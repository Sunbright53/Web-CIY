// src/tables/ReportsTable.tsx
import { useState } from 'react';
import { Report, Student } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import { formatDate } from '@/hooks/useReports';
import { useFloatingHScroll } from '@/hooks/useFloatingHScroll';
import { AddReportModal } from '@/modals/AddReportModal';

interface ReportsTableProps {
  reports: Report[];
  loading: boolean;
  mode?: 'parent' | 'student' | 'coach'; // ✅ โหมด coach
  student?: Student;                     // ✅ ส่งต่อให้ modal
  loadReports?: () => void;              // ✅ reload หลัง edit
}

export function ReportsTable({
  reports,
  loading,
  mode = 'student',
  student,
  loadReports
}: ReportsTableProps) {
  const { t } = useI18n();
  const { containerRef, ghostRef } = useFloatingHScroll();
  const [editing, setEditing] = useState<null | { row: number; initial: any }>(null);

  // =============== 🧾 Parent Mode ==================
  const renderParentTable = () => (
    <div id="reports-scroll-wrap" className="overflow-x-auto no-x-scrollbar" ref={containerRef}>
      <table className="w-full text-left border border-slate-300 rounded-xl overflow-hidden bg-white">
        <thead className="table-header">
          <tr className="[&>th]:px-4 [&>th]:py-3">
            <th>{t('date')}</th>
            <th>{t('topic')}</th>
            <th>{t('lesson')}</th>
            <th>{t('summary')}</th>
            <th>{t('coachName')}</th>
            <th>{t('attachment')}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-white/60 text-center">{t('loading')}</td>
            </tr>
          ) : reports.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-white/60 text-center">{t('noReports')}</td>
            </tr>
          ) : (
            reports.map((report, index) => (
              <tr key={index} className="row-hover">
                <td className="px-4 py-3">{formatDate(report.date)}</td>
                <td className="px-4 py-3">{report.course || report.topic || '-'}</td>
                <td className="px-4 py-3">{(report as any).lesson || '-'}</td>
                <td className="px-4 py-3 max-w-[420px]">
                  <div className="line-clamp-2">
                    {(report as any).progress_summary || report.session_report || '-'}
                  </div>
                </td>
                <td className="px-4 py-3">{(report as any).coach_name || report.session_incharge || '-'}</td>
                <td className="px-4 py-3">
                  {((report as any).attachments || (report as any).link12) ? (
                    <a
                      href={(report as any).attachments || (report as any).link12}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      {t('open')}
                    </a>
                  ) : '-' }
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // =============== 🧑‍💻 Student/Coach Mode ==================
  const renderStudentTable = () => {
    const colCount = mode === 'coach' ? 11 : 10;
    return (
      <div className="reports-card relative">
        <div id="reports-scroll-wrap" className="overflow-x-auto" ref={containerRef}>
          <table
            id="student-reports-table"
            className="w-full min-w-[1400px] text-left border border-slate-300 rounded-xl bg-white"
          >
            <thead className="table-header">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-center">
                <th>{t('no')}</th>
                <th>{t('date')}</th>
                <th>{t('time')}</th>
                <th>{t('topic')}</th>
                <th>{t('sessionIncharge')}</th>
                <th>{t('sessionType')}</th>
                <th>{t('sessionReport')}</th>
                <th>{t('feedback')}</th>
                <th>{t('nextRecommendation')}</th>
                <th>{t('progressLink')}</th>
                {mode === 'coach' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-6 text-white/60 text-center">{t('loading')}</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-6 text-white/60 text-center">{t('noReports')}</td>
                </tr>
              ) : (
                reports.map((r, i) => {
                  const rowNumber = (r as any).row as number | undefined;
                  return (
                    <tr key={i} className="row-hover">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3">{formatDate(r.date)}</td>
                      <td className="px-4 py-3">{r.time || '-'}</td>
                      <td className="px-4 py-3">{r.topic || r.course || '-'}</td>
                      <td className="px-4 py-3">{(r as any).session_incharge || (r as any).coach_name || '-'}</td>
                      <td className="px-4 py-3">{(r as any).session_type || '-'}</td>
                      <td className="px-4 py-3 max-w-[420px]">{r.session_report || '--'}</td>
                      <td className="px-4 py-3 max-w-[420px]">{(r as any).feedback || '--'}</td>
                      <td className="px-4 py-3 max-w-[420px]">{(r as any).next_recommend || '--'}</td>
                      <td className="px-4 py-3">
                        {((r as any).link12 || (r as any).attachments) ? (
                          <a
                            href={(r as any).link12 || (r as any).attachments}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                          >
                            {t('open')}
                          </a>
                        ) : '-' }
                      </td>

                      {mode === 'coach' && (
                        <td className="px-3 py-2 text-right">
                          <button
                            className="text-sky-600 hover:underline disabled:text-slate-400"
                            disabled={!rowNumber}
                            onClick={() => rowNumber && setEditing({
                              row: rowNumber,
                              initial: {
                                date: r.date || '',
                                time: r.time || '',
                                topic: (r.topic || r.course || ''),
                                session_incharge: (r as any).session_incharge || '',
                                session_type: (r as any).session_type || '',
                                session_report: r.session_report || '',
                                feedback: (r as any).feedback || '',
                                next_recommend: (r as any).next_recommend || '',
                                link12: (r as any).link12 || ''
                              }
                            })}
                          >
                            {'Edit'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* แถบสกรอลลอย */}
        <div
          ref={ghostRef}
          className="reports-ghostbar sticky bottom-4 w-full overflow-x-auto rounded-lg border bg-white/70 shadow"
          style={{ height: 14, zIndex: 10 }}
          aria-hidden="true"
        >
          <div className="reports-ghostbar-inner h-3" />
        </div>

        {/* ✅ Modal แก้ไขรายงาน */}
        {editing && student && (
          <AddReportModal
            isOpen
            mode="edit"
            reportRow={editing.row}
            initial={editing.initial}
            student={student}
            onClose={() => setEditing(null)}
            onSuccess={() => {
              setEditing(null);
              loadReports?.();
            }}
          />
        )}
      </div>
    );
  };

  return mode === 'parent' ? renderParentTable() : renderStudentTable();
}
