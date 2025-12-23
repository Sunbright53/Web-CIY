// src/cards/StudentProfile.tsx
import { useState } from 'react';
import { Student } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/hooks/useI18n';
import { useToast } from '@/components/Toast';
import { ProjectListBox } from '@/components/ProjectListBox';
import { updateParentPassword } from '@/services/api';

interface StudentProfileProps {
  student: Student;
}

function shortCodeFor(student: Student): string {
  const name = (student.nickname || '').replace(/[^A-Za-zก-ฮะ-์]/g, '').toUpperCase();
  const letters = (name + 'XYZ').slice(0, 3);
  const digits = ((student.coder_id || '').match(/\d+/g) || ['000']).join('').slice(-3) || '000';
  return letters + digits;
}

/** ปุ่ม/Modal เปลี่ยนรหัสผู้ปกครอง */
function ChangeParentPasswordButton({ coderId }: { coderId: string }) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const minLen = 6;

  const submit = async () => {
    const a = pw1.trim();
    const b = pw2.trim();
    if (!a || !b) return;
    if (a.length < minLen) {
      showToast(`รหัสอย่างน้อย ${minLen} ตัวอักษร`, 'warn');
      return;
    }
    if (a !== b) {
      showToast('รหัสไม่ตรงกัน', 'warn');
      return;
    }
    setLoading(true);
    const res = await updateParentPassword(coderId, a);
    setLoading(false);
    if (res.success) {
      showToast('เปลี่ยนรหัสสำเร็จ', 'success');
      setOpen(false);
      setPw1('');
      setPw2('');
    } else {
      showToast(res.error || 'อัปเดตไม่สำเร็จ', 'error');
    }
  };

  return (
    <>
      {/* ปุ่มเปิด modal */}
      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setOpen(true)}>
        {/* อย่าใช้ t('change') ถ้าไม่มีคีย์นี้ */}
        Change
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 modal-overlay" onClick={() => !loading && setOpen(false)} />
          <div className="relative glass rounded-2xl p-4 w-[92vw] max-w-sm shadow-strong">
            <div className="text-lg font-bold mb-3">Change Parent Password</div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">New password</label>
                <input
                  type="password"
                  className="input w-full rounded-lg px-3 py-2"
                  value={pw1}
                  minLength={minLen}
                  onChange={(e) => setPw1(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Confirm password</label>
                <input
                  type="password"
                  className="input w-full rounded-lg px-3 py-2"
                  value={pw2}
                  minLength={minLen}
                  onChange={(e) => setPw2(e.target.value)}
                />
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={loading}>
                  {/* ใช้คีย์ที่มีอยู่แล้ว: loading */}
                  {loading ? (t('loading') || 'Saving...') : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export function StudentProfile({ student }: StudentProfileProps) {
  const { session } = useAuthStore();
  const { t } = useI18n();

  // รวมรหัสผู้ปกครองจากหลายชื่อคอลัมน์ให้เป็นค่าเดียว
  const parentPassword = String(
    (student as any).parent_password ??
    (student as any).password ??
    (student as any)['Parent Password'] ??
    (student as any)['Password'] ??
    ''
  ).trim();

  // โชว์/ซ่อนรหัส (เฉพาะโค้ช)
  const [passwordVisible, setPasswordVisible] = useState(false);
  const displayPassword = passwordVisible
    ? (parentPassword || '-')
    : (parentPassword ? '••••••' : '-');

  const handleCopyPassword = async () => {
    if (!parentPassword) return;
    await navigator.clipboard.writeText(parentPassword);
    alert(t('copied') || 'Copied!');
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-strong text-slate-900">
      <div className="flex gap-4 items-start">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: '#1a2a66' }}
        >
          <span className="text-2xl font-extrabold text-white">
            {(student.nickname || '?').slice(0, 1).toUpperCase()}
          </span>
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-2xl font-bold">
              {student.nickname}{' '}
              <span className="text-slate-500 font-medium">({student.coder_id})</span>
            </div>
            <Badge status={student.status} type="status" />
            <Badge status={student.course_status || 'N/A'} type="course" />
            <Badge status={shortCodeFor(student)} type="code" />
          </div>

          <div className="mt-1 text-slate-600">{student.fullname || '-'}</div>

          {/* Cards */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-stretch">
            {/* Program */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col justify-center items-center text-center h-full">
              <span className="text-slate-600">{t('program')}:</span>
              <span className="font-semibold">{student.program || '-'}</span>
            </div>

            {/* Parent Password */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col justify-center items-center text-center h-full">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-slate-600">{t('parentPassword')}:</span>
                <span className="font-semibold tracking-widest">{displayPassword}</span>
              </div>

              {/* โค้ช: Show/Copy  |  ผู้ปกครอง: ปุ่ม Change */}
              <div className="flex gap-2 flex-wrap mt-3 justify-center">
                {session.role === 'coach' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setPasswordVisible(v => !v)}
                    >
                      {passwordVisible ? t('hide') : t('show')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={handleCopyPassword}
                    >
                      {t('copy')}
                    </Button>
                  </>
                )}

                {(session.role === 'parent' || session.role === 'coach') && (
                  <ChangeParentPasswordButton coderId={student.coder_id} />
                )}
              </div>
            </div>

            {/* Status */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col justify-center items-center text-center h-full">
              <span className="text-slate-600">{t('status')}:</span>
              <span className="font-semibold">{student.status || '-'}</span>
            </div>

            {/* Project List */}
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="text-slate-600 mb-2">
                {t('projectList') || 'Project List'}
              </div>
              <ProjectListBox student={student} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
