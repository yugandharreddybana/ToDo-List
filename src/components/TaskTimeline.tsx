import React, { useState, useRef, useEffect } from 'react';
import { GlassCard, Button, TechnicalLabel, Badge } from './UI';
import { Clock, Plus, ChevronLeft, ChevronRight, Activity, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function TaskTimeline({ 
  onOpenTaskModal,
  tasks = []
}: { 
  onOpenTaskModal: (tab?: 'manual' | 'scan' | 'voice') => void,
  tasks?: any[]
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeDateString = currentDate.toISOString().split('T')[0];

  const todayTasks = tasks.filter(t => {
    return t.date === activeDateString;
  });

  const navigateDate = (days: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    setCurrentDate(next);
  };

  const isToday = new Date().toISOString().split('T')[0] === activeDateString;
  
  const displayDate = isToday ? 'TODAY' : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

  const handleMouseDown = (hour: number) => {
    setIsDragging(true);
    setStartHour(hour);
    setEndHour(hour);
  };

  const handleMouseEnter = (hour: number) => {
    if (isDragging) {
      setEndHour(hour);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (startHour !== null && endHour !== null) {
        onOpenTaskModal();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, startHour, endHour]);

  const getSelectionStyles = () => {
    if (startHour === null || endHour === null) return {};
    const start = Math.min(startHour, endHour);
    const end = Math.max(startHour, endHour);
    return {
      top: `${start * 80}px`,
      height: `${(end - start + 1) * 80}px`,
    };
  };

  const getTaskStyles = (task: any, index: number) => {
    let start = 9;
    let duration = 1.25;
    
    const timeMatch = task.time?.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      let h = parseInt(timeMatch[1]);
      const m = parseInt(timeMatch[2]);
      start = h + (m / 60);
    } else {
      start = 8 + (index * 1.5);
    }

    const priorityColors: Record<string, string> = {
      P1: 'border-zenith-error bg-zenith-error/5 text-zenith-danger',
      P2: 'border-zenith-warning bg-zenith-warning/5 text-zenith-warning',
      P3: 'border-zenith-accent bg-zenith-accent/5 text-zenith-accent',
      P4: 'border-zenith-border bg-zenith-surface text-zenith-muted',
    };

    return {
      top: `${start * 80}px`,
      height: `${duration * 80}px`,
      colorClass: priorityColors[task.priority] || priorityColors.P4
    };
  };

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div>
            <h2 className="text-3xl font-display font-semibold text-zenith-text tracking-tight">Execution Roadmap</h2>
            <p className="text-[10px] font-mono text-zenith-muted uppercase tracking-[0.4em] mt-2 font-bold">Daily Strategic Schedule</p>
          </div>
          
          <div className="flex items-center gap-2 p-1.5 glass-surface border-white/5 rounded-2xl shadow-2xl">
            <button 
              onClick={() => navigateDate(-1)}
              className="p-3 hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-zenith-emerald"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-6 text-white tracking-[0.3em] min-w-[140px] text-center italic">
              SESSION: {displayDate}
            </span>
            <button 
              onClick={() => navigateDate(1)}
              className="p-3 hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-zenith-emerald"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <Button variant="zenith" size="sm" onClick={() => onOpenTaskModal()} className="gap-3 px-8 shadow-soft">
          <Plus className="w-4 h-4" /> New Objective
        </Button>
      </header>

      <div className="relative glass-surface rounded-[3rem] overflow-hidden border-white/5 mx-auto max-w-7xl">
        
        {/* Scaffolding Decoration - Professional Vibe */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <Activity className="w-72 h-72 text-zenith-emerald" />
        </div>

        <div 
          ref={containerRef}
          className="h-[700px] overflow-y-auto relative scrollbar-hide select-none p-4"
        >
          {/* Time Matrix Grid */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div 
                key={hour}
                onMouseDown={() => handleMouseDown(hour)}
                onMouseEnter={() => handleMouseEnter(hour)}
                className="h-[100px] border-b border-white/[0.03] flex items-start group cursor-crosshair transition-colors hover:bg-white/[0.02]"
              >
                <div className="w-32 shrink-0 flex flex-col items-end pr-12 pt-6">
                  <span className="text-[12px] font-mono font-bold text-white/20 group-hover:text-zenith-emerald transition-colors tracking-tighter">
                    {hour === 0 ? '00:00' : hour < 10 ? `0${hour}:00` : `${hour}:00`}
                  </span>
                  <div className="w-6 h-[1px] bg-white/10 mt-2 group-hover:bg-zenith-emerald/40 transition-colors" />
                </div>
                <div className="flex-1 h-full" />
              </div>
            ))}

            {/* Selection / Interactive Layer */}
            {(isDragging || (startHour !== null && endHour !== null)) && (
              <motion.div 
                className="absolute left-32 right-8 bg-zenith-emerald/[0.03] border-l-4 border-zenith-emerald z-20 shadow-2xl backdrop-blur-xl rounded-r-[2rem]"
                style={getSelectionStyles()}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
              >
                <div className="p-10 flex items-center gap-6">
                   <div className="w-12 h-12 rounded-[1.2rem] glass-surface flex items-center justify-center border-white/10 shadow-2xl">
                      <Terminal className="w-6 h-6 text-zenith-emerald animate-pulse" />
                   </div>
                   <span className="text-[10px] font-mono font-bold text-zenith-emerald uppercase tracking-[0.6em]">
                     Initializing Protocol Selection...
                   </span>
                </div>
              </motion.div>
            )}

            {/* Task Nodes */}
            {todayTasks.length > 0 ? (
              todayTasks.map((task, idx) => {
                const styles = getTaskStyles(task, idx);
                return (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02, x: 10, zIndex: 30 }}
                    className={cn(
                      "absolute left-36 right-12 rounded-[2rem] border-l-[10px] p-8 z-10 transition-all cursor-pointer shadow-2xl group glass-surface",
                      styles.colorClass === 'border-zenith-error bg-zenith-error/5 text-zenith-danger' ? 'border-red-500/50 bg-red-500/5' : 
                      styles.colorClass === 'border-zenith-warning bg-zenith-warning/5 text-zenith-warning' ? 'border-amber-400/50 bg-amber-400/5' :
                      styles.colorClass === 'border-zenith-accent bg-zenith-accent/5 text-zenith-accent' ? 'border-zenith-emerald/50 bg-zenith-emerald/5' :
                      'border-white/10 bg-white/5',
                      "hover:shadow-[0_0_50px_rgba(255,255,255,0.05)] hover:border-l-[15px]"
                    )}
                    style={{ top: styles.top, height: styles.height }}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="space-y-4">
                         <h4 className="text-3xl font-display font-light text-white transition-colors group-hover:text-zenith-emerald tracking-tight italic">{task.title}</h4>
                         <div className="flex items-center gap-6 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.4em]">
                            <span className="flex items-center gap-3"><Clock className="w-4 h-4 text-zenith-emerald" /> {task.time || 'SYNCHRONIZED'}</span>
                            <span className="w-2 h-2 rounded-full bg-white/5" />
                            <span className="text-white/20 group-hover:text-white transition-colors">{task.category} Sector</span>
                         </div>
                      </div>
                      <Badge priority={task.priority} className="px-6 py-2 rounded-full border-white/10 text-[9px] tracking-widest uppercase">
                        {task.priority === 'P1' ? 'CRITICAL' : task.priority === 'P2' ? 'HIGH' : task.priority === 'P3' ? 'MODERATE' : 'ROUTINE'}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })
            ) : (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                    <p className="text-8xl font-display font-bold italic tracking-tighter">NO_DATA_STREAM</p>
                </div>
            )}
          </div>
        </div>
        
        {/* Interaction Footer */}
        <div className="absolute inset-x-0 bottom-0 py-10 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center pointer-events-none">
           <div className="px-10 py-5 glass-surface border-white/10 rounded-full flex items-center gap-6 shadow-2xl">
              <div className="w-3 h-3 rounded-full bg-zenith-emerald animate-ping" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em] font-bold">Trace & Select Matrix to Map New Directive</span>
           </div>
        </div>
      </div>
    </div>
  );
}
