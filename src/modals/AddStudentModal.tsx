import React, { useState, useEffect } from 'react';
import { AddStudentForm, Student } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { submitStudent } from '@/services/api';
import { CONFIG } from '@/config';
import { useToast } from '@/components/Toast';

interface AddStudentModalProps {
  isOpen: boolean;
  students: Student[];
  onClose: () => void;
  onSuccess: () => void;
}

// Generate random password (matches original logic)
function randomPassword(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function AddStudentModal({ isOpen, students, onClose, onSuccess }: AddStudentModalProps) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddStudentForm>({
    coder_id: '',
    nickname: '',
    fullname: '',
    status: 'Enrolled',
    course_status: '',
    program: '',
    parent_password: randomPassword()
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        coder_id: '',
        nickname: '',
        fullname: '',
        status: 'Enrolled',
        course_status: '',
        program: '',
        parent_password: randomPassword()
      });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.coder_id.trim()) {
      showToast(t('provideCodeId'), 'error');
      return;
    }

    // Check if Coder ID already exists
    const existingStudent = students.find(s => 
      (s.coder_id || '').toLowerCase() === formData.coder_id.toLowerCase()
    );
    
    if (existingStudent) {
      showToast(t('coderIdExists'), 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const isDemo = CONFIG.appScriptPostUrl.includes('REPLACE_WITH_YOUR_DEPLOYED_ID');
      
      if (isDemo) {
        // Demo mode - just show success
        showToast(t('lang') === 'th' ? 'บันทึกนักเรียน (เดโม) สำเร็จ' : 'Student saved (demo)', 'success');
      } else {
        await submitStudent(CONFIG.appScriptPostUrl, formData);
        showToast(t('studentSaved'), 'success');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to submit student:', error);
      showToast(t('errorSavingStudent'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'Enrolled', label: 'Enrolled' },
    { value: 'Not re-enrolled', label: 'Not re-enrolled' }
  ];

  const isDemo = CONFIG.appScriptPostUrl.includes('REPLACE_WITH_YOUR_DEPLOYED_ID');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 modal-overlay">
      <div className="w-full max-w-xl mx-4 glass rounded-2xl p-6 relative shadow-strong">
        <button 
          className="absolute top-3 right-3 px-3 py-1.5 rounded-lg hover:bg-white/10"
          onClick={onClose}
          disabled={loading}
        >
          ✕
        </button>
        
        <h3 className="text-xl font-bold mb-1">{t('addStudentTitle')}</h3>
        <p className="text-sm text-white/70 mb-4">{t('fillStudentInfo')}</p>
        
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <Input
            label={t('coderIdLabel')}
            name="coder_id"
            value={formData.coder_id}
            onChange={handleInputChange}
            placeholder={t('lang') === 'th' ? 'เช่น 6600010' : 'e.g., 6600010'}
            required
          />
          
          <Input
            label={t('nickname')}
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            placeholder={t('lang') === 'th' ? 'เช่น Putter' : 'e.g., Putter'}
            required
          />
          
          <Input
            label={t('fullname')}
            name="fullname"
            value={formData.fullname}
            onChange={handleInputChange}
            placeholder={t('lang') === 'th' ? 'ชื่อ-นามสกุล' : 'Full name'}
            required
            className="md:col-span-2"
          />
          
          <Select
            label={t('status')}
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={statusOptions}
            required
          />
          
          <Input
            label={t('course')}
            name="course_status"
            value={formData.course_status}
            onChange={handleInputChange}
            placeholder="Rookie / Special"
            required
          />
          
          <Input
            label={t('program') + ' (optional)'}
            name="program"
            value={formData.program}
            onChange={handleInputChange}
            placeholder="Python / Scratch / App Lab ..."
            className="md:col-span-2"
          />
          
          <Input
            label={t('parentPassword')}
            name="parent_password"
            value={formData.parent_password}
            onChange={handleInputChange}
            placeholder={t('lang') === 'th' ? 'เว้นว่างเพื่อสุ่มให้' : 'Leave blank to auto-generate'}
            className="md:col-span-2"
          />
          
          <div className="md:col-span-2 flex items-center justify-end gap-3 mt-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button type="submit" loading={loading}>
              {t('saveStudent')}
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-white/60 mt-3">
          {isDemo 
            ? (t('lang') === 'th' 
                ? 'หมายเหตุ: ยังไม่ได้ตั้งค่า Apps Script — เดโมโหมด (ข้อมูลจะไม่ถูกเขียนลงชีตจริง)'
                : 'Note: App Script URL not set yet — demo mode (won\'t write to real sheet)')
            : (t('lang') === 'th'
                ? 'ข้อมูลจะถูกส่งไปยัง Apps Script และเพิ่มลงชีต Students'
                : 'Data will be sent to Apps Script and appended to Students sheet')
          }
        </div>
      </div>
    </div>
  );
}