import React, { useState } from 'react';
import { GlassCard, Button, Badge, TechnicalLabel } from './UI';
import { 
  Plus, 
  Search, 
  Target, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Navigation2,
  ListTodo,
  Sparkles,
  RefreshCw,
  LayoutGrid
} from 'lucide-react';
import TaskTimeline from './TaskTimeline';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const CATEGORIES = ['All', 'Work', 'Career', 'Health', 'Personal', 'Nexus'];

export default function Tasks({ tasks, onViewTask, onDeleteTask, onOpenTaskModal }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Immediate': true,
    'Scheduled': true,
    'Backlog': true,
    'Completed': false
  });

  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleTaskComplete = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    if (task.status !== 'done') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: ['#00F5A0', '#FFFFFF', '#1A1C1E', '#50C878']
      });
    }
  };

  const confirmDelete = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setTaskToDelete(taskId);
  };

  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || task.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTasks = {
    'Immediate': filteredTasks.filter((t: any) => t.priority === 'P1' && t.status !== 'done'),
    'Scheduled': filteredTasks.filter((t: any) => (t.priority === 'P2' || t.priority === 'P3') && t.status !== 'done'),
    'Backlog': filteredTasks.filter((t: any) => t.priority === 'P4' && t.status !== 'done'),
    'Completed': filteredTasks.filter((t: any) => t.status === 'done'),
  };

  return (
    <div className="space-y-24 pb-32">
      
      {/* Registry Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-12 pt-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
             <div className="h-[1.5px] w-12 bg-zenith-emerald" />
             <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-zenith-emerald">Tactical Operations Log</span>
          </div>
          <h1 className="text-8xl md:text-[8rem] font-display font-semibold text-white tracking-tighter leading-none italic">
             Core <br /><span className="text-white/20 not-italic">Registry.</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="hidden lg:flex items-center gap-12 px-10 py-6 glass-surface border-white/5 rounded-[2rem]">
             <TechnicalLabel label="Load Status" value={`${tasks.filter((t: any) => t.status !== 'done').length}/50_NODES`} color="text-zenith-emerald" />
             <div className="w-[1px] h-10 bg-white/10" />
             <TechnicalLabel label="Capacity" value="OPTIMAL_ALIGNMENT" color="text-white/40" />
          </div>
          <Button variant="zenith-emerald" onClick={() => onOpenTaskModal('manual')} className="shadow-[0_0_50px_rgba(0,245,160,0.1)] px-12 py-8 rounded-[2.5rem]">
            <Plus className="w-8 h-8 mr-4" />
            <span className="font-bold">NEW_PROTOCOL</span>
          </Button>
        </div>
      </header>

      {/* Management Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center glass-surface p-6 rounded-[3rem] border-white/5 mx-auto max-w-7xl">
        <div className="lg:col-span-12 xl:col-span-1 relative group flex items-center justify-center border-r border-white/5 px-4">
           <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-3 rounded-xl transition-all",
                  viewMode === 'grid' ? "bg-white text-black shadow-xl" : "text-white/20 hover:text-white"
                )}
                title="Registry Matrix"
              >
                <LayoutGrid className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setViewMode('timeline')}
                className={cn(
                  "p-3 rounded-xl transition-all",
                  viewMode === 'timeline' ? "bg-white text-black shadow-xl" : "text-white/20 hover:text-white"
                )}
                title="Execution Timeline"
              >
                <Calendar className="w-6 h-6" />
              </button>
           </div>
        </div>
        <div className="lg:col-span-12 xl:col-span-7 relative group">
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-white/20 group-focus-within:text-zenith-emerald transition-colors" />
          <input 
            type="text" 
            placeholder="Search active roadmap nodes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none py-8 pl-24 pr-12 text-4xl font-display font-light text-white placeholder:text-white/5 focus:outline-none transition-all tracking-tighter italic"
          />
        </div>
        <div className="lg:col-span-12 xl:col-span-4 flex gap-4 overflow-x-auto scrollbar-hide py-4 px-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-10 py-5 rounded-[2rem] text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all shrink-0 active:scale-95",
                activeCategory === cat ? "bg-white text-black shadow-2xl" : "glass-surface border-white/5 text-white/20 hover:text-white hover:bg-white/10"
              )}
            >
              {cat === 'All' ? 'FULL_MATRIX' : cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Protocol Streams */}
      <div className="space-y-24">
        {viewMode === 'timeline' ? (
           <TaskTimeline 
             tasks={filteredTasks} 
             onOpenTaskModal={onOpenTaskModal} 
           />
        ) : (
          Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
          if (groupTasks.length === 0 && groupName !== 'Immediate') return null;
          const isExpanded = expandedGroups[groupName];

          return (
            <section key={groupName} className="space-y-12">
              <button 
                onClick={() => toggleGroup(groupName)}
                className="flex items-center gap-8 group w-full text-left active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-3 h-3 rounded-full transition-all duration-700 group-hover:scale-[2] group-hover:shadow-[0_0_20px_white]",
                    groupName === 'Immediate' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : groupName === 'Scheduled' ? 'bg-zenith-emerald shadow-[0_0_15px_rgba(0,245,160,0.5)]' : groupName === 'Completed' ? 'bg-white opacity-20' : 'bg-white opacity-5'
                  )} />
                  <h3 className="text-sm font-mono font-bold uppercase tracking-[0.6em] text-white/20 group-hover:text-white transition-all italic">{groupName}</h3>
                </div>
                <div className="h-[1px] flex-1 bg-white/5 group-hover:bg-white/20 transition-all" />
                <span className="text-[10px] font-mono text-white/40 glass-surface border-white/5 px-8 py-3 rounded-full font-bold uppercase tracking-[0.2em]">{groupTasks.length} VISUAL_NODES</span>
                <div className="w-12 h-12 glass-surface border-white/5 rounded-2xl flex items-center justify-center group-hover:border-white transition-all">
                   {isExpanded ? <ChevronDown className="w-6 h-6 text-white/40" /> : <ChevronRight className="w-6 h-6 text-white/40" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 gap-10"
                  >
                    {groupTasks.length === 0 ? (
                      <div className="p-32 glass-surface border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center opacity-40 group hover:opacity-100 transition-opacity">
                        <div className="p-10 glass-surface rounded-[2.5rem] border-white/10 mb-10 group-hover:rotate-12 transition-all duration-700">
                           <ListTodo className="w-20 h-20 text-white/5 group-hover:text-zenith-emerald transition-colors" />
                        </div>
                        <p className="text-white/20 font-display text-4xl font-light mb-12 italic">Target stream is <span className="text-white">Empty.</span></p>
                        <Button variant="outline" size="lg" onClick={() => onOpenTaskModal('manual')} className="px-16 py-8 rounded-[2rem] text-xl font-display uppercase tracking-widest border-white/10 hover:border-zenith-emerald hover:text-zenith-emerald">Initialize Protocol</Button>
                      </div>
                    ) : (
                      groupTasks.map((task: any) => (
                        <div 
                          key={task.id} 
                          className="group p-12 interactive-pane cursor-pointer border-white/5 relative overflow-hidden"
                          onClick={() => onViewTask(task)}
                        >
                          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-zenith-emerald/40 transition-all duration-[1500ms]" />
                          
                          <div className="flex items-center gap-12 relative z-10">
                            <button 
                              onClick={(e) => handleTaskComplete(e, task)}
                              className="shrink-0 relative group/check"
                            >
                              {task.status === 'done' ? (
                                <div className="w-16 h-16 rounded-[2rem] glass-surface flex items-center justify-center border-zenith-emerald/30 bg-zenith-emerald/10">
                                   <CheckCircle2 className="w-10 h-10 text-zenith-emerald" />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-[2rem] glass-surface border-white/10 flex items-center justify-center group-hover/check:border-zenith-emerald transition-all duration-700 group-hover/check:scale-110">
                                  <div className="w-4 h-4 rounded-full bg-white/10 group-hover/check:bg-zenith-emerald group-hover/check:scale-[2] shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover/check:shadow-zenith-emerald group-hover/check:shadow-[0_0_30px_rgba(0,245,160,0.6)] transition-all duration-700" />
                                </div>
                              )}
                            </button>

                            <div className="flex-1 min-w-0 space-y-8">
                              <div className="flex items-center gap-8">
                                <h4 className={cn("text-6xl font-display font-light transition-all duration-1000 tracking-tighter italic", task.status === 'done' ? "line-through text-white/10" : "text-white group-hover:text-zenith-emerald group-hover:not-italic group-hover:font-normal")}>
                                  {task.title}
                                </h4>
                                {task.priority === 'P1' && <Badge priority="P1" className="not-italic">PRIORITY_CRITICAL</Badge>}
                              </div>
                              <div className="flex flex-wrap items-center gap-10 text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] font-bold group-hover:text-white/60 transition-colors">
                                <span className="flex items-center gap-3 px-6 py-3 glass-surface rounded-xl border-white/5 group-hover:border-zenith-emerald/20 transition-all"><Navigation2 className="w-5 h-5 text-zenith-emerald" />{task.category} Baseline</span>
                                <div className="hidden md:flex items-center gap-10">
                                   <div className="w-2 h-2 rounded-full bg-white/5" />
                                   <span className="flex items-center gap-4"><Clock className="w-5 h-5" />{task.duration || task.time || 'SYNCHRONIZED'}</span>
                                   {task.isRecurring && (
                                     <>
                                       <div className="w-2 h-2 rounded-full bg-white/5" />
                                       <span className="flex items-center gap-4 text-zenith-emerald/60">
                                         <RefreshCw className="w-4 h-4" />
                                         {task.recurrence === 'custom' ? `EVERY ${task.customInterval || 0} D` : task.recurrence}
                                       </span>
                                     </>
                                   )}
                                   {task.date && (
                                     <>
                                       <div className="w-2 h-2 rounded-full bg-white/5" />
                                       <span className="flex items-center gap-4"><Calendar className="w-5 h-5" />{task.date}</span>
                                     </>
                                   )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-8 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-12 group-hover:translate-x-0">
                              <button 
                                onClick={(e) => confirmDelete(e, task.id)}
                                className="w-16 h-16 glass-surface border-white/5 hover:border-red-500/30 hover:bg-red-500/5 text-white/20 hover:text-red-500 rounded-[1.5rem] transition-all duration-700 flex items-center justify-center shadow-2xl"
                              >
                                <Trash2 className="w-8 h-8" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })
      )}
      </div>

      {/* Synthesis Advisory */}
      <div className="glass-surface border-zenith-emerald/20 bg-zenith-emerald/5 p-16 flex flex-col lg:flex-row items-center justify-between group overflow-hidden rounded-[4rem] gap-16 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-zenith-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[1500ms]" />
        <div className="flex items-center gap-16 relative z-10">
           <div className="w-24 h-24 rounded-[3rem] glass-surface flex items-center justify-center border-white/10 group-hover:rotate-[360deg] transition-all duration-[2000ms]">
              <Sparkles className="w-12 h-12 text-zenith-emerald animate-pulse" />
           </div>
           <div className="space-y-4">
              <span className="text-[10px] font-mono text-zenith-emerald uppercase tracking-[0.6em] font-bold mb-2 block">Neural Strategy Node</span>
              <p className="text-4xl font-display font-light text-white max-w-2xl leading-tight tracking-tight italic">
                 Analysis indicates <span className="text-white font-bold not-italic">2 high-impact nodes</span> require immediate synchronization to maintain optimal end-of-day parity.
              </p>
           </div>
        </div>
        <Button variant="zenith-emerald" className="w-full lg:w-auto px-16 py-10 text-2xl rounded-[3rem] shadow-[0_0_80px_rgba(0,245,160,0.1)] group-hover:shadow-[0_0_120px_rgba(0,245,160,0.2)] transition-all duration-1000 relative z-10 font-bold italic">SYNCHRONIZE NOW</Button>
      </div>

      {/* Deletion Confirmation Modal */}
      <AnimatePresence>
        {taskToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTaskToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-surface border-white/10 p-16 rounded-[4rem] text-center space-y-12 shadow-[0_0_100px_rgba(239,68,68,0.1)]"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-12 h-12 text-red-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                <h3 className="text-5xl font-display font-semibold text-white italic">Confirm Node Erasure?</h3>
                <p className="text-2xl font-display font-light text-white/30 leading-relaxed italic">
                  This action will permanently terminate the selected <span className="text-white">Neural Objective</span> from the core registry.
                </p>
              </div>
              <div className="flex gap-6 pt-8">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setTaskToDelete(null)}
                  className="flex-1 h-20 rounded-[2rem] border-white/5 text-white/30 hover:text-white"
                >
                  ABORT_ACTION
                </Button>
                <Button 
                  variant="zenith-emerald" 
                  size="lg" 
                  onClick={() => {
                    onDeleteTask(taskToDelete);
                    setTaskToDelete(null);
                  }}
                  className="flex-1 h-20 rounded-[2rem] bg-red-500 hover:bg-red-600 border-none shadow-[0_0_50px_rgba(239,68,68,0.2)]"
                >
                  TERMINATE_NODE
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
