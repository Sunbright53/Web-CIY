// src/cards/StudentProfile.tsx
import { useState } from 'react';
import { Student } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/hooks/useI18n';
import { ProjectListBox } from '@/components/ProjectListBox';

interface StudentProfileProps {
  student: Student;
}

function shortCodeFor(student: Student): string {
  const name = (student.nickname || '').replace(/[^A-Za-zก-ฮะ-์]/g, '').toUpperCase();
  const letters = (name + 'XYZ').slice(0, 3);
  const digits = ((student.coder_id || '').match(/\d+/g) || ['000']).join('').slice(-3) || '000';
  return letters + digits;
}

export function StudentProfile({ student }: StudentProfileProps) {
  const { session } = useAuthStore();
  const { t } = useI18n();

  // ✅ Parent password controls
  const [passwordVisible, setPasswordVisible] = useState(false);
  const displayPassword =
    passwordVisible ? (student.parent_password || '-') : (student.parent_password ? '••••••' : '-');

  const handleCopyPassword = async () => {
    if (!student.parent_password) return;
    await navigator.clipboard.writeText(student.parent_password);
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
          {/* ชื่อ + แถบสถานะ */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-2xl font-bold">
              {student.nickname}{' '}
              <span className="text-slate-500 font-medium">
                ({student.coder_id})
              </span>
            </div>
            <Badge status={student.status} type="status" />
            <Badge status={student.course_status || 'N/A'} type="course" />
            <Badge status={shortCodeFor(student)} type="code" />
          </div>

          <div className="mt-1 text-slate-600">
            {student.fullname || '-'}
          </div>

          {/* META: ไม่ซ้อนเมื่อจอแคบ */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {/* Program */}
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-600">{t('program')}:</span>{' '}
              <span className="font-semibold">{student.program || '-'}</span>
            </div>

            {/* Parent Password (wrap ได้) */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-slate-600">{t('parentPassword')}:</span>
              <span className="font-semibold tracking-widest">{displayPassword}</span>

              {session.role === 'coach' && (
                <div className="flex gap-2 flex-wrap">
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
                </div>
              )}
            </div>

            {/* Status */}
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-600">{t('status')}:</span>{' '}
              <span className="font-semibold">{student.status || '-'}</span>
            </div>

            {/* ✅ Project List (ตำแหน่งเดียวกับ Parent Password) */}
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
