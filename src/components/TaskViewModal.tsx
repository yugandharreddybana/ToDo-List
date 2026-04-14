import React from 'react';
import { Button, Badge } from './UI';
import { X, Clock, Calendar, Circle, Edit2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface TaskViewModalProps {
  task: any;
  onClose: () => void;
  onUpdateTask: (task: any) => void;
  onEdit: (task: any) => void;
}

export default function TaskViewModal({ task, onClose, onUpdateTask, onEdit }: TaskViewModalProps) {
  if (!task) return null;

  const statuses = ['todo', 'in-progress', 'done'];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <Badge priority={task.priority as any}>{task.priority}</Badge>
            <span className="text-xs font-bold text-gray-muted uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">{task.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { onClose(); onEdit(task); }} className="gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </Button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-muted hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          <div>
            <h2 className={cn("text-3xl font-bold mb-4", task.status === 'done' && "line-through text-gray-muted")}>
              {task.title}
            </h2>
            <div className="flex items-center gap-6 text-sm text-gray-muted">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-electric-blue" /> 
                {task.date || 'No date set'}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-electric-blue" /> 
                {task.time || task.duration || '1h'}
              </div>
            </div>
          </div>

          {/* Status Workflow */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-muted">Status Workflow</h3>
            <div className="flex gap-2 p-1.5 bg-black/20 rounded-xl border border-white/5 w-fit">
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => onUpdateTask({ ...task, status: s })}
                  className={cn(
                    "px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all flex items-center gap-2",
                    task.status === s 
                      ? "bg-electric-blue text-background shadow-[0_0_15px_rgba(0,191,255,0.3)]" 
                      : "text-gray-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  {s === 'done' && task.status === s && <CheckCircle2 className="w-4 h-4" />}
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {task.description && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-muted">Description</h3>
              <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-muted">Subtasks</h3>
              <div className="space-y-2">
                {task.subtasks.map((st: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <Circle className="w-4 h-4 text-electric-blue mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300">{st}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
