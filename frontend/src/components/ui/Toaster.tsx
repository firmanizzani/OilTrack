import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let externalToast: ((message: string, type?: ToastType) => void) | null = null;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  // Fallback for external usage
  return {
    toast: (message: string, type: ToastType = 'info') => externalToast?.(message, type),
  };
}

const icons = {
  success: CheckCircle,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
};

const colors = {
  success: 'border-success/40 bg-success/10 text-success',
  error:   'border-danger/40 bg-danger/10 text-danger',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  info:    'border-accent/40 bg-accent/10 text-accent',
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Expose to external callers
  useEffect(() => { externalToast = addToast; }, [addToast]);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-lg border shadow-card backdrop-blur-sm',
                  'bg-surface',
                  colors[t.type]
                )}
              >
                <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="flex-1 text-sm text-foreground leading-snug">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-muted hover:text-foreground transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Simple imperative API used throughout the app
export const toast = {
  success: (msg: string) => externalToast?.(msg, 'success'),
  error:   (msg: string) => externalToast?.(msg, 'error'),
  warning: (msg: string) => externalToast?.(msg, 'warning'),
  info:    (msg: string) => externalToast?.(msg, 'info'),
};
