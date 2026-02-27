// src/routes/CoachLogin.tsx
import { useState } from 'react';
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