import React, { useState } from 'react';
import { GlassCard, Button, Badge } from './UI';
import { 
  Moon, 
  Droplets, 
  Briefcase, 
  Timer, 
  Flame, 
  Brain, 
  X, 
  LayoutGrid, 
  Columns, 
  MoreVertical, 
  CheckCircle2,
  Clock,
  Play,
  Calendar as CalendarIcon,
  FileText,
  Sparkles,
  GripVertical,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import RosterInput from './RosterInput';
import TaskTimeline from './TaskTimeline';
import confetti from 'canvas-confetti';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MetricCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  target: string;
  progress: number;
  color: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

function MetricCard({ icon: Icon, value, label, target, progress, color, onClick, children }: MetricCardProps) {
  return (
    <GlassCard 
      onClick={onClick}
      className={cn(
        "min-w-[180px] flex-1 flex flex-col items-center text-center p-4 relative overflow-hidden transition-all",
        onClick && "cursor-pointer hover:border-electric-blue/30 active:scale-95"
      )}
    >
      <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
          <circle 
            cx="50%" cy="50%" r="45%" fill="none" stroke={color} strokeWidth="4" 
            strokeDasharray="282.7" strokeDashoffset={282.7 * (1 - progress / 100)}
            className="transition-all duration-1000"
          />
        </svg>
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      <h4 className="text-xl font-mono font-bold">{value}</h4>
      <p className="text-[10px] text-gray-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[10px] text-gray-muted/50">{target}</p>
      {children}
    </GlassCard>
  );
}

const SortableWidget: React.FC<{ id: string, widget: any, children: React.ReactNode, isEditMode: boolean, onResize: (id: string, colDelta: number, rowDelta: number) => void }> = ({ id, widget, children, isEditMode, onResize }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.colSpan || 1} / span ${widget.colSpan || 1}`,
    gridRow: `span ${widget.rowSpan || 1} / span ${widget.rowSpan || 1}`,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group h-full">
      {isEditMode && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute -left-4 top-4 p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-surface/80 rounded-lg backdrop-blur-sm border border-white/10"
        >
          <GripVertical className="w-5 h-5 text-gray-muted hover:text-white" />
        </div>
      )}
      <div className={cn("h-full", isEditMode && "border-2 border-dashed border-white/10 rounded-2xl p-2 relative")}>
        {children}
        {isEditMode && (
          <div className="absolute -bottom-3 -right-3 flex gap-1 bg-surface border border-white/10 rounded-lg p-1 z-20 shadow-lg">
            <button onClick={() => onResize(id, -1, 0)} className="p-1 hover:bg-white/10 rounded"><ChevronLeft className="w-3 h-3" /></button>
            <button onClick={() => onResize(id, 1, 0)} className="p-1 hover:bg-white/10 rounded"><ChevronRight className="w-3 h-3" /></button>
            <button onClick={() => onResize(id, 0, -1)} className="p-1 hover:bg-white/10 rounded"><ChevronUp className="w-3 h-3" /></button>
            <button onClick={() => onResize(id, 0, 1)} className="p-1 hover:bg-white/10 rounded"><ChevronDown className="w-3 h-3" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

const TASKS = [
  { id: '1', title: 'Review Q2 Strategy', priority: 'P1', category: 'Work', time: '1h', status: 'todo' },
  { id: '2', title: 'Morning Workout', priority: 'P2', category: 'Health', time: '45m', status: 'in-progress' },
  { id: '3', title: 'Update Personal OS', priority: 'P3', category: 'Side Project', time: '2h', status: 'todo' },
  { id: '4', title: 'Buy Groceries', priority: 'P4', category: 'Personal', time: '30m', status: 'done' },
];

export default function Dashboard({ tasks, onNavigateToAI, onNavigateToHealth, onNavigateToCareer, onNavigateToTimer, onOpenTaskModal, onViewTask }: any) {
  const [viewMode, setViewMode] = useState<'kanban' | 'eisenhower'>('kanban');
  const [showInsight, setShowInsight] = useState(true);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'tasks' | 'timeline' | 'roster'>('tasks');
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [layout, setLayout] = useState([
    { id: 'health-metrics', type: 'health-metrics', colSpan: 2, rowSpan: 1 },
    { id: 'career-metrics', type: 'career-metrics', colSpan: 1, rowSpan: 1 },
    { id: 'work-metrics', type: 'work-metrics', colSpan: 3, rowSpan: 1 },
    { id: 'ai-insight', type: 'ai-insight', colSpan: 3, rowSpan: 1 },
    { id: 'main-tasks', type: 'main-tasks', colSpan: 3, rowSpan: 2 }
  ]);

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
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleResize = (id: string, colDelta: number, rowDelta: number) => {
    setLayout(prev => prev.map(w => {
      if (w.id === id) {
        return {
          ...w,
          colSpan: Math.max(1, Math.min(3, (w.colSpan || 1) + colDelta)),
          rowSpan: Math.max(1, Math.min(4, (w.rowSpan || 1) + rowDelta))
        };
      }
      return w;
    }));
  };

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setLayout((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'health-metrics':
        return (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <MetricCard icon={Moon} value="7.5 / 8" label="Sleep" target="Target: 8h" progress={93} color="#00E676" onClick={onNavigateToHealth} />
            <MetricCard icon={Droplets} value="1.8 / 3.0" label="Water" target="Target: 3L" progress={60} color="#00BFFF" onClick={onNavigateToHealth} />
          </div>
        );
      case 'career-metrics':
        return (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <MetricCard icon={Briefcase} value="3 / 12" label="Jobs" target="Weekly Goal" progress={25} color="#00BFFF" onClick={onNavigateToCareer} />
          </div>
        );
      case 'work-metrics':
        return (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide h-full">
            <MetricCard icon={Timer} value="4.5 / 8" label="Work" target="Target: 8h" progress={56} color="#FFB300">
              <button onClick={onNavigateToTimer} className="mt-2 p-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Play className="w-3 h-3 fill-current" /></button>
            </MetricCard>
            <MetricCard icon={Flame} value="Day 12" label="Streak" target="Personal Best: 15" progress={80} color="#FFB300" />
            <MetricCard icon={Brain} value="74/100" label="Focus" target="AI Calculated" progress={74} color="#00BFFF" />
          </div>
        );
      case 'ai-insight':
        return (
          <AnimatePresence>
            {showInsight && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <GlassCard className="border-l-4 border-l-electric-blue bg-amber/10 flex items-center justify-between p-4 cursor-pointer" onClick={onNavigateToAI}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center"><Brain className="w-6 h-6 text-amber" /></div>
                    <p className="text-sm font-medium">You're most productive <span className="text-electric-blue">9PM–1AM</span>. 2 deep work tasks scheduled for tonight.</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setShowInsight(false); }} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-muted" /></button>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        );
      case 'main-tasks':
        return (
          <div className="space-y-6">
            <div className="flex gap-6 border-b border-white/8">
              {[
                { id: 'tasks', label: 'Daily Tasks', icon: CheckCircle2 },
                { id: 'timeline', label: 'Timeline', icon: CalendarIcon },
                { id: 'roster', label: 'Roster Optimizer', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDashboardTab(tab.id as any)}
                  className={cn("flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative", activeDashboardTab === tab.id ? "text-electric-blue" : "text-gray-muted hover:text-white")}
                >
                  <tab.icon className="w-4 h-4" />{tab.label}
                  {activeDashboardTab === tab.id && <motion.div layoutId="dashboardTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-blue shadow-[0_0_8px_rgba(0,191,255,0.8)]" />}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeDashboardTab === 'tasks' && (
                <motion.section key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">Today's Tasks</h2>
                      <span className="bg-surface border border-white/8 px-2 py-0.5 rounded-md text-xs font-mono">{tasks.length}</span>
                      <button className="text-xs text-electric-blue hover:underline">View All</button>
                    </div>
                    <div className="flex bg-surface p-1 rounded-xl border border-white/8">
                      <button onClick={() => setViewMode('kanban')} className={cn("p-2 rounded-lg transition-all", viewMode === 'kanban' ? "bg-electric-blue text-background" : "text-gray-muted")}><Columns className="w-4 h-4" /></button>
                      <button onClick={() => setViewMode('eisenhower')} className={cn("p-2 rounded-lg transition-all", viewMode === 'eisenhower' ? "bg-electric-blue text-background" : "text-gray-muted")}><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {viewMode === 'kanban' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['todo', 'in-progress', 'done'].map((status) => (
                        <div key={status} className="space-y-4">
                          <div className={cn("flex items-center justify-between pb-2 border-b-2", status === 'todo' ? "border-p3" : status === 'in-progress' ? "border-p2" : "border-emerald-green")}>
                            <h3 className="font-bold uppercase tracking-widest text-xs capitalize">{status.replace('-', ' ')}</h3>
                            <Badge priority={status === 'todo' ? 'P3' : status === 'in-progress' ? 'P2' : 'P4'}>{tasks.filter((t: any) => t.status === status).length}</Badge>
                          </div>
                          <div className="space-y-3">
                            {tasks.filter((t: any) => t.status === status).map((task: any) => (
                              <GlassCard key={task.id} className="p-4 group relative cursor-pointer hover:border-electric-blue/30 active:scale-[0.98] transition-all" onClick={() => onViewTask(task)}>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <button 
                                      className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all relative", task.status === 'done' ? "bg-emerald-green border-emerald-green" : "border-white/20")}
                                      onClick={(e) => handleTaskComplete(e, task)}
                                    >
                                      {task.status === 'done' ? (
                                        <CheckCircle2 className="w-3 h-3 text-background" />
                                      ) : (
                                        <motion.div 
                                          className="absolute inset-0 rounded-full border-2 border-emerald-green"
                                          initial={{ scale: 0.8, opacity: 0 }}
                                          whileTap={{ scale: 1.5, opacity: 0 }}
                                          transition={{ duration: 0.3 }}
                                        />
                                      )}
                                    </button>
                                    <h4 className={cn("font-semibold text-sm", task.status === 'done' && "line-through text-gray-muted")}>{task.title}</h4>
                                  </div>
                                  <button className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4 text-gray-muted" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                  <Badge priority={task.priority as any}>{task.priority}</Badge>
                                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-gray-muted">{task.category}</span>
                                  <span className="text-[10px] text-gray-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {task.time}</span>
                                </div>
                              </GlassCard>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 aspect-square md:aspect-video">
                      <div className="border-2 border-p1/30 rounded-2xl p-4 bg-p1/5">
                        <h3 className="text-p1 font-bold text-xs uppercase tracking-widest mb-4">Do Now</h3>
                        <div className="flex flex-wrap gap-2">{tasks.filter((t: any) => t.priority === 'P1').map((t: any) => (<div key={t.id} onClick={() => onViewTask(t)} className="cursor-pointer hover:border-electric-blue/50 bg-surface border border-white/8 px-3 py-1.5 rounded-xl text-xs font-medium">{t.title}</div>))}</div>
                      </div>
                      <div className="border-2 border-p3/30 rounded-2xl p-4 bg-p3/5">
                        <h3 className="text-p3 font-bold text-xs uppercase tracking-widest mb-4">Schedule</h3>
                        <div className="flex flex-wrap gap-2">{tasks.filter((t: any) => t.priority === 'P2').map((t: any) => (<div key={t.id} onClick={() => onViewTask(t)} className="cursor-pointer hover:border-electric-blue/50 bg-surface border border-white/8 px-3 py-1.5 rounded-xl text-xs font-medium">{t.title}</div>))}</div>
                      </div>
                      <div className="border-2 border-p2/30 rounded-2xl p-4 bg-p2/5">
                        <h3 className="text-p2 font-bold text-xs uppercase tracking-widest mb-4">Delegate</h3>
                        <div className="flex flex-wrap gap-2">{tasks.filter((t: any) => t.priority === 'P3').map((t: any) => (<div key={t.id} onClick={() => onViewTask(t)} className="cursor-pointer hover:border-electric-blue/50 bg-surface border border-white/8 px-3 py-1.5 rounded-xl text-xs font-medium">{t.title}</div>))}</div>
                      </div>
                      <div className="border-2 border-p4/30 rounded-2xl p-4 bg-p4/5">
                        <h3 className="text-p4 font-bold text-xs uppercase tracking-widest mb-4">Eliminate</h3>
                        <div className="flex flex-wrap gap-2">{tasks.filter((t: any) => t.priority === 'P4').map((t: any) => (<div key={t.id} onClick={() => onViewTask(t)} className="cursor-pointer hover:border-electric-blue/50 bg-surface border border-white/8 px-3 py-1.5 rounded-xl text-xs font-medium">{t.title}</div>))}</div>
                      </div>
                    </div>
                  )}
                </motion.section>
              )}

              {activeDashboardTab === 'timeline' && (
                <motion.section key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <TaskTimeline onOpenTaskModal={() => onOpenTaskModal('manual')} />
                </motion.section>
              )}

              {activeDashboardTab === 'roster' && (
                <motion.section key="roster" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <RosterInput />
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-end mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditMode(!isEditMode)}
          className={cn("gap-2", isEditMode && "bg-electric-blue/20 text-electric-blue border-electric-blue/50")}
        >
          <Settings2 className="w-4 h-4" />
          {isEditMode ? "Done Editing" : "Customize Dashboard"}
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layout.map(l => l.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-8">
            {layout.map((widget) => (
              <SortableWidget key={widget.id} id={widget.id} widget={widget} isEditMode={isEditMode} onResize={handleResize}>
                {renderWidget(widget)}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
