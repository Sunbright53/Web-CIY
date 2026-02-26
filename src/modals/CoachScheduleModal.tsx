// src/modals/CoachScheduleModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { fetchCoachSchedule } from '@/services/api';

const COACHES = ["Coach Bright", "Coach Nur", "Coach Biw", "Coach Joshua", "Coach Ellie", "Coach Sup", "Coach Karn", "Coach Maung"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const CoachScheduleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [selectedCoach, setSelectedCoach] = useState(COACHES[0]);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || "Wednesday");
  const [rawSchedule, setRawSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        setIsLoading(true);
        try {
          const res = await fetchCoachSchedule(selectedCoach);
          if (res.success) setRawSchedule(res.data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
      };
      load();
    }
  }, [isOpen]);

  // ✅ รวมข้อมูลและกรองตามวัน/โค้ช
  const scheduleByTime = useMemo(() => {
    const filtered = rawSchedule.filter(item => 
      item.coach.toLowerCase().includes(selectedCoach.replace("Coach ", "").toLowerCase()) && 
      item.day === selectedDay
    );
    
    // จัดกลุ่มตามเวลา
    const groups: Record<string, any[]> = {};
    filtered.forEach(item => {
      if (!groups[item.time]) groups[item.time] = [];
      groups[item.time].push(item);
    });
    return groups;
  }, [rawSchedule, selectedCoach, selectedDay]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl text-slate-800">
        
        {/* Header - เลือกโค้ช */}
        <div className="p-6 border-b bg-slate-50 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-800">COACH SCHEDULE 📋</h2>
            <Button variant="ghost" onClick={onClose}>CLOSE</Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {COACHES.map(c => (
              <button key={c} onClick={() => setSelectedCoach(c)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${selectedCoach === c ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* เลือกวัน */}
        <div className="flex bg-slate-100 p-2 gap-2 overflow-x-auto">
          {DAYS.map(d => (
            <button key={d} onClick={() => setSelectedDay(d)}
              className={`flex-1 min-w-[100px] py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedDay === d ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              {d}
            </button>
          ))}
        </div>

        {/* ตารางเรียน */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f8fafc]">
          {isLoading ? (
            <div className="col-span-2 text-center py-20 font-bold text-slate-400 animate-pulse text-xl">LOADING SCHEDULE...</div>
          ) : Object.keys(scheduleByTime).length > 0 ? (
            Object.entries(scheduleByTime).map(([time, students]) => (
              <div key={time} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-xl font-black text-slate-700">{time}</span>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold ${students.length >= 4 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {students.length} / 4 Seats
                  </span>
                </div>
                
                {/* ✅ แสดงที่นั่ง 4 ตัว (รูปเด็ก) */}
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-24 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all
                      ${students[i] ? 'border-blue-200 bg-blue-50 text-blue-600 animate-in zoom-in-50' : 'border-slate-100 bg-slate-50 text-slate-200'}`}>
                      {students[i] ? (
                        <>
                          <span className="text-2xl mb-1">👦</span>
                          <span className="text-[10px] font-black uppercase text-center px-1 truncate w-full">{students[i].nickname}</span>
                          <span className="text-[8px] font-bold opacity-60">{students[i].coder_id}</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold">EMPTY</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300 font-black text-xl italic uppercase">
              No classes on {selectedDay}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};