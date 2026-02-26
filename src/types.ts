// types.ts
export interface Student {
  coder_id: string;
  nickname: string;
  fullname: string;
  status: string;
  course_status: string;
  course: string;            // ✅ ต้องมี
  program?: string;
  parent_password: string;
  password?: string; // For backward compatibility
  project_list_url?: string;
}

export interface Report {
  // ✅ แถวจริงในชีต (แถว 1 = header → ข้อมูลเริ่มที่แถว 2)
  row: number;

  coder_id: string;
  date: string;
  time?: string;
  topic: string;
  session_incharge: string;
  session_type?: string;
  session_report: string;
  feedback?: string;
  next_recommend?: string;
  link12?: string;
  
  // Legacy fields for backward compatibility
  course?: string;
  lesson?: string;
  progress_summary?: string;
  skills?: string;
  homework?: string;
  next_plan?: string;
  coach_name?: string;
  attachments?: string;
}

export interface Session {
  role: 'parent' | 'coach' | null;
  parentId?: string;
  coder_id?: string | null;
}

export type UserRole = 'parent' | 'coach' | null;
export type Language = 'th' | 'en';

export interface AuthState {
  session: Session;
  lang: Language;
  setSession: (session: Session) => void;
  setLang: (lang: Language) => void;
  logout: () => void;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warn';
}

export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

// Form interfaces
export interface AddReportForm {
  date: string;
  time?: string;
  topic: string;
  session_incharge: string;
  session_type: string;
  session_report: string;
  feedback?: string;
  next_recommend?: string;
  link12?: string;
}

export interface AddStudentForm {
  coder_id: string;
  nickname: string;
  fullname: string;
  status: string;
  course_status: string;
  program?: string;
  parent_password: string;
}

// --- Booking System (ปรับให้เข้ากับระบบเดิม) ---

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended';

export interface Booking {
  // ✅ แถวจริงในชีต (เหมือน Report interface)
  row?: number; 

  booking_id: string;      // ID ของการจอง
  coder_id: string;       // เชื่อมกับ Student.coder_id
  student_nickname: string; // เก็บเผื่อไว้แสดงผลเร็วๆ
  date: string;           // วันที่จอง (YYYY-MM-DD)
  time_slot: string;      // ช่วงเวลา เช่น "10:00 - 12:00"
  coach_name?: string;    // โค้ชที่ดูแลในเซสชั่นนั้น
  status: BookingStatus;
  branch?: string;        // สาขา (ถ้ามี)
  note?: string;          // หมายเหตุจากผู้ปกครอง
  created_at: string;
}

/**
 * Interface สำหรับหน้าจอง (หน้าบ้าน)
 */
export interface BookingSlot {
  id: string;
  time: string;           // เช่น "13:00"
  available_seats: number;
  max_seats: number;
}

/**
 * Form สำหรับหน้าสร้างการจองใหม่
 */
export interface AddBookingForm {
  coder_id: string;
  date: string;
  time_slot: string;
  note?: string;
}