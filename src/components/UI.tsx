import React from 'react';
import { cn } from '@/src/lib/utils';
import { motion, HTMLMotionProps, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  onClick?: any;
}

export function GlassCard({ children, className, title, subtitle, ...props }: CardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("interactive-pane p-8 relative overflow-hidden", className)} 
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-10 relative z-10">
          {title && <h3 className="text-3xl font-display font-semibold tracking-tight text-white">{title}</h3>}
          {subtitle && (
            <div className="flex items-center gap-3 mt-3">
              <div className="h-[1px] w-8 bg-zenith-emerald/30" />
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-zenith-muted font-bold">{subtitle}</p>
            </div>
          )}
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'zenith' | 'subtle' | 'outline' | 'ghost' | 'danger' | 'zenith-emerald';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: React.ReactNode;
  className?: string;
  onClick?: any;
  disabled?: boolean;
}

export function Button({ 
  children, 
  className, 
  variant = 'zenith', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  const variants = {
    zenith: "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
    'zenith-emerald': "bg-zenith-emerald text-black shadow-[0_0_20px_rgba(0,245,160,0.3)] hover:scale-105 transition-transform duration-500",
    subtle: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    outline: "bg-transparent border border-white/20 text-white hover:bg-white/5",
    ghost: "bg-transparent text-white/50 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
  };

  const sizes = {
    sm: "px-6 py-2.5 text-[10px] uppercase tracking-widest font-mono font-bold",
    md: "px-10 py-4 text-sm font-bold uppercase tracking-widest",
    lg: "px-14 py-6 text-xl font-display font-semibold",
    icon: "p-4",
  };

  return (
    <motion.button 
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "rounded-2xl transition-all duration-500 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-3",
        variants[variant as keyof typeof variants] || variants.zenith,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Badge({ children, priority, className }: { children: React.ReactNode, priority: 'P1' | 'P2' | 'P3' | 'P4' | 'critical' | 'high' | 'medium' | 'low', className?: string }) {
  const pMap: Record<string, string> = {
    critical: 'P1',
    high: 'P2',
    medium: 'P3',
    low: 'P4',
    P1: 'P1',
    P2: 'P2',
    P3: 'P3',
    P4: 'P4'
  };

  const normalizedPriority = pMap[priority] || 'P3';

  const colors = {
    P1: "text-red-400 border-red-400/30 bg-red-400/5",
    P2: "text-orange-400 border-orange-400/30 bg-orange-400/5",
    P3: "text-zenith-emerald border-zenith-emerald/30 bg-zenith-emerald/5",
    P4: "text-white/40 border-white/10 bg-white/5",
  };

  return (
    <span className={cn(
      "px-4 py-1.5 rounded-full text-[9px] font-mono font-bold border uppercase tracking-widest",
      colors[normalizedPriority as keyof typeof colors],
      className
    )}>
      {children}
    </span>
  );
}

export function TechnicalLabel({ label, value, color = "text-white/40" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em] font-bold">{label}</span>
      <span className={cn("text-xs font-bold tracking-wide", color)}>{value}</span>
    </div>
  );
}

export function ProgressBar({ progress, className }: { progress: number, className?: string }) {
  return (
    <div className={cn("h-1 w-full bg-white/5 rounded-full overflow-hidden", className)}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className="h-full bg-gradient-to-r from-zenith-emerald to-zenith-emerald/50 shadow-[0_0_10px_rgba(0,245,160,0.4)]"
      />
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, className }: { isOpen: boolean, onClose: () => void, title?: string, children: React.ReactNode, className?: string }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 md:p-12 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn("interactive-pane p-12 relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide", className)}
          >
            <div className="flex items-start justify-between mb-12">
              <div>
                <h2 className="text-5xl font-display font-semibold text-white tracking-tighter leading-none">{title}</h2>
                <div className="h-1 w-20 bg-zenith-emerald mt-6" />
              </div>
              <button 
                onClick={onClose} 
                className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/40 hover:text-white transition-all transform hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
