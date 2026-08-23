import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ open, onClose, title, children, className, size = 'md' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Scroll container — full screen, centers modal, allows scroll if too tall */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              key="panel"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={cn('w-full my-auto', sizeClasses[size])}
            >
              <div className={cn('card p-6', className)}>
                {title && (
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    <button
                      onClick={onClose}
                      className="text-muted hover:text-foreground transition-colors p-1 rounded-lg hover:bg-surfaceHigh"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Confirm Delete Dialog ──────────────────────────────────────────────────
interface ConfirmDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  open, onClose, onConfirm, title = 'Hapus Item', description, loading,
}: ConfirmDeleteProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-muted mb-6">
        {description ?? 'Tindakan ini tidak dapat dibatalkan. Apakah kamu yakin?'}
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-ghost text-sm" disabled={loading}>
          Batal
        </button>
        <button onClick={onConfirm} className="btn-danger text-sm" disabled={loading}>
          {loading ? 'Menghapus...' : 'Ya, Hapus'}
        </button>
      </div>
    </Modal>
  );
}
