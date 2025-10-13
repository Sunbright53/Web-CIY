// src/store/authStore.ts

import { create } from 'zustand';
import { AuthState, Session, Language } from '@/types';

const STORAGE_KEYS = {
  session: 'ciy_session',
  lang: 'ciy_lang',
};

const isRole = (v: any): v is Session['role'] =>
  v === 'coach' || v === 'parent' || v === null;

// ✅ โหลด session จาก storage (รองรับ coder_id และ fallback ปลอดภัย)
const loadSession = (): Session => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.session);
    if (raw) {
      const parsed = JSON.parse(raw) ?? {};
      const role = isRole(parsed.role) ? parsed.role : null;
      const coder_id =
        typeof parsed.coder_id === 'string' || parsed.coder_id === null
          ? parsed.coder_id
          : null;
      return { role, coder_id };
    }
  } catch (err) {
    console.warn('Failed to load session from storage:', err);
  }
  return { role: null, coder_id: null };
};

const loadLanguage = (): Language => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.lang);
    if (stored === 'th' || stored === 'en') return stored;
  } catch (err) {
    console.warn('Failed to load language from storage:', err);
  }
  return 'th';
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: loadSession(),
  lang: loadLanguage(),

  // ✅ รับ Partial<Session> แล้ว merge กับของเดิม + บันทึกลง storage
  setSession: (patch) => {
    const next: Session = { ...get().session, ...patch };
    sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(next));
    set({ session: next });
  },

  setLang: (lang: Language) => {
    sessionStorage.setItem(STORAGE_KEYS.lang, lang);
    set({ lang });
    document.documentElement.setAttribute('lang', lang);
  },

  logout: () => {
    const cleared: Session = { role: null, coder_id: null }; // ✅ ล้าง coder_id ด้วย
    sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(cleared));
    set({ session: cleared });
  },
}));

// ตั้งค่า lang บน <html> ตอนเริ่ม
document.documentElement.setAttribute('lang', loadLanguage());

