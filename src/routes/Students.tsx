import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStudents, useStudentSearch, useStudentSort } from '@/hooks/useStudents';
import { useI18n } from '@/hooks/useI18n';
import { useToast } from '@/components/Toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StudentTable } from '@/tables/StudentTable';
import { AddStudentModal } from '@/modals/AddStudentModal';
import { CoachScheduleModal } from '@/modals/CoachScheduleModal';
import { CONFIG } from '@/config';
import { Menu, ClipboardList } from 'lucide-react';

export function Students() {
  const { session } = useAuthStore();
  const { students, loading, loadStudents } = useStudents();
  const { t } = useI18n();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCoachSchedule, setShowCoachSchedule] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredStudents = useStudentSearch(students, searchQuery);
  const { sortedStudents, sortState, handleSort } = useStudentSort(filteredStudents);

  const handleClearSearch = () => setSearchQuery('');

  const handleOpenSheet = (type: 'students' | 'reports') => {
    const links = CONFIG.sheetLinks;
    const url = type === 'students' ? links.students : links.reports;
    if (!url) {
      showToast(t('sheetLinkNotSet'), 'error');
      return;
    }
    window.open(url, '_blank');
  };

  const handleAddStudent = () => {
    if (session.role !== 'coach') {
      showToast(t('coachOnlyFeature'), 'warn');
      return;
    }
    setShowAddModal(true);
  };

  const handleAddStudentSuccess = async () => {
    await loadStudents();
  };

  if (session.role !== 'coach') {
    return (
      <div className="glass rounded-2xl p-6 shadow-strong">
        <div className="text-center text-white/70">{t('coachOnlyFeature')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{t('allStudents')}</h3>
          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setMenuOpen(!menuOpen)} className="p-2">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-[200px]">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full"
            />
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" onClick={handleClearSearch}>{t('clear')}</Button>
            <span className="hidden md:inline-block w-px h-6 bg-white/10 mx-1" />

            {/* ✅ ปุ่มตารางโค้ช จอคอม: สีอ่อนลงเมื่อ Hover */}
            <Button 
              variant="ghost" 
              onClick={() => setShowCoachSchedule(true)}
              className="bg-slate-800 text-white flex items-center gap-2 hover:bg-slate-800/80 transition-all active:scale-95 shadow-sm"
            >
              <ClipboardList className="w-4 h-4" />
              <span>ตารางโค้ช</span>
            </Button>

            <Button variant="ghost" onClick={() => handleOpenSheet('students')}>{t('openStudents')}</Button>
            <Button variant="ghost" onClick={() => handleOpenSheet('reports')}>{t('openReports')}</Button>
            <Button variant="primary" onClick={handleAddStudent}>{t('addStudent')}</Button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white rounded-xl shadow-lg p-4 space-y-3">
          <Button variant="ghost" className="w-full justify-start" onClick={handleClearSearch}>{t('clear')}</Button>
          
          {/* ✅ ปุ่มตารางโค้ช จอมือถือ: สีอ่อนลงเมื่อ Hover */}
          <Button 
            variant="ghost" 
            onClick={() => { setShowCoachSchedule(true); setMenuOpen(false); }}
            className="w-full bg-slate-800 text-white flex items-center justify-start gap-2 hover:bg-slate-800/80 transition-all active:scale-95 px-4"
          >
            <ClipboardList className="w-4 h-4" />
            <span>ตารางโค้ช</span>
          </Button>

          <Button variant="ghost" className="w-full justify-start" onClick={() => { handleOpenSheet('students'); setMenuOpen(false); }}>{t('openStudents')}</Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { handleOpenSheet('reports'); setMenuOpen(false); }}>{t('openReports')}</Button>
          <Button variant="primary" className="w-full justify-start" onClick={handleAddStudent}>{t('addStudent')}</Button>
        </div>
      )}

      <StudentTable students={sortedStudents} loading={loading} sortState={sortState} onSort={handleSort} />
      <AddStudentModal isOpen={showAddModal} students={students} onClose={() => setShowAddModal(false)} onSuccess={handleAddStudentSuccess} />
      <CoachScheduleModal isOpen={showCoachSchedule} onClose={() => setShowCoachSchedule(false)} />
    </div>
  );
}