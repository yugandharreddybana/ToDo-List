import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'purple';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
}

const tone: Record<BadgeVariant, { bg: string; color: string; dot: string }> = {
  default: { bg: '#EEF2F7', color: '#2C3E50', dot: '#95A5A6' },
  success: { bg: 'rgba(107, 190, 160, 0.15)', color: '#3E8B72', dot: '#6BBEA0' },
  warning: { bg: 'rgba(240, 165, 0, 0.15)', color: '#B47A00', dot: '#F0A500' },
  danger: { bg: 'rgba(224, 123, 106, 0.15)', color: '#B35848', dot: '#E07B6A' },
  info: { bg: 'rgba(91, 155, 213, 0.15)', color: '#2F6FA3', dot: '#5B9BD5' },
  primary: { bg: 'rgba(91, 155, 213, 0.15)', color: '#2F6FA3', dot: '#5B9BD5' },
  purple: { bg: 'rgba(155, 137, 196, 0.18)', color: '#6F5DA3', dot: '#9B89C4' },
};

export function Badge({ variant = 'default', dot = false, children, className, style, ...rest }: BadgeProps) {
  const t = tone[variant];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded-full',
        className,
      )}
      style={{ background: t.bg, color: t.color, ...style }}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden
          className="inline-block rounded-full"
          style={{ width: 6, height: 6, background: t.dot }}
        />
      )}
      {children}
    </span>
  );
}
