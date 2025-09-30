import React from 'react';
import { Report } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import { formatDate } from '@/hooks/useReports';
import { useFloatingHScroll } from '@/hooks/useFloatingHScroll';

interface ReportsTableProps {
  reports: Report[];
  loading: boolean;
  mode?: 'parent' | 'student';
}

// (ยังไม่ใช้ก็ปล่อยไว้ได้)
function linkOrDash(url: string, t: (key: string) => string): string {
  if (!url) return '-';
  const safe = url.startsWith('http') ? url : null;
  return safe ? `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="link">${t('open')}</a>` : '-';
}

export function ReportsTable({ reports, loading, mode = 'student' }: ReportsTableProps) {
  const { t } = useI18n();
  const { containerRef, ghostRef } = useFloatingHScroll();

  const renderParentTable = () => (
    <div  id="reports-scroll-wrap"
className="overflow-x-auto no-x-scrollbar"  // ⬅️ เพิ่ม no-x-scrollbar
  ref={containerRef}>
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
              <td colSpan={6} className="px-4 py-6 text-white/60 text-center">
                {t('loading')}
              </td>
            </tr>
          ) : reports.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-white/60 text-center">
                {t('noReports')}
              </td>
            </tr>
          ) : (
            reports.map((report, index) => (
              <tr key={index} className="row-hover">
                <td className="px-4 py-3">{formatDate(report.date)}</td>
                <td className="px-4 py-3">{report.course || report.topic || '-'}</td>
                <td className="px-4 py-3">{report.lesson || '-'}</td>
                <td className="px-4 py-3 max-w-[420px]">
                  <div className="line-clamp-2">
                    {report.progress_summary || report.session_report || '-'}
                  </div>
                </td>
                <td className="px-4 py-3">{report.coach_name || report.session_incharge || '-'}</td>
                <td className="px-4 py-3">
                  {(report.attachments || report.link12) ? (
                    <a
                      href={report.attachments || report.link12}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      {t('open')}
                    </a>
                  ) : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderStudentTable = () => (
    <div className="reports-card relative">
      {/* คอนเทนเนอร์ที่เลื่อนจริง */}
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-white/60 text-center">
                  {t('loading')}
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-white/60 text-center">
                  {t('noReports')}
                </td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <tr key={index} className="row-hover">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{formatDate(report.date)}</td>
                  <td className="px-4 py-3">{report.time || '-'}</td>
                  <td className="px-4 py-3">{report.topic || report.course || '-'}</td>
                  <td className="px-4 py-3">{report.session_incharge || report.coach_name || '-'}</td>
                  <td className="px-4 py-3">{report.session_type || '-'}</td>
                  <td className="px-4 py-3 max-w-[420px]">
                    <div>{report.session_report || report.progress_summary || '--'}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[420px]">
                    <div>{report.feedback || '--'}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[420px]">
                    <div>{report.next_recommend || report.next_plan || '--'}</div>
                  </td>
                  <td className="px-4 py-3">
                    {(report.link12 || report.attachments) ? (
                      <a
                        href={report.link12 || report.attachments}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        {t('open')}
                      </a>
                    ) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ แถบสกรอลลอย (ghost bar) — เปิดใช้งาน */}
      <div
  ref={ghostRef}
  className="reports-ghostbar sticky bottom-4 w-full overflow-x-auto rounded-lg border bg-white/70 shadow"
  style={{ height: 14, zIndex: 10 }}
  aria-hidden="true"
>
  <div className="reports-ghostbar-inner h-3" />
</div>
      {/* <div
        ref={ghostRef}
        className="reports-ghostbar fixed left-0 right-0 bottom-4 mx-auto w-[10%] overflow-x-auto rounded-lg border bg-white/70 shadow hidden"
        style={{ height: 14 }}
        aria-hidden="true"
      >
        <div className="reports-ghostbar-inner h-3" />
      </div> */}
    </div>
  );

  return mode === 'parent' ? renderParentTable() : renderStudentTable();
}
