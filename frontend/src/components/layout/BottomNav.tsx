import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, Droplets } from 'lucide-react';
import { cn } from '@/utils';

const navItems = [
  { to: '/dashboard',   label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles',    label: 'Kendaraan', icon: Car },
  { to: '/oil-history', label: 'Riwayat',   icon: Droplets },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border">
      <div className="flex items-stretch h-16 safe-area-inset-bottom">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200',
                isActive ? 'text-accent' : 'text-muted'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-5 h-5', isActive && 'text-accent')} />
                <span className={isActive ? 'text-accent' : ''}>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-12 h-0.5 bg-accent rounded-t-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
