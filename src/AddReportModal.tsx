// src/modals/AddReportModal.tsx
import { useEffect, useState } from 'react';
import type { Student } from '@/types';
import { updateReportByRow, submitReport } from '@/services/api';
import { CONFIG } from '@/config';

type AddReportModalProps = {
  isOpen: boolean;
  mode?: 'add' | 'edit';
  reportRow?: number; // ใช้เมื่อ mode="edit"
  initial?: Partial<{
    date: string;
    time: string;
    topic: string;
    course: string;
    session_incharge: string;
    session_type: string;
    session_report: string;
    feedback: string;
    next_recommend: string;
    link12: string;
    attachments: string;
  }>;
  student: Student;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AddReportModal(props: AddReportModalProps) {
  const {
    isOpen,
    mode = 'add',
    reportRow,
    initial,
    onClose,
    onSuccess,
  } = props;

  const [form, setForm] = useState({
    date: '',
    time: '',
    topic: '',
    session_incharge: '',
    session_type: '',
    session_report: '',
    feedback: '',
    next_recommend: '',
    link12: '',
    attachments: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // เติมค่าเริ่มต้นเมื่อเป็นโหมด edit
  useEffect(() => {
    if (mode === 'edit' && initial) {
      setForm(f => ({
        ...f,
        date: initial.date ?? '',
        time: initial.time ?? '',
        topic: initial.topic ?? initial.course ?? '',
        session_incharge: initial.session_incharge ?? '',
        session_type: initial.session_type ?? '',
        session_report: initial.session_report ?? '',
        feedback: initial.feedback ?? '',
        next_recommend: initial.next_recommend ?? '',
        link12: initial.link12 ?? '',
        attachments: initial.attachments ?? '',
      }));
    }
  }, [mode, initial]);

  if (!isOpen) return null;

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'edit') {
        if (!reportRow) throw new Error('Missing report row');
        const res = await updateReportByRow(reportRow, {
          date: form.date,
          time: form.time,
          topic: form.topic, // map เป็น 'course' ใน api.ts
          session_incharge: form.session_incharge,
          session_type: form.session_type,
          session_report: form.session_report,
          feedback: form.feedback,
          next_recommend: form.next_recommend,
          link12: form.link12,
          attachments: form.attachments,
        });
        if (!res.success) throw new Error(res.error || 'Update failed');
        onSuccess?.();
        onClose();
      } else {
        // ✅ ADD MODE: เพิ่มรายงานใหม่
        if (!props.student?.coder_id) throw new Error('Missing student coder_id');

        // (validate เบื้องต้น)
        if (!form.date || !form.topic || !form.session_incharge || !form.session_type || !form.session_report) {
          throw new Error('กรอก: วันที่, หัวข้อ, ผู้รับผิดชอบ, ประเภทคาบ, สรุปคาบเรียน ให้ครบ');
        }

        await submitReport(
          CONFIG.appScriptPostUrl,
          props.student.coder_id,
          {
            date: form.date,
            time: form.time,
            topic: form.topic, // ฝั่ง API จะส่งเป็น course ให้
            session_incharge: form.session_incharge,
            session_type: form.session_type,
            session_report: form.session_report,
            feedback: form.feedback,
            next_recommend: form.next_recommend,
            link12: form.link12,
          } as any
        );

        onSuccess?.();
        onClose();
      }
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
            {mode === 'edit' ? 'Edit Report' : 'Add Report'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 text-red-700 px-4 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border px-3 py-2"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Time
              </label>
              <input
                type="time"
                className="w-full rounded-lg border px-3 py-2"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Topic / Course
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="e.g., Code.org C — L12"
                value={form.topic}
                onChange={e => setForm({ ...form, topic: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Session Incharge
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.session_incharge}
                onChange={e => setForm({ ...form, session_incharge: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Session Type
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Private / Group / Online"
                value={form.session_type}
                onChange={e => setForm({ ...form, session_type: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Session Report
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 min-h-[96px]"
                value={form.session_report}
                onChange={e => setForm({ ...form, session_report: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Feedback
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 min-h-[80px]"
                value={form.feedback}
                onChange={e => setForm({ ...form, feedback: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Next Recommendation
              </label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 min-h-[80px]"
                value={form.next_recommend}
                onChange={e => setForm({ ...form, next_recommend: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Progress Link
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="https://..."
                value={form.link12}
                onChange={e => setForm({ ...form, link12: e.target.value })}
              />
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
            Cancel
          </button>
          <button
            className="inline-flex items-center rounded-lg px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
            onClick={() => handleSubmit()}
            disabled={submitting}
          >
            {submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddReportModal;
