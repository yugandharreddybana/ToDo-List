import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  hideClose?: boolean;
}

const widthMap: Record<NonNullable<ModalProps['size']>, number> = {
  sm: 380,
  md: 520,
  lg: 720,
  xl: 960,
};

export function Modal({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  hideClose = false,
}: ModalProps) {
  const visible = open ?? isOpen ?? false;
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal)' as unknown as number }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="tps-backdrop"
        style={{ animation: 'fadeIn 200ms ease-out' }}
        onClick={() => closeOnBackdrop && onClose()}
      />
      <div
        className={cn('relative w-full rounded-[14px] flex flex-col')}
        style={{
          maxWidth: widthMap[size],
          maxHeight: '90vh',
          background: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {(title || !hideClose) && (
          <div
            className="flex items-start justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex flex-col gap-1">
              {title && (
                <h3 id="modal-title" className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  {description}
                </p>
              )}
            </div>
            {!hideClose && (
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
            )}
          </div>
        )}
        <div className="px-6 py-5 overflow-auto">{children}</div>
        {footer && (
          <div
            className="flex items-center justify-end gap-2 px-6 py-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
