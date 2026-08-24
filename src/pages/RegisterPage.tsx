import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Gauge, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/hooks/useAuthStore';
import { toast } from '@/components/ui/Toaster';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (res.status === 'success' && res.data) {
        setAuth(res.data.user, res.data.token);
        toast.success('Akun berhasil dibuat!');
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Registrasi gagal.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shadow-glow">
            <Gauge className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl text-foreground">OliTrack</h1>
            <p className="text-xs text-muted">Oil Change Tracker</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-1">Buat Akun</h2>
          <p className="text-sm text-muted mb-6">Daftar untuk mulai melacak oli kendaraan</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="text" {...field('name')} placeholder="Nama Lengkap" className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="email" {...field('email')} placeholder="email@example.com" className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type={showPw ? 'text' : 'password'}
                  {...field('password')}
                  placeholder="Min. 8 karakter"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="password" {...field('confirmPassword')} placeholder="Ulangi password" className="input-field pl-10" required />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Masuk
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
