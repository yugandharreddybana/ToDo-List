import React, { useState } from 'react';
import { GlassCard, Button, Badge } from './UI';
import { Plus, Search, Filter, CheckSquare, MoreVertical, Clock, Calendar, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const FILTERS = ['All', 'Today', 'Overdue', 'This Week', 'P1', 'P2', 'Work', 'Career', 'Health', 'Study', 'Personal', 'Completed'];

export default function Tasks({ tasks, onViewTask, onOpenTaskModal }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Today': true,
    'Tomorrow': true,
    'This Week': true,
    'Later': true,
    'Completed': false
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleTaskComplete = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    if (task.status !== 'done') {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#00E676', '#00BFFF', '#BF5AF2']
      });
      
      // Here you would normally call an onUpdateTask prop to save the status
      // For now, we'll just let the view modal handle it or add a prop later
    }
  };

  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Completed') return task.status === 'done';
    if (['P1', 'P2', 'P3', 'P4'].includes(activeFilter)) return task.priority === activeFilter;
    if (['Work', 'Career', 'Health', 'Study', 'Personal'].includes(activeFilter)) return task.category === activeFilter;
    
    // Simple date filtering for demo
    const today = new Date().toISOString().split('T')[0];
    if (activeFilter === 'Today') return task.date === today && task.status !== 'done';
    if (activeFilter === 'Overdue') return task.date && task.date < today && task.status !== 'done';
    
    return true;
  });

  const groupedTasks = {
    'Today': filteredTasks.filter((t: any) => t.date === new Date().toISOString().split('T')[0] && t.status !== 'done'),
    'Tomorrow': filteredTasks.filter((t: any) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return t.date === tomorrow.toISOString().split('T')[0] && t.status !== 'done';
    }),
    'This Week': filteredTasks.filter((t: any) => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      return t.date > tomorrowStr && t.status !== 'done';
    }),
    'Later': filteredTasks.filter((t: any) => !t.date && t.status !== 'done'),
    'Completed': filteredTasks.filter((t: any) => t.status === 'done'),
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
          <span className="bg-electric-blue/20 text-electric-blue px-3 py-1 rounded-full text-sm font-bold">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="gap-2 border border-white/10">
            <Filter className="w-4 h-4" /> Sort
          </Button>
          <Button onClick={() => onOpenTaskModal('manual')} className="gap-2 shadow-[0_0_20px_rgba(0,191,255,0.3)]">
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              activeFilter === f 
                ? "bg-electric-blue text-background shadow-[0_0_10px_rgba(0,191,255,0.4)]" 
                : "bg-white/5 text-gray-muted hover:bg-white/10 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-muted" />
        <input 
          type="text" 
          placeholder="Search tasks..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-white/8 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-electric-blue/50 transition-colors"
        />
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
          if (groupTasks.length === 0) return null;
          const isExpanded = expandedGroups[groupName];

          return (
            <div key={groupName} className="space-y-2">
              <button 
                onClick={() => toggleGroup(groupName)}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-muted hover:text-white transition-colors w-full text-left"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {groupName} <span className="bg-white/10 px-2 py-0.5 rounded-md text-[10px]">{groupTasks.length}</span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {groupTasks.length === 0 ? (
                      <div className="py-6 text-center text-gray-muted flex flex-col items-center justify-center bg-surface/30 rounded-xl border border-white/5 border-dashed">
                        <CheckSquare className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs">No tasks in this group.</p>
                        <Button variant="ghost" size="sm" onClick={() => onOpenTaskModal('manual')} className="mt-2 text-electric-blue text-xs h-8">
                          <Plus className="w-3 h-3 mr-1" /> Add Task
                        </Button>
                      </div>
                    ) : (
                      groupTasks.map((task: any) => (
                        <GlassCard 
                          key={task.id} 
                          className="p-3 flex items-center gap-4 group cursor-pointer hover:border-electric-blue/30 transition-all relative overflow-hidden"
                          onClick={() => onViewTask(task)}
                        >
                        <button 
                          className="shrink-0 text-gray-muted hover:text-electric-blue transition-colors relative"
                          onClick={(e) => handleTaskComplete(e, task)}
                        >
                          {task.status === 'done' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-green" />
                          ) : (
                            <>
                              <Circle className="w-5 h-5" />
                              <motion.div 
                                className="absolute inset-0 rounded-full border-2 border-emerald-green"
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileTap={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              />
                            </>
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              task.priority === 'P1' ? 'bg-p1' : task.priority === 'P2' ? 'bg-p2' : task.priority === 'P3' ? 'bg-p3' : 'bg-p4'
                            )} />
                            <h4 className={cn("font-medium truncate text-sm", task.status === 'done' && "line-through text-gray-muted")}>
                              {task.title}
                            </h4>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-muted truncate max-w-md">{task.description}</p>
                          )}
                        </div>

                        <div className="hidden md:flex items-center gap-3 shrink-0">
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="text-[10px] font-medium bg-white/5 px-2 py-1 rounded-md text-gray-muted">
                              0/{task.subtasks.length} subtasks
                            </span>
                          )}
                          <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-gray-muted">{task.category}</span>
                          <span className="text-[10px] text-gray-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {task.time}</span>
                          <span className={cn(
                            "text-[10px] flex items-center gap-1 px-2 py-1 rounded-md",
                            task.date === new Date().toISOString().split('T')[0] ? "bg-amber/20 text-amber" : "bg-white/5 text-gray-muted"
                          )}>
                            <Calendar className="w-3 h-3" /> {task.date || 'No date'}
                          </span>
                        </div>

                        <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all shrink-0">
                          <MoreVertical className="w-4 h-4 text-gray-muted" />
                        </button>
                      </GlassCard>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        
        {filteredTasks.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-white/8">
              <CheckSquare className="w-8 h-8 text-gray-muted" />
            </div>
            <h3 className="text-lg font-bold mb-1">No tasks found</h3>
            <p className="text-gray-muted text-sm">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
