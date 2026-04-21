import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  helperText?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, prefix, suffix, className, id, disabled, ...rest },
  ref,
) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const describedBy = error ? `${fieldId}-err` : helperText ? `${fieldId}-help` : undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="text-[13px] font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 rounded-[10px] transition-all duration-200',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
        style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${error ? 'var(--accent-coral)' : 'var(--border)'}`,
          padding: '0 12px',
          height: 40,
        }}
      >
        {prefix && <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>{prefix}</span>}
        <input
          id={fieldId}
          ref={ref}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn('flex-1 bg-transparent outline-none text-[14px]', className)}
          style={{ color: 'var(--text-primary)' }}
          {...rest}
        />
        {suffix && <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>{suffix}</span>}
      </div>
      {error ? (
        <span id={`${fieldId}-err`} className="text-[12px]" style={{ color: 'var(--accent-coral)' }}>
          {error}
        </span>
      ) : helperText ? (
        <span id={`${fieldId}-help`} className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
});
