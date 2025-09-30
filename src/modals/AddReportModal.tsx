// AddReportModal.tsx
import React, { useState, useEffect } from 'react';
import { Student, AddReportForm } from '@/types';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { submitReport } from '@/services/api';
import { CONFIG } from '@/config';
import { useToast } from '@/components/Toast';

interface AddReportModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddReportModal({ isOpen, student, onClose, onSuccess }: AddReportModalProps) {
  const { t, lang } = useI18n(); // ⬅️ เพิ่ม lang
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddReportForm>({
    date: new Date().toISOString().slice(0, 10),
    time: '',
    topic: '',
    session_incharge: '',
    session_type: '',
    session_report: '',
    feedback: '',
    next_recommend: '',
    link12: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        time: '',
        topic: '',
        session_incharge: '',
        session_type: '',
        session_report: '',
        feedback: '',
        next_recommend: '',
        link12: ''
      });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setLoading(true);
    try {
      const isDemo = CONFIG.appScriptPostUrl.includes('REPLACE_WITH_YOUR_DEPLOYED_ID');

      if (isDemo) {
        // ⬇️ เปลี่ยนมาใช้ lang
        showToast(lang === 'th' ? 'บันทึกสำเร็จ (เดโม)' : 'Saved (demo)', 'success');
      } else {
        await submitReport(CONFIG.appScriptPostUrl, student.coder_id, formData);
        showToast(t('reportSaved'), 'success');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
      showToast(t('errorSavingReport'), 'error');
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

        <h3 className="text-xl font-bold">{t('addReportTitle')}</h3>
        {student && (
          <p className="text-sm text-white/70 mt-1">
            {/* ⬇️ เปลี่ยน t('lang') → lang */}
            {lang === 'th' ? 'สำหรับ' : 'For'}: {student.nickname} ({student.coder_id})
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 grid md:grid-cols-2 gap-4">
          <Input
            label={t('date')}
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />

          <Input
            label={t('time')}
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            placeholder="e.g., 09:00–10:00"
          />

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
            <Button type="submit" loading={loading}>
              {t('saveReport')}
            </Button>
          </div>
        </form>

        <div className="text-xs text-white/60 mt-3">
          {/* ⬇️ ทั้งสอง ternary เปลี่ยนมาใช้ lang */}
          {isDemo
            ? (lang === 'th'
                ? 'หมายเหตุ: ยังไม่ได้ตั้งค่า Apps Script การบันทึกนี้เป็นเดโม'
                : 'Note: App Script URL not set yet. This is a demo save.')
            : (lang === 'th'
                ? 'ข้อมูลจะถูกส่งไปยัง Apps Script และเพิ่มลงชีตรายงาน'
                : 'Data will be sent to Google Apps Script and appended to the Reports sheet.')
          }
        </div>
      </div>
    </div>
  );
}
