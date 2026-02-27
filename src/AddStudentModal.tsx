// // src/AddStudentModal.tsx
// import { useEffect, useState } from 'react';
// import { submitStudent } from '@/services/api';
// import { CONFIG } from '@/config';

// type AddStudentModalProps = {
//   isOpen: boolean;
//   mode?: 'add' | 'edit';
//   initial?: Partial<{
//     coder_id: string;
//     nickname: string;
//     fullname: string;
//     status: string;
//     course: string;
//     program: string;
//     parent_password: string;
//   }>;
//   onClose: () => void;
//   onSuccess?: () => void;
// };

// export default function AddStudentModal({
//   isOpen,
//   mode = 'add',
//   initial,
//   onClose,
//   onSuccess,
// }: AddStudentModalProps) {
//   const [form, setForm] = useState({
//     coder_id: '',
//     nickname: '',
//     fullname: '',
//     status: 'Enrolled',
//     course: '',
//     program: '',
//     parent_password: '',
//     // ✅ ข้อมูลสำหรับจองเก้าอี้ถาวร
//     day: 'Saturday',
//     time: '11:00 - 12:30',
//     coach: 'Coach Ellie',
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (isOpen) {
//       if (initial) {
//         setForm(f => ({
//           ...f,
//           coder_id: initial.coder_id ?? '',
//           nickname: initial.nickname ?? '',
//           fullname: initial.fullname ?? '',
//           status: initial.status ?? 'Enrolled',
//           course: initial.course ?? '',
//           program: initial.program ?? '',
//           parent_password: initial.parent_password ?? '',
//         }));
//       } else {
//         // เคลียร์ฟอร์มเมื่อเปิดมาเพิ่มนักเรียนใหม่
//         setForm({
//           coder_id: '', nickname: '', fullname: '', status: 'Enrolled',
//           course: '', program: '', parent_password: '',
//           day: 'Saturday', time: '11:00 - 12:30', coach: 'Coach Ellie',
//         });
//       }
//     }
//   }, [isOpen, initial]);

//   if (!isOpen) return null;

//   async function handleSubmit(e?: React.FormEvent) {
//     if (e) e.preventDefault();
//     if (submitting) return;

//     setSubmitting(true);
//     setError(null);

//     try {
//       if (!form.coder_id || !form.nickname || !form.fullname) {
//         throw new Error('กรอก รหัสนักเรียน, ชื่อเล่น, ชื่อ-นามสกุล ให้ครบ');
//       }

//       // 1️⃣ 🚀 ส่งไปที่ Database Script (บันทึกรายชื่อลง Sheet Students)
//       await submitStudent(CONFIG.appScriptPostUrl, {
//         action: 'add_student_with_schedule',
//         coder_id: form.coder_id.trim(),
//         nickname: form.nickname.trim(),
//         fullname: form.fullname.trim(),
//         status: (form.status || 'Enrolled').trim(),
//         course_status: (form.course || '').trim(),
//         program: (form.program || '').trim(),
//         parent_password: (form.parent_password || '').trim(),
//       } as any);

//       // 2️⃣ 🚀 ส่งไปที่ Booking Script (บันทึกตารางลง Sheet Fix_date_coder เพื่อจองเก้าอี้)
//       // ชื่อนักเรียนจะเด้งไปนั่งในหน้า Coach Schedule ทันที
//       await submitStudent(CONFIG.bookingScriptUrl, {
//         action: 'add_student_with_schedule',
//         coder_id: form.coder_id.trim(),
//         nickname: form.nickname.trim(),
//         fix_day: form.day,
//         fix_time: form.time,
//         fix_coach: form.coach
//       } as any);

//       onSuccess?.();
//       onClose();
//     } catch (err: any) {
//       console.error("Submit Error:", err);
//       setError(err?.message || 'Something went wrong');
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//       <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
//         {/* Header */}
//         <div className="px-8 py-6 border-b bg-slate-50/50 flex items-center justify-between">
//           <h2 className="text-xl font-bold text-slate-800">
//             {mode === 'add' ? 'เพิ่มนักเรียนใหม่ & ฟิกตารางเรียน' : 'แก้ไขข้อมูลนักเรียน'}
//           </h2>
//           <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
//           {error && <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm border border-red-100">{error}</div>}

//           {/* ส่วนที่ 1: ข้อมูลนักเรียน */}
//           <section className="space-y-4">
//             <h3 className="text-xs font-bold text-sky-600 uppercase tracking-widest">ข้อมูลนักเรียน</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">CODER ID *</label>
//                 <input className="w-full rounded-xl border-slate-200 px-4 py-2 focus:ring-2 focus:ring-sky-500 transition-all outline-none border" placeholder="เช่น 6600010" value={form.coder_id} onChange={e => setForm({ ...form, coder_id: e.target.value })} />
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">ชื่อเล่น *</label>
//                 <input className="w-full rounded-xl border-slate-200 px-4 py-2 focus:ring-2 focus:ring-sky-500 transition-all outline-none border" placeholder="เช่น Putter" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">ชื่อ-นามสกุล *</label>
//                 <input className="w-full rounded-xl border-slate-200 px-4 py-2 focus:ring-2 focus:ring-sky-500 transition-all outline-none border" placeholder="ชื่อ-นามสกุลจริง" value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })} />
//               </div>
//             </div>
//           </section>

//           <hr className="border-slate-100" />

//           {/* ✅ ส่วนที่ 2: ตารางเรียนประจำ (เพื่อให้ชื่อไปโชว์ในหน้าตารางโค้ช) */}
//           <section className="space-y-4 bg-sky-50/50 p-6 rounded-2xl border border-sky-100">
//             <h3 className="text-xs font-bold text-sky-700 uppercase tracking-widest">ตารางเรียนประจำ (จองเก้าอี้ถาวร)</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">วันเรียน</label>
//                 <select className="w-full rounded-xl border-slate-200 px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-sky-500 border transition-all" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
//                   {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">เวลาเรียน</label>
//                 <select className="w-full rounded-xl border-slate-200 px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-sky-500 border transition-all" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}>
//                   {["09:00 - 10:30", "11:00 - 12:30", "13:30 - 15:00", "15:30 - 17:00", "17:30 - 19:00"].map(t => <option key={t} value={t}>{t}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">โค้ชดูแล</label>
//                 <select className="w-full rounded-xl border-slate-200 px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-sky-500 border transition-all" value={form.coach} onChange={e => setForm({ ...form, coach: e.target.value })}>
//                   {['Coach Ellie', 'Coach Joshua', 'Coach Biw', 'Coach Sup', 'Coach Bright'].map(c => <option key={c} value={c}>{c}</option>)}
//                 </select>
//               </div>
//             </div>
//           </section>

//           <hr className="border-slate-100" />

//           {/* ส่วนที่ 3: ข้อมูลคอร์ส */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">คอร์ส *</label>
//               <input className="w-full rounded-xl border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-sky-500 transition-all outline-none border" placeholder="Rookie / Special" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">รหัสผู้ปกครอง</label>
//               <input className="w-full rounded-xl border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-sky-500 transition-all outline-none border" placeholder="ตั้งรหัสดูรายงาน" value={form.parent_password} onChange={e => setForm({ ...form, parent_password: e.target.value })} />
//             </div>
//           </div>
//         </form>

//         {/* Footer */}
//         <div className="px-8 py-6 border-t bg-slate-50/50 flex gap-3 justify-end">
//           <button className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all" onClick={onClose} disabled={submitting}>ยกเลิก</button>
//           <button className="px-10 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 shadow-lg shadow-sky-200 transition-all disabled:opacity-50 flex items-center gap-2" onClick={() => handleSubmit()} disabled={submitting}>
//             {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'บันทึกนักเรียน'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }