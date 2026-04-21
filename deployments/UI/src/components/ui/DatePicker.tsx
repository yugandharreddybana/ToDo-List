import { useState, useMemo, useRef, useEffect, useId } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DatePickerProps {
  label?: string;
  value: string | null; // ISO YYYY-MM-DD
  onChange: (next: string | null) => void;
  mode?: 'single' | 'range';
  rangeEnd?: string | null;
  onRangeEndChange?: (next: string | null) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  placeholder?: string;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fromISODate(s: string | null): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function DatePicker({
  label,
  value,
  onChange,
  mode = 'single',
  rangeEnd = null,
  onRangeEndChange,
  min,
  max,
  disabled = false,
  placeholder = 'Select date',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => fromISODate(value) ?? new Date());
  const ref = useRef<HTMLDivElement>(null);
  const fieldId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const days = useMemo(() => {
    const firstOfMonth = new Date(view.getFullYear(), view.getMonth(), 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.getFullYear(), view.getMonth(), d));
    return cells;
  }, [view]);

  const selectedStart = fromISODate(value);
  const selectedEnd = fromISODate(rangeEnd);
  const minDate = fromISODate(min ?? null);
  const maxDate = fromISODate(max ?? null);

  const inRange = (d: Date) => {
    if (mode !== 'range' || !selectedStart || !selectedEnd) return false;
    return d >= selectedStart && d <= selectedEnd;
  };

  const pick = (d: Date) => {
    const iso = toISODate(d);
    if (mode === 'single') {
      onChange(iso);
      setOpen(false);
      return;
    }
    if (!selectedStart || (selectedStart && selectedEnd)) {
      onChange(iso);
      onRangeEndChange?.(null);
    } else if (d < selectedStart) {
      onChange(iso);
    } else {
      onRangeEndChange?.(iso);
      setOpen(false);
    }
  };

  const display = mode === 'single'
    ? value ?? placeholder
    : value || rangeEnd
      ? `${value ?? '…'} → ${rangeEnd ?? '…'}`
      : placeholder;

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthLabel = view.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={ref}>
      {label && (
        <label htmlFor={fieldId} className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={fieldId}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={cn(
            'w-full h-10 flex items-center gap-2 rounded-[10px] px-3 text-left text-[14px] transition-all duration-200',
            disabled && 'opacity-60 cursor-not-allowed',
          )}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: value || rangeEnd ? 'var(--text-primary)' : 'var(--text-muted)',
          }}
        >
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <span className="flex-1 truncate">{display}</span>
        </button>
        {open && (
          <div
            className="absolute mt-1 p-3 rounded-[10px]"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 'var(--z-dropdown)' as unknown as number,
              minWidth: 260,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                className="p-1 rounded-md"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                className="p-1 rounded-md"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
              {weekdays.map((w, i) => (
                <span key={i} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {w}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((d, i) => {
                if (!d) return <span key={i} />;
                const iso = toISODate(d);
                const isSelected =
                  (selectedStart && iso === toISODate(selectedStart)) ||
                  (selectedEnd && iso === toISODate(selectedEnd));
                const highlighted = inRange(d);
                const disabledDay =
                  (minDate && d < minDate) || (maxDate && d > maxDate);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={Boolean(disabledDay)}
                    onClick={() => pick(d)}
                    className="h-8 w-8 text-[13px] rounded-md transition-all duration-150"
                    style={{
                      background: isSelected
                        ? 'var(--accent-primary)'
                        : highlighted
                          ? 'var(--bg-hover)'
                          : 'transparent',
                      color: isSelected
                        ? 'var(--text-inverse)'
                        : disabledDay
                          ? 'var(--text-muted)'
                          : 'var(--text-primary)',
                      opacity: disabledDay ? 0.4 : 1,
                    }}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
