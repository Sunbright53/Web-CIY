import { useState, useEffect } from 'react';
import { Report } from '@/types';
import { fetchReports } from '@/services/api';
import { CONFIG } from '@/config';

// Date parsing helper (matches original logic)
function dateFromAny(s: string): Date | null {
  if (!s) return null;
  
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const dd = +m[1];
    const MM = +m[2] - 1;
    const yy = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    const dt = new Date(yy, MM, dd);
    if (!isNaN(dt.getTime())) return dt;
  }
  
  return null;
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchReports(CONFIG.reportsCsv);
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const addReportLocal = (newReport: Report) => {
    setReports(prev => [newReport, ...prev]);
  };

  const getReportsForStudent = (coderId: string): Report[] => {
    return reports
      .filter(r => (r.coder_id || '').toLowerCase() === (coderId || '').toLowerCase())
      .sort((a, b) => {
        const dateA = dateFromAny(a.date);
        const dateB = dateFromAny(b.date);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      });
  };

  return {
    reports,
    loading,
    error,
    loadReports,
    addReportLocal,
    getReportsForStudent
  };
}

// Format date helper (matches original)
export function formatDate(dateString: string): string {
  const d = dateFromAny(dateString);
  if (!d) return dateString || '-';
  
  return String(d.getDate()).padStart(2, '0') + '/' +
         String(d.getMonth() + 1).padStart(2, '0') + '/' +
         d.getFullYear();
}