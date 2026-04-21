import { ReactNode, SelectHTMLAttributes, forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helperText, error, options, placeholder, className, id, disabled, children, ...rest },
  ref,
) {
  const reactId = useId();
  const fieldId = id ?? reactId;

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
          'relative flex items-center rounded-[10px] transition-all duration-200',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
        style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${error ? 'var(--accent-coral)' : 'var(--border)'}`,
          height: 40,
        }}
      >
        <select
          id={fieldId}
          ref={ref}
          disabled={disabled}
          className={cn(
            'appearance-none bg-transparent outline-none w-full pl-3 pr-9 text-[14px]',
            className,
          )}
          style={{ color: 'var(--text-primary)' }}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((o) => (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown
          size={16}
          style={{ position: 'absolute', right: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}
        />
      </div>
      {error ? (
        <span className="text-[12px]" style={{ color: 'var(--accent-coral)' }}>
          {error}
        </span>
      ) : helperText ? (
        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
});
