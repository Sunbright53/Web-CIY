// src/components/ProjectListBox.tsx
import { useEffect, useState, KeyboardEvent } from 'react';
import { updateProjectListLink } from '@/services/api';
import type { Student } from '@/types';
import { useAuthStore } from '@/store/authStore';

type Props = {
  student: Student;
  /** เรียกเมื่อบันทึกสำเร็จ (เวอร์ชันใหม่) */
  onUpdated?: (url: string) => void;
  /** รองรับโค้ดเก่า (ยังเรียกให้ด้วยถ้าส่งมา) */
  onSaved?: (url: string) => void;
};

export function ProjectListBox({ student, onUpdated, onSaved }: Props) {
  const { session } = useAuthStore();
  const isCoach = session?.role === 'coach';

  // local state
  const [link, setLink] = useState(student.project_list_url || '');
  const [draft, setDraft] = useState(student.project_list_url || '');
  const [saving, setSaving] = useState(false);

  // 🔁 sync เมื่อ prop เปลี่ยน (เช่น refetch student)
  useEffect(() => {
    const url = student.project_list_url || '';
    setLink(url);
    setDraft(url);
  }, [student.coder_id, student.project_list_url]);

  const isValidUrl = (u: string) => {
    if (!u) return true;
    try { new URL(u); return true; } catch { return false; }
  };

  const doCallback = (url: string) => {
    onUpdated?.(url);
    onSaved?.(url); // compat เก่า
  };

  const handleSave = async () => {
    if (!isValidUrl(draft)) {
      alert('Invalid URL format');
      return;
    }
    setSaving(true);
    const newUrl = draft.trim();
    const res = await updateProjectListLink(student.coder_id, newUrl);
    setSaving(false);

    if (res?.success) {
      setLink(newUrl);
      doCallback(newUrl);
      alert('Project List updated successfully!');
    } else {
      alert((res as any)?.error || 'Failed to update Project List');
    }
  };

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    alert('Copied Project List link');
  };

  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isCoach && !saving && isValidUrl(draft)) {
      handleSave();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 w-full">
      {/* ช่องลิงก์ (ยืด/หด + กันล้น) */}
      <input
        type="text"
        readOnly
        value={link}
        placeholder="No project list yet"
        className="border rounded px-3 py-2 flex-1 min-w-0 bg-white/80 truncate"
      />

      {/* ปุ่ม Open/Copy */}
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          className="btn btn-primary px-3 py-2 rounded whitespace-nowrap disabled:opacity-50"
          disabled={!link}
          onClick={() => window.open(link, '_blank')}
        >
          Open
        </button>
        <button
          type="button"
          className="btn px-3 py-2 rounded border whitespace-nowrap disabled:opacity-50"
          disabled={!link}
          onClick={handleCopy}
        >
          Copy
        </button>
      </div>

      {/* ช่องแก้ไข + ปุ่มบันทึก (เฉพาะ Coach) */}
      {isCoach && (
        <>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onEnter}
            placeholder="https://..."
            className="border rounded px-3 py-2 w-full sm:w-72"
          />
          <button
            onClick={handleSave}
            disabled={saving || (!draft && link === '') || !isValidUrl(draft)}
            className="bg-blue-600 text-white rounded px-4 py-2 whitespace-nowrap disabled:opacity-50 shrink-0"
          >
            {saving ? 'Saving...' : link ? 'Update Project List' : 'Add Project List'}
          </button>
        </>
      )}
    </div>
  );
}
