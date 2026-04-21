import { cn } from '../../lib/utils';

export interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple';
  showLabel?: boolean;
  size?: 'sm' | 'md';
  height?: number;
  className?: string;
}

const colorMap = {
  primary: 'var(--accent-primary)',
  success: 'var(--accent-green)',
  warning: 'var(--accent-amber)',
  danger: 'var(--accent-coral)',
  purple: 'var(--accent-purple)',
} as const;

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  showLabel = false,
  size = 'md',
  height,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const resolvedHeight = height ?? (size === 'sm' ? 4 : 8);

  return (
    <div className={cn('flex items-center gap-3 w-full', className)}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex-1 overflow-hidden rounded-full"
        style={{ height: resolvedHeight, background: 'var(--bg-hover)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: colorMap[variant] }}
        />
      </div>
      {showLabel && (
        <span className="text-[12px] font-medium tabular-nums" style={{ color: 'var(--text-secondary)', minWidth: 32 }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
