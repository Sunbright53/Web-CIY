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

  const shortDate = (d?: string) => formatDate(d || '').replace(/\s+/g, ' ');

  const [expanded, setExpanded] = useState<Set<string | number>>(new Set());
  const toggleExpand = (id: string | number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getKey = (r: any, i: number) => r?.row ?? r?.id ?? i;

  const { containerRef, ghostRef } = useFloatingHScroll();
  const [editing, setEditing] = useState<null | { row: number; initial: any }>(null);

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

      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center text-slate-500 py-6">{t('loading')}</div>
        ) : sortedReports.length === 0 ? (
          <div className="text-center text-slate-500 py-6">{t('noReports')}</div>
        ) : (
          sortedReports.map((report, index) => {
            const key = getKey(report, index);
            const isOpen = expanded.has(key);
            const summary = (report as any).progress_summary || report.session_report || '';

            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-slate-500">#{index + 1}</div>
                  <div className="text-xs text-slate-500">{shortDate((report as any).date || (report as any).Date)}</div>
                </div>
                <div className="text-sm font-medium">
                  {report.course || report.topic || '-'} <span className="font-normal text-xs text-slate-600">· {(report as any).time || '-'}</span>
                </div>

                {summary && (
                  <div className={`mt-3 text-sm text-slate-700 ${isOpen ? '' : 'line-clamp-3'}`}>
                    <div className="font-semibold text-slate-600 mb-1">{t('sessionReport') || 'Session Report'}</div>
                    {summary}
                  </div>
                )}

                {(report as any).feedback && (
                  <div className="mt-3 text-sm text-slate-700">
                    <div className="font-semibold text-slate-600 mb-1">{t('feedback') || 'Feedback'}</div>
                    {(report as any).feedback}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-500">{(report as any).coach_name || (report as any).session_incharge || '-'}</div>
                  {summary.length > 200 && (
                    <button type="button" className="text-xs font-medium text-sky-700 underline" onClick={() => toggleExpand(key)}>
                      {isOpen ? tt('showLess', 'ย่อ') : tt('readMore', 'อ่านเพิ่ม')}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div id="reports-scroll-wrap" className="hidden md:block overflow-x-auto no-x-scrollbar" ref={containerRef}>
        <table className="w-full text-left border border-slate-300 rounded-xl overflow-hidden bg-white">
          <thead className="table-header">
            <tr className="[&>th]:px-4 [&>th]:py-3">
              <th>{t('date')}</th>
              <th>{t('topic')}</th>
              <th>{t('summary')}</th>
              <th>{t('feedback')}</th> {/* เพิ่มคอลัมน์ */}
              <th>{t('coachName')}</th>
              <th>{t('attachment')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center">{t('loading')}</td></tr>
            ) : sortedReports.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center">{t('noReports')}</td></tr>
            ) : (
              sortedReports.map((report, index) => (
                <tr key={index} className="row-hover">
                  <td className="px-4 py-3">{formatDate(report.date)}</td>
                  <td className="px-4 py-3">{report.course || report.topic || '-'}</td>
                  <td className="px-4 py-3 max-w-[420px]">
                    <div className="line-clamp-2">{(report as any).progress_summary || report.session_report || '-'}</div>
                  </td>
                  <td className="px-4 py-3">{(report as any).feedback || '--'}</td> {/* ดึง feedback */}
                  <td className="px-4 py-3">{(report as any).coach_name || report.session_incharge || '-'}</td>
                  <td className="px-4 py-3">
                    {((report as any).attachments || (report as any).link12) ? (
                      <a href={(report as any).attachments || (report as any).link12} target="_blank" rel="noopener noreferrer" className="link">{t('open')}</a>
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
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center text-slate-500 py-6">{t('loading')}</div>
          ) : sortedReports.length === 0 ? (
            <div className="text-center text-slate-500 py-6">{t('noReports')}</div>
          ) : (
            sortedReports.map((r, i) => {
              const key = getKey(r, i);
              const isOpen = expanded.has(key);
              return (
                <div key={key} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-slate-500">#{i + 1} | {shortDate((r as any).date || (r as any).Date)}</div>
                  </div>
                  <div className="text-sm font-medium">{r.topic || r.course || '-'}</div>
                  {r.session_report && (
                    <div className={`mt-2 text-sm text-slate-700 ${isOpen ? '' : 'line-clamp-2'}`}>
                      <span className="font-semibold">{t('summary')}:</span> {r.session_report}
                    </div>
                  )}
                  {(r as any).feedback && (
                    <div className="mt-2 text-sm text-slate-700">
                      <span className="font-semibold">{t('feedback')}:</span> {(r as any).feedback}
                    </div>
                  )}
                  <div className="mt-2 flex justify-end gap-2">
                    {mode === 'coach' && (
                      <button className="text-xs text-sky-700 underline" onClick={() => triggerEdit(r)}>Edit</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div id="reports-scroll-wrap" className="hidden md:block overflow-x-auto" ref={containerRef}>
          <table id="student-reports-table" className="w-full min-w-[1400px] text-left border border-slate-300 rounded-xl bg-white">
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
                <tr><td colSpan={colCount} className="px-4 py-6 text-center">{t('loading')}</td></tr>
              ) : sortedReports.length === 0 ? (
                <tr><td colSpan={colCount} className="px-4 py-6 text-center">{t('noReports')}</td></tr>
              ) : (
                sortedReports.map((r, i) => (
                  <tr key={i} className="row-hover">
                    <td className="px-4 py-3 text-center">{i + 1}</td>
                    <td className="px-4 py-3">{formatDate((r as any).date || (r as any).Date)}</td>
                    <td className="px-4 py-3 text-center">{r.time || '-'}</td>
                    <td className="px-4 py-3">{r.topic || r.course || '-'}</td>
                    <td className="px-4 py-3 text-center">{(r as any).session_incharge || (r as any).coach_name || '-'}</td>
                    <td className="px-4 py-3 text-center">{(r as any).session_type || '-'}</td>
                    <td className="px-4 py-3 max-w-[420px]">{r.session_report || '--'}</td>
                    <td className="px-4 py-3 max-w-[420px]">{(r as any).feedback || '--'}</td>
                    <td className="px-4 py-3 max-w-[420px]">{(r as any).next_recommend || '--'}</td>
                    <td className="px-4 py-3 text-center">
                      {((r as any).link12 || (r as any).attachments) ? (
                        <a href={(r as any).link12 || (r as any).attachments} target="_blank" rel="noopener noreferrer" className="link">{t('open')}</a>
                      ) : '-' }
                    </td>
                    {mode === 'coach' && (
                      <td className="px-3 py-2 text-right">
                        <button className="text-sky-600 hover:underline" onClick={() => triggerEdit(r)}>Edit</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div ref={ghostRef} className="hidden md:block reports-ghostbar sticky bottom-4 w-full overflow-x-auto rounded-lg border bg-white/70 shadow" style={{ height: 14, zIndex: 10 }}>
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
            onSuccess={() => { setEditing(null); loadReports?.(); }}
          />
        )}
      </div>
    );
  };

  return mode === 'parent' ? renderParentTable() : renderStudentTable();
}