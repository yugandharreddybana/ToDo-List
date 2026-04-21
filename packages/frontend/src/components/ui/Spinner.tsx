import { CSSProperties } from 'react';

export interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Spinner({ size = 16, color = 'currentColor', className }: SpinnerProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    border: `2px solid color-mix(in srgb, ${color} 25%, transparent)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  };
  return <span role="status" aria-label="Loading" className={className} style={style} />;
}
