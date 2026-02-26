import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // นำเข้าสไตล์พื้นฐาน
import { Report } from '@/types';
import { Button } from '@/components/ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[]; // ดึงรายงานทั้งหมดของน้องคนนี้มา
  nickname: string;
}

export const AttendanceCalendarModal: React.FC<Props> = ({ isOpen, onClose, reports, nickname }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // ✅ กรองข้อมูล: วันไหนบ้างที่มีเรียน (จัดกลุ่มตามวันที่)
  const attendanceMap = useMemo(() => {
    const map: Record<string, Report[]> = {};
    reports.forEach(r => {
      if (r.date) {
        // แปลงวันที่จาก Sheet ให้เป็น Format YYYY-MM-DD เพื่อเทียบง่ายๆ
        const d = new Date(r.date).toDateString(); 
        if (!map[d]) map[d] = [];
        map[d].push(r);
      }
    });
    return map;
  }, [reports]);

  if (!isOpen) return null;

  // รายละเอียดของวันที่เลือก
  const dayReports = attendanceMap[selectedDate.toDateString()] || [];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">ประวัติการเรียน: {nickname}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="calendar-container mb-6 flex justify-center">
          <Calendar
            onChange={(val) => setSelectedDate(val as Date)}
            value={selectedDate}
            locale="th-TH"
            tileClassName={({ date }) => {
              // ✅ ใส่สีเขียวให้วันที่น้องมาเรียนจริง
              return attendanceMap[date.toDateString()] ? 'bg-green-100 text-green-700 font-bold rounded-full' : '';
            }}
          />
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 max-h-48 overflow-y-auto border border-slate-100">
          <p className="text-sm font-semibold text-slate-500 mb-2">
            วันที่ {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          
          {dayReports.length > 0 ? (
            dayReports.map((r, i) => (
              <div key={i} className="bg-white p-3 rounded-xl mb-2 border-l-4 border-green-500 shadow-sm">
                <p className="font-bold text-slate-700">{r.course || 'ไม่ระบุคอร์ส'}</p>
                <p className="text-xs text-slate-500">เวลา: {r.time} | ผู้สอน: {r.session_incharge}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 py-4 italic">ไม่มีข้อมูลการเรียนในวันนี้</p>
          )}
        </div>

        <Button onClick={onClose} className="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-3">
          ปิดหน้าต่าง
        </Button>
      </div>

      <style>{`
        .react-calendar { border: none; font-family: inherit; width: 100%; }
        .react-calendar__tile--now { background: #f1f5f9; border-radius: 0.5rem; }
        .react-calendar__tile--active { background: #1e293b !important; border-radius: 0.5rem; color: white !important; }
        .react-calendar__navigation button { font-size: 1.2rem; font-weight: bold; }
      `}</style>
    </div>
  );
};