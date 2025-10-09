// types.ts
export interface Student {
  coder_id: string;
  nickname: string;
  fullname: string;
  status: string;
  course_status: string;
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
