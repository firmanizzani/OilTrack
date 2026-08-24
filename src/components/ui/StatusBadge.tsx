import type { ReminderStatus } from '@/types';
import { cn, getStatusClasses, getStatusLabel } from '@/utils';

interface StatusBadgeProps {
  status: ReminderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border',
        getStatusClasses(status),
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'green'  && 'bg-success',
          status === 'yellow' && 'bg-warning',
          status === 'red'    && 'bg-danger'
        )}
      />
      {getStatusLabel(status)}
    </span>
  );
}
