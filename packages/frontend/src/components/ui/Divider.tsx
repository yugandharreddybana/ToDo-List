import { cn } from '../../lib/utils';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export function Divider({ orientation = 'horizontal', className, label }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <span
        aria-hidden
        className={cn('inline-block self-stretch', className)}
        style={{ width: 1, background: 'var(--border)' }}
      />
    );
  }
  if (label) {
    return (
      <div className={cn('flex items-center gap-3 my-2', className)}>
        <span className="flex-1" style={{ height: 1, background: 'var(--border)' }} />
        <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span className="flex-1" style={{ height: 1, background: 'var(--border)' }} />
      </div>
    );
  }
  return (
    <hr
      className={cn('border-0', className)}
      style={{ height: 1, background: 'var(--border)', margin: 0 }}
    />
  );
}
