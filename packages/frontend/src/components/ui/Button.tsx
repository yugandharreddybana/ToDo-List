import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-[14px]',
  lg: 'h-12 px-6 text-[15px]',
};

const variantStyles: Record<ButtonVariant, { bg: string; color: string; hover: string; border: string }> = {
  primary: { bg: 'var(--accent-primary)', color: 'var(--text-inverse)', hover: '#4A87BF', border: 'transparent' },
  secondary: { bg: 'var(--bg-secondary)', color: 'var(--text-primary)', hover: 'var(--bg-hover)', border: 'var(--border)' },
  ghost: { bg: 'transparent', color: 'var(--text-primary)', hover: 'var(--bg-hover)', border: 'transparent' },
  danger: { bg: 'var(--accent-coral)', color: 'var(--text-inverse)', hover: '#C96A59', border: 'transparent' },
  success: { bg: 'var(--accent-green)', color: 'var(--text-inverse)', hover: '#5AA88D', border: 'transparent' },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    className,
    onMouseEnter,
    onMouseLeave,
    style,
    ...rest
  },
  ref,
) {
  const v = variantStyles[variant];
  const busy = loading || isLoading;
  const isDisabled = disabled || busy;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-[10px] transition-all duration-200 select-none',
        sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      style={{
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        boxShadow: variant === 'primary' || variant === 'danger' || variant === 'success' ? 'var(--shadow-sm)' : 'none',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) (e.currentTarget.style.background = v.hover);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) (e.currentTarget.style.background = v.bg);
        onMouseLeave?.(e);
      }}
      {...rest}
    >
      {busy ? <Spinner size={size === 'sm' ? 12 : 14} color={v.color} /> : leftIcon}
      {children}
      {!busy && rightIcon}
    </button>
  );
});
