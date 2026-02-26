// src/modals/CancelBookingModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { fetchUserBookings, cancelBooking, fetchCoachSchedule, submitAbsence } from '@/services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

export const CancelBookingModal: React.FC<Props> = ({ isOpen, onClose, student }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [fixedSchedule, setFixedSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student?.coder_id) {
      loadData();
    }
  }, [isOpen, student]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. ดึงรายการที่จองเสริม (จาก Sheet Bookings)
      const resBookings = await fetchUserBookings(student.coder_id);
      
      // 2. ดึงตารางเรียนประจำ (จาก Sheet Fix_date_coder)
      const resSchedule = await fetchCoachSchedule("Coach Ellie");

      if (resBookings.success) setBookings(resBookings.bookings || []);
      
      if (resSchedule.success) {
        const myFixed = resSchedule.data.filter((item: any) => 
          String(item.coder_id) === String(student.coder_id) && item.nickname !== "Booking"
        );
        setFixedSchedule(myFixed);
      }
    } catch (err) {
      console.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (b: any) => {
    if (!window.confirm(`ยืนยันการยกเลิกคาบจองเสริมวันที่ ${b.date} ใช่หรือไม่?`)) return;
    setIsLoading(true);
    try {
      const res = await cancelBooking({
        coder_id: student.coder_id,
        date: b.date,
        time_slot: b.time_slot
      });
      if (res.success) { 
        alert('ยกเลิกคาบเรียนเรียบร้อยแล้ว'); 
        loadData(); 
      }
    } catch (err) { 
      alert('Connection error'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleAddAbsence = async (dayName: string, time: string) => {
    const reason = window.prompt(`ระบุเหตุผลการลาหยุดวัน ${dayName} เวลา ${time}:`);
    if (reason === null) return;

    setIsLoading(true);
    try {
      const d = new Date();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const targetDayIndex = days.indexOf(dayName);
      const currentDayIndex = d.getDay();
      const diff = targetDayIndex - currentDayIndex;
      d.setDate(d.getDate() + diff);
      const dateStr = d.toISOString().split('T')[0];

      const res = await submitAbsence({
        coder_id: student.coder_id,
        date: dateStr,
        time_slot: time,
        reason: reason || "ลาปกติ"
      });
      if (res.success) alert('แจ้งลาหยุดเรียบร้อยแล้ว ระบบจะคืนที่นั่งให้คนอื่นจองชดเชย');
    } catch (err) { 
      alert('Error submitting absence'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-gray-900">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-red-50 bg-red-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-red-600">จัดการคาบเรียน</h2>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading} 
            className="text-gray-400"
          >
            ปิด
          </Button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto relative">
          
          {/* ✅ แสดงตัวหมุนโหลดข้อมูลเมื่อ isLoading เป็น true */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-red-600 animate-pulse">กำลังดำเนินการ...</p>
              </div>
            </div>
          )}

          {/* ส่วนที่ 1: คาบเรียนประจำ (แจ้งลา) */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">คาบเรียนประจำ (แจ้งลาหยุด)</h3>
            {fixedSchedule.length > 0 ? fixedSchedule.map((f, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-2">
                <div>
                  <div className="font-bold text-blue-800">Every {f.day}</div>
                  <div className="text-sm text-blue-600 font-medium">{f.time}</div>
                </div>
                <Button 
                  disabled={isLoading}
                  onClick={() => handleAddAbsence(f.day, f.time)} 
                  className="bg-white text-blue-600 border border-blue-200 rounded-xl text-xs font-bold py-2 px-4 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                >
                  แจ้งลา
                </Button>
              </div>
            )) : <div className="text-center py-4 text-gray-400 text-xs italic">ไม่มีตารางเรียนประจำ</div>}
          </section>

          {/* ส่วนที่ 2: คาบที่จองเสริมไว้ (ยกเลิก) */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">คาบจองชดเชย (ยกเลิกจอง)</h3>
            {bookings.length > 0 ? bookings.map((b, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                <div>
                  <div className="font-bold text-gray-800">{b.date}</div>
                  <div className="text-sm text-gray-500 font-medium">{b.time_slot}</div>
                </div>
                <Button 
                  disabled={isLoading}
                  onClick={() => handleCancelBooking(b)} 
                  className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold py-2 px-4 transition-all disabled:opacity-50"
                >
                  ยกเลิก
                </Button>
              </div>
            )) : <div className="text-center py-4 text-gray-400 text-xs italic">ยังไม่มีรายการจองชดเชย</div>}
          </section>
        </div>
      </div>
    </div>
  );
};