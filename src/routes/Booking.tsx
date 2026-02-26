// import React, { useState, useMemo, useEffect } from 'react';
// import { useAuthStore } from '../store/authStore';
// import { fetchAvailableSlots, submitBooking } from '../services/api';
// import { BookingSlot } from '../types';

// // ✅ รายชื่อโค้ช 8 ท่านตามข้อมูลล่าสุด
// const COACHES = [
//   { id: 'c1', name: 'Coach Bright' },
//   { id: 'c2', name: 'Coach Nur' },
//   { id: 'c3', name: 'Coach Biw' },
//   { id: 'c4', name: 'Coach Joshua' },
//   { id: 'c5', name: 'Coach Elliw' },
//   { id: 'c6', name: 'Coach Sup' },
//   { id: 'c7', name: 'Coach Karn' },
//   { id: 'c8', name: 'Coach Maung' },
// ];

// // ✅ ช่วงเวลามาตรฐาน (ตัดรอบ 17:30 - 19:00 ออกถาวร)
// const MASTER_SLOTS = [
//   "09:00 - 10:30", 
//   "11:00 - 12:30", 
//   "13:00 - 15:00", 
//   "15:30 - 17:00"
// ];

// const Booking: React.FC = () => {
//   const { session } = useAuthStore();
//   const [selectedCoach, setSelectedCoach] = useState(COACHES[0].id);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [slots, setSlots] = useState<BookingSlot[]>([]);
//   const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // 1. ดึงข้อมูลและกรองช่วงเวลาตามกฎปฏิทินจริง
//   useEffect(() => {
//     if (selectedCoach && selectedDate) {
//       const getSlots = async () => {
//         setIsLoading(true);
//         try {
//           const d = new Date(selectedDate);
          
//           const filtered = MASTER_SLOTS.filter(time => {
//             // เงื่อนไข: อังคาร-อาทิตย์ ไม่มีรอบ 09:00 - 10:30
//             if (time.startsWith("09:00")) return false;
//             return true;
//           }).map((time, index) => ({
//             id: `slot-${index}`,
//             time: time,
//             available_seats: 2, 
//             max_seats: 2        // ✅ แก้ Error ts(2345)
//           }));

//           setSlots(filtered);
//         } catch (error) {
//           console.error("Error loading slots:", error);
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       getSlots();
//     }
//   }, [selectedCoach, selectedDate]);

//   // 2. ฟังก์ชันยืนยันการจอง
//   const handleConfirmBooking = async () => {
//     if (!selectedSlot || !session.coder_id) return;

//     const coachName = COACHES.find(c => c.id === selectedCoach)?.name;
//     const confirm = window.confirm(`ยืนยันการจองเรียนกับ ${coachName}\nวันที่ ${selectedDate} เวลา ${selectedSlot}?`);
//     if (!confirm) return;

//     try {
//       const res = await submitBooking({
//         coder_id: session.coder_id,
//         date: selectedDate,
//         time_slot: selectedSlot,
//         note: `Coach: ${coachName}`
//       });

//       if (res.success) {
//         alert('จองเรียนสำเร็จแล้ว! ข้อมูลถูกบันทึกลง Google Sheets เรียบร้อย');
//         setSelectedSlot(null);
//       } else {
//         alert(`เกิดข้อผิดพลาด: ${res.error}`);
//       }
//     } catch (error) {
//       alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
//     }
//   };

//   const availableDates = useMemo(() => {
//     const dates = [];
//     for (let i = 0; i < 14; i++) {
//       const d = new Date();
//       d.setDate(d.getDate() + i);
//       if (d.getDay() !== 1) dates.push(d); // หยุดวันจันทร์
//     }
//     return dates;
//   }, []);

//   return (
//     <div className="min-h-screen bg-slate-50 pb-24 text-gray-900">
//       <div className="p-5 bg-white border-b sticky top-0 z-20">
//         <h1 className="text-2xl font-bold text-gray-800">จองเวลาเรียน</h1>
//         {/* ✅ แก้ไข Error session.nickname โดยใช้ coder_id แทน */}
//         <p className="text-gray-500 text-sm italic">น้อง {session.coder_id || 'Student'}</p>
//       </div>

//       <main className="p-5 max-w-4xl mx-auto space-y-8">
//         <section>
//           <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Select Coach</label>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             {COACHES.map(coach => (
//               <button
//                 key={coach.id}
//                 onClick={() => { setSelectedCoach(coach.id); setSelectedSlot(null); }}
//                 className={`p-3 rounded-xl border-2 transition-all font-bold text-[10px] ${
//                   selectedCoach === coach.id ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' : 'border-gray-100 bg-white text-gray-400'
//                 }`}
//               >
//                 {coach.name}
//               </button>
//             ))}
//           </div>
//         </section>

//         <section>
//           <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Date Selection</h3>
//           <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
//             {availableDates.map((date) => {
//               const dateStr = date.toISOString().split('T')[0];
//               const isSelected = selectedDate === dateStr;
//               return (
//                 <button
//                   key={dateStr}
//                   onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
//                   className={`flex-shrink-0 w-16 p-3 rounded-2xl border-2 transition-all ${
//                     isSelected ? 'border-blue-600 bg-blue-600 text-white shadow-md scale-105' : 'border-gray-50 bg-white text-gray-400 shadow-sm'
//                   }`}
//                 >
//                   <div className="text-[10px] uppercase font-bold">{date.toLocaleDateString('th-TH', { weekday: 'short' })}</div>
//                   <div className="text-xl font-black leading-tight">{date.getDate()}</div>
//                   <div className="text-[9px] opacity-80 font-bold">{date.toLocaleDateString('th-TH', { month: 'short' })}</div>
//                 </button>
//               );
//             })}
//           </div>
//         </section>

//         {selectedDate && (
//           <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
//             <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
//               {isLoading ? 'Loading Slots...' : 'Available Time'}
//             </h3>
            
//             <div className="grid grid-cols-2 gap-3">
//               {slots.length > 0 ? (
//                 slots.map((slot) => (
//                   <button
//                     key={slot.id}
//                     disabled={slot.available_seats === 0}
//                     onClick={() => setSelectedSlot(slot.time)}
//                     className={`p-5 rounded-2xl border-2 font-bold transition-all flex flex-col items-center ${
//                       selectedSlot === slot.time ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-inner' : 'border-gray-50 bg-white shadow-sm'
//                     }`}
//                   >
//                     <div className="text-lg">{slot.time}</div>
//                     <div className="text-[10px] font-normal opacity-60">ว่าง {slot.available_seats} ที่</div>
//                   </button>
//                 ))
//               ) : (
//                 !isLoading && <p className="text-gray-400 text-sm italic col-span-2 text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed">ไม่มีรอบเรียนในวันที่เลือก</p>
//               )}
//             </div>
//           </section>
//         )}
//       </main>

//       {selectedSlot && (
//         <div className="fixed bottom-0 inset-x-0 p-5 bg-white border-t z-50 shadow-2xl animate-in slide-in-from-bottom-full">
//            <button 
//              onClick={handleConfirmBooking}
//              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 active:scale-95 transition-transform"
//            >
//              Confirm Booking: {selectedSlot}
//            </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Booking;