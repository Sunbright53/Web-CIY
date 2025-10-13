// src/services/mapper.ts
import { Student, Report } from '@/types';

// ===== helpers =====
// รองรับการส่งทั้ง string เดี่ยว หรือ string[] ได้
function pick(obj: Record<string, any>, keys: string | string[] = []): string {
  const arr = Array.isArray(keys) ? keys : [keys];
  for (const k of arr) {
    if (!k) continue;
    const v = (obj[k] ?? '').toString().trim();
    if (v) return v;
  }
  return '';
}

function rVal(row: Record<string, any>, candidates: string | string[]): string {
  const arr = Array.isArray(candidates) ? candidates : [candidates];
  for (const key of arr) {
    if (key in row && typeof row[key] !== 'undefined') {
      const v = (row[key] ?? '').toString().trim();
      if (v !== '') return v;
    }
  }
  return '';
}

// ===== headers mapping =====
export const HEADER_MAPPINGS = {
  students: {
    coder_id: ["No", "Coder ID", "ID", "รหัสนักเรียน", "coder_id", "coder id"],
    nickname: ["Name", "Nickname", "Nick name", "ชื่อเล่น"],
    fullname: ["Fullname", "Full name", "ชื่อ-นามสกุล", "ชื่อจริง"],
    status: ["Status", "สถานะ", "Enrollment Status"],
    course_status: ["Status of course", "Course", "คอร์ส", "course_status"],
    // อันนี้เป็น string เดี่ยวก็ใช้ได้ เพราะ pick() รองรับ
    course: "Course",
    program: ["Program", "โปรแกรม", "โปรแกรมเรียน"],
    parent_password: ["Parent Password", "Parent pass", "Password", "รหัสผู้ปกครอง"],
    project_list_url: [
      "Project List",
      "ProjectListURL",
      "Project Link",
      "โปรเจคลิงก์",
      "ลิงก์โปรเจค"
    ]
  },
  reports: {
    coder_id: ["coder_id", "Coder ID", "id", "No", "รหัสนักเรียน", "coder id"],
    date: ["date", "Date", "วันที่"],
    time: ["time", "Time", "เวลา"],
    topic: ["topic", "Topic", "หัวข้อ", "course", "Course"],
    incharge: ["session incharge", "Session incharge", "session in-charge", "incharge", "coach", "Coach", "coach_name", "Coach Name", "ผู้สอน", "ผู้รับผิดชอบคาบ"],
    type: ["session type", "Session type", "class type", "ประเภทคาบ"],
    report: ["session report", "Session report", "report", "progress_summary", "Progress Summary", "summary", "สรุป"],
    feedback: ["Feedback","feedback", "ความคิดเห็น", "ข้อเสนอแนะ", "comment", "คอมเมนต์"],
    next_reco: ["Recommandation for next session", "Recommendation for next session", "next recommendation", "next session plan", "next_plan", "Next Plan", "แผนถัดไป"],
    link12: ["12 Times Progress Report (link)", "12 times link", "progress link", "link", "attachments", "attachment", "แนบ"],
    // legacy fallbacks
    course: ["course", "Course", "topic", "Topic"],
    lesson: ["lesson", "Lesson", "บทเรียน"],
    progress_summary: ["progress_summary", "summary", "สรุป", "Session report"],
    skills: ["skills", "Skills", "ทักษะ"],
    homework: ["homework", "Homework", "การบ้าน"],
    next_plan: ["next_plan", "Next Plan", "แผนถัดไป"],
    coach_name: ["coach_name", "coach _name", "coach name", "coach", "Coach Name"],
    attachments: ["attachments", "attachment", "แนบ", "Attachment"]
  },
  // ✅ สำหรับแท็บ Coache_login
  coaches: {
    coach_id: ["coach_id", "Coach ID", "id", "ID", "โค้ช"],
    password: ["password", "pass", "รหัสผ่าน"],
    name: ["name", "coach_name", "Coach Name", "ชื่อ"]
  }
};

// ===== students =====
export function mapRawToStudents(raw: Record<string, any>[]): Student[] {
  const M = HEADER_MAPPINGS.students;
  return raw.map(r => {
    const parent_password = pick(r, M.parent_password);
    return {
      coder_id:        pick(r, M.coder_id),
      nickname:        pick(r, M.nickname),
      fullname:        pick(r, M.fullname),
      status:          pick(r, M.status),
      course:          pick(r, M.course) ?? '',
      course_status:   pick(r, M.course_status) ?? '',
      program:         pick(r, M.program),
      parent_password,                         // main field
      project_list_url: pick(r, M.project_list_url),

      // option: backward compatibility (ถ้าใน types กำหนดเป็น optional)
      parent_pass: parent_password,
    };
  });
}

// ===== reports =====
export function mapRawToReports(rawData: Record<string, any>[]): Report[] {
  const H = HEADER_MAPPINGS.reports;
  return rawData
    .map((r, idx) => ({
      // แถวจริงในชีต (header = แถว 1 → ข้อมูลเริ่มแถว 2)
      row: idx + 2,

      coder_id: rVal(r, H.coder_id),
      date: rVal(r, H.date),
      time: rVal(r, H.time),
      topic: rVal(r, H.topic) || rVal(r, H.course),
      session_incharge: rVal(r, H.incharge) || rVal(r, H.coach_name),
      session_type: rVal(r, H.type) || rVal(r, H.course),
      session_report: rVal(r, H.report) || rVal(r, H.progress_summary),
      feedback: rVal(r, H.feedback),
      next_recommend: rVal(r, H.next_reco) || rVal(r, H.next_plan),
      link12: rVal(r, H.link12) || rVal(r, H.attachments),

      // legacy fields
      course: rVal(r, H.course),
      lesson: rVal(r, H.lesson),
      progress_summary: rVal(r, H.progress_summary),
      skills: rVal(r, H.skills),
      homework: rVal(r, H.homework),
      next_plan: rVal(r, H.next_plan),
      coach_name: rVal(r, H.coach_name),
      attachments: rVal(r, H.attachments)
    }))
    .filter(x => x.coder_id);
}

// ===== coaches =====
export type Coach = { coach_id: string; password: string; name: string };

export function mapRawToCoaches(rawData: Record<string, any>[]): Coach[] {
  const M = HEADER_MAPPINGS.coaches;
  return rawData
    .map(r => ({
      coach_id: pick(r, M.coach_id),
      password: pick(r, M.password),
      name: pick(r, M.name)
    }))
    // เอาเฉพาะที่มี password
    .filter(c => c.password);
}

// ใช้ตอน fetch จาก Apps Script JSON ตรง ๆ
export function mapStudent(raw: any): Student {
  return {
    coder_id:        raw.coder_id ?? raw.No ?? '',
    nickname:        raw.nickname ?? raw.Name ?? '',
    fullname:        raw.fullname ?? raw.Fullname ?? '',
    status:          raw.status ?? raw.Status ?? '',
    course:          raw.course ?? raw.Course ?? '',
    course_status:   raw.course_status ?? raw.Course ?? raw.course ?? '',
    program:         raw.program ?? raw.Program ?? '',
    parent_password: raw.parent_password ?? raw['Parent Password'] ?? raw.Password ?? '',
    project_list_url: raw.project_list_url ?? ''
  };
}
