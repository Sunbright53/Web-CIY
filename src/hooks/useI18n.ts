// src/hooks/useI18n.ts
import { useAuthStore } from '@/store/authStore';

// ❗ ประกาศ translations ก่อน แล้วค่อยอนุมาน type จากมัน
export const translations = {
  th: {
    // Navigation
    home: 'หน้าแรก',
    parent: 'ผู้ปกครอง',
    coach: 'โค้ช',
    logout: 'ออกจากระบบ',

    // Landing
    landingTitle: 'ระบบรายงานนักเรียน CIY',
    landingDesc: 'ระบบติดตามความก้าวหน้านักเรียน CIY.CLUB',
    parentLogin: 'เข้าสู่ระบบผู้ปกครอง',
    coachLogin: 'เข้าสู่ระบบโค้ช',

    // Parent Login
    parentLoginTitle: 'เข้าสู่ระบบผู้ปกครอง',
    parentLoginDesc: 'กรอกรหัสนักเรียนและรหัสผู้ปกครอง',
    coderIdLabel: 'รหัสนักเรียน (Coder ID)',
    parentPassLabel: 'รหัสผู้ปกครอง',
    coderIdPlaceholder: 'เช่น 6600001',
    enterParentCode: 'กรอกรหัสผู้ปกครอง', // ✅ เพิ่มคีย์ที่ขาด
    login: 'เข้าสู่ระบบ',

    // Coach Login
    coachLoginTitle: 'เข้าสู่ระบบโค้ช',
    coachLoginDesc: 'กรอกรหัสผ่านสำหรับโค้ช',
    masterPassLabel: 'รหัสผ่านหลัก',

    // Students
    allStudents: 'รายชื่อนักเรียนทั้งหมด',
    searchPlaceholder: 'ค้นหา: Coder ID / ชื่อเล่น / ชื่อจริง',
    clear: 'ล้าง',
    openStudents: 'เปิดชีต Students',
    openReports: 'เปิดชีต Reports',
    addStudent: '+ เพิ่มนักเรียน',
    nickname: 'ชื่อเล่น',
    fullname: 'ชื่อ-นามสกุล',
    status: 'สถานะ',
    course: 'คอร์ส',
    parentPassword: 'รหัสผู้ปกครอง',

    // Student Detail
    back: '← ย้อนกลับ',
    studentDetail: 'ข้อมูลนักเรียน',
    addReport: '+ เพิ่มรายงาน',
    allReports: 'รายงานทั้งหมด',
    pastReports: 'รายงานที่ผ่านมา',

    // Table Headers
    date: 'วันที่',
    time: 'เวลา',
    topic: 'หัวข้อ',
    lesson: 'บทเรียน',
    summary: 'สรุป',
    coachName: 'โค้ช',
    attachment: 'ไฟล์แนบ',
    no: 'ลำดับ',
    sessionIncharge: 'ผู้รับผิดชอบคาบ',
    sessionType: 'ประเภทคาบ',
    sessionReport: 'สรุปคาบเรียน',
    feedback: 'ข้อเสนอแนะ',
    nextRecommendation: 'แผนครั้งถัดไป',
    progressLink: 'ลิงก์ Project หรือรายงาน 12 ครั้ง (link)',

    // Common
    loading: 'กำลังโหลด...',
    items: 'รายการ',
    noReports: 'ยังไม่มีรายงาน',
    noStudents: 'ไม่พบนักเรียนที่ค้นหา',
    studentNotFound: 'ไม่พบนักเรียน',
    unknown: 'ไม่ทราบ',
    open: 'เปิด',
    show: 'แสดง',
    hide: 'ซ่อน',
    copy: 'คัดลอก',
    copied: 'คัดลอกแล้ว',
    copyFailed: 'คัดลอกไม่สำเร็จ',
    program: 'โปรแกรม',

    // Forms
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    addReportTitle: 'เพิ่มรายงาน',
    addStudentTitle: 'เพิ่มนักเรียนใหม่',
    fillStudentInfo: 'กรอกข้อมูลนักเรียนด้านล่าง',
    saveStudent: 'บันทึกนักเรียน',
    saveReport: 'บันทึกรายงาน',
    projectList: 'รายการโปรเจกต์', 

    // Messages
    coachOnlyFeature: 'ฟีเจอร์นี้สำหรับโค้ชเท่านั้น',
    loadingStudents: 'กำลังโหลดรายชื่อนักเรียน โปรดลองอีกครั้ง',
    coderIdNotFound: 'ไม่พบ Coder ID',
    incorrectParentPass: 'รหัสผู้ปกครองไม่ถูกต้อง',
    incorrectCoachPass: 'รหัสผ่านโค้ชไม่ถูกต้อง',
    provideCodeId: 'กรุณากรอกรหัสนักเรียน',
    coderIdExists: 'มี Coder ID นี้อยู่แล้ว',
    studentSaved: 'บันทึกนักเรียนสำเร็จ!',
    reportSaved: 'บันทึกรายงานสำเร็จ!',
    errorSavingStudent: 'เกิดข้อผิดพลาดในการเพิ่มนักเรียน',
    errorSavingReport: 'เกิดข้อผิดพลาดขณะบันทึก',
    sheetLinkNotSet: 'ยังไม่ได้ตั้งค่าลิงก์ชีต',
  coderId: 'Coder ID',
  fillBothFields: 'กรอกให้ครบทั้ง Coder ID และรหัสผู้ปกครอง',
  invalidParentPassword: 'รหัสผู้ปกครองไม่ถูกต้อง',
  noParentPasswordSet: 'ยังไม่ได้ตั้งรหัสผู้ปกครองในชีต',
    
  },
  en: {
    // Navigation
    home: 'Home',
    parent: 'Parent',
    coach: 'Coach',
    logout: 'Logout',
    

    // Landing
    landingTitle: 'Welcome to CIY.CLUB Student Reports',
    landingDesc: 'CIY.CLUB Student Progress Tracking System',
    parentLogin: 'Parent Login',
    coachLogin: 'Coach Login',

    // Parent Login
    parentLoginTitle: 'Parent Login',
    parentLoginDesc: 'Enter Coder ID and Parent Password',
    coderIdLabel: 'Coder ID',
    parentPassLabel: 'Parent Password',
    coderIdPlaceholder: 'e.g., 6600001',
    enterParentCode: 'Enter parent code', // ✅ เพิ่มคีย์ที่ขาด
    login: 'Log in',

    // Coach Login
    coachLoginTitle: 'Coach Login',
    coachLoginDesc: 'Enter the coach password',
    masterPassLabel: 'Master Password',

    // Students
    allStudents: 'All Students',
    searchPlaceholder: 'Search: Coder ID / Nickname / Name',
    clear: 'Clear',
    openStudents: 'Open Students',
    openReports: 'Open Reports',
    addStudent: '+ Add Student',
    nickname: 'Nickname',
    fullname: 'Full name',
    status: 'Status',
    course: 'Course',
    parentPassword: 'Parent Password',

    // Student Detail
    back: '← Back',
    studentDetail: 'Student Detail',
    addReport: '+ Add Report',
    allReports: 'All Reports',
    pastReports: 'Past Reports',

    // Table Headers
    date: 'Date',
    time: 'Time',
    topic: 'Topic',
    lesson: 'Lesson',
    summary: 'Summary',
    coachName: 'Coach',
    attachment: 'Attachment',
    no: 'No',
    sessionIncharge: 'Session incharge',
    sessionType: 'Session type',
    sessionReport: 'Session report',
    feedback: 'Feedback',
    nextRecommendation: 'Recommendation for next session',
    progressLink: 'Project or 12 Times Progress Report (link)',

    // Common
    loading: 'Loading...',
    items: 'items',
    noReports: 'No reports yet',
    noStudents: 'No matching students',
    studentNotFound: 'Student not found',
    unknown: 'Unknown',
    open: 'Open',
    show: 'Show',
    hide: 'Hide',
    copy: 'Copy',
    copied: 'Copied!',
    copyFailed: 'Copy failed',
    program: 'Program',

    // Forms
    save: 'Save',
    cancel: 'Cancel',
    addReportTitle: 'Add Report',
    addStudentTitle: 'Add Student',
    fillStudentInfo: 'Fill student info below',
    saveStudent: 'Save student',
    saveReport: 'Save report',
    projectList: 'Project List',

    // Messages
    coachOnlyFeature: 'This feature is for coaches only',
    loadingStudents: 'Students are still loading, please try again',
    coderIdNotFound: 'Coder ID not found',
    incorrectParentPass: 'Incorrect parent password',
    incorrectCoachPass: 'Incorrect coach password',
    provideCodeId: 'Please provide Coder ID',
    coderIdExists: 'This Coder ID already exists',
    studentSaved: 'Student saved!',
    reportSaved: 'Saved!',
    errorSavingStudent: 'Error adding student',
    errorSavingReport: 'Error saving',
    sheetLinkNotSet: 'Sheet link not set',
    coderId: 'Coder ID',
    fillBothFields: 'Please fill both fields.',
    invalidParentPassword: 'Invalid parent password.',
    noParentPasswordSet: 'Parent password not set in sheet.',
  }
} as const;

type Lang = keyof typeof translations;                  // 'th' | 'en'
type TranslationKey = keyof typeof translations['th'];  // คีย์ทั้งหมดที่รองรับ

export function useI18n() {
  const { lang } = useAuthStore() as { lang: Lang };

  const t = (key: TranslationKey): string => {
    // ถ้าภาษาปัจจุบันไม่มีค่านี้ ให้ fallback เป็น en
    return translations[lang][key] ?? translations.en[key];
  };

  return { t, lang };
}
