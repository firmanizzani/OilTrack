import { Package } from 'lucide-react';
import { cn } from '@/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-surfaceHigh border border-border flex items-center justify-center mb-4">
        {icon ?? <Package className="w-7 h-7 text-muted" />}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-xs mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
