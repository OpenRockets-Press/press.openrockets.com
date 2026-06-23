import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-surface-0 border-cream-border',
    },
    error: {
      icon: XCircle,
      bgClass: 'bg-surface-0 border-cream-border',
    },
    warning: {
      icon: AlertTriangle,
      bgClass: 'bg-surface-0 border-cream-border',
    },
    info: {
      icon: Info,
      bgClass: 'bg-surface-0 border-cream-border',
    },
  };

  const fallbackColors = {
    warning: '#f59e0b',
    info: '#3b82f6',
    error: '#ef4444',
    success: '#d4af37',
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      layout
      className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg border p-4 ${config.bgClass} flex items-start gap-3`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: fallbackColors[toast.type]
      }}
    >
      <Icon 
        className={`flex-shrink-0 mt-0.5`} 
        size={20} 
        style={{ color: fallbackColors[toast.type] }}
      />
      <div className="flex-1 min-w-0">
        {toast.title && <h3 className="t-label text-ink mb-1">{toast.title}</h3>}
        <p className="t-body-sm text-ink-light">{toast.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-ink-light hover:text-ink transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
