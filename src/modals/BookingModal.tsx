import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { fetchAvailableSlots, submitBooking } from '@/services/api';
import { BookingSlot } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/hooks/useI18n';

// ✅ รายชื่อโค้ช 8 ท่านล่าสุด
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
  const { session } = useAuthStore();
  
  const [selectedCoach, setSelectedCoach] = useState(COACHES[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ แก้ไข useEffect เพื่อดึงข้อมูลจริงจาก Google Sheet และจัดการ Type ให้แม่นยำขึ้น
  useEffect(() => {
    let isMounted = true; // ป้องกันการอัปเดต State หาก Component ถูกปิดไปก่อน

    if (isOpen && selectedDate && selectedCoach) {
      const getSlots = async () => {
        setIsLoading(true);
        try {
          // ✅ เรียก API จริงที่เชื่อมกับ Google Apps Script
          const res = (await fetchAvailableSlots(selectedCoach, selectedDate)) as unknown as { 
            success: boolean; 
            slots: BookingSlot[] 
          };
          
          if (isMounted) {
            if (res && res.success && Array.isArray(res.slots)) {
              // ข้อมูล 'available_seats' จะถูกคำนวณมาจากจำนวนแถวใน Sheet
              setSlots(res.slots); 
            } else {
              setSlots([]);
            }
          }
        } catch (error) { 
          console.error('Failed to fetch real-time seats:', error); 
          if (isMounted) setSlots([]);
        } finally { 
          if (isMounted) setIsLoading(false); 
        }
      };
      getSlots();
    }

    return () => { isMounted = false; };
  }, [isOpen, selectedDate, selectedCoach]);

  // ล้างค่าเมื่อปิด Modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate('');
      setSelectedSlot(null);
      setSlots([]);
      setSelectedCoach(COACHES[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-gray-900">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            Booking section: {student?.nickname || student?.fullname}
          </h2>
          <Button variant="ghost" onClick={onClose}>{t('cancel')}</Button>
        </div>

        <div className="p-6 space-y-8">
          {/* 1. เลือกโค้ช */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Select Coach</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {COACHES.map(coach => (
                <button
                  key={coach}
                  onClick={() => { setSelectedCoach(coach); setSelectedSlot(null); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full border-2 transition-all font-bold text-sm ${
                    selectedCoach === coach ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-gray-100 bg-gray-50 text-gray-500'
                  }`}
                >
                  {coach}
                </button>
              ))}
            </div>
          </section>

          {/* 2. เลือกวันที่ (หยุดวันจันทร์) */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">{t('date')}</h3>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {Array.from({ length: 14 }).map((_, i) => {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() + i);

                if (d.getDay() === 1) return null; // หยุดวันจันทร์
                
                const dStr = d.toISOString().split('T')[0];
                const isSelected = selectedDate === dStr;
                
                return (
                  <button 
                    key={dStr}
                    onClick={() => { setSelectedDate(dStr); setSelectedSlot(null); }}
                    className={`flex-shrink-0 p-4 rounded-2xl border-2 transition-all min-w-[75px] flex flex-col items-center shadow-sm ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white scale-105 shadow-blue-200' : 'border-gray-100 bg-white text-gray-400 hover:border-blue-200'
                    }`}
                  >
                    <div className={`text-[10px] uppercase font-black ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                      {d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-2xl font-black leading-none my-1">{d.getDate()}</div>
                    <div className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-blue-500'}`}>
                      {d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short' })}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. แสดงเวลาที่ดึงจาก Google Sheet จริง */}
          {selectedDate && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">{t('time')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {isLoading ? (
                  <div className="col-span-2 text-center py-10 text-gray-400">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p>{t('loading')}</p>
                  </div>
                ) : slots.length > 0 ? (
                  slots.map(slot => (
                    <Button
                      key={slot.id}
                      variant="ghost"
                      // ✅ ล็อคปุ่มหากจองโค้ชคนนี้ครบ 4 คนแล้ว
                      disabled={slot.available_seats === 0}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`border-2 py-6 flex flex-col items-center rounded-2xl transition-all ${
                        selectedSlot === slot.time 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-inner' 
                        : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-200'
                      } ${slot.available_seats === 0 ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                    >
                      <div className="text-xl font-bold">{slot.time}</div>
                      <div className={`text-[10px] ${slot.available_seats === 0 ? 'text-red-500 font-bold' : 'opacity-60'}`}>
                        {slot.available_seats > 0 ? `ว่าง ${slot.available_seats} ที่` : 'คาบเรียนเต็มแล้ว'}
                      </div>
                    </Button>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 italic text-sm">ไม่มีรอบเรียนในวันที่เลือก</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white sticky bottom-0 z-10">
          <Button 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 active:scale-[0.98] transition-all disabled:bg-gray-200" 
            disabled={!selectedSlot || isLoading}
            onClick={async () => {
              try {
                setIsLoading(true);
                // บันทึกข้อมูลลง Sheet: Timestamp, Coder ID, Date, Time Slot, Note
                const res = await submitBooking({ 
                  coder_id: student.coder_id, 
                  date: selectedDate, 
                  time_slot: selectedSlot!, 
                  note: `Coach: ${selectedCoach} | Booked by ${session?.role || 'User'}` 
                });
                if (res.success) { 
                  alert('จองสำเร็จ! จำนวนที่ว่างจะถูกอัปเดตทันที'); 
                  onClose(); 
                } else { 
                  alert(res.error || 'Booking failed'); 
                }
              } catch (err) { 
                alert('Connection error'); 
              } finally { 
                setIsLoading(false); 
              }
            }}
          >
            {isLoading ? t('loading') : t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};