import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard, Car, Droplets, LogOut, Gauge, User, Sun, Moon,
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useThemeStore } from '@/hooks/useThemeStore';
import { cn } from '@/utils';

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/vehicles',    label: 'Kendaraan',  icon: Car },
  { to: '/oil-history', label: 'Riwayat Oli', icon: Droplets },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-surface border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-glow">
          <Gauge className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-foreground text-lg leading-none">OliTrack</h1>
          <p className="text-xs text-muted mt-0.5">Oil Change Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-muted hover:text-foreground hover:bg-surfaceHigh'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-4 h-4', isActive ? 'text-accent' : '')} />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile + theme toggle + logout */}
      <div className="px-3 pb-4 border-t border-border pt-4 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surfaceHigh transition-all duration-200"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-warning" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-accent" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surfaceHigh">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <User className="w-4 h-4 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted
                     hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
