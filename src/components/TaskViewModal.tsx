import React from 'react';
import { Button, Badge, Modal, TechnicalLabel } from './UI';
import { X, Clock, Calendar, Edit2, CheckCircle2, MessageSquare, ListTodo, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
    <Modal 
      isOpen={!!task} 
      onClose={onClose} 
      title="Strategic Objective Analysis"
    >
      <div className="space-y-12 py-6">
        <div className="flex items-center gap-6 mb-8">
           <div className="h-[2px] w-8 bg-zenith-emerald/50" />
           <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/30">REF_ID: {task.id?.toUpperCase().slice(0, 8)}</span>
        </div>
        
        {/* Primary Meta Section */}
        <section className="space-y-10">
           <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <Badge priority={task.priority as any} className="px-6">{task.priority} INTENSITY</Badge>
                    <span className="text-[9px] font-mono text-zenith-emerald uppercase tracking-[0.4em] px-5 py-2 border border-zenith-emerald/20 rounded-full font-bold bg-zenith-emerald/5">{task.category} SECTOR</span>
                 </div>
                 <Button variant="outline" size="sm" onClick={() => { onClose(); onEdit(task); }} className="gap-3 h-12 rounded-xl border-white/5 hover:border-zenith-emerald/30 hover:bg-zenith-emerald/5 transition-all px-8 text-[10px]">
                   <Edit2 className="w-4 h-4" /> RE_STRATEGIZE
                 </Button>
              </div>
              
              <h2 className={cn(
                "text-5xl md:text-6xl font-display font-semibold leading-tight tracking-tighter italic",
                task.status === 'done' ? "text-white/20 line-through" : "text-white"
              )}>
                {task.title}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/5">
                 <TechnicalLabel label="Operational Date" value={task.date || 'PENDING'} color="text-white" />
                 <TechnicalLabel label="Asset Load" value={task.duration || task.time || '1.0 HRS'} color="text-zenith-emerald" />
                  {task.isRecurring ? (
                    <TechnicalLabel 
                      label="Protocol Loop" 
                      value={task.recurrence === 'custom' ? `EVERY ${task.customInterval || 0} D` : (task.recurrence?.toUpperCase() || 'CYCLIC')} 
                      color="text-white/40" 
                    />
                  ) : (
                    <TechnicalLabel label="Operational Status" value="Linear" color="text-white/20" />
                  )}
                 <TechnicalLabel label="Clearance" value="Executive" />
              </div>
           </div>
        </section>

        {/* Workflow State Terminal */}
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-white/20">Deployment Status</h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <div className="flex flex-wrap gap-4 bg-white/[0.02] p-2 border border-white/5 rounded-[2rem] backdrop-blur-3xl">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => onUpdateTask({ ...task, status: s })}
                className={cn(
                  "px-12 py-5 rounded-[1.5rem] text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all duration-700 flex items-center gap-6 relative overflow-hidden group/s",
                  task.status === s 
                    ? "text-black" 
                    : "text-white/20 hover:text-white"
                )}
              >
                {task.status === s && (
                  <motion.div layoutId="status-bg" className="absolute inset-0 bg-white" />
                )}
                <div className="relative z-10 flex items-center gap-4">
                  {s === 'done' && <CheckCircle2 className="w-5 h-5" />}
                  {s === 'in-progress' && <Activity className="w-5 h-5 animate-pulse" />}
                  {s === 'todo' && <ListTodo className="w-5 h-5" />}
                  {s.replace('-', ' ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Narrative Description */}
        {task.description && (
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-white/20">Strategic Intent</h3>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="p-10 glass-surface border-white/5 bg-white/[0.02] rounded-[3rem] text-white/60 text-2xl font-light leading-relaxed italic whitespace-pre-wrap">
              {task.description}
            </div>
          </div>
        )}

        {/* Tactical Operational Segments */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-white/20">Tactical Segments</h3>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {task.subtasks.map((st: string, idx: number) => (
                <div key={idx} className="flex items-center gap-6 p-6 glass-surface border-white/5 rounded-2xl group/st hover:bg-white/[0.04] transition-all">
                   <div className="w-2.5 h-2.5 rounded-full bg-zenith-emerald/20 group-hover/st:bg-zenith-emerald transition-colors" />
                   <span className="text-xl font-display font-light text-white/50 group-hover/st:text-white transition-colors italic">{st}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Communication Stream */}
        <div className="space-y-12">
           <div className="flex items-center gap-6">
             <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-white/20">Communication Matrix</h3>
             <div className="h-[1px] flex-1 bg-white/5" />
           </div>
          
          <div className="space-y-10">
            {task.comments?.map((comment: any, idx: number) => (
              <div key={idx} className="flex gap-8 group">
                <div className="w-16 h-16 rounded-[1.5rem] glass-surface border-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xl font-display font-bold text-white/40">{comment.author?.[0] || 'E'}</span>
                </div>
                <div className="flex-1 glass-surface border-white/5 p-8 rounded-[2.5rem] rounded-tl-none group-hover:border-white/20 transition-all duration-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold text-zenith-emerald uppercase tracking-[0.3em]">{comment.author || 'EXECUTIVE'}</span>
                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{comment.date || 'RECENT'}</span>
                  </div>
                  <p className="text-xl font-light text-white/70 leading-relaxed italic">{comment.text}</p>
                </div>
              </div>
            ))}
            
            {(!task.comments || task.comments.length === 0) && (
              <div className="py-20 text-center glass-surface border-dashed border-2 border-white/5 rounded-[4rem] group hover:border-white/10 transition-all">
                 <MessageSquare className="w-12 h-12 mx-auto mb-6 text-white/10 group-hover:text-white/20 transition-colors" />
                 <p className="text-[10px] font-mono uppercase tracking-[0.4em] font-bold text-white/20 group-hover:text-white/30 transition-colors">Strategic Stream Silent. Initiation Pending.</p>
              </div>
            )}
          </div>

          <div className="relative pt-12">
            <input 
              type="text" 
              placeholder="Inject strategic commentary..." 
              className="w-full glass-surface border-white/5 rounded-[2.5rem] p-10 text-2xl font-display font-light italic focus:border-white outline-none transition-all pr-48 text-white placeholder:text-white/5"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  if (input.value.trim()) {
                    const newComment = {
                      author: 'Primary Directive',
                      text: input.value,
                      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    onUpdateTask({
                      ...task,
                      comments: [...(task.comments || []), newComment]
                    });
                    input.value = '';
                  }
                }
              }}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 translate-y-[1.7rem]">
               <Button variant="zenith-emerald" size="lg" className="h-16 px-12 rounded-full font-bold shadow-2xl">TRANSMIT</Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
