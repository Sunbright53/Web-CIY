// src/services/api.ts
import { CONFIG } from '@/config';
import { Student, Report, AddReportForm, AddStudentForm } from '@/types';
import { mapRawToStudents, mapRawToReports, mapRawToCoaches } from './mapper';

// (ถ้าใน '@/types' ยังไม่มี Coach ให้ใช้ type ชั่วคราวนี้ได้)
export type Coach = { coach_id: string; password: string; name: string };

type ApiOk = { success: true; [k: string]: any };
type ApiErr = { success: false; error?: string };
export type ApiResponse = ApiOk | ApiErr;

/* =========================================================
   🔰 Simple Request (form-urlencoded) to Apps Script
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
    // Apps Script ควรส่ง JSON กลับมา
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

/** ===== CSV Helper ===== */
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
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQ = true;
      } else if (ch === ',') {
        row.push(cur);
        cur = '';
      } else if (ch === '\r') {
        // skip
      } else if (ch === '\n') {
        row.push(cur);
        rows.push(row);
        cur = '';
        row = [];
      } else {
        cur += ch;
      }
    }
    i++;
  }

  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }

  const rawHeader = rows.shift() || [];
  const header = rawHeader.map(h => (h ?? '').toString().replace(/^\uFEFF/, '').trim());

  return rows.map(r => {
    const o: Record<string, any> = {};
    header.forEach((h, idx) => {
      o[h] = (r[idx] ?? '').toString().trim();
    });
    return o;
  });
}

// Fetch CSV with no-cache
export async function fetchCSV(url: string): Promise<Record<string, any>[]> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch CSV: ${res.status}`);
  }
  const text = await res.text();
  return parseCSV(text);
}

// ---------- API: Students ----------
export async function fetchStudents(csvUrl: string): Promise<Student[]> {
  try {
    const raw = await fetchCSV(csvUrl);
    return mapRawToStudents(raw);
  } catch (error) {
    console.error('Error loading students:', error);
    throw new Error('Failed to load students data');
  }
}

// ---------- API: Reports ----------
export async function fetchReports(csvUrl: string): Promise<Report[]> {
  try {
    const raw = await fetchCSV(csvUrl);
    return mapRawToReports(raw);
  } catch (error) {
    console.error('Error loading reports:', error);
    throw new Error('Failed to load reports data');
  }
}

// ---------- ✅ NEW: Coaches ----------
export async function fetchCoaches(csvUrl: string): Promise<Coach[]> {
  try {
    const raw = await fetchCSV(csvUrl);
    return mapRawToCoaches(raw); // mapper จะดึง coach_id, password, name
  } catch (error) {
    console.error('Error loading coaches:', error);
    throw new Error('Failed to load coaches data');
  }
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
export async function submitReport(
  appScriptUrl: string,
  coderId: string,
  data: AddReportForm
): Promise<void> {
  const body = new URLSearchParams();

  body.append('action', 'add_report');
  body.append('coder_id', coderId);
  body.append('date', (data.date ?? '').trim());
  body.append('time', (data.time ?? '').trim());
  body.append('course', (data.topic ?? '').trim());
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
  if (!res.ok) throw new Error(`Failed to submit report: ${res.status}`);
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
  };

  const body = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => body.append(k, v));

  const res = await fetch(appScriptUrl, { method: 'POST', body });
  const json = await res.json().catch(() => ({} as any));

  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Failed to submit student: ${res.status}`);
  }
}

// ---------- ✅ NEW: Update report by row ----------
export async function updateReportByRow(
  appScriptUrl: string,
  row: number,
  updates: Partial<AddReportForm> & { coder_id?: string }
): Promise<void> {
  const body = new URLSearchParams();

  body.append('action', 'update_report');
  body.append('row', String(row));

  // 🔐 ส่ง key ให้ตรงกับ Apps Script (updateReport_ เช็ค WEBHOOK_CLIENT_KEY)
  if (WEBHOOK_KEY) body.append('key', WEBHOOK_KEY);

  // เฉพาะฟิลด์ที่ต้องการอัปเดต
  if (updates.coder_id != null) body.append('coder_id', (updates.coder_id ?? '').trim());
  if (updates.date != null) body.append('date', (updates.date ?? '').trim());
  if (updates.time != null) body.append('time', (updates.time ?? '').trim());
  if (updates.topic != null) body.append('course', (updates.topic ?? '').trim());
  if (updates.session_incharge != null) body.append('session incharge', (updates.session_incharge ?? '').trim());
  if (updates.session_type != null) body.append('session type', (updates.session_type ?? '').trim());

  if ((updates as any).progress_summary != null) {
    body.append('progress_summary', ((updates as any).progress_summary ?? '').toString().trim());
  }
  if (updates.session_report != null) {
    body.append('Session report', (updates.session_report ?? '').trim());
  }
  if (updates.feedback != null) {
    body.append('Feedback', (updates.feedback ?? '').trim());
  }
  if (updates.next_recommend != null) {
    body.append('Recommendation for next session', (updates.next_recommend ?? '').trim());
  }
  if (updates.link12 != null) {
    body.append('12 Times Progress Report (link)', (updates.link12 ?? '').trim());
  }

  const res = await fetch(appScriptUrl, { method: 'POST', body });
  const json = await res.json().catch(() => ({} as any));

  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || `Failed to update report: ${res.status}`);
  }
}
