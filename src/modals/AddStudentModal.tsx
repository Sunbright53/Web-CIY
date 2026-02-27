// src/modals/AddStudentModal.tsx
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

function randomPassword(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function AddStudentModal({ isOpen, students, onClose, onSuccess }: AddStudentModalProps) {
  const { t, lang } = useI18n();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<AddStudentForm>({
    coder_id: '',
    nickname: '',
    fullname: '',
    status: 'Enrolled',
    course_status: '',
    program: '',
    parent_password: randomPassword(),
    day: 'Saturday',
    time: '11:00 - 12:30',
    coach: 'Coach Ellie'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        coder_id: '',
        nickname: '',
        fullname: '',
        status: 'Enrolled',
        course_status: '',
        program: '',
        parent_password: randomPassword(),
        day: 'Saturday',
        time: '11:00 - 12:30',
        coach: 'Coach Ellie'
      });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.coder_id.trim()) {
      showToast(t('provideCodeId'), 'error');
      return;
    }

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
        showToast(lang === 'th' ? 'บันทึกนักเรียน (เดโม) สำเร็จ' : 'Student saved (demo)', 'success');
      } else {
        // 🚀 1. บันทึกลงฐานข้อมูลหลัก (Database_ciy_report)
        // ส่ง formData ไปตรงๆ เพื่อให้ api.ts จัดการ action ให้เอง
        await submitStudent(CONFIG.appScriptPostUrl, formData);

        // 🚀 2. บันทึกลงระบบจอง (CIY Booking System)
        // แก้ไข: ส่ง formData ไปเลย เพื่อให้ api.ts แมพค่า day, time, coach เข้า fix_... อัตโนมัติ
        if (CONFIG.bookingScriptUrl) {
          await submitStudent(CONFIG.bookingScriptUrl, formData);
        }

        showToast(t('studentSaved'), 'success');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to submit student:', error);
      showToast(error.message || t('errorSavingStudent'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => ({ value: d, label: d }));
  const timeOptions = ["09:00 - 10:30", "11:00 - 12:30", "13:30 - 15:00", "15:30 - 17:00", "17:30 - 19:00"].map(t => ({ value: t, label: t }));
  const coachOptions = ['Coach Ellie', 'Coach Joshua', 'Coach Biw', 'Coach Bright', 'Coach Sup'].map(c => ({ value: c, label: c }));

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] modal-overlay backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 glass rounded-3xl p-8 relative shadow-strong border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
        <button 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors" 
          onClick={onClose} 
          disabled={loading}
        >
          ✕
        </button>
        
        <h3 className="text-2xl font-bold mb-1 text-white">{t('addStudentTitle')}</h3>
        <p className="text-sm text-white/60 mb-6">{t('fillStudentInfo')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label={t('coderIdLabel')} name="coder_id" value={formData.coder_id} onChange={handleInputChange} required />
            <Input label={t('nickname')} name="nickname" value={formData.nickname} onChange={handleInputChange} required />
            <Input label={t('fullname')} name="fullname" value={formData.fullname} onChange={handleInputChange} required className="md:col-span-2" />
          </div>

          <div className="p-5 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-widest">ตารางเรียนประจำ (Fix Schedule)</h4>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">BOOKING SYSTEM</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <Select label="Day" name="day" value={formData.day} onChange={handleInputChange} options={dayOptions} />
              <Select label="Time" name="time" value={formData.time} onChange={handleInputChange} options={timeOptions} />
              <Select label="Coach" name="coach" value={formData.coach} onChange={handleInputChange} options={coachOptions} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input label={t('course')} name="course_status" value={formData.course_status} onChange={handleInputChange} required />
            <Input label={t('parentPassword')} name="parent_password" value={formData.parent_password} onChange={handleInputChange} />
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={onClose} disabled={loading}>{t('cancel')}</Button>
            <Button type="submit" loading={loading} className="px-8">{t('saveStudent')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}