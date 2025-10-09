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



// ----- NEW: map สีของสถานะ -----
const statusClass = (status: string) => {
  if (status === 'Enrolled') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'Not re-enrolled') return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export function StudentTable({ students, loading, sortState, onSort }: StudentTableProps) {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const handleStudentClick = (coderId: string) => {
    navigate(`/student/${coderId}`);
  };

  const getSortIndicator = (key: string) => {
    if (sortState.key !== key) return '';
    return sortState.dir === 'asc' ? ' ↑' : ' ↓';
  };

  const TableWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="glass rounded-2xl p-0 overflow-hidden shadow-strong">
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden bg-white">
          {children}
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <TableWrapper>
        <thead className="table-header bg-slate-100 text-gray-700 text-sm">
          <tr className="[&>th]:px-4 [&>th]:py-4">
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
            <td colSpan={6} className="px-4 py-6 text-slate-500 text-center">
              {t('loading')}
            </td>
          </tr>
        </tbody>
      </TableWrapper>
    );
  }

  if (students.length === 0) {
    return (
      <TableWrapper>
        <thead className="table-header bg-slate-100 text-gray-700 text-sm">
          <tr className="[&>th]:px-4 [&>th]:py-4">
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
            <td colSpan={6} className="px-4 py-6 text-slate-500 text-center">
              {t('noStudents')}
            </td>
          </tr>
        </tbody>
      </TableWrapper>
    );
  }

  return (
    <TableWrapper>
      <thead className="table-header bg-slate-100 text-gray-700 text-sm">
        <tr className="[&>th]:px-4 [&>th]:py-4 select-none">
          <th
            className="cursor-pointer hover:bg-sky-50"
            onClick={() => onSort('coder_id')}
          >
            Coder ID{getSortIndicator('coder_id')}
          </th>
          <th
            className="cursor-pointer hover:bg-sky-50"
            onClick={() => onSort('nickname')}
          >
            {t('nickname')}{getSortIndicator('nickname')}
          </th>
          <th
            className="cursor-pointer hover:bg-sky-50"
            onClick={() => onSort('fullname')}
          >
            {t('fullname')}{getSortIndicator('fullname')}
          </th>
          <th
            className="cursor-pointer hover:bg-sky-50"
            onClick={() => onSort('status')}
          >
            {t('status')}{getSortIndicator('status')}
          </th>
          <th
            className="cursor-pointer hover:bg-sky-50"
            onClick={() => onSort('course_status')}
          >
            {t('course')}{getSortIndicator('course_status')}
          </th>
          <th>{t('parentPassword')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {students.map((student) => (
          <tr
            key={student.coder_id}
            className="odd:bg-white even:bg-slate-50 hover:bg-sky-50 transition-colors cursor-pointer"
            onClick={() => handleStudentClick(student.coder_id)}
          >
            <td className="px-4 py-4">{student.coder_id}</td>

            {/* ไม่มี code ย่อยใต้ชื่อ */}
            <td className="px-4 py-4 font-medium">
              {student.nickname || '-'}
            </td>

            <td className="px-4 py-4">{student.fullname || '-'}</td>

            <td className="px-4 py-4">
              <span
                className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${statusClass(student.status)}`}
              >
                {student.status}
              </span>
            </td>

            <td className="px-4 py-4">{student.course_status || '-'}</td>
            <td className="px-4 py-4">
              {student.parent_password ? (
                <Badge status={student.parent_password} type="pill" />
              ) : (
                <span className="text-xs text-rose-400">
                  {lang === 'th' ? 'ไม่มีรหัสผู้ปกครอง' : 'No parent pass'}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
}
