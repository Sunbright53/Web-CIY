// src/App.tsx
import { useState } from 'react';
import { HashRouter, Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';

import { Header } from '@/components/Header';
import { ToastProvider, useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';

import { StudentProfile } from '@/cards/StudentProfile';
import { ReportsTable } from '@/tables/ReportsTable';
import { AddReportModal } from '@/modals/AddReportModal';
import { BookingModal } from '@/modals/BookingModal'; 
import { CancelBookingModal } from '@/modals/CancelBookingModal';
import { AttendanceCalendarModal } from '@/modals/AttendanceCalendarModal'; // ✅ 1. Import Modal ปฏิทินเพิ่มเข้ามา

import { useAuthStore } from '@/store/authStore';
import { useStudents } from '@/hooks/useStudents';
import { useReports } from '@/hooks/useReports';
import { useI18n } from '@/hooks/useI18n';

import { Landing } from '@/routes/Landing';
import ParentLogin from '@/routes/ParentLogin';

import CoachLogin from '@/routes/CoachLogin';
import { Students } from '@/routes/Students'; 

function CoachRoute() {
  const { session } = useAuthStore();
  return session.role === 'coach' ? <Students /> : <Navigate to="/coach-login" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Header />
        <main className="container mx-auto px-4 pt-5 pb-10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/parent" element={<ParentLogin />} />
            <Route path="/coach" element={<CoachRoute />} />
            <Route path="/coach-login" element={<CoachLogin />} />
            <Route path="/student/:id" element={<StudentDetail />} />
          </Routes>
        </main>
      </HashRouter>
    </ToastProvider>
  );
}

// ---------- หน้า Student Detail ----------
export function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { session } = useAuthStore();
  const { findStudentById } = useStudents();
  const { getReportsForStudent, loadReports } = useReports();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false); 
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false); // ✅ 2. เพิ่ม State สำหรับเปิด/ปิด Calendar Modal

  const student = id ? findStudentById(id) : null;
  const studentReports = student ? getReportsForStudent(student.coder_id) : [];

  const handleBack = () => {
    if (session.role === 'coach') navigate('/coach'); 
    else navigate(-1);
  };

  const handleAddReport = () => {
    if (session.role !== 'coach') {
      showToast(t('coachOnlyFeature'), 'warn');
      return;
    }
    setShowAddReportModal(true);
  };

  const handleAddReportSuccess = async () => {
    await loadReports();
  };

  if (!student) {
    return (
      <div className="glass rounded-2xl p-6 shadow-strong">
        <div className="text-center text-white/70">{t('studentNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleBack}>{t('back')}</Button>
          <h2 className="text-2xl font-bold">{t('studentDetail')}</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* ✅ 3. ปุ่มเช็ควันเรียน (สีเขียว/ขาว) */}
          <Button 
            variant="ghost" 
            className="bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 flex items-center gap-2"
            onClick={() => setShowCalendarModal(true)}
          >
            <span>🗓️</span>
            <span>{t('checkclass')}</span> 
          </Button>

          {/* ✅ ปุ่มจองเรียนเดิม (สีน้ำเงิน) */}
          <Button 
            variant="ghost" 
            className="bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/40 text-blue-100 flex items-center gap-2"
            onClick={() => setShowBookingModal(true)}
          >
            <span>📅</span>
            <span>{t('booking')}</span> 
          </Button>

          {/* ✅ ปุ่มยกเลิกคาบเรียน (สีแดงอ่อน) */}
          <Button 
            variant="ghost" 
            className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 flex items-center gap-2"
            onClick={() => setShowCancelModal(true)}
          >
            <span>🚫</span>
            <span>{t('canclesection')}</span> 
          </Button>

          {session.role === 'coach' && (
            <Button onClick={handleAddReport}>{t('addReport')}</Button>
          )}
        </div>
      </div>

      <StudentProfile student={student} />

      <div className="glass rounded-2xl p-6 shadow-strong">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{t('allReports')}</h3>
          <div className="text-sm text-white/60">
            {studentReports.length} {t('items')}
          </div>
        </div>

        <ReportsTable reports={studentReports} loading={false} mode="student" />
      </div>

      <AddReportModal
        isOpen={showAddReportModal}
        student={student}
        onClose={() => setShowAddReportModal(false)}
        onSuccess={handleAddReportSuccess}
      />

      <BookingModal
        isOpen={showBookingModal}
        student={student}
        onClose={() => setShowBookingModal(false)}
      />

      <CancelBookingModal
        isOpen={showCancelModal}
        student={student}
        onClose={() => setShowCancelModal(false)}
      />

      {/* ✅ 4. ใส่ Component AttendanceCalendarModal ไว้ท้ายสุด */}
      <AttendanceCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        reports={studentReports}
        nickname={student.nickname}
      />
    </div>
  );
}