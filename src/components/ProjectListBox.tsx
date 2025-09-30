// src/components/ProjectListBox.tsx
import React, { useState } from 'react';
import { updateProjectListLink } from '@/services/api';
import { Student } from '@/types';
import { useAuthStore } from '@/store/authStore';

type Props = { student: Student };

export function ProjectListBox({ student }: Props) {
  const { session } = useAuthStore();
  const [link, setLink] = useState(student.project_list_url || '');
  const [draft, setDraft] = useState(student.project_list_url || '');
  const [saving, setSaving] = useState(false);
  const isCoach = session?.role === 'coach';

  const isValidUrl = (u: string) => {
    if (!u) return true;
    try { new URL(u); return true; } catch { return false; }
  };

  const handleSave = async () => {
    if (!isValidUrl(draft)) return alert('Invalid URL format');
    setSaving(true);
    const res = await updateProjectListLink(student.coder_id, draft.trim());
    setSaving(false);
    if (res?.success) { setLink(draft.trim()); alert('Project List updated successfully!'); }
    else alert((res as any)?.error || 'Failed to update Project List');
  };

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    alert('Copied Project List link');
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

      {/* ปุ่ม Open/Copy (ไม่หด) */}
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




// // src/components/ProjectListBox.tsx
// import React, { useState } from 'react';
// import { updateProjectListLink } from '@/services/api';
// import { Student } from '@/types';
// import { useAuthStore } from '@/store/authStore';

// type Props = {
//   student: Student;
// };

// export function ProjectListBox({ student }: Props) {
//   const { session } = useAuthStore();
//   const [link, setLink] = useState(student.project_list_url || '');
//   const [draft, setDraft] = useState(student.project_list_url || '');
//   const [saving, setSaving] = useState(false);

//   const isCoach = session?.role === 'coach';

//   const isValidUrl = (url: string) => {
//     try {
//       if (!url) return true; // allow empty draft
//       new URL(url);
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   const handleSave = async () => {
//     if (!isValidUrl(draft)) {
//       alert('Invalid URL format');
//       return;
//     }
//     setSaving(true);
//     const res = await updateProjectListLink(student.coder_id, draft.trim());
//     setSaving(false);

//     if (res?.success) {
//       setLink(draft.trim());
//       alert('Project List updated successfully!');
//     } else {
//       alert(res?.error || 'Failed to update Project List');
//     }
//   };

//   const handleCopy = async () => {
//     if (!link) return;
//     await navigator.clipboard.writeText(link);
//     alert('Copied Project List link');
//   };

//   return (
//     <div className="flex items-center gap-2 w-full">
//       {/* ช่องแสดงผลลิงก์ (readOnly) */}
//       <input
//         type="text"
//         readOnly
//         value={link}
//         placeholder="No project list yet"
//         className="border rounded px-3 py-2 w-[20rem] md:w-[24rem] bg-white/80"
//       />

//       {/* ปุ่มเปิดลิงก์ & คัดลอก (ถ้ามีลิงก์) */}
//       <button
//         type="button"
//         className="btn btn-primary px-3 py-2 rounded"
//         disabled={!link}
//         onClick={() => window.open(link, '_blank')}
//         title="Open Project List"
//       >
//         Open
//       </button>
//       <button
//         type="button"
//         className="btn px-3 py-2 rounded border"
//         disabled={!link}
//         onClick={handleCopy}
//         title="Copy link"
//       >
//         Copy
//       </button>

//       {/* ช่องแก้ไข + ปุ่มบันทึก (เฉพาะ Coach) */}
//       {isCoach && (
//         <>
//           <input
//             type="text"
//             value={draft}
//             onChange={(e) => setDraft(e.target.value)}
//             placeholder="https://..."
//             className="border rounded px-3 py-2 w-[16rem]"
//           />
//           <button
//             onClick={handleSave}
//             disabled={saving || (!draft && link === '') || !isValidUrl(draft)}
//             className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
//           >
//             {saving ? 'Saving...' : link ? 'Update Project List' : 'Add Project List'}
//           </button>
//         </>
//       )}
//     </div>
//   );
// }