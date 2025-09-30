import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStudents, useStudentSearch, useStudentSort } from '@/hooks/useStudents';
import { useI18n } from '@/hooks/useI18n';
import { useToast } from '@/components/Toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StudentTable } from '@/tables/StudentTable';
import { AddStudentModal } from '@/modals/AddStudentModal';
import { CONFIG } from '@/config';
import { Menu } from 'lucide-react'; // ใช้ icon สามขีด

export function Students() {
  const { session } = useAuthStore();
  const { students, loading, loadStudents } = useStudents();
  const { t } = useI18n();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
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
      {/* หัวข้อ + Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{t('allStudents')}</h3>
          
          {/* ปุ่ม Hamburger เฉพาะจอเล็ก */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box ยืดได้ */}
          <div className="flex-1 min-w-[200px]">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full"
            />
          </div>

          {/* ปุ่ม Toolbar จอใหญ่ */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" onClick={handleClearSearch}>
              {t('clear')}
            </Button>

            <span className="hidden md:inline-block w-px h-6 bg-white/10 mx-1" />

            <Button variant="ghost" onClick={() => handleOpenSheet('students')}>
              {t('openStudents')}
            </Button>

            <Button variant="ghost" onClick={() => handleOpenSheet('reports')}>
              {t('openReports')}
            </Button>

            <Button variant="primary" onClick={handleAddStudent}>
              {t('addStudent')}
            </Button>
          </div>
        </div>
      </div>

      {/* เมนูแบบ Slide ลงมา (เฉพาะจอเล็ก) */}
      {menuOpen && (
        <div className="md:hidden bg-white rounded-xl shadow-lg p-4 space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleClearSearch}
          >
            {t('clear')}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleOpenSheet('students')}
          >
            {t('openStudents')}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleOpenSheet('reports')}
          >
            {t('openReports')}
          </Button>
          <Button
            variant="primary"
            className="w-full justify-start"
            onClick={handleAddStudent}
          >
            {t('addStudent')}
          </Button>
        </div>
      )}

      <StudentTable
        students={sortedStudents}
        loading={loading}
        sortState={sortState}
        onSort={handleSort}
      />

      <AddStudentModal
        isOpen={showAddModal}
        students={students}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddStudentSuccess}
      />
    </div>
  );
}



// import React, { useState } from 'react';
// import { useAuthStore } from '@/store/authStore';
// import { useStudents, useStudentSearch, useStudentSort } from '@/hooks/useStudents';
// import { useI18n } from '@/hooks/useI18n';
// import { useToast } from '@/components/Toast';
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';
// import { StudentTable } from '@/tables/StudentTable';
// import { AddStudentModal } from '@/modals/AddStudentModal';
// import { CONFIG } from '@/config';

// export function Students() {
//   const { session } = useAuthStore();
//   const { students, loading, loadStudents } = useStudents();
//   const { t } = useI18n();
//   const { showToast } = useToast();
  
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showAddModal, setShowAddModal] = useState(false);
  
//   const filteredStudents = useStudentSearch(students, searchQuery);
//   const { sortedStudents, sortState, handleSort } = useStudentSort(filteredStudents);

//   const handleClearSearch = () => setSearchQuery('');

//   const handleOpenSheet = (type: 'students' | 'reports') => {
//     const links = CONFIG.sheetLinks;
//     const url = type === 'students' ? links.students : links.reports;
//     if (!url) {
//       showToast(t('sheetLinkNotSet'), 'error');
//       return;
//     }
//     window.open(url, '_blank');
//   };

//   const handleAddStudent = () => {
//     if (session.role !== 'coach') {
//       showToast(t('coachOnlyFeature'), 'warn');
//       return;
//     }
//     setShowAddModal(true);
//   };

//   const handleAddStudentSuccess = async () => {
//     await loadStudents();
//   };

//   if (session.role !== 'coach') {
//     return (
//       <div className="glass rounded-2xl p-6 shadow-strong">
//         <div className="text-center text-white/70">{t('coachOnlyFeature')}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* หัวข้อ */}
//       <div className="flex items-center justify-between">
//         <h3 className="text-xl font-bold">{t('allStudents')}</h3>
//       </div>

//       {/* Toolbar: บรรทัดเดียวเสมอ + เลื่อนแกน X ได้เมื่อแคบ */}
//       <div className="overflow-x-auto">
//         <div className="flex items-center gap-2 flex-nowrap min-w-max w-full">
//           {/* ค้นหา: ยืดได้แต่ไม่ล้น */}
//           <div className="flex-1 min-w-0">
//             <Input
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder={t('searchPlaceholder')}
//               className="w-full"
//             />
//           </div>

//           <Button
//             variant="ghost"
//             onClick={handleClearSearch}
//             className="flex-shrink-0 whitespace-nowrap"
//           >
//             {t('clear')}
//           </Button>

//           <span className="hidden md:inline-block w-px h-6 bg-white/10 mx-1" />

//           <Button
//             variant="ghost"
//             onClick={() => handleOpenSheet('students')}
//             className="flex-shrink-0 whitespace-nowrap"
//           >
//             {t('openStudents')}
//           </Button>

//           <Button
//             variant="ghost"
//             onClick={() => handleOpenSheet('reports')}
//             className="flex-shrink-0 whitespace-nowrap"
//           >
//             {t('openReports')}
//           </Button>

//           {/* ปุ่ม Add ด้านขวาสุด */}
//           <Button
//             variant="primary"
//             onClick={handleAddStudent}
//             className="flex-shrink-0 whitespace-nowrap ml-auto"
//           >
//             {t('addStudent')}
//           </Button>
//         </div>
//       </div>

//       <StudentTable
//         students={sortedStudents}
//         loading={loading}
//         sortState={sortState}
//         onSort={handleSort}
//       />

//       <AddStudentModal
//         isOpen={showAddModal}
//         students={students}
//         onClose={() => setShowAddModal(false)}
//         onSuccess={handleAddStudentSuccess}
//       />
//     </div>
//   );
// }



// import React, { useState } from 'react';
// import { useAuthStore } from '@/store/authStore';
// import { useStudents, useStudentSearch, useStudentSort } from '@/hooks/useStudents';
// import { useI18n } from '@/hooks/useI18n';
// import { useToast } from '@/components/Toast';
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';
// import { StudentTable } from '@/tables/StudentTable';
// import { AddStudentModal } from '@/modals/AddStudentModal';
// import { CONFIG } from '@/config';

// export function Students() {
//   const { session } = useAuthStore();
//   const { students, loading, loadStudents } = useStudents();
//   const { t } = useI18n();
//   const { showToast } = useToast();
  
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showAddModal, setShowAddModal] = useState(false);
  
//   const filteredStudents = useStudentSearch(students, searchQuery);
//   const { sortedStudents, sortState, handleSort } = useStudentSort(filteredStudents);

//   const handleClearSearch = () => setSearchQuery('');

//   const handleOpenSheet = (type: 'students' | 'reports') => {
//     const links = CONFIG.sheetLinks;
//     const url = type === 'students' ? links.students : links.reports;
//     if (!url) {
//       showToast(t('sheetLinkNotSet'), 'error');
//       return;
//     }
//     window.open(url, '_blank');
//   };

//   const handleAddStudent = () => {
//     if (session.role !== 'coach') {
//       showToast(t('coachOnlyFeature'), 'warn');
//       return;
//     }
//     setShowAddModal(true);
//   };

//   const handleAddStudentSuccess = async () => {
//     await loadStudents();
//   };

//   if (session.role !== 'coach') {
//     return (
//       <div className="glass rounded-2xl p-6 shadow-strong">
//         <div className="text-center text-white/70">{t('coachOnlyFeature')}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* หัวข้อ + แถบเครื่องมือ */}
//       <div className="flex flex-col gap-3">
//         <div className="flex items-center justify-between">
//           <h3 className="text-xl font-bold">{t('allStudents')}</h3>
//           {/* ปุ่ม Add สำหรับจอกว้าง */}
//           <div className="hidden md:block">
//             <Button variant="primary" onClick={handleAddStudent}>
//               {t('addStudent')}
//             </Button>
//           </div>
//         </div>

//         {/* Toolbar เหนือตาราง */}
//         <div className="flex flex-wrap items-center gap-2">
//           {/* กล่องค้นหา: ยืดได้แต่ไม่ล้น */}
//           <div className="flex-1 min-w-[220px] md:max-w-[560px]">
//             <Input
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder={t('searchPlaceholder')}
//               className="w-full"
//             />
//           </div>

//           <Button variant="ghost" onClick={handleClearSearch} className="flex-shrink-0">
//             {t('clear')}
//           </Button>

//           <span className="hidden md:inline-block w-px h-6 bg-white/10 mx-1" />

//           <Button
//             variant="ghost"
//             onClick={() => handleOpenSheet('students')}
//             className="flex-shrink-0"
//           >
//             {t('openStudents')}
//           </Button>

//           <Button
//             variant="ghost"
//             onClick={() => handleOpenSheet('reports')}
//             className="flex-shrink-0"
//           >
//             {t('openReports')}
//           </Button>

//           {/* ปุ่ม Add ชิดขวาสำหรับจอแคบ (ให้ wrap ไปบรรทัดใหม่ได้) */}
//           <div className="ml-auto md:hidden">
//             <Button variant="primary" onClick={handleAddStudent}>
//               {t('addStudent')}
//             </Button>
//           </div>
//         </div>
//       </div>

//       <StudentTable
//         students={sortedStudents}
//         loading={loading}
//         sortState={sortState}
//         onSort={handleSort}
//       />

//       <AddStudentModal
//         isOpen={showAddModal}
//         students={students}
//         onClose={() => setShowAddModal(false)}
//         onSuccess={handleAddStudentSuccess}
//       />
//     </div>
//   );
// }


// import React, { useState } from 'react';
// import { useAuthStore } from '@/store/authStore';
// import { useStudents, useStudentSearch, useStudentSort } from '@/hooks/useStudents';
// import { useI18n } from '@/hooks/useI18n';
// import { useToast } from '@/components/Toast';
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';
// import { StudentTable } from '@/tables/StudentTable';
// import { AddStudentModal } from '@/modals/AddStudentModal';
// import { CONFIG } from '@/config';

// export function Students() {
//   const { session } = useAuthStore();
//   const { students, loading, loadStudents } = useStudents();
//   const { t } = useI18n();
//   const { showToast } = useToast();
  
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showAddModal, setShowAddModal] = useState(false);
  
//   const filteredStudents = useStudentSearch(students, searchQuery);
//   const { sortedStudents, sortState, handleSort } = useStudentSort(filteredStudents);

//   const handleClearSearch = () => {
//     setSearchQuery('');
//   };

//   const handleOpenSheet = (type: 'students' | 'reports') => {
//     const links = CONFIG.sheetLinks;
//     const url = type === 'students' ? links.students : links.reports;
    
//     if (!url) {
//       showToast(t('sheetLinkNotSet'), 'error');
//       return;
//     }
    
//     window.open(url, '_blank');
//   };

//   const handleAddStudent = () => {
//     if (session.role !== 'coach') {
//       showToast(t('coachOnlyFeature'), 'warn');
//       return;
//     }
//     setShowAddModal(true);
//   };

//   const handleAddStudentSuccess = async () => {
//     await loadStudents(); // Reload students list
//   };

//   if (session.role !== 'coach') {
//     return (
//       <div className="glass rounded-2xl p-6 shadow-strong">
//         <div className="text-center text-white/70">
//           {t('coachOnlyFeature')}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
//         <h3 className="text-xl font-bold">{t('allStudents')}</h3>
        
//         <div className="flex items-center gap-2 flex-wrap">
//           <Input
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder={t('searchPlaceholder')}
//             className="w-72 max-w-full"
//           />
          
//           <Button variant="ghost" onClick={handleClearSearch}>
//             {t('clear')}
//           </Button>
          
//           <span className="hidden md:inline-block w-px h-6 bg-white/10 mx-1"></span>
          
//           <Button variant="ghost" onClick={() => handleOpenSheet('students')}>
//             {t('openStudents')}
//           </Button>
          
//           <Button variant="ghost" onClick={() => handleOpenSheet('reports')}>
//             {t('openReports')}
//           </Button>
          
//           <Button variant="primary" onClick={handleAddStudent} className="ml-1">
//             {t('addStudent')}
//           </Button>
//         </div>
//       </div>

//       <StudentTable
//         students={sortedStudents}
//         loading={loading}
//         sortState={sortState}
//         onSort={handleSort}
//       />

//       <AddStudentModal
//         isOpen={showAddModal}
//         students={students}
//         onClose={() => setShowAddModal(false)}
//         onSuccess={handleAddStudentSuccess}
//       />
//     </div>
//   );
// }