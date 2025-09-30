import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/hooks/useStudents';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function ParentLogin() {
  const [coderId, setCoderId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { findStudentById } = useStudents();
  const { showToast } = useToast();
  const { t } = useI18n();
  const { setSession } = useAuthStore();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = coderId.trim();
      const pw = password.trim();

      if (!id || !pw) {
        showToast(t('fillBothFields') || 'Please fill both fields.', 'warn');
        return;
      }

      const st = findStudentById(id);
      if (!st) {
        showToast(t('studentNotFound') || 'Student not found.', 'error');
        return;
      }

      const sheetPw = (st.parent_password ?? '').trim();
      if (sheetPw.length === 0) {
        showToast(t('noParentPasswordSet') || 'Parent password not set in sheet.', 'error');
        return;
      }

      if (sheetPw !== pw) {
        showToast(t('invalidParentPassword') || 'Invalid parent password.', 'error');
        return;
      }

      // OK → ตั้ง session แล้วพาไปหน้า student detail (โหมดผู้ปกครอง)
      setSession({ role: 'parent', coder_id: st.coder_id });
      navigate(`/student/${st.coder_id}`);
    } catch (err) {
      console.error(err);
      showToast('Login failed.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6 shadow-strong space-y-4">
        <h2 className="text-2xl font-bold">{t('parentLogin') || 'Parent Login'}</h2>

        <div>
          <label className="block text-sm mb-1">{t('coderId') || 'Coder ID'}</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={coderId}
            onChange={(e) => setCoderId(e.target.value)}
            placeholder="e.g., 6600001"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">{t('parentPassword') || 'Parent Password'}</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="e.g., due2oe"
          />
        </div>

        <Button type="submit" className="w-full">{t('login') || 'Log in'}</Button>
      </form>
    </div>
  );
}