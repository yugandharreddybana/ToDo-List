import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { checked, onChange, label, description, disabled = false, className },
  ref,
) {
  const id = useId();
  return (
    <div className={cn('inline-flex items-start gap-3', className)}>
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex items-center transition-all duration-200 flex-shrink-0',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          background: checked ? 'var(--accent-primary)' : 'var(--border)',
        }}
      >
        <span
          aria-hidden
          className="block rounded-full transition-all duration-200"
          style={{
            width: 16,
            height: 16,
            background: 'var(--bg-secondary)',
            boxShadow: 'var(--shadow-sm)',
            transform: `translateX(${checked ? 18 : 2}px)`,
          }}
        />
      </button>
      {(label || description) && (
        <label htmlFor={id} className="flex flex-col gap-0.5 cursor-pointer select-none">
          {label && (
            <span className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              {description}
            </span>
          )}
        </label>
      )}
    </div>
  );
});
