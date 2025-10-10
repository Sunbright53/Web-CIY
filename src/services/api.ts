// src/services/api.ts
import { CONFIG } from '@/config';
import { Student, Report, AddReportForm, AddStudentForm } from '@/types';
import { mapRawToCoaches } from './mapper';

// (ถ้าใน '@/types' ยังไม่มี Coach ให้ใช้ type ชั่วคราวนี้ได้)
export type Coach = { coach_id: string; password: string; name: string };

type ApiOk = { success: true; [k: string]: any };
type ApiErr = { success: false; error?: string };
export type ApiResponse = ApiOk | ApiErr;

/* =========================================================
   🔰 Simple Request (form-urlencoded) to Apps Script (POST)
   - ไม่ใช้ JSON + ไม่ส่ง custom header → ไม่เกิด CORS preflight
   - ใช้ CONFIG.appScriptPostUrl เป็นปลายทางหลัก
   ========================================================= */

const WEBHOOK_KEY: string | undefined = import.meta.env.VITE_SHEETS_WEBHOOK_KEY;

async function postForm(payload: Record<string, string>): Promise<ApiResponse> {
  if (!CONFIG.appScriptPostUrl) {
    return { success: false, error: 'appScriptPostUrl is not set in config.ts' };
  }
  try {
    const body = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => body.append(k, v ?? ''));

    const res = await fetch(CONFIG.appScriptPostUrl, { method: 'POST', body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.error || `Network error (${res.status})` };
    }
    return data as ApiResponse;
  } catch (e: any) {
    return { success: false, error: e?.message || 'Request failed' };
  }
}

/** ✅ อัปเดตลิงก์ Project List ของนักเรียน */
export async function updateProjectListLink(
  coder_id: string,
  project_list_url: string
): Promise<ApiResponse> {
  return postForm({
    action: 'update_project_list_link',
    coder_id,
    project_list_url,
  });
}

/** ✅ อัปเดตรหัสผ่านผู้ปกครอง (Simple Request: no preflight)
 *  - ส่ง key ใน body → ไม่ต้องใช้ header พิเศษ
 *  - ใช้ .env เดิม: VITE_SHEETS_WEBHOOK_KEY
 */
export async function updateParentPassword(
  coder_id: string,
  new_password: string
): Promise<ApiResponse> {
  return postForm({
    action: 'update_parent_password',
    coder_id,
    new_password,
    key: WEBHOOK_KEY || '',
  });
}

/* =========================================================
   🧰 CSV Helpers (คงไว้เพื่อ Backward-compat / ใช้กับ Coaches)
   ========================================================= */
function parseCSV(text: string): Record<string, any>[] {
  const rows: string[][] = [];
  let i = 0;
  let cur = '';
  let inQ = false;
  let row: string[] = [];

  while (i < text.length) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else { inQ = false; }
      } else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\r') {/* skip */}
      else if (ch === '\n') { row.push(cur); rows.push(row); cur = ''; row = []; }
      else cur += ch;
    }
    i++;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }

  const rawHeader = rows.shift() || [];
  const header = rawHeader.map(h => (h ?? '').toString().replace(/^\uFEFF/, '').trim());

  return rows.map(r => {
    const o: Record<string, any> = {};
    header.forEach((h, idx) => { o[h] = (r[idx] ?? '').toString().trim(); });
    return o;
  });
}

export async function fetchCSV(url: string): Promise<Record<string, any>[]> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
  const text = await res.text();
  return parseCSV(text);
}

/* =========================================================
   📥 อ่านข้อมูลจาก Apps Script doGet (JSON, no-cache)
   - รองรับทั้งกรณีมี/ไม่มี CONFIG.appScriptGetUrl (fallback ไป postUrl)
   ========================================================= */

// ใช้ as any เพื่อไม่ให้ TS ฟ้องเรื่อง prop ที่ไม่มีใน type
const APP_SCRIPT_GET_BASE: string | undefined =
  (CONFIG as any).appScriptGetUrl || CONFIG.appScriptPostUrl;

async function getFromAppScript<T>(action: 'students' | 'reports' | 'project_list'): Promise<T> {
  if (!APP_SCRIPT_GET_BASE) {
    throw new Error('No Apps Script URL found: please set appScriptPostUrl (or appScriptGetUrl) in config.ts');
  }
  const bust = `t=${Date.now()}`;
  const url = `${APP_SCRIPT_GET_BASE}?action=${encodeURIComponent(action)}&${bust}`;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.error || `GET ${action} failed (${res.status})`);
  }
  return data as T;
}

/* =========================================================
   👨‍🎓 Students / 📄 Reports
   - เปลี่ยนมาอ่านจาก Apps Script เป็นค่าเริ่มต้น
   - ยังเก็บเวอร์ชัน CSV ไว้ให้เรียกใช้ได้ (กรณีจำเป็น)
   ========================================================= */

// ---------- API: Students (จาก Apps Script) ----------
export async function fetchStudents(_csvUrlIgnored?: string): Promise<Student[]> {
  // อ่านจาก Apps Script แทน CSV (ค่าใหม่ล่าสุด)
  const { students } = await getFromAppScript<{ success: true; students: any[] }>('students');

  // map ให้ตรง type Student ที่คุณใช้อยู่
  const mapped: Student[] = students.map((r: any) => ({
    coder_id: (r.coder_id ?? '').toString().trim(),
    nickname: (r.nickname ?? '').toString().trim(),
    fullname: (r.fullname ?? '').toString().trim(),
    status:   (r.status ?? '').toString().trim(),
    course:   (r.course ?? '').toString().trim(),
    program:  (r.program ?? '').toString().trim(),
    course_status: (r.course_status ?? '').toString().trim(),
    parent_password: (r.parent_password ?? '').toString().trim(),
  }));

  return mapped;
}

// ---------- API: Reports (จาก Apps Script) ----------
export async function fetchReports(_csvUrlIgnored?: string): Promise<Report[]> {
  const { reports } = await getFromAppScript<{ success: true; reports: any[] }>('reports');

  // คุณอาจมี mapper เดิมอยู่แล้ว → แปลงให้ง่าย ๆ ให้เข้ากับ Report
  const mapped: Report[] = reports.map((r: any, idx: number) => ({
    row: Number(r.row || idx + 2), // ถ้า Apps Script ไม่ส่ง row ก็เผื่อ index+2
    coder_id: (r['coder_id'] ?? r['Coder ID'] ?? r['No'] ?? '').toString().trim(),
    date:     (r['date'] ?? '').toString().trim(),
    time:     (r['time'] ?? '').toString().trim(),
    course:   (r['course'] ?? '').toString().trim(),
    topic:    (r['course'] ?? '').toString().trim(),
    session_incharge: (r['session incharge'] ?? r['coach_name'] ?? '').toString().trim(),
    session_type: (r['session type'] ?? '').toString().trim(),
    session_report: (r['Session report'] ?? r['session_report'] ?? '').toString().trim(),
    feedback: (r['Feedback'] ?? r['feedback'] ?? '').toString().trim(),
    next_recommend: (r['Recommendation for next session'] ?? r['next_plan'] ?? '').toString().trim(),
    link12: (r['12 Times Progress Report (link)'] ?? r['Project or 12 Times Progress Report (link)'] ?? '').toString().trim(),
  }));

  return mapped;
}

/* ---------- (Optional) เวอร์ชัน CSV เดิม ถ้าจำเป็นต้องใช้ ----------
export async function fetchStudentsFromCSV(csvUrl: string): Promise<Student[]> {
  const raw = await fetchCSV(`${csvUrl}${csvUrl.includes('?') ? '&' : '?'}t=${Date.now()}`);
  return mapRawToStudents(raw);
}
export async function fetchReportsFromCSV(csvUrl: string): Promise<Report[]> {
  const raw = await fetchCSV(`${csvUrl}${csvUrl.includes('?') ? '&' : '?'}t=${Date.now()}`);
  return mapRawToReports(raw);
}
----------------------------------------------------------------------- */

// ---------- ✅ NEW: Coaches (ยังใช้ CSV ตามเดิม) ----------
export async function fetchCoaches(csvUrl: string): Promise<Coach[]> {
  const raw = await fetchCSV(`${csvUrl}${csvUrl.includes('?') ? '&' : '?'}t=${Date.now()}`);
  return mapRawToCoaches(raw);
}

// ดึงเฉพาะ password เป็น array
export async function fetchCoachPasswords(csvUrl: string): Promise<string[]> {
  const coaches = await fetchCoaches(csvUrl);
  return coaches.map(c => c.password).filter(Boolean);
}

// Helper ตรวจสอบ password
export async function verifyCoachPassword(csvUrl: string, inputPassword: string): Promise<boolean> {
  const passwords = await fetchCoachPasswords(csvUrl);
  return passwords.includes((inputPassword ?? '').trim());
}

// ---------- Random password generator ----------
function randomPassword(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ---------- Submit report ----------
// ---------- Submit report ----------
export async function submitReport(
  appScriptUrl: string,
  coderId: string,
  data: AddReportForm
): Promise<void> {
  const body = new URLSearchParams();

  body.append('action', 'add_report');
  body.append('key', WEBHOOK_KEY || '');           // ✅ ต้องส่ง key
  body.append('coder_id', coderId);
  body.append('date', (data.date ?? '').trim());
  body.append('time', (data.time ?? '').trim());
  body.append('course', (data.topic ?? '').trim()); // topic → course
  body.append('session incharge', (data.session_incharge ?? '').trim());
  body.append('session type', (data.session_type ?? '').trim());
  body.append(
    'progress_summary',
    (data as any).progress_summary?.trim?.() || (data.session_report ?? '').trim()
  );
  body.append('Session report', (data.session_report ?? '').trim());
  body.append('Feedback', (data.feedback ?? '').trim());
  body.append('Recommendation for next session', (data.next_recommend ?? '').trim());
  body.append('12 Times Progress Report (link)', (data.link12 ?? '').trim());

  const res = await fetch(appScriptUrl, { method: 'POST', body });
  const json = await res.json().catch(() => ({} as any));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || `Failed to submit report: ${res.status}`);
  }
}


// ---------- Submit student ----------
export async function submitStudent(
  appScriptUrl: string,
  data: AddStudentForm
): Promise<void> {
  const payload: Record<string, string> = {
    action: 'add_student',
    coder_id: (data.coder_id ?? '').trim(),
    nickname: (data.nickname ?? '').trim(),
    fullname: (data.fullname ?? '').trim(),
    status: (data.status ?? 'Enrolled').trim(),
    course_status: (data.course_status ?? '').trim(),
    program: (data.program ?? '').trim(),
    parent_password: (data.parent_password ?? randomPassword()).trim(),
    key: WEBHOOK_KEY || '', // ถ้าตั้งตรวจ key ไว้
  };

  const body = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => body.append(k, v));

  const res = await fetch(appScriptUrl, { method: 'POST', body });
  const json = await res.json().catch(() => ({} as any));

  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Failed to submit student: ${res.status}`);
  }
}

/* =========================================================
   ✏️ Update Report (Overloaded) — รองรับทั้ง "สไตล์เก่า" และ "สไตล์ใหม่"
   - แบบเก่า: updateReportByRow(appScriptUrl, row, updates) → throw on error
   - แบบใหม่: updateReportByRow(row, values) → ใช้ postForm() คืน ApiResponse
   ========================================================= */

// สำหรับแบบใหม่: กำหนดคีย์ที่อนุญาตให้แก้
const REPORT_EDIT_KEYS = [
  'date', 'time', 'topic', 'course',
  'session_incharge', 'session_type', 'session_report',
  'feedback', 'next_recommend', 'link12', 'attachments'
] as const;

type ReportEditPayload = Partial<Record<(typeof REPORT_EDIT_KEYS)[number], string>>;

// Overload signatures
export async function updateReportByRow(
  row: number,
  values: ReportEditPayload
): Promise<ApiResponse>;
export async function updateReportByRow(
  appScriptUrl: string,
  row: number,
  updates: Partial<AddReportForm> & { coder_id?: string }
): Promise<void>;

// Implementation
export async function updateReportByRow(a: any, b: any, c?: any): Promise<any> {
  // ✅ สไตล์ใหม่: updateReportByRow(row, values)
  if (typeof a === 'number' && typeof b === 'object' && c === undefined) {
    const row = a as number;
    const values = b as ReportEditPayload;

    const payload: Record<string, string> = {
      action: 'update_report',
      row: String(row),
      key: WEBHOOK_KEY || '',
    };

    REPORT_EDIT_KEYS.forEach((k) => {
      const v = (values as any)[k];
      if (v !== undefined && v !== null) {
        const keyForServer = k === 'topic' ? 'course' : k; // map topic → course
        payload[keyForServer] = String(v).trim();
      }
    });

    // ใช้ postForm() → รูปแบบ ApiResponse เดียวกับฟังก์ชันอื่น
    return postForm(payload);
  }

  // 🧓 สไตล์เก่า: updateReportByRow(appScriptUrl, row, updates) — คงไว้ไม่ให้กระทบของเดิม
  const appScriptUrl = a as string;
  const row = b as number;
  const updates = c as Partial<AddReportForm> & { coder_id?: string };

  const body = new URLSearchParams();
  body.append('action', 'update_report');
  body.append('row', String(row));
  if (WEBHOOK_KEY) body.append('key', WEBHOOK_KEY);

  if (updates?.coder_id != null) body.append('coder_id', (updates.coder_id ?? '').trim());
  if (updates?.date != null) body.append('date', (updates.date ?? '').trim());
  if (updates?.time != null) body.append('time', (updates.time ?? '').trim());
  if (updates?.topic != null) body.append('course', (updates.topic ?? '').trim());
  if (updates?.session_incharge != null) body.append('session incharge', (updates.session_incharge ?? '').trim());
  if (updates?.session_type != null) body.append('session type', (updates.session_type ?? '').trim());
  if ((updates as any)?.progress_summary != null) {
    body.append('progress_summary', ((updates as any).progress_summary ?? '').toString().trim());
  }
  if (updates?.session_report != null) body.append('Session report', (updates.session_report ?? '').trim());
  if (updates?.feedback != null) body.append('Feedback', (updates.feedback ?? '').trim());
  if (updates?.next_recommend != null) {
    body.append('Recommendation for next session', (updates.next_recommend ?? '').trim());
  }
  if (updates?.link12 != null) body.append('12 Times Progress Report (link)', (updates.link12 ?? '').trim());

  const res = await fetch(appScriptUrl, { method: 'POST', body });
  const json = await res.json().catch(() => ({} as any));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || `Failed to update report: ${res.status}`);
  }
}
