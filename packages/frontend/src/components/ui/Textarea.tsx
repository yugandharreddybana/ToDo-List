import { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, error, className, id, rows = 4, ...rest },
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
      <textarea
        id={fieldId}
        ref={ref}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-[10px] outline-none transition-all duration-200 resize-y',
          className,
        )}
        style={{
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: `1px solid ${error ? 'var(--accent-coral)' : 'var(--border)'}`,
          padding: '10px 12px',
          fontSize: 14,
          lineHeight: 1.6,
        }}
        {...rest}
      />
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
