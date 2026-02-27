// src/modals/AddReportModal.tsx
import React, { useState, useEffect } from 'react';
import { Student, AddReportForm } from '@/types';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { submitReport, updateReportByRow } from '@/services/api';
import { CONFIG } from '@/config';
import { useToast } from '@/components/Toast';

type AddReportModalProps = {
  isOpen: boolean;
  mode?: 'add' | 'edit';
  initial?: Partial<AddReportForm>;
  reportRow?: number;
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddReportModal({
  isOpen,
  mode = 'add',
  initial,
  reportRow,
  student,
  onClose,
  onSuccess
}: AddReportModalProps) {
  const { t, lang } = useI18n();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  // 🔁 ดึงคอร์สจาก student แบบยืดหยุ่น (รองรับทั้ง course และ program)
  const studentCourse =
    (student as any)?.course ??
    (student as any)?.program ??
    '';

  const [formData, setFormData] = useState<AddReportForm>({
    date: initial?.date || today,
    time: initial?.time || '',
    // ✅ ใช้ topic จาก initial ก่อน ไม่มีก็ fallback เป็นคอร์สของนักเรียน
    topic: initial?.topic ?? studentCourse,
    session_incharge: initial?.session_incharge || '',
    session_type: initial?.session_type || '',
    session_report: initial?.session_report || '',
    feedback: initial?.feedback || '',
    next_recommend: initial?.next_recommend || '',
    link12: initial?.link12 || ''
  });

  // เมื่อ modal เปิด/เปลี่ยน initial ให้ sync ค่าอีกครั้ง
  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      date: initial?.date || today,
      time: initial?.time || '',
      topic: initial?.topic ?? studentCourse,
      session_incharge: initial?.session_incharge || '',
      session_type: initial?.session_type || '',
      session_report: initial?.session_report || '',
      feedback: initial?.feedback || '',
      next_recommend: initial?.next_recommend || '',
      link12: initial?.link12 || ''
    });
    // ❗ อย่าใส่ student.course/program ตรง ๆ เพราะ type อาจไม่ตรง
  }, [isOpen, initial, today, student]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    try {
      setLoading(true);
      const isDemo = CONFIG.appScriptPostUrl.includes('REPLACE_WITH_YOUR_DEPLOYED_ID');

      if (isDemo) {
        showToast(lang === 'th' ? 'บันทึกสำเร็จ (เดโม)' : 'Saved (demo)', 'success');
      } else {
        if (mode === 'edit') {
          if (!reportRow) {
            showToast(lang === 'th' ? 'ไม่พบหมายเลขแถวของรายงาน' : 'Missing report row index', 'error');
            return;
          }
          await updateReportByRow(CONFIG.appScriptPostUrl, reportRow, formData);
          showToast(t('saveChanges') || (lang === 'th' ? 'บันทึกการแก้ไขแล้ว' : 'Changes saved'), 'success');
        } else {
          await submitReport(CONFIG.appScriptPostUrl, student.coder_id, formData);
          showToast(t('reportSaved') || (lang === 'th' ? 'บันทึกสำเร็จ' : 'Report saved'), 'success');
        }
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || t('errorSavingReport') || 'Save failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const sessionTypeOptions = [
    { value: '', label: '-- Select Session Type --' },
    { value: 'Regular class', label: 'Regular class' },
    { value: 'Make-Up class', label: 'Make-Up class' }
  ];

  const isDemo = CONFIG.appScriptPostUrl.includes('REPLACE_WITH_YOUR_DEPLOYED_ID');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 modal-overlay">
      <div
        className="
          w-full mx-4
          bg-white rounded-2xl shadow-strong relative
          max-w-xl md:max-w-2xl
          max-h-[85vh] md:max-h-[90vh]
          overflow-y-auto
          p-4 md:p-6
        "
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <button
          className="absolute top-3 right-3 px-3 py-1.5 rounded-lg hover:bg-white/10"
          onClick={onClose}
          disabled={loading}
        >
          ✕
        </button>

        <h3 className="text-xl font-bold">
          {mode === 'edit'
            ? (t('editReport') || (lang === 'th' ? 'แก้ไขรายงาน' : 'Edit report'))
            : (t('addReportTitle') || (lang === 'th' ? 'เพิ่มรายงาน' : 'Add report'))}
        </h3>

        <p className="text-sm text-white/70 mt-1">
          {lang === 'th' ? 'สำหรับ' : 'For'}: {student.nickname} ({student.coder_id})
          {mode === 'edit' && reportRow ? ` · Row ${reportRow}` : null}
        </p>

        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="mt-5 grid md:grid-cols-2 gap-4">
          <Input label={t('date')} type="date" name="date" value={formData.date} onChange={handleInputChange} required />
          <Input label={t('time')} name="time" value={formData.time} onChange={handleInputChange} placeholder="e.g., 09:00–10:00" />

          <Input
            label={t('topic')}
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            placeholder="python / scratch …"
            required
          />

          <Input
            label={t('sessionIncharge')}
            name="session_incharge"
            value={formData.session_incharge}
            onChange={handleInputChange}
            placeholder="Coach name"
            required
          />

          <Select
            label={t('sessionType')}
            name="session_type"
            value={formData.session_type}
            onChange={handleInputChange}
            options={sessionTypeOptions}
            required
          />

          <div></div>

          <Textarea
            label={t('sessionReport')}
            name="session_report"
            value={formData.session_report}
            onChange={handleInputChange}
            placeholder="What was achieved?"
            required
            className="md:col-span-2"
          />

          <Textarea
            label={t('feedback')}
            name="feedback"
            value={formData.feedback}
            onChange={handleInputChange}
            placeholder="-"
            className="md:col-span-2"
          />

          <Textarea
            label={t('nextRecommendation')}
            name="next_recommend"
            value={formData.next_recommend}
            onChange={handleInputChange}
            placeholder="Plan for next session"
            className="md:col-span-2"
          />

          <Input
            label={t('progressLink')}
            type="url"
            name="link12"
            value={formData.link12}
            onChange={handleInputChange}
            placeholder="https://..."
            className="md:col-span-2"
          />

          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button onClick={save} loading={loading}>
              {mode === 'edit'
                ? (t('saveChanges') || (lang === 'th' ? 'บันทึกการเปลี่ยนแปลง' : 'Save changes'))
                : (t('saveReport') || (lang === 'th' ? 'บันทึกรายงาน' : 'Save report'))}
            </Button>
          </div>
        </form>

        <div className="text-xs text-white/60 mt-3">
          {isDemo
            ? (lang === 'th'
                ? 'หมายเหตุ: ยังไม่ได้ตั้งค่า Apps Script การบันทึกนี้เป็นเดโม'
                : 'Note: App Script URL not set yet. This is a demo save.')
            : (lang === 'th'
                ? 'ข้อมูลจะถูกส่งไปยัง Apps Script และเพิ่ม/แก้ไขในชีตรายงาน'
                : 'Data will be sent to Google Apps Script and appended/updated in the Reports sheet.')}
        </div>
      </div>
    </div>
  );
}
