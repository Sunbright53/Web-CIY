// src/routes/StudentDetail.tsx
import { useState, useEffect } from 'react';
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

  // ⬇️ ดึง loadStudents มาด้วย
  const { findStudentById, loadStudents } = useStudents();

  const { getReportsForStudent, loadReports, loading: reportsLoading } = useReports() as any;

  const { t } = useI18n();
  const { showToast } = useToast();
  const [showAddReportModal, setShowAddReportModal] = useState(false);

  // ⬇️ โหลดข้อมูลนักเรียนใหม่ทุกครั้งที่เปิดหน้านี้ (หรือ id เปลี่ยน)
  useEffect(() => {
    loadStudents();
  }, [id]);

  const student = id ? findStudentById(id) : null;
  const studentReports = student ? getReportsForStudent(student.coder_id) : [];
  const isCoach = session?.role === 'coach';

  const handleBack = () => {
    if (isCoach) navigate('/coach');
    else navigate(-1);
  };

  const handleAddReport = () => {
    if (!isCoach) {
      showToast(t('coachOnlyFeature'), 'warn');
      return;
    }
    setShowAddReportModal(true);
  };

  const handleAddReportSuccess = async () => {
    await loadReports?.(); // Reload reports หลัง add สำเร็จ
  };

  if (!student) {
    return (
      <div className="glass rounded-2xl p-6 shadow-strong">
        <div className="text-center text-white/70">{t('studentNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto scrollable">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleBack}>
                {t('back')}
              </Button>
              <h2 className="text-2xl font-bold">{t('studentDetail')}</h2>
            </div>

            {isCoach && (
              <div>
                <Button onClick={handleAddReport}>{t('addReport')}</Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* โปรไฟล์นักเรียน */}
            <div className="flex flex-col">
              <div className="grid items-stretch">
                <StudentProfile student={student} />
              </div>
            </div>

            {/* Project List */}
            <div className="glass rounded-2xl p-6 shadow-strong">
              <div className="mb-4">
                <h3 className="text-lg font-bold">{t('projectList')}</h3>
              </div>
              {/* ⬇️ เมื่ออัปเดตแล้ว ให้โหลด students ใหม่ */}
              <ProjectListBox student={student} onUpdated={loadStudents} />
            </div>

            {/* ตารางรายงานทั้งหมด */}
            <div className="glass rounded-2xl p-6 shadow-strong">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{t('allReports')}</h3>
                <div className="text-sm text-white/60">
                  {studentReports.length} {t('items')}
                </div>
              </div>

              <ReportsTable
                reports={studentReports}
                loading={Boolean(reportsLoading)}
                mode={isCoach ? 'coach' : 'student'}
                student={student}
                loadReports={loadReports}
              />
            </div>
          </div>
        </div>
      </main>

      <AddReportModal
        isOpen={showAddReportModal}
        student={student}
        onClose={() => setShowAddReportModal(false)}
        onSuccess={handleAddReportSuccess}
      />
    </div>
  );
}
