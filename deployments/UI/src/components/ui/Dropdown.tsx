import { ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';

export interface DropdownItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect: () => void;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
}

export function Dropdown({ trigger, items, align = 'end' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(items.length - 1, i + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === 'Enter' && activeIndex >= 0) {
        const item = items[activeIndex];
        if (item && !item.disabled) {
          item.onSelect();
          close();
        }
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, items, activeIndex, close]);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <span onClick={() => setOpen((o) => !o)}>{trigger}</span>
      {open && (
        <ul
          role="menu"
          className={cn(
            'absolute mt-1 min-w-[180px] py-1 rounded-[10px]',
            align === 'end' ? 'right-0' : 'left-0',
          )}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 'var(--z-dropdown)' as unknown as number,
            animation: 'fadeInUp 160ms ease-out',
          }}
        >
          {items.map((it, idx) => (
            <li
              key={it.key}
              role="menuitem"
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => {
                if (!it.disabled) {
                  it.onSelect();
                  close();
                }
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-[14px] cursor-pointer',
                it.disabled && 'opacity-50 cursor-not-allowed',
              )}
              style={{
                color: it.danger ? 'var(--accent-coral)' : 'var(--text-primary)',
                background: activeIndex === idx ? 'var(--bg-hover)' : 'transparent',
              }}
            >
              {it.icon && <span style={{ display: 'inline-flex' }}>{it.icon}</span>}
              <span>{it.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
