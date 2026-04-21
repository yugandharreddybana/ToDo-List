import { useRef, useState, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SelectOption } from './Select';

export interface MultiSelectProps {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxSelected?: number;
}

export function MultiSelect({
  label,
  helperText,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  maxSelected,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const toggle = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      onChange([...value, v]);
    }
  };

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={ref}>
      {label && (
        <label className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            'w-full min-h-[40px] flex items-center gap-2 rounded-[10px] px-3 text-left transition-all duration-200',
            disabled && 'opacity-60 cursor-not-allowed',
          )}
          style={{
            background: 'var(--bg-secondary)',
            border: `1px solid ${error ? 'var(--accent-coral)' : 'var(--border)'}`,
          }}
        >
          <div className="flex flex-wrap gap-1 flex-1 py-1">
            {selectedLabels.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{placeholder}</span>
            ) : (
              selectedLabels.map((o) => (
                <span
                  key={o.value}
                  className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                >
                  {o.label}
                  <X
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(o.value);
                    }}
                    style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                  />
                </span>
              ))
            )}
          </div>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute z-[300] left-0 right-0 mt-1 rounded-[10px] max-h-60 overflow-auto py-1"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {options.map((o) => {
              const checked = value.includes(o.value);
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={checked}
                  onClick={() => !o.disabled && toggle(o.value)}
                  className={cn(
                    'px-3 py-2 flex items-center justify-between text-[14px] cursor-pointer',
                    o.disabled && 'opacity-50 cursor-not-allowed',
                  )}
                  style={{
                    color: 'var(--text-primary)',
                    background: checked ? 'var(--bg-hover)' : 'transparent',
                  }}
                >
                  <span>{o.label}</span>
                  {checked && <Check size={14} style={{ color: 'var(--accent-primary)' }} />}
                </li>
              );
            })}
          </ul>
        )}
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
}
