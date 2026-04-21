import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, id, checked, disabled, ...rest },
  ref,
) {
  const reactId = useId();
  const fieldId = id ?? reactId;

  return (
    <label
      htmlFor={fieldId}
      className={cn('inline-flex items-start gap-2.5 cursor-pointer select-none', disabled && 'opacity-60 cursor-not-allowed', className)}
    >
      <span className="relative flex-shrink-0" style={{ width: 18, height: 18 }}>
        <input
          id={fieldId}
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className="peer absolute inset-0 opacity-0 cursor-inherit"
          {...rest}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-[4px] transition-all duration-200 flex items-center justify-center"
          style={{
            background: checked ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            border: `1px solid ${checked ? 'var(--accent-primary)' : 'var(--border)'}`,
          }}
        >
          {checked && <Check size={12} color="white" strokeWidth={3} />}
        </span>
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && (
            <span className="text-[14px] leading-tight" style={{ color: 'var(--text-primary)' }}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});
