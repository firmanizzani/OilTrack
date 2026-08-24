import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, LogOut, Gauge } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profil</h1>
        <p className="text-sm text-muted mt-1">Informasi akun kamu</p>
      </div>

      {/* Avatar & name card */}
      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center shadow-glow">
          <User className="w-10 h-10 text-accent" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{user?.name}</p>
          <p className="text-sm text-muted">{user?.email}</p>
        </div>
      </div>

      {/* Info rows */}
      <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <User className="w-4 h-4 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted">Nama</p>
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Mail className="w-4 h-4 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted">Email</p>
            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
          </div>
        </div>

      </div>


      {/* App info */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-glow">
          <Gauge className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">OliTrack</p>
          <p className="text-xs text-muted">Oil Change Tracker</p>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                   bg-danger/10 text-danger border border-danger/20
                   hover:bg-danger/20 active:scale-95 transition-all duration-200 font-medium text-sm"
      >
        <LogOut className="w-4 h-4" />
        Keluar dari Akun
      </button>
    </motion.div>
  );
}
