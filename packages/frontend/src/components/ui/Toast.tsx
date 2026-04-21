import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const tone: Record<ToastType, { color: string; Icon: typeof CheckCircle2 }> = {
  success: { color: 'var(--accent-green)', Icon: CheckCircle2 },
  error: { color: 'var(--accent-coral)', Icon: XCircle },
  warning: { color: 'var(--accent-amber)', Icon: AlertTriangle },
  info: { color: 'var(--accent-primary)', Icon: Info },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((xs) => xs.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2, 10);
      const toast: Toast = { duration: 4000, ...t, id };
      setToasts((xs) => [...xs, toast]);
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => dismiss(id), toast.duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-4 right-4 flex flex-col gap-2 pointer-events-none"
        style={{ zIndex: 'var(--z-toast)' as unknown as number }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { Icon, color } = tone[toast.type];
  useEffect(() => {
    // no-op; lifecycle handled by provider
  }, []);

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-[380px] rounded-[10px] px-4 py-3"
      style={{
        background: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
        animation: 'fadeInUp 220ms ease-out',
      }}
    >
      <Icon size={18} style={{ color, marginTop: 2, flexShrink: 0 }} />
      <div className="flex-1 flex flex-col gap-0.5">
        <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {toast.title}
        </span>
        {toast.description && (
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {toast.description}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="p-0.5"
        style={{ color: 'var(--text-muted)' }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
