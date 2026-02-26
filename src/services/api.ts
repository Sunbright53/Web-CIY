// src/services/api.ts
import { CONFIG } from '@/config';
import { Student, Report, AddStudentForm } from '@/types';
import { mapRawToCoaches } from './mapper';
import { AddBookingForm} from '../types';

export type Coach = { coach_id: string; password: string; name: string };
type ApiOk = { success: true; [k: string]: any };
type ApiErr = { success: false; error?: string };
export type ApiResponse = ApiOk | ApiErr;

const WEBHOOK_KEY: string | undefined = import.meta.env.VITE_SHEETS_WEBHOOK_KEY;

/* =========================================================
   🔰 Helper สำหรับส่งข้อมูล POST (หลีกเลี่ยง CORS Preflight)
   ========================================================= */
async function postForm(url: string, payload: Record<string, string>): Promise<ApiResponse> {
  try {
    const body = new URLSearchParams();
    if (!payload.key) payload.key = (WEBHOOK_KEY || '');
    Object.entries(payload).forEach(([k, v]) => body.append(k, v ?? ''));

    // ✅ ไม่ใส่ Custom Headers เพื่อไม่ให้เกิด Preflight
    const res = await fetch(url, { 
      method: 'POST', 
      body,
      mode: 'cors'
    });
    
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.error || `Network error (${res.status})` };
    }
    return data as ApiResponse;
  } catch (e: any) {
    return { success: false, error: e?.message || 'Request failed' };
  }
}

/* =========================================================
   📅 ระบบจองและยกเลิกคาบเรียน (Booking System)
   ========================================================= */

/** ✅ แก้ไข: ใช้ Simple GET เพื่อดึงข้อมูล Slots (แก้ปัญหา Load Failed) */
export async function fetchAvailableSlots(coachId: string, date: string): Promise<any> {
  if (!CONFIG.bookingScriptUrl) throw new Error('bookingScriptUrl is not set');
  
  const bust = `t=${Date.now()}`;
  const url = `${CONFIG.bookingScriptUrl}?action=get_slots&coach_id=${encodeURIComponent(coachId)}&date=${encodeURIComponent(date)}&${bust}`;
  
  // ✅ ใช้ Simple GET Request
  const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok || data?.success === false) throw new Error(data?.error || `Failed to fetch slots`);
  return data; 
}

/** ✅ ดึงรายการที่จองไว้ของนักเรียน */
export async function fetchUserBookings(coderId: string): Promise<any> {
  if (!CONFIG.bookingScriptUrl) throw new Error('bookingScriptUrl is not set');
  const bust = `t=${Date.now()}`;
  const url = `${CONFIG.bookingScriptUrl}?action=get_user_bookings&coder_id=${encodeURIComponent(coderId)}&${bust}`;
  
  const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) throw new Error(data?.error || `Failed to fetch user bookings`);
  return data;
}

/** ✅ ส่งข้อมูลจองเรียนใหม่ */
export async function submitBooking(data: AddBookingForm): Promise<ApiResponse> {
  if (!CONFIG.bookingScriptUrl) return { success: false, error: 'bookingScriptUrl is not set' };
  return postForm(CONFIG.bookingScriptUrl, {
    action: 'add_booking',
    coder_id: data.coder_id,
    date: data.date,
    time_slot: data.time_slot,
    note: data.note || '',
  });
}

/** ✅ ยกเลิกการจองเรียน */
export async function cancelBooking(data: { coder_id: string; date: string; time_slot: string }): Promise<ApiResponse> {
  if (!CONFIG.bookingScriptUrl) return { success: false, error: 'bookingScriptUrl is not set' };
  return postForm(CONFIG.bookingScriptUrl, {
    action: 'cancel_booking',
    coder_id: data.coder_id,
    date: data.date,
    time_slot: data.time_slot,
  });
}

/* =========================================================
   👨‍🎓 ฟังก์ชันระบบเดิม (Students / Reports)
   ========================================================= */

export async function submitStudent(url: string, data: AddStudentForm): Promise<void> {
  const res = await postForm(url, {
    action: 'add_student',
    coder_id: (data.coder_id ?? '').trim(),
    nickname: (data.nickname ?? '').trim(),
    fullname: (data.fullname ?? '').trim(),
    status: (data.status ?? 'Enrolled').trim(),
    course_status: (data.course_status ?? '').trim(),
    program: (data.program ?? '').trim(),
    parent_password: (data.parent_password ?? '').trim(),
  });
  if (!res.success) throw new Error(res.error);
}

export async function verifyCoachPassword(csvUrl: string, inputPassword: string): Promise<boolean> {
  const coaches = await fetchCoaches(csvUrl);
  const passwords = coaches.map(c => c.password).filter(Boolean);
  return passwords.includes((inputPassword ?? '').trim());
}

export async function updateReportByRow(a: any, b: any, c?: any): Promise<any> {
  if (typeof a === 'number') {
    return postForm(CONFIG.appScriptPostUrl, { action: 'update_report', row: String(a), key: WEBHOOK_KEY || '', ...b });
  }
  return postForm(a, { action: 'update_report', row: String(b), ...c });
}

export async function fetchCoaches(csvUrl: string): Promise<Coach[]> {
  const raw = await fetchCSV(`${csvUrl}${csvUrl.includes('?') ? '&' : '?'}t=${Date.now()}`);
  return mapRawToCoaches(raw);
}

export async function fetchStudents(): Promise<Student[]> {
  const url = `${CONFIG.appScriptPostUrl}?action=students&t=${Date.now()}`;
  const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
  const data = await res.json();
  return (data.students || []).map((r: any) => ({
    coder_id: String(r.coder_id || ''),
    nickname: String(r.nickname || ''),
    fullname: String(r.fullname || ''),
    status: String(r.status || ''),
    course: String(r.course || ''),
    program: String(r.program || ''),
    course_status: String(r.course_status || ''),
    parent_password: String(r.parent_password || ''),
  }));
}

export async function fetchReports(): Promise<Report[]> {
  const url = `${CONFIG.appScriptPostUrl}?action=reports&t=${Date.now()}`;
  const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
  const data = await res.json();
  return (data.reports || []).map((r: any, idx: number) => ({
    row: Number(r.row || idx + 2),
    coder_id: String(r.coder_id || r['Coder ID'] || ''),
    date: String(r.date || ''),
    time: String(r.time || ''),
    course: String(r.course || ''),
    topic: String(r.course || ''),
    session_incharge: String(r['session incharge'] || r.coach_name || ''),
    session_type: String(r['session type'] || ''),
    session_report: String(r['Session report'] || ''),
    feedback: String(r.feedback || ''),
    next_recommend: String(r['Recommendation for next session'] || ''),
    link12: String(r['12 Times Progress Report (link)'] || ''),
  }));
}

export async function submitReport(url: string, id: string, data: any): Promise<void> {
  await postForm(url, { action: 'add_report', coder_id: id, ...data });
}

export async function updateParentPassword(id: string, pw: string): Promise<ApiResponse> {
  return postForm(CONFIG.appScriptPostUrl, { action: 'update_parent_password', coder_id: id, new_password: pw });
}

export async function updateProjectListLink(id: string, link: string): Promise<ApiResponse> {
  return postForm(CONFIG.appScriptPostUrl, { action: 'update_project_list_link', coder_id: id, project_list_url: link });
}

export async function fetchCSV(url: string): Promise<Record<string, any>[]> {
  const res = await fetch(url, { cache: 'no-store' });
  const text = await res.text();
  const rows = text.split('\n').map(r => r.split(','));
  const header = rows.shift()?.map(h => h.trim().replace(/^\uFEFF/, '')) || [];
  return rows.map(r => {
    const o: any = {};
    header.forEach((h, idx) => { o[h] = (r[idx] ?? '').trim(); });
    return o;
  });
}