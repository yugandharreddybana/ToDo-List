import { CSSProperties } from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  circle?: boolean;
  lines?: number;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ width = '100%', height = 14, radius = 6, circle = false, lines, className, style }: SkeletonProps) {
  const r = circle ? '50%' : radius;
  if (lines && lines > 1) {
    return (
      <div className={cn('flex flex-col gap-2', className)} style={style}>
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="tps-skeleton block"
            style={{ width: i === lines - 1 ? '70%' : width, height, borderRadius: r }}
          />
        ))}
      </div>
    );
  }
  return (
    <span
      aria-hidden
      className={cn('tps-skeleton block', className)}
      style={{ width, height, borderRadius: r, ...style }}
    />
  );
}
