import React, { useState, useRef, useEffect } from 'react';
import { GlassCard, Button } from './UI';
import { Clock, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function TaskTimeline({ onOpenTaskModal }: { onOpenTaskModal: (tab?: 'manual' | 'scan' | 'voice') => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      top: `${start * 60}px`,
      height: `${(end - start + 1) * 60}px`,
    };
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Timeline</h2>
          <div className="flex bg-surface border border-white/8 rounded-xl p-1">
            <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-3 text-xs font-bold uppercase tracking-widest">Today</button>
            <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        <Button size="sm" onClick={onOpenTaskModal} className="gap-2">
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </header>

      <div className="relative bg-surface/30 border border-white/8 rounded-3xl overflow-hidden">
        <div 
          ref={containerRef}
          className="h-[600px] overflow-y-auto relative scrollbar-hide select-none"
        >
          {/* Time Grid */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div 
                key={hour}
                onMouseDown={() => handleMouseDown(hour)}
                onMouseEnter={() => handleMouseEnter(hour)}
                className="h-[60px] border-b border-white/5 flex items-start group cursor-crosshair"
              >
                <div className="w-16 text-[10px] font-mono text-gray-muted text-right pr-4 pt-1">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                <div className="flex-1 h-full group-hover:bg-white/[0.02] transition-colors" />
              </div>
            ))}

            {/* Selection Overlay */}
            {(isDragging || (startHour !== null && endHour !== null)) && (
              <motion.div 
                className="absolute left-16 right-0 bg-electric-blue/20 border-l-4 border-electric-blue pointer-events-none z-10"
                style={getSelectionStyles()}
              >
                <div className="p-3">
                  <span className="bg-electric-blue text-background text-[10px] font-bold px-1.5 py-0.5 rounded">
                    New Task
                  </span>
                </div>
              </motion.div>
            )}

            {/* Existing Tasks Simulation */}
            <div className="absolute top-[120px] left-16 right-4 h-[90px] bg-purple-500/20 border-l-4 border-purple-500 rounded-r-xl p-3 z-0">
              <h4 className="text-xs font-bold">Deep Work: Project Alpha</h4>
              <p className="text-[10px] text-gray-muted">2:00 AM - 3:30 AM</p>
            </div>

            <div className="absolute top-[300px] left-16 right-4 h-[60px] bg-amber/20 border-l-4 border-amber rounded-r-xl p-3 z-0">
              <h4 className="text-xs font-bold">Team Sync</h4>
              <p className="text-[10px] text-gray-muted">5:00 AM - 6:00 AM</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-muted">
          Drag over time slots to create a task
        </div>
      </div>
    </div>
  );
}
