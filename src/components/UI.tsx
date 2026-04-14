import React from 'react';
import { cn } from '@/src/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  key?: string | number;
  [key: string]: any;
}

export function GlassCard({ children, className, title, subtitle, ...props }: CardProps) {
  return (
    <div className={cn("glass-card p-6", className)} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: any;
  key?: string | number;
  [key: string]: any;
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-electric-blue text-background hover:bg-electric-blue/90",
    secondary: "bg-surface text-white hover:bg-surface/80 border border-white/8",
    outline: "bg-transparent border border-electric-blue text-electric-blue hover:bg-electric-blue/10",
    ghost: "bg-transparent hover:bg-white/5 text-gray-muted hover:text-white",
    danger: "bg-red text-white hover:bg-red/90",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button 
      className={cn(
        "rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, priority }: { children: React.ReactNode, priority: 'P1' | 'P2' | 'P3' | 'P4' }) {
  const colors = {
    P1: "bg-p1/10 text-p1 border-p1/20",
    P2: "bg-p2/10 text-p2 border-p2/20",
    P3: "bg-p3/10 text-p3 border-p3/20",
    P4: "bg-p4/10 text-p4 border-p4/20",
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider",
      colors[priority]
    )}>
      {children}
    </span>
  );
}
