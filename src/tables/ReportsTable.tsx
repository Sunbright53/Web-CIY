// src/tables/ReportsTable.tsx
import { useMemo, useState } from 'react';
import { Report, Student } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import { formatDate } from '@/hooks/useReports';
import { useFloatingHScroll } from '@/hooks/useFloatingHScroll';
import { AddReportModal } from '@/modals/AddReportModal';

interface ReportsTableProps {
  reports: Report[];
  loading: boolean;
  mode?: 'parent' | 'student' | 'coach';
  student?: Student;
  loadReports?: () => void;
}

export function ReportsTable({
  reports,
  loading,
  mode = 'student',
  student,
  loadReports
}: ReportsTableProps) {
  const { t } = useI18n();
  const tt = (key: string, fallback: string) => {
  try {
    return ((t as unknown as (k: string) => string)(key)) || fallback;
  } catch {
    return fallback;
  }
};
  // ⛳️ helper: วันที่สั้นสำหรับมือถือ
  const shortDate = (d?: string) => formatDate(d || '').replace(/\s+/g, ' ');

  // ⛳️ อ่านเพิ่ม/ย่อ (remember per-card)
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set());
  const toggleExpand = (id: string | number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  // key เสถียร
  const getKey = (r: any, i: number) => r?.row ?? r?.id ?? i;

  const { containerRef, ghostRef } = useFloatingHScroll();
  const [editing, setEditing] = useState<null | { row: number; initial: any }>(null);

  // === เรียงตามวันที่ ===
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  function parseDateSafe(d?: string) {
    if (!d) return 0;
    const direct = new Date(d);
    if (!isNaN(direct.getTime())) return direct.getTime();
    const parts = d.split(/[/-]/).map((x) => x.trim());
    if (parts.length >= 3) {
      const [dd, mm, yy] = parts;
      const Y = yy.length === 2 ? Number(`20${yy}`) : Number(yy);
      const M = Number(mm) - 1;
      const D = Number(dd);
      const t = new Date(Y, M, D).getTime();
      if (!isNaN(t)) return t;
    }
    return 0;
  }
  const sortedReports = useMemo(() => {
    const copy = [...reports];
    copy.sort((a, b) => {
      const ta = parseDateSafe((a as any).date || (a as any).Date);
      const tb = parseDateSafe((b as any).date || (b as any).Date);
      return order === 'asc' ? ta - tb : tb - ta;
    });
    return copy;
  }, [reports, order]);

  // สวิตช์เรียง
  const OrderSwitcher = () => (
    <div className="mb-3 flex items-center justify-end gap-2">
      <span className="text-sm text-slate-500">{t('sortBy') || 'เรียงตาม'}:</span>
      <div className="inline-flex rounded-2xl border border-slate-200 p-1">
        <button
          type="button"
          onClick={() => setOrder('desc')}
          className={
            'px-3 py-1 text-sm rounded-xl transition ' +
            (order === 'desc' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700')
          }
          aria-pressed={order === 'desc'}
        >
          {t('latest') || 'ล่าสุด'}
        </button>
        <button
          type="button"
          onClick={() => setOrder('asc')}
          className={
            'px-3 py-1 text-sm rounded-xl transition ' +
            (order === 'asc' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700')
          }
          aria-pressed={order === 'asc'}
        >
          {t('oldest') || 'เก่าสุด'}
        </button>
      </div>
    </div>
  );

  // =================== Parent Mode ===================
  const renderParentTable = () => (
    <div>
      <OrderSwitcher />

      {/* Mobile (<md) – Card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center text-slate-500 py-6">{t('loading')}</div>
        ) : sortedReports.length === 0 ? (
          <div className="text-center text-slate-500 py-6">{t('noReports')}</div>
        ) : (
          sortedReports.map((report, index) => {
            const key = getKey(report, index);
            const isOpen = expanded.has(key);

            const topic = report.course || report.topic || '-';
            const time = (report as any).time || '-';
            const dateStr = shortDate((report as any).date || (report as any).Date);
            const coach = (report as any).coach_name || (report as any).session_incharge || '-';
            const summary = (report as any).progress_summary || report.session_report || '';
            const link = (report as any).attachments || (report as any).link12;

            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-slate-500">#{index + 1}</div>
                  <div className="text-xs text-slate-500">{dateStr}</div>
                </div>

                {/* หัวข้อ + เวลา */}
                <div className="text-sm font-medium">
                  {topic} <span className="font-normal text-xs text-slate-600">· {time}</span>
                </div>

                {/* 🔹 Session Report */}
{summary && (
  <div className={`mt-3 text-sm text-slate-700 ${isOpen ? '' : 'line-clamp-3'}`}>
    <div className="font-semibold text-slate-600 mb-1">
      {t('sessionReport') || 'Session Report'}
    </div>
    {summary}
  </div>
)}

{/* 🔹 Feedback */}
{(report as any).feedback && (
  <div className="mt-3 text-sm text-slate-700">
    <div className="font-semibold text-slate-600 mb-1">
      {t('feedback') || 'Feedback'}
    </div>
    {(report as any).feedback}
  </div>
)}

{/* 🔹 Recommendation */}
{(report as any).next_recommend && (
  <div className="mt-3 text-sm text-slate-700">
    <div className="font-semibold text-slate-600 mb-1">
      {t('nextRecommendation') || 'Next Recommendation'}
    </div>
    {(report as any).next_recommend}
  </div>
)}

{/* 🔹 Project or 12 Times Progress Report (link) */}
{(report as any).attachments || (report as any).link12 ? (
  <div className="mt-3 text-sm text-slate-700">
    <div className="font-semibold text-slate-600 mb-1">
      {t('progressLink') || 'Project or 12 Times Progress Report (link)'}
    </div>
    <a
      href={(report as any).attachments || (report as any).link12}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-700 underline text-sm"
    >
      {t('open') || 'Open'}
    </a>
  </div>
) : null}

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-500">{coach}</div>
                  <div className="flex items-center gap-3">
                    {summary && summary.length > 200 && (
                      <button
                        type="button"
                        className="text-xs font-medium text-sky-700 underline"
                        onClick={() => toggleExpand(key)}
                      >
                        {isOpen ? tt('showLess', 'ย่อ') : tt('readMore', 'อ่านเพิ่ม')}
                      </button>
                    )}
                    {link && (
                      <a
                        className="text-xs font-medium text-sky-700 underline"
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('open')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop (≥md) – table เดิม */}
      <div
        id="reports-scroll-wrap"
        className="hidden md:block overflow-x-auto no-x-scrollbar"
        ref={containerRef}
      >
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
            ) : sortedReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-white/60 text-center">{t('noReports')}</td>
              </tr>
            ) : (
              sortedReports.map((report, index) => (
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
    </div>
  );

  // ================= Student/Coach Mode =================
  const renderStudentTable = () => {
    const colCount = mode === 'coach' ? 11 : 10;

    const triggerEdit = (r: Report) => {
      const rowNumber = (r as any).row as number | undefined;
      if (!rowNumber) return;
      setEditing({
        row: rowNumber,
        initial: {
          date: (r as any).date || (r as any).Date || '',
          time: r.time || '',
          topic: r.topic || r.course || '',
          session_incharge: (r as any).session_incharge || '',
          session_type: (r as any).session_type || '',
          session_report: r.session_report || '',
          feedback: (r as any).feedback || '',
          next_recommend: (r as any).next_recommend || '',
          link12: (r as any).link12 || ''
        }
      });
    };

    return (
      <div className="reports-card relative">
        <OrderSwitcher />

        {/* Mobile (<md) – Card list */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center text-slate-500 py-6">{t('loading')}</div>
          ) : sortedReports.length === 0 ? (
            <div className="text-center text-slate-500 py-6">{t('noReports')}</div>
          ) : (
            sortedReports.map((r, i) => {
              const key = getKey(r, i);
              const isOpen = expanded.has(key);

              const topic = r.topic || r.course || '-';
              const time = r.time || '-';
              const dateStr = shortDate((r as any).date || (r as any).Date);
              const coach = (r as any).session_incharge || (r as any).coach_name || '-';
              const summary = r.session_report || '';
              const link = (r as any).link12 || (r as any).attachments;

              return (
                <div key={key} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-slate-500">#{i + 1}</div>
                    <div className="text-xs text-slate-500">{dateStr}</div>
                  </div>

                  {/* หัวข้อ + เวลา */}
                  <div className="text-sm font-medium">
                    {topic} <span className="font-normal text-xs text-slate-600">· {time}</span>
                  </div>

                  {/* 🔹 Session Report */}
{summary && (
  <div className={`mt-3 text-sm text-slate-700 ${isOpen ? '' : 'line-clamp-3'}`}>
    <div className="font-semibold text-slate-600 mb-1">
      {t('sessionReport') || 'Session Report'}
    </div>
    {summary}
  </div>
)}

{/* 🔹 Feedback */}
{(r as any).feedback && (
  <div className="mt-3 text-sm text-slate-700">
    <div className="font-semibold text-slate-600 mb-1">
      {t('feedback') || 'Feedback'}
    </div>
    {(r as any).feedback}
  </div>
)}

{/* 🔹 Recommendation */}
{(r as any).next_recommend && (
  <div className="mt-3 text-sm text-slate-700">
    <div className="font-semibold text-slate-600 mb-1">
      {t('nextRecommendation') || 'Next Recommendation'}
    </div>
    {(r as any).next_recommend}
  </div>
)}

{/* 🔹 Project or 12 Times Progress Report (link) */}
{(r as any).attachments || (r as any).link12 ? (
  <div className="mt-3 text-sm text-slate-700">
    <div className="font-semibold text-slate-600 mb-1">
      {t('progressLink') || 'Project or 12 Times Progress Report (link)'}
    </div>
    <a
      href={(r as any).attachments || (r as any).link12}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-700 underline text-sm"
    >
      {t('open') || 'Open'}
    </a>
  </div>
) : null}


                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-slate-500">{coach}</div>
                    <div className="flex items-center gap-3">
                      {summary && (
                        <button
                          type="button"
                          className="text-xs font-medium text-sky-700 underline"
                          onClick={() => toggleExpand(key)}
                        >
                          {isOpen ? tt('showLess', 'ย่อ') : tt('readMore', 'อ่านเพิ่ม')}

                        </button>
                      )}
                      {link && (
                        <a
                          className="text-xs font-medium text-sky-700 underline"
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('open')}
                        </a>
                      )}
                    </div>
                  </div>

                  {mode === 'coach' && (
                    <div className="mt-2 text-right">
                      <button
                        className="text-xs text-sky-700 underline disabled:text-slate-400"
                        disabled={!((r as any).row as number | undefined)}
                        onClick={() => triggerEdit(r)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop (≥md) – table เดิม */}
        <div id="reports-scroll-wrap" className="hidden md:block overflow-x-auto" ref={containerRef}>
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
                 <td colSpan={colCount} className="px-4 py-6 text-white/60 text-center">
  {t('loading')}
</td>

                </tr>
              ) : sortedReports.length === 0 ? (
                <tr>
               <td colSpan={colCount} className="px-4 py-6 text-white/60 text-center">
  {t('noReports')}
</td>

                </tr>
              ) : (
                sortedReports.map((r, i) => {
                  const rowNumber = (r as any).row as number | undefined;
                  return (
                    <tr key={i} className="row-hover">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3">{formatDate((r as any).date || (r as any).Date)}</td>
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
                                date: (r as any).date || (r as any).Date || '',
                                time: r.time || '',
                                topic: r.topic || r.course || '',
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

        {/* ghost bar เฉพาะเดสก์ท็อป */}
        <div
          ref={ghostRef}
          className="hidden md:block reports-ghostbar sticky bottom-4 w-full overflow-x-auto rounded-lg border bg-white/70 shadow"
          style={{ height: 14, zIndex: 10 }}
          aria-hidden="true"
        >
          <div className="reports-ghostbar-inner h-3" />
        </div>

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
