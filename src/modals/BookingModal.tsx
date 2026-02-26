import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { fetchAvailableSlots, submitBooking, fetchUserBookings } from '@/services/api'; // ✅ เพิ่ม fetchUserBookings
import { BookingSlot } from '@/types';

import { useI18n } from '@/hooks/useI18n';

const COACHES = [
  "Coach Bright", "Coach Nur", "Coach Biw", 
  "Coach Joshua", "Coach Elliw", "Coach Sup", "Coach Karn", "Coach Maung"
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

export const BookingModal: React.FC<Props> = ({ isOpen, onClose, student }) => {
  const { t, lang } = useI18n();

  
  const [selectedCoach, setSelectedCoach] = useState(COACHES[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userBookings, setUserBookings] = useState<any[]>([]); // ✅ State เก็บประวัติการจองของนักเรียน

  // ✅ 1. โหลดประวัติการจองของนักเรียนเมื่อเปิด Modal
  useEffect(() => {
    if (isOpen && student?.coder_id) {
      const loadHistory = async () => {
        try {
          const res = await fetchUserBookings(student.coder_id);
          if (res.success) setUserBookings(res.bookings || []);
        } catch (e) { console.error("History load failed", e); }
      };
      loadHistory();
    }
  }, [isOpen, student]);

  // ✅ 2. ดึงข้อมูลที่ว่างจาก Google Sheet
  useEffect(() => {
    let isMounted = true;
    if (isOpen && selectedDate && selectedCoach) {
      const getSlots = async () => {
        setIsLoading(true);
        try {
          const res = (await fetchAvailableSlots(selectedCoach, selectedDate)) as any;
          if (isMounted && res?.success) setSlots(res.slots || []);
        } catch (error) { 
          if (isMounted) setSlots([]);
        } finally { 
          if (isMounted) setIsLoading(false); 
        }
      };
      getSlots();
    }
    return () => { isMounted = false; };
  }, [isOpen, selectedDate, selectedCoach]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate('');
      setSelectedSlot(null);
      setSlots([]);
      setUserBookings([]); // ล้างประวัติเมื่อปิด
      setSelectedCoach(COACHES[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-gray-900">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">
            Booking: {student?.nickname || student?.fullname}
          </h2>
          <Button variant="ghost" onClick={onClose} className="text-gray-400">{t('cancel')}</Button>
        </div>

        <div className="p-6 space-y-8">
          {/* เลือกโค้ช */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">1. Select Coach</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {COACHES.map(coach => (
                <button
                  key={coach}
                  onClick={() => { setSelectedCoach(coach); setSelectedSlot(null); }}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full border-2 transition-all font-bold text-sm ${
                    selectedCoach === coach ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100' : 'border-gray-100 bg-gray-50 text-gray-400'
                  }`}
                >
                  {coach}
                </button>
              ))}
            </div>
          </section>

          {/* เลือกวันที่ */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">2. Select Date</h3>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {Array.from({ length: 14 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                if (d.getDay() === 1) return null; // หยุดวันจันทร์
                const dStr = d.toISOString().split('T')[0];
                const isSelected = selectedDate === dStr;
                return (
                  <button key={dStr} onClick={() => { setSelectedDate(dStr); setSelectedSlot(null); }}
                    className={`flex-shrink-0 p-4 rounded-2xl border-2 transition-all min-w-[80px] flex flex-col items-center ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white scale-105 shadow-xl shadow-blue-100' : 'border-gray-100 bg-white text-gray-400 hover:border-blue-200'
                    }`}>
                    <div className="text-[10px] uppercase font-black opacity-80">{d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'short' })}</div>
                    <div className="text-2xl font-black my-1">{d.getDate()}</div>
                    <div className="text-[10px] font-bold opacity-80">{d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short' })}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* แสดงเวลา (พร้อมระบบเช็คจองซ้ำ) */}
          {selectedDate && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">3. Select Time</h3>
              <div className="grid grid-cols-2 gap-3">
                {isLoading ? (
                  <div className="col-span-2 text-center py-10"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div></div>
                ) : slots.length > 0 ? (
                  slots.map(slot => {
                    // ✅ เช็คว่า "วันนี้ + เวลานี้" นักเรียนคนนี้จองไปแล้วหรือยัง
                    const isAlreadyBooked = userBookings.some(
                      (b: any) => b.date === selectedDate && b.time_slot === slot.time
                    );

                    return (
                      <Button
                        key={slot.id}
                        variant="ghost"
                        // ✅ ปิดปุ่มถ้าที่นั่งเต็ม หรือ จองไปแล้ว
                        disabled={slot.available_seats === 0 || isAlreadyBooked}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`border-2 py-6 flex flex-col items-center rounded-2xl transition-all ${
                          selectedSlot === slot.time ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-200'
                        } ${isAlreadyBooked ? 'opacity-40 bg-gray-100 cursor-not-allowed border-dashed' : ''}`}
                      >
                        <div className="text-xl font-bold">{slot.time}</div>
                        <div className={`text-[10px] font-bold ${isAlreadyBooked ? 'text-blue-500' : slot.available_seats === 0 ? 'text-red-500' : 'opacity-60'}`}>
                          {isAlreadyBooked ? 'จองคลาสนี้แล้ว' : slot.available_seats > 0 ? `ว่าง ${slot.available_seats} ที่` : 'คาบเรียนเต็ม'}
                        </div>
                      </Button>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 italic text-sm">ไม่มีรอบเรียนในวันที่เลือก</div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white sticky bottom-0 z-10">
          <Button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 disabled:bg-gray-200 transition-all" 
            disabled={!selectedSlot || isLoading}
            onClick={async () => {
              try {
                setIsLoading(true);
                const res = await submitBooking({ 
                  coder_id: student.coder_id, 
                  date: selectedDate, 
                  time_slot: selectedSlot!, 
                  note: `Coach: ${selectedCoach}` 
                });
                if (res.success) { alert('จองสำเร็จ!'); onClose(); } 
                else { alert(res.error || 'Booking failed'); }
              } catch (err) { alert('Connection error'); } 
              finally { setIsLoading(false); }
            }}>
            {isLoading ? t('loading') : t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};