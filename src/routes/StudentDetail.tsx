import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useStudents } from '@/hooks/useStudents';
import { useReports } from '@/hooks/useReports';
import { useI18n } from '@/hooks/useI18n';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';
import { StudentProfile } from '@/cards/StudentProfile'; 
import { ReportsTable } from '@/tables/ReportsTable';
import { AddReportModal } from '@/modals/AddReportModal';
import { ProjectListBox } from '@/components/ProjectListBox';

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
    if (session.role === 'coach') {
      navigate('/coach');
    } else {
      navigate(-1);
    }
  };

  const handleAddReport = () => {
    if (session.role !== 'coach') {
      showToast(t('coachOnlyFeature'), 'warn');
      return;
    }
    setShowAddReportModal(true);
  };

  const handleAddReportSuccess = async () => {
    await loadReports(); // Reload reports
  };

  if (!student) {
    return (
      <div className="glass rounded-2xl p-6 shadow-strong">
        <div className="text-center text-white/70">
          {t('studentNotFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* ✅ ส่วนที่สกรอลล์ได้ทั้งหน้า */}
      <main className="flex-1 overflow-y-auto scrollable">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleBack}>
                {t('back')}
              </Button>
              <h2 className="text-2xl font-bold">{t('studentDetail')}</h2>
            </div>

            {session.role === 'coach' && (
              <div>
                <Button onClick={handleAddReport}>
                  {t('addReport')}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* ข้อมูลโปรไฟล์นักเรียน */}
            <StudentProfile student={student} />

            {/* ✅ Project List Section */}
            <div className="glass rounded-2xl p-6 shadow-strong">
              <div className="mb-4">
                <h3 className="text-lg font-bold">
                  {t('projectList')}
                </h3>
              </div>
              <ProjectListBox student={student} />
            </div>

            {/* ตารางรายงานทั้งหมด */}
            <div className="glass rounded-2xl p-6 shadow-strong">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{t('allReports')}</h3>
                <div className="text-sm text-white/60">
                  {studentReports.length} {t('items')}
                </div>
              </div>

              {/* ตารางอยู่ใน ReportsTable */}
              <ReportsTable 
                reports={studentReports}
                loading={false}
                mode="student"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modal สำหรับ Add Report */}
      <AddReportModal
        isOpen={showAddReportModal}
        student={student}
        onClose={() => setShowAddReportModal(false)}
        onSuccess={handleAddReportSuccess}
      />
    </div>
  );
}




// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuthStore } from '@/store/authStore';
// import { useStudents } from '@/hooks/useStudents';
// import { useReports } from '@/hooks/useReports';
// import { useI18n } from '@/hooks/useI18n';
// import { useToast } from '@/components/Toast';
// import { Button } from '@/components/ui/Button';
// import { StudentProfile } from '@/cards/StudentProfile'; 
// import { ReportsTable } from '@/tables/ReportsTable';
// import { AddReportModal } from '@/modals/AddReportModal';
// import { ProjectListBox } from '@/components/ProjectListBox' 



// export function StudentDetail() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { session } = useAuthStore();
//   const { findStudentById } = useStudents();
//   const { getReportsForStudent, loadReports } = useReports();
//   const { t } = useI18n();
//   const { showToast } = useToast();
  
//   const [showAddReportModal, setShowAddReportModal] = useState(false);

//   const student = id ? findStudentById(id) : null;
//   const studentReports = student ? getReportsForStudent(student.coder_id) : [];

//   const handleBack = () => {
//     if (session.role === 'coach') {
//       navigate('/coach');
//     } else {
//       navigate(-1);
//     }
//   };

//   const handleAddReport = () => {
//     if (session.role !== 'coach') {
//       showToast(t('coachOnlyFeature'), 'warn');
//       return;
//     }
//     setShowAddReportModal(true);
//   };

//   const handleAddReportSuccess = async () => {
//     await loadReports(); // Reload reports
//   };

//   if (!student) {
//     return (
//       <div className="glass rounded-2xl p-6 shadow-strong">
//         <div className="text-center text-white/70">
//           {t('studentNotFound')}
//         </div>
//       </div>
//     );
//   }

//   return (
//   <div className="flex flex-col h-screen">
//       {/* ถ้ามี Header แบบ fixed ให้คงไว้ด้านบน; ถ้าไม่มีก็ข้ามได้ */}

//       {/* ✅ ส่วนที่สกรอลล์ได้ทั้งหน้า */}
//       <main className="flex-1 overflow-y-auto scrollable">
//         <div className="max-w-6xl mx-auto px-4 py-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
//             <div className="flex items-center gap-3">
//               <Button variant="ghost" onClick={handleBack}>
//                 {t('back')}
//               </Button>
//               <h2 className="text-2xl font-bold">{t('studentDetail')}</h2>
//             </div>

//             {session.role === 'coach' && (
//               <div>
//                 <Button onClick={handleAddReport}>
//                   {t('addReport')}
//                 </Button>
//               </div>
//             )}
//           </div>

//           <div className="space-y-6">
//             <StudentProfile student={student} />

//             {/* ❗️ห้ามใส่ overflow-x ตรง wrapper นี้ เพื่อไม่ให้ scrollbar ซ้อน */}
//             <div className="glass rounded-2xl p-6 shadow-strong">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-bold">{t('allReports')}</h3>
//                 <div className="text-sm text-white/60">
//                   {studentReports.length} {t('items')}
//                 </div>
//               </div>

//               {/* ตารางอยู่ใน ReportsTable */}
//               <ReportsTable 
//                 reports={studentReports}
//                 loading={false}
//                 mode="student"
//               />
//             </div>
//           </div>
//         </div>
//       </main>

//       <AddReportModal
//         isOpen={showAddReportModal}
//         student={student}
//         onClose={() => setShowAddReportModal(false)}
//         onSuccess={handleAddReportSuccess}
//       />
//     </div>    

//   );
// }