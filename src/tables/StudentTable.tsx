import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, SortState } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/hooks/useI18n';

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  sortState: SortState;
  onSort: (key: string) => void;
}

// Generate short code (matches original logic)
function shortCodeFor(student: Student): string {
  const name = (student.nickname || '').replace(/[^A-Za-zก-ฮะ-์]/g, '').toUpperCase();
  const letters = (name + 'XYZ').slice(0, 3);
  const digits = ((student.coder_id || '').match(/\d+/g) || ['000']).join('').slice(-3) || '000';
  return letters + digits;
}

// ----- NEW: map สีของสถานะ -----
const statusClass = (status: string) => {
  if (status === 'Enrolled') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'Not re-enrolled') return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export function StudentTable({ students, loading, sortState, onSort }: StudentTableProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleStudentClick = (coderId: string) => {
    navigate(`/student/${coderId}`);
  };

  const getSortIndicator = (key: string) => {
    if (sortState.key !== key) return '';
    return sortState.dir === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-0 overflow-hidden shadow-strong">
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-slate-300 rounded-xl overflow-hidden bg-white">
            <thead className="table-header">
              <tr className="[&>th]:px-4 [&>th]:py-3">
                <th>Coder ID</th>
                <th>{t('nickname')}</th>
                <th>{t('fullname')}</th>
                <th>{t('status')}</th>
                <th>{t('course')}</th>
                <th>{t('parentPassword')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-6 text-white/60 text-center">
                  {t('loading')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="glass rounded-2xl p-0 overflow-hidden shadow-strong">
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-slate-300 rounded-xl overflow-hidden bg-white">
            <thead className="table-header">
              <tr className="[&>th]:px-4 [&>th]:py-3">
                <th>Coder ID</th>
                <th>{t('nickname')}</th>
                <th>{t('fullname')}</th>
                <th>{t('status')}</th>
                <th>{t('course')}</th>
                <th>{t('parentPassword')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-6 text-white/60 text-center">
                  {t('noStudents')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-0 overflow-hidden shadow-strong">
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-slate-300 rounded-xl overflow-hidden bg-white">
          <thead className="table-header">
            <tr className="[&>th]:px-4 [&>th]:py-3 select-none">
              <th 
                className="cursor-pointer hover:bg-sky-100"
                onClick={() => onSort('coder_id')}
              >
                Coder ID{getSortIndicator('coder_id')}
              </th>
              <th 
                className="cursor-pointer hover:bg-sky-100"
                onClick={() => onSort('nickname')}
              >
                {t('nickname')}{getSortIndicator('nickname')}
              </th>
              <th 
                className="cursor-pointer hover:bg-sky-100"
                onClick={() => onSort('fullname')}
              >
                {t('fullname')}{getSortIndicator('fullname')}
              </th>
              <th 
                className="cursor-pointer hover:bg-sky-100"
                onClick={() => onSort('status')}
              >
                {t('status')}{getSortIndicator('status')}
              </th>
              <th 
                className="cursor-pointer hover:bg-sky-100"
                onClick={() => onSort('course_status')}
              >
                {t('course')}{getSortIndicator('course_status')}
              </th>
              <th>{t('parentPassword')}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr 
                key={student.coder_id}
                className="row-hover cursor-pointer"
                onClick={() => handleStudentClick(student.coder_id)}
              >
                <td className="px-4 py-3">{student.coder_id}</td>
                <td className="px-4 py-3">
                  <div>{student.nickname || '-'}</div>
                  <div className="text-xs text-white/50 mt-0.5">
                    Code: {shortCodeFor(student)}
                  </div>
                </td>
                <td className="px-4 py-3">{student.fullname || '-'}</td>

                {/* ----- NEW: Badge สีตามสถานะ ----- */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${statusClass(student.status)}`}
                  >
                    {student.status}
                  </span>
                </td>

                <td className="px-4 py-3">{student.course_status || '-'}</td>
                <td className="px-4 py-3">
                  {student.parent_password ? (
                    <Badge status={student.parent_password} type="pill" />
                  ) : (
                    <span className="text-xs text-red-300">
                      {t('lang') === 'th' ? 'ไม่มีรหัสผู้ปกครอง' : 'No parent pass'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


