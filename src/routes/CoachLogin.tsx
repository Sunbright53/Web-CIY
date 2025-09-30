// src/routes/CoachLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyCoachPassword } from '@/services/api';
import { CONFIG } from '@/config';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/Toast';
import { useAuthStore } from '@/store/authStore'; // 👈 ใช้ setSession

export default function CoachLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { setSession } = useAuthStore(); // 👈 ดึง setSession

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pass = password.trim();
    if (!pass) return;

    setLoading(true);
    try {
      const ok = await verifyCoachPassword(CONFIG.coachesCsv, pass);
      if (ok) {
        setSession({ role: 'coach' });      // 👈 สำคัญ! mark เป็น coach
        showToast('Login success', 'success');
        navigate('/coach');                  // 👈 ไปหน้า coach (จะผ่าน CoachRoute แล้วโชว์ Students)
      } else {
        showToast('รหัสไม่ถูกต้อง', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('ตรวจสอบรหัสไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 glass rounded-2xl shadow-strong">
      <h1 className="text-2xl font-bold mb-4">Coach Login</h1>
      <form onSubmit={handleLogin} className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            type="password"
            placeholder="Master Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Log in'}
        </Button>
      </form>
    </div>
  );
}



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { verifyCoachPassword } from '@/services/api';
// import { CONFIG } from '@/config';
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';
// import { useToast } from '@/components/Toast';

// export default function CoachLogin() {
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { showToast } = useToast();
//   const navigate = useNavigate();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const pass = password.trim();

//     if (!CONFIG.coachesCsv) {
//       showToast('ยังไม่ได้ตั้งค่า coachesCsv ใน CONFIG', 'error');
//       return;
//     }
//     if (!pass) {
//       showToast('กรุณากรอกรหัส', 'error');
//       return;
//     }

//     setLoading(true);
//     try {
//       // ✅ ตรวจเฉพาะรหัสจากชีต Coache_login
//       const ok = await verifyCoachPassword(CONFIG.coachesCsv, pass);

//       if (ok) {
//         showToast('Login success', 'success');
//         // TODO: set auth store -> role = 'coach' ถ้ามี
//         navigate('/coach');
//       } else {
//         showToast('รหัสไม่ถูกต้อง', 'error');
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('ตรวจสอบรหัสไม่สำเร็จ', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 glass rounded-2xl shadow-strong">
//       <h1 className="text-2xl font-bold mb-4">Coach Login</h1>
//       <form onSubmit={handleLogin} className="flex items-center gap-3">
//         <div className="flex-1">
//           <Input
//             type="password"
//             placeholder="Master Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full"
//             autoComplete="current-password"
//           />
//         </div>
//         <Button type="submit" disabled={loading}>
//           {loading ? 'Checking…' : 'Log in'}
//         </Button>
//       </form>
//     </div>
//   );
// }




// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { verifyCoachPassword } from '@/services/api';
// import { CONFIG } from '@/config';
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';
// import { useToast } from '@/components/Toast';

// export default function CoachLogin() {
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { showToast } = useToast();
//   const navigate = useNavigate();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       // ✅ ใช้เฉพาะพาสจากชีต
//       const okFromSheet = await verifyCoachPassword(CONFIG.coachesCsv, password);

//       // (ออปชัน) fallback: ยอมให้ผ่านถ้าตรงกับ coachPassword คงไว้เผื่อฉุกเฉิน
//       const ok = okFromSheet || password === CONFIG.coachPassword;

//       if (ok) {
//         showToast('Login success', 'success');
//         // TODO: ถ้ามี auth store ให้ตั้ง role = 'coach' ที่นี่
//         navigate('/coach');
//       } else {
//         showToast('รหัสไม่ถูกต้อง', 'error');
//       }
//     } catch (err) {
//       console.error(err);
//       showToast('ตรวจสอบรหัสไม่สำเร็จ', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 glass rounded-2xl shadow-strong">
//       <h1 className="text-2xl font-bold mb-4">Coach Login</h1>
//       <form onSubmit={handleLogin} className="flex items-center gap-3">
//         <div className="flex-1">
//           <Input
//             type="password"
//             placeholder="Master Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full"
//             autoComplete="current-password"
//           />
//         </div>
//         <Button type="submit" disabled={loading}>
//           {loading ? 'Checking…' : 'Log in'}
//         </Button>
//       </form>
//     </div>
//   );
// }



// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '@/store/authStore';
// import { useI18n } from '@/hooks/useI18n';
// import { useToast } from '@/components/Toast';
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';
// import { Students } from './Students';
// import { CONFIG } from '@/config';

// export function CoachLogin() {
//   const navigate = useNavigate();
//   const { session, setSession } = useAuthStore();
//   const { t } = useI18n();
//   const { showToast } = useToast();
  
//   const [password, setPassword] = useState('');

//   // Check if already logged in as coach
//   useEffect(() => {
//     if (session.role === 'coach') {
//       // Already logged in, show students list
//     }
//   }, [session]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (password !== CONFIG.coachPassword) {
//       showToast(t('incorrectCoachPass'), 'error');
//       return;
//     }

//     setSession({ role: 'coach' });
//     showToast(t('lang') === 'th' ? 'เข้าสู่ระบบสำเร็จ' : 'Login successful', 'success');
//   };

//   const isLoggedIn = session.role === 'coach';

//   return (
//     <div>
//       {!isLoggedIn ? (
//         <div className="glass rounded-2xl p-6 md:p-8 shadow-strong">
//           <h2 className="text-2xl font-bold">{t('coachLoginTitle')}</h2>
//           <p className="text-white/70 mt-1 text-sm">{t('coachLoginDesc')}</p>
          
//           <form onSubmit={handleSubmit} className="mt-6 grid md:grid-cols-3 gap-4">
//             <Input
//               label={t('masterPassLabel')}
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               required
//               className="md:col-span-2"
//             />
            
//             <div className="md:col-span-1 flex items-end">
//               <Button type="submit" variant="blue" className="w-full">
//                 {t('login')}
//               </Button>
//             </div>
//           </form>
//         </div>
//       ) : (
//         <Students />
//       )}
//     </div>
//   );
// }