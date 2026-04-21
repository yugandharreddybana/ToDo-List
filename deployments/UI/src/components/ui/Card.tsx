import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
  children: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, padded = true, className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-[14px]',
        padded && 'p-6',
        interactive && 'tps-card-hover cursor-pointer',
        className,
      )}
      style={{
        background: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-start justify-between pb-4 mb-4', className)}
      style={{ borderBottom: '1px solid var(--border)' }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 pt-4 mt-4', className)}
      style={{ borderTop: '1px solid var(--border)' }}
      {...rest}
    >
      {children}
    </div>
  );
}
