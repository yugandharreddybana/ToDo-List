import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12',
        className,
      )}
    >
      {icon && (
        <div
          className="flex items-center justify-center mb-4 rounded-full"
          style={{
            width: 56,
            height: 56,
            background: 'var(--bg-sidebar)',
            color: 'var(--accent-primary)',
          }}
        >
          {icon}
        </div>
      )}
      <h4 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h4>
      {description && (
        <p className="text-[13px] max-w-[320px] mb-4" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
