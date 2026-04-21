import React, { useState } from 'react';
import { GlassCard, Button, Badge, ProgressBar, TechnicalLabel, Modal } from './UI';
import { Plus, Flame, HeartCrack, ChevronDown, ChevronUp, MoreVertical, Target, Sparkles, Navigation2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const STREAKS = [
  { id: 1, name: 'Bio-Hydration', active: true, current: 12, best: 15, icon: '💧' },
  { id: 2, name: 'Career Ops', active: true, current: 5, best: 14, icon: '💼' },
  { id: 3, name: 'Deep Recovery', active: false, current: 0, best: 21, icon: '😴' },
];

const INITIAL_GOALS = [
  {
    id: 1,
    title: 'Senior Domain Authority',
    category: 'Career',
    progress: 12,
    target: 100,
    unit: 'Applications',
    daysRemaining: 48,
    status: 'ACTIVE'
  },
  {
    id: 2,
    title: 'Kinetic Endurance',
    category: 'Health',
    progress: 65,
    target: 100,
    unit: 'Training Nodes',
    daysRemaining: 92,
    status: 'ACTIVE'
  }
];

export default function Goals() {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('nexus_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'Career',
    target: 100,
    unit: 'units',
    targetDate: ''
  });

  const saveGoals = (updatedGoals: any) => {
    setGoals(updatedGoals);
    localStorage.setItem('nexus_goals', JSON.stringify(updatedGoals));
  };

  const handleCreateGoal = () => {
    if (!newGoal.title) return;
    const goal = {
      ...newGoal,
      id: Date.now(),
      progress: 0,
      daysRemaining: 90,
      status: 'PLANNING'
    };
    saveGoals([goal, ...goals]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-32 pb-32">
      
      {/* Strategic Vision Header */}
      <header className="relative pt-16 pb-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
               <div className="h-[1px] w-12 bg-zenith-emerald" />
               <span className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-zenith-emerald shadow-[0_0_10px_rgba(0,245,160,0.3)]">Mission Control</span>
            </div>
            <h1 className="text-[8rem] md:text-[12rem] font-display font-semibold text-white tracking-tighter leading-none">
               Strategic <br /><span className="text-white/20 italic">Layer.</span>
            </h1>
          </div>
          <Button 
            variant="zenith-emerald" 
            size="lg"
            onClick={() => setIsModalOpen(true)} 
            className="rounded-full px-12 h-20 text-xl font-display font-bold shadow-[0_0_30px_rgba(0,245,160,0.2)] hover:shadow-[0_0_50px_rgba(0,245,160,0.4)] transition-all"
          >
            <Plus className="w-6 h-6 mr-4" />
            INITIALIZE MISSION
          </Button>
        </div>
      </header>

      {/* Persistence Matrix (Streaks) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {STREAKS.map((streak) => (
          <div key={streak.id} className="glass-surface p-12 relative overflow-hidden group hover:scale-[1.02] transition-all duration-700">
            <div className="absolute -right-12 -bottom-12 opacity-5 grayscale group-hover:opacity-10 transition-opacity transform group-hover:scale-150 rotate-12 duration-1000">
              <span className="text-[15rem] leading-none">{streak.icon}</span>
            </div>
            
            <div className="flex items-center justify-between mb-12 relative z-10">
               <span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.4em]">{streak.name}</span>
               {streak.active ? (
                 <div className="relative">
                    <div className="absolute inset-0 bg-zenith-emerald/40 blur-xl animate-pulse" />
                    <Flame className="w-8 h-8 text-zenith-emerald relative z-10" />
                 </div>
               ) : (
                 <HeartCrack className="w-8 h-8 text-white/10" />
               )}
            </div>

            <div className="flex items-end gap-6 mb-8 relative z-10">
               <span className={cn("text-9xl font-display font-bold tracking-tighter leading-none", streak.active ? "text-white" : "text-white/20")}>
                 {streak.current}
               </span>
               <div className="mb-4">
                 <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] font-bold">Current_Cycle</p>
               </div>
            </div>
            <div className="pt-8 border-t border-white/5">
              <TechnicalLabel label="Operational Peak" value={`${streak.best} CYCLES`} color="text-zenith-emerald" />
            </div>
          </div>
        ))}
      </div>

      {/* Mission Log */}
      <div className="space-y-16">
        <div className="flex items-center gap-10">
           <h2 className="text-sm font-mono font-bold uppercase tracking-[0.6em] text-white/20 whitespace-nowrap">
              Active Initiative Pipeline
           </h2>
           <div className="h-[1px] flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 gap-12">
          {goals.map((goal: any) => (
            <div key={goal.id} className="interactive-pane p-16 group relative overflow-hidden">
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-20">
                
                <div className="flex-1 space-y-10">
                  <div className="flex items-start gap-10">
                    <div className="w-24 h-24 rounded-[2.5rem] glass-surface flex items-center justify-center border-white/10 group-hover:border-zenith-emerald/50 transition-colors">
                       <Target className="w-12 h-12 text-white/20 group-hover:text-zenith-emerald transition-colors animate-pulse" />
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] font-mono text-zenith-emerald uppercase tracking-[0.5em] font-bold">{goal.category} SECTOR</p>
                       <h3 className="text-7xl font-display font-semibold text-white tracking-tighter leading-tight italic group-hover:not-italic transition-all duration-700">{goal.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-12 pt-4">
                     <TechnicalLabel label="Linear Status" value={goal.status} color="text-zenith-emerald" />
                     <TechnicalLabel label="Operational Window" value={`${goal.daysRemaining} SECONDS_UNTIL_EOF`} color="text-white/40" />
                     <TechnicalLabel label="Cumulative Capacity" value={`${goal.progress}/${goal.target} ${goal.unit.toUpperCase()}`} />
                  </div>
                </div>

                <div className="w-full xl:w-[450px] space-y-8">
                   <div className="flex justify-between items-end mb-4">
                      <span className="text-xl font-display font-bold text-white italic tracking-tight">Sync Level</span>
                      <span className="text-5xl font-display font-bold text-white tracking-tighter">{Math.round((goal.progress / goal.target) * 100)}%</span>
                   </div>
                   <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 glass-surface">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(goal.progress / goal.target) * 100}%` }}
                        className="h-full bg-white rounded-full relative"
                      >
                         <div className="absolute inset-0 bg-white blur-md opacity-50" />
                      </motion.div>
                   </div>
                   <Button variant="outline" size="lg" className="w-full h-16 rounded-2xl border-white/10 text-white/40 hover:text-white hover:border-white transition-all uppercase font-mono text-xs tracking-[0.4em] font-bold">Synchronize Nodes</Button>
                </div>
              </div>

              {/* Data Infrastructure Lines */}
              <div className="absolute bottom-0 right-0 p-12 pointer-events-none opacity-5 group-hover:opacity-20 transition-all duration-1000 rotate-180">
                 <div className="flex gap-2">
                    {[100, 160, 220, 280, 340].map((h, i) => (
                      <div key={i} className="w-[1px] bg-white transition-all duration-1000" style={{ height: `${h}px` }} />
                    ))}
                 </div>
              </div>
            </div>
          ))}

          <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full glass-surface border-dashed border-2 border-white/5 rounded-[4rem] p-32 flex flex-col items-center justify-center text-white/10 hover:text-zenith-emerald hover:border-zenith-emerald/30 hover:bg-zenith-emerald/5 transition-all group"
          >
             <Plus className="w-24 h-24 mb-10 group-hover:scale-125 transition-transform duration-700" />
             <span className="text-5xl font-display font-light italic tracking-tighter">Initiate Strategic Roadmap Node</span>
          </button>
        </div>
      </div>

      {/* Neural Synergy Card */}
      <div className="glass-surface border-zenith-emerald/20 bg-zenith-emerald/[0.03] p-16 flex flex-col lg:flex-row items-center gap-20 transition-all group overflow-hidden relative">
         <div className="absolute inset-0 bg-gradient-to-r from-zenith-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
         <div className="w-32 h-32 rounded-[3rem] glass-surface border-zenith-emerald/30 flex items-center justify-center relative z-10 scale-125 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Sparkles className="w-16 h-16 text-zenith-emerald animate-pulse" />
         </div>
         <div className="relative z-10 flex-1 text-center lg:text-left space-y-4">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="h-1 w-8 bg-zenith-emerald rounded-full" />
              <span className="text-[10px] font-mono text-zenith-emerald uppercase tracking-[0.5em] font-bold">Neural Synergy Advisor</span>
            </div>
            <p className="text-4xl font-display font-light text-white leading-tight tracking-tight max-w-4xl italic">
               Velocity metrics are optimal. Reaching <span className="text-zenith-emerald font-bold not-italic">80% Kinetic Endurance</span> will trigger a projected +15% boost to cognitive task efficiency.
            </p>
         </div>
         <Button variant="zenith-emerald" size="lg" className="relative z-10 rounded-full h-16 px-12 font-display font-bold tracking-tight">EXECUTE_STRATEGY</Button>
      </div>

      {/* New Objective Deployment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Mission Deployment">
         <div className="space-y-12 py-10">
            <div className="space-y-6">
               <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] font-bold ml-2">Mission_Designator</label>
               <input 
                 value={newGoal.title}
                 onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                 placeholder="e.g. ESTABLISH_DOMAIN_AUTHORITY"
                 className="w-full glass-surface border-white/10 rounded-3xl p-10 text-5xl font-display font-semibold focus:border-white outline-none placeholder:text-white/5 transition-all italic focus:not-italic"
               />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] font-bold ml-2">Initiative_Sector</label>
                  <select className="w-full glass-surface border-white/10 rounded-3xl p-8 text-2xl font-display font-bold text-white outline-none focus:border-white transition-all appearance-none cursor-pointer">
                     <option className="bg-black">Career</option>
                     <option className="bg-black">Health</option>
                     <option className="bg-black">Intelligence</option>
                     <option className="bg-black">Kinetic</option>
                  </select>
               </div>
               <div className="space-y-6">
                  <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] font-bold ml-2">Target_Timestamp</label>
                  <input type="date" className="w-full glass-surface border-white/10 rounded-3xl p-8 text-2xl font-display font-bold text-white outline-none focus:border-white transition-all cursor-pointer invert brightness-200" />
               </div>
            </div>
            <Button className="w-full h-24 text-3xl font-display font-black tracking-tighter rounded-full" variant="zenith-emerald" onClick={handleCreateGoal}>DEPLOY MISSION</Button>
         </div>
      </Modal>
    </div>
  );
}
