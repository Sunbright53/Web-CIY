// src/hooks/useStudents.ts

import { useState, useEffect } from 'react';
import { Student, SortState } from '@/types';
import { CONFIG } from '@/config';
import { mapStudent } from "@/services/mapper"; 


export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


const loadStudents = async () => {
  try {
    setLoading(true);
   const res = await fetch(`${CONFIG.appScriptGetUrl}?action=students`);
    const json = await res.json();
    if (json.success) {
      // ✅ map project_list_url ให้เข้ารูปแบบ Student interface
      const mapped = json.students.map(mapStudent);
      setStudents(mapped);
    }
  } catch (err) {
    console.error("Failed to load students:", err);
    setError("โหลดข้อมูลไม่สำเร็จ");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadStudents();
  }, []);

  const addStudentLocal = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  const findStudentById = (coderId: string): Student | undefined => {
    return students.find(s => 
      (s.coder_id || '').toLowerCase() === (coderId || '').toLowerCase()
    );
  };

  return {
    students,
    loading,
    error,
    loadStudents,
    addStudentLocal,
    findStudentById
  };
}

export function useStudentSearch(
  students: Student[], 
  searchQuery: string = ''
) {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = students.filter(s =>
      (s.coder_id || '').toLowerCase().includes(query) ||
      (s.nickname || '').toLowerCase().includes(query) ||
      (s.fullname || '').toLowerCase().includes(query) ||
      (s.program || '').toLowerCase().includes(query)
    );
    
    setFilteredStudents(filtered);
  }, [students, searchQuery]);

  return filteredStudents;
}

export function useStudentSort(students: Student[]) {
  const [sortState, setSortState] = useState<SortState>({
    key: 'coder_id',
    dir: 'asc'
  });

  const handleSort = (key: string) => {
    setSortState(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedStudents = [...students].sort((a, b) => {
    const aVal = (a[sortState.key as keyof Student] || '').toString().toLowerCase();
    const bVal = (b[sortState.key as keyof Student] || '').toString().toLowerCase();
    
    if (aVal < bVal) return sortState.dir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortState.dir === 'asc' ? 1 : -1;
    return 0;
  });

  return {
    sortedStudents,
    sortState,
    handleSort
  };
}