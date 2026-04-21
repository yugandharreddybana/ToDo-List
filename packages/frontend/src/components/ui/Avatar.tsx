import { useMemo, useState } from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

const PALETTE = ['#5B9BD5', '#6BBEA0', '#9B89C4', '#F0A500', '#72C5E0', '#E07B6A'];

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length]!;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join('') || '?';
}

export function Avatar({ src, name = '', size = 36, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src && !failed);
  const color = useMemo(() => hashColor(name || 'user'), [name]);

  return (
    <span
      className={cn('inline-flex items-center justify-center overflow-hidden select-none flex-shrink-0', className)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: showImage ? 'transparent' : color,
        color: 'white',
        fontWeight: 600,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {showImage ? (
        <img
          src={src!}
          alt={name}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
