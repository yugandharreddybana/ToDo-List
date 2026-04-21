import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
  side?: 'right' | 'left';
}

export function Drawer({ open, onClose, title, children, width = 420, side = 'right' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isRight = side === 'right';

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 'var(--z-drawer)' as unknown as number }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="tps-backdrop"
        style={{ animation: 'fadeIn 200ms ease-out' }}
        onClick={onClose}
      />
      <aside
        className="absolute top-0 bottom-0 flex flex-col"
        style={{
          width,
          maxWidth: '100%',
          [isRight ? 'right' : 'left']: 0,
          background: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)',
          animation: `${isRight ? 'slideInRight' : 'slideInRight'} 220ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <header
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {title && (
            <h3 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-auto px-5 py-4">{children}</div>
      </aside>
    </div>
  );
}
