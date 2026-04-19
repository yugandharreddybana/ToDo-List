import React, { useState, useEffect } from 'react';
import { GlassCard, Button, Badge, TechnicalLabel, ProgressBar } from './UI';
import { 
  Droplets, 
  Moon, 
  Zap, 
  Brain, 
  Target, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles,
  Search,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import RosterInput from './RosterInput';
import TaskTimeline from './TaskTimeline';
import confetti from 'canvas-confetti';

export default function Dashboard({ 
  tasks, 
  onSaveTask,
  onOpenTaskModal, 
  onViewTask 
}: any) {
  const [insightQuote, setInsightQuote] = useState("");
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [activeTab, setActiveTab] = useState<'ops' | 'timeline' | 'roster'>('ops');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    import('../services/geminiService').then(m => {
      m.getMotivationalQuote().then(q => {
        setInsightQuote(q);
        setLoadingQuote(false);
      });
    });
    return () => clearInterval(timer);
  }, []);

  const handleTaskComplete = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    if (task.status !== 'done') {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: ['#00F5A0', '#FFFFFF', '#444444']
      });
    }
  };

  return (
    <div className="space-y-24 pb-32">
      
      {/* Immersive Command Hero */}
      <section className="relative">
        <div className="absolute -top-40 -left-20 w-[600px] h-[600px] opacity-20 blur-[120px] bg-zenith-emerald/10 rounded-full pointer-events-none" />
        
        <header className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-zenith-emerald" />
              <span className="text-xs font-mono font-bold uppercase tracking-[0.5em] text-zenith-emerald">System Operational</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-display font-semibold text-white tracking-tighter leading-none">
              Command <br /><span className="text-white/40 italic font-serif">Awaiting Instruction.</span>
            </h1>
            <div className="flex items-center gap-12 pt-8">
              <TechnicalLabel label="Operational Time" value={currentTime.toLocaleTimeString()} color="text-white" />
              <TechnicalLabel label="Neural Load" value="SYNC_ACTIVE" color="text-zenith-emerald" />
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-6">
             <div className="text-right">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] mb-2 block font-bold">Ambient Condition</span>
                <span className="text-2xl font-display font-medium text-white italic">"High Performance Environment"</span>
             </div>
             <Button variant="zenith-emerald" size="lg" onClick={() => onOpenTaskModal('manual')}>
                New Protocol <Plus className="ml-3 w-6 h-6" />
             </Button>
          </div>
        </header>
      </section>

      {/* Neural Interface Section */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <GlassCard className="lg:col-span-3 h-full flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <Brain className="w-6 h-6 text-zenith-emerald" />
            </div>
            <TechnicalLabel label="Module" value="NEURAL_SYNTHESIS_HUB" />
          </div>
          
          <div className="relative min-h-[120px]">
            {loadingQuote ? (
              <div className="space-y-4">
                <div className="h-8 w-full bg-white/5 animate-pulse rounded-lg" />
                <div className="h-8 w-2/3 bg-white/5 animate-pulse rounded-lg" />
              </div>
            ) : (
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-4xl md:text-5xl font-display font-light text-white italic leading-tight tracking-tight"
              >
                "{insightQuote}"
              </motion.p>
            )}
          </div>
          
          <div className="h-[1px] w-full bg-white/10 mt-12 mb-8" />
          <div className="flex items-center justify-between">
            <div className="flex gap-8">
               <TechnicalLabel label="Security" value="LEVEL_5" color="text-zenith-emerald" />
               <TechnicalLabel label="Coherence" value="99.8%" color="text-white" />
            </div>
            <ArrowRight className="w-6 h-6 text-white/20" />
          </div>
        </GlassCard>

        <div className="flex flex-col gap-8">
          <GlassCard title="Telemetry" subtitle="BIO_SYNC" className="flex-1">
            <div className="space-y-10 mt-6">
               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">
                    <span>Focus State</span>
                    <span className="text-zenith-emerald">92%</span>
                  </div>
                  <ProgressBar progress={92} />
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">
                    <span>Mission Clarity</span>
                    <span>85%</span>
                  </div>
                  <ProgressBar progress={85} />
               </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Primary Operation Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Biometric Stream */}
        <div className="lg:col-span-4 space-y-12">
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-semibold text-white tracking-widest uppercase">Biometrics</h2>
            <div className="h-1 w-12 bg-zenith-emerald" />
          </div>

          <div className="grid grid-cols-1 gap-8">
            {[
              { icon: Moon, label: 'Sleep Phase', value: '7.5h / 8h', progress: 93 },
              { icon: Droplets, label: 'Hydration', value: '1.8L / 3L', progress: 60 },
              { icon: Zap, label: 'Vital Energy', value: 'High', progress: 85 }
            ].map((metric, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-10 interactive-pane group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-zenith-emerald transition-all duration-500 transform group-hover:-rotate-6">
                    <metric.icon className="w-7 h-7 text-white group-hover:text-black transition-colors" />
                  </div>
                  <span className="text-3xl font-display font-semibold text-white tracking-tighter">{metric.value}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-[0.3em] font-bold">
                    <span>{metric.label}</span>
                    <span>{metric.progress}%</span>
                  </div>
                  <ProgressBar progress={metric.progress} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Operational Flow */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center justify-between border-b border-white/10 pb-8">
            <div className="flex gap-12">
              {[
                { id: 'ops', label: 'Operations', icon: Target },
                { id: 'timeline', label: 'Timeline', icon: Clock },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-4 pb-4 text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all relative",
                    activeTab === tab.id ? "text-zenith-emerald" : "text-white/30 hover:text-white"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="dash-tab" className="absolute -bottom-1 inset-x-0 h-1 bg-zenith-emerald shadow-[0_0_10px_rgba(0,245,160,0.5)]" />
                  )}
                </button>
              ))}
            </div>
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => onOpenTaskModal('manual')}>
              <Plus className="w-6 h-6 text-white" />
            </Button>
          </div>

          <div className="min-h-[600px] py-4">
            <AnimatePresence mode="wait">
              {activeTab === 'ops' ? (
                <motion.div
                  key="ops"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {tasks.length > 0 ? (
                    tasks.filter((t: any) => t.status !== 'done').slice(0, 5).map((task: any, idx: number) => (
                      <div 
                        key={task.id} 
                        className="group relative p-10 interactive-pane cursor-pointer overflow-hidden"
                        onClick={() => onViewTask(task)}
                      >
                        <div className="absolute top-0 right-0 p-8">
                           <ArrowRight className="w-8 h-8 text-white/10 group-hover:text-zenith-emerald transition-all transform group-hover:translate-x-2" />
                        </div>
                        <div className="flex flex-col gap-8">
                          <div className="flex items-center gap-6">
                             <div className="h-1 w-12 bg-white/10 group-hover:w-20 group-hover:bg-zenith-emerald transition-all duration-700" />
                             <Badge priority={task.priority as any}>{task.priority}</Badge>
                          </div>
                          <div>
                            <h4 className="text-4xl font-display font-semibold text-white tracking-tighter leading-tight group-hover:translate-x-3 transition-transform duration-700">
                               {task.title}
                            </h4>
                            <div className="flex items-center gap-8 mt-6">
                              <TechnicalLabel label="Asset Class" value={task.category} color="text-white/60" />
                              <TechnicalLabel label="Status" value="IN_SYNC" color="text-zenith-emerald" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-[500px] flex flex-col items-center justify-center glass-surface rounded-zenith border-dashed border-2 border-white/10 p-20 text-center">
                      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-10">
                        <Target className="w-12 h-12 text-white/20" />
                      </div>
                      <p className="text-white/30 font-display text-2xl font-light mb-12">No current tactical threats identified.</p>
                      <Button variant="outline" size="lg" onClick={() => onOpenTaskModal('manual')}>Initialize Directive</Button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="timeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <TaskTimeline tasks={tasks} onOpenTaskModal={() => onOpenTaskModal('manual')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
