// src/App.tsx
import { useState } from 'react';
import { HashRouter, Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';

import { Header } from '@/components/Header';
import { ToastProvider, useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';

import { StudentProfile } from '@/cards/StudentProfile';
import { ReportsTable } from '@/tables/ReportsTable';
import { AddReportModal } from '@/modals/AddReportModal';

import { useAuthStore } from '@/store/authStore';
import { useStudents } from '@/hooks/useStudents';
import { useReports } from '@/hooks/useReports';
import { useI18n } from '@/hooks/useI18n';

import { Landing } from '@/routes/Landing';
import ParentLogin from '@/routes/ParentLogin';

import CoachLogin from '@/routes/CoachLogin';
import { Students } from '@/routes/Students'; // ✅ เอาหน้า Students มาแสดงเมื่อเป็น coach

function CoachRoute() {
  const { session } = useAuthStore();
  // ถ้าเป็น coach แล้ว => แสดง Students, ไม่งั้น => ส่งไปหน้า Login
  return session.role === 'coach' ? <Students /> : <Navigate to="/coach-login" replace />;
}

// function FixedViewport({
//   children,
//   baseW = 562,
//   baseH = 833,
// }: {
//   children: React.ReactNode;
//   baseW?: number;
//   baseH?: number;
// }) {
//   const [vw, setVw] = useState(window.innerWidth);
//   const [vh, setVh] = useState(window.innerHeight);

//   useEffect(() => {
//     const onResize = () => {
//       setVw(window.innerWidth);
//       setVh(window.innerHeight);
//     };
//     window.addEventListener('resize', onResize);
//     window.addEventListener('orientationchange', onResize);
//     return () => {
//       window.removeEventListener('resize', onResize);
//       window.removeEventListener('orientationchange', onResize);
//     };
//   }, []);

//   // scale เฉพาะเมื่อจอเล็กกว่า base (ไม่ upscale)
//   const scale = useMemo(() => Math.min(vw / baseW, vh / baseH, 1), [vw, vh, baseW, baseH]);

//   if (scale === 1) {
//     // จอ >= 562×833 ใช้เลย์เอาต์ปกติ (responsive ตามเดิม)
//     return <>{children}</>;
//   }

//   // จอ < 562×833 => scale ทั้งแอปให้พอดีจอ และจัดกึ่งกลาง
//   return (
//     <div
//       style={{
//         width: '100vw',
//         height: '100vh',
//         overflow: 'hidden',
//         display: 'flex',
//         alignItems: 'flex-start', // บน
//         justifyContent: 'center', // กลางแนวนอน
//         background: 'transparent',
//       }}
//     >
//       <div
//         style={{
//           width: baseW,
//           height: baseH,
//           transform: `scale(${scale})`,
//           transformOrigin: 'top center',
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }

// ---------- App (มี Router ครบ) ----------
export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Header />
        <main className="container mx-auto px-4 pt-5 pb-10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/parent" element={<ParentLogin />} />
            <Route path="/coach" element={<CoachRoute />} />        {/* ✅ gate */}
            <Route path="/coach-login" element={<CoachLogin />} />   {/* ✅ หน้า login */}
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

  const student = id ? findStudentById(id) : null;
  const studentReports = student ? getReportsForStudent(student.coder_id) : [];

  const handleBack = () => {
    if (session.role === 'coach') navigate('/coach'); // ✅ กลับไปพื้นที่ coach
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

        {session.role === 'coach' && (
          <Button onClick={handleAddReport}>{t('addReport')}</Button>
        )}
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
    </div>
  );
}