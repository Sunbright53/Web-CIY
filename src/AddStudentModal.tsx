// src/modals/AddStudentModal.tsx
import { useEffect, useState } from 'react';
import { submitStudent } from '@/services/api';
import { CONFIG } from '@/config';

type AddStudentModalProps = {
  isOpen: boolean;
  mode?: 'add' | 'edit';           // ตอนนี้รองรับ add เป็นหลัก
  initial?: Partial<{
    coder_id: string;
    nickname: string;
    fullname: string;
    status: string;
    course: string;                // map → course_status
    program: string;
    parent_password: string;
  }>;
  onClose: () => void;
  onSuccess?: () => void;          // เรียก reload รายชื่อนักเรียนในหน้า list
};

export default function AddStudentModal({
  isOpen,
  mode = 'add',
  initial,
  onClose,
  onSuccess,
}: AddStudentModalProps) {
  const [form, setForm] = useState({
    coder_id: '',
    nickname: '',
    fullname: '',
    status: 'Enrolled',
    course: '',
    program: '',
    parent_password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm(f => ({
        ...f,
        coder_id: initial.coder_id ?? '',
        nickname: initial.nickname ?? '',
        fullname: initial.fullname ?? '',
        status: initial.status ?? 'Enrolled',
        course: initial.course ?? '',
        program: initial.program ?? '',
        parent_password: initial.parent_password ?? '',
      }));
    }
  }, [initial]);

  if (!isOpen) return null;

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // validate basic
      if (!form.coder_id || !form.nickname || !form.fullname) {
        throw new Error('กรอก รหัสนักเรียน, ชื่อเล่น, ชื่อ-นามสกุล ให้ครบ');
      }

      await submitStudent(CONFIG.appScriptPostUrl, {
        coder_id: form.coder_id.trim(),
        nickname: form.nickname.trim(),
        fullname: form.fullname.trim(),
        status: (form.status || 'Enrolled').trim(),
        course_status: (form.course || '').trim(),
        program: (form.program || '').trim(),
        parent_password: (form.parent_password || '').trim(), // เว้นว่างให้สุ่มฝั่งเว็บก็ได้
      } as any);

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === 'add' ? 'เพิ่มนักเรียนใหม่' : 'แก้ไขข้อมูลนักเรียน'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 text-red-700 px-4 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                รหัสนักเรียน (Coder ID) *
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="เช่น 6600010"
                value={form.coder_id}
                onChange={e => setForm({ ...form, coder_id: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ชื่อเล่น *
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="เช่น Putter"
                value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ชื่อ-นามสกุล *
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="ชื่อ-นามสกุล"
                value={form.fullname}
                onChange={e => setForm({ ...form, fullname: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                สถานะ *
              </label>
              <select
                className="w-full rounded-lg border px-3 py-2 bg-white"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="Enrolled">Enrolled</option>
                <option value="Paused">Paused</option>
                <option value="Left">Left</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                คอร์ส *
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Rookie / Special"
                value={form.course}
                onChange={e => setForm({ ...form, course: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                โปรแกรม (optional)
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Python / Scratch / App Lab ..."
                value={form.program}
                onChange={e => setForm({ ...form, program: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                รหัสผู้ปกครอง
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.parent_password}
                onChange={e => setForm({ ...form, parent_password: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">
                เว้นว่างได้ (ระบบจะสุ่มฝั่งเว็บขณะส่ง)
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3 justify-end">
          <button
            className="inline-flex items-center rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100"
            onClick={onClose}
            disabled={submitting}
          >
            ยกเลิก
          </button>
          <button
            className="inline-flex items-center rounded-lg px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
            onClick={() => handleSubmit()}
            disabled={submitting}
          >
            {submitting ? 'กำลังบันทึก…' : 'บันทึกนักเรียน'}
          </button>
        </div>
      </div>
    </div>
  );
}
