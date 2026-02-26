import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { fetchUserBookings, cancelBooking } from '@/services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

export const CancelBookingModal: React.FC<Props> = ({ isOpen, onClose, student }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student?.coder_id) {
      loadData();
    }
  }, [isOpen, student]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchUserBookings(student.coder_id);
      if (res.success) setBookings(res.bookings || []);
    } catch (err) {
      console.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (b: any) => {
    if (!window.confirm(`ยืนยันการยกเลิกคาบเรียนวันที่ ${b.date} เวลา ${b.time_slot} ใช่หรือไม่?`)) return;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-gray-900">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-red-50 bg-red-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-red-600">จัดการคาบเรียนที่จองไว้</h2>
          <Button variant="ghost" onClick={onClose} className="text-gray-400">ปิด</Button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading && bookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
          ) : bookings.length > 0 ? (
            bookings.map((b, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <div className="font-bold text-gray-800">{b.date}</div>
                  <div className="text-sm text-gray-500 font-medium">{b.time_slot}</div>
                </div>
                <Button 
                  onClick={() => handleCancel(b)}
                  className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold py-2 px-4 transition-all"
                >
                  ยกเลิก
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 italic text-sm">ยังไม่มีรายการจองเรียน</div>
          )}
        </div>
      </div>
    </div>
  );
};