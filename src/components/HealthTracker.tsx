import React, { useState } from 'react';
import { GlassCard, Button, Badge, ProgressBar, TechnicalLabel } from './UI';
import { 
  Moon, 
  Droplets, 
  Zap, 
  Smile, 
  Star, 
  Plus, 
  Brain, 
  Activity,
  Heart,
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function HealthTracker() {
  const [water, setWater] = useState(() => {
    const saved = localStorage.getItem('nexus_health_water');
    return saved ? parseFloat(saved) : 1.8;
  });
  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem('nexus_health_energy');
    return saved ? parseInt(saved) : 7;
  });
  const [mood, setMood] = useState<number | null>(() => {
    const saved = localStorage.getItem('nexus_health_mood');
    return saved ? parseInt(saved) : null;
  });

  const [sleepData, setSleepData] = useState(() => {
    const saved = localStorage.getItem('nexus_health_sleep');
    return saved ? JSON.parse(saved) : { bedtime: '23:00', wakeTime: '06:30', quality: 4 };
  });

  const addWater = (amount: number) => {
    const newWater = Math.min(5.0, water + amount);
    setWater(newWater);
    localStorage.setItem('nexus_health_water', newWater.toString());
  };

  const moods = [
    { emoji: '😫', val: 1, label: 'depleted' },
    { emoji: '😐', val: 3, label: 'neutral' },
    { emoji: '😄', val: 5, label: 'optimized' },
  ];

  return (
    <div className="space-y-24 pb-32">
      
      {/* Wellness Strategic Header */}
      <header className="relative py-12">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-zenith-emerald/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-12 bg-white/20" />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.5em] text-white/40">Biological Core</span>
          </div>
          <h1 className="text-8xl md:text-[10rem] font-display font-semibold text-white tracking-tighter leading-none">
            Vitality <br /><span className="text-white/30 italic font-serif">Equilibrium.</span>
          </h1>
          <div className="flex items-center gap-12 pt-8">
            <TechnicalLabel label="System State" value="ALL_METRICS_STABLE" color="text-zenith-emerald" />
            <TechnicalLabel label="Biometric Sync" value="READY" color="text-white" />
          </div>
        </div>
      </header>

      {/* Main Control Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Aspect: Recovery & Mind */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-12">
          <GlassCard title="Nocturnal Recovery" subtitle="PHASE_RECOVERY_LOG">
            <div className="space-y-12">
               <div className="flex justify-between items-center glass-surface p-10 rounded-3xl border-white/5">
                  <div className="text-center flex-1 border-r border-white/10">
                     <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-bold">Entry Point</span>
                     <p className="text-4xl font-display font-semibold mt-3 text-white">{sleepData.bedtime}</p>
                  </div>
                  <div className="text-center flex-1">
                     <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-bold">Extraction</span>
                     <p className="text-4xl font-display font-semibold mt-3 text-white">{sleepData.wakeTime}</p>
                  </div>
               </div>
               
               <div className="relative group py-12 flex flex-col items-center justify-center">
                  <div className="absolute inset-x-0 h-[2px] bg-white/5" />
                  <div className="relative z-10 text-center">
                    <span className="text-[10rem] font-display font-bold text-white tracking-tighter leading-none block group-hover:scale-110 transition-transform duration-700">7<span className="text-white/30">h</span> 30<span className="text-white/30">m</span></span>
                    <p className="text-xs font-mono text-white/40 uppercase tracking-[0.4em] mt-6 font-bold">Calculated Recovery Depth</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <TechnicalLabel label="Efficiency Correlation" value="8.4/10" color="text-zenith-emerald" />
                  <ProgressBar progress={84} />
               </div>
            </div>
          </GlassCard>

          <GlassCard title="Psychological Filter" subtitle="SENTIMENT_BASELINE">
            <div className="grid grid-cols-3 gap-8 py-10">
              {moods.map((m) => (
                <button 
                  key={m.val}
                  onClick={() => setMood(m.val)}
                  className={cn(
                    "flex flex-col items-center gap-6 p-8 rounded-3xl transition-all duration-700 interactive-pane border-none",
                    mood === m.val ? "bg-white/[0.08] shadow-[0_0_30px_rgba(255,255,255,0.05)]" : "opacity-30 hover:opacity-100"
                  )}
                >
                  <span className="text-6xl group-hover:scale-125 transition-transform">{m.emoji}</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">{m.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Aspect: Physical Sustenance */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <GlassCard title="Hydration Telemetry" subtitle="SYSTEM_LUBRICATION">
              <div className="flex flex-col gap-12 h-full">
                 <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-full aspect-[3/4] glass-surface rounded-[3rem] overflow-hidden group">
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${(water / 5.0) * 100}%` }}
                         className="absolute bottom-0 inset-x-0 bg-white/10 backdrop-blur-3xl border-t border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
                       />
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                          <Brain className="w-12 h-12 text-white/10 mb-8 animate-pulse" />
                          <span className="text-8xl font-display font-bold leading-none tracking-tighter">{water.toFixed(1)}<span className="text-white/20">L</span></span>
                          <span className="text-xs font-mono tracking-[0.4em] font-bold opacity-30 mt-6 uppercase">Target: 5.0L Capacity</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    {[0.25, 0.5, 0.75, 1.0].map(amt => (
                      <button 
                        key={amt}
                        onClick={() => addWater(amt)}
                        className="py-10 glass-surface hover:bg-white/10 transition-all rounded-2xl group"
                      >
                        <span className="text-xs font-mono font-bold tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">{amt * 1000}ML</span>
                      </button>
                    ))}
                 </div>
              </div>
            </GlassCard>

            <GlassCard title="Energy Capacitor" subtitle="AVAILABLE_SURGE_POTENTIAL">
               <div className="space-y-16 py-12 h-full flex flex-col justify-between">
                 <div className="flex flex-col items-center justify-center gap-8">
                    <div className="w-32 h-32 rounded-full glass-surface flex items-center justify-center border-zenith-emerald/30 relative">
                       <div className="absolute inset-0 bg-zenith-emerald blur-3xl opacity-10 animate-pulse" />
                       <Zap className={cn("w-14 h-14 relative z-10 transition-colors", energy > 7 ? "text-zenith-emerald" : "text-white/20")} />
                    </div>
                    <div className="text-center mt-4">
                      <span className="text-[10rem] font-display font-bold text-white tracking-tighter leading-none">{energy}</span>
                      <p className="text-xs font-mono text-white/30 uppercase tracking-[0.5em] mt-4 font-bold">Scale Matrix: 1-10</p>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <input 
                      type="range" min="1" max="10" value={energy} 
                      onChange={(e) => setEnergy(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold">
                      <span>Stasis</span><span>Active</span><span>Peak_Potential</span>
                    </div>
                 </div>
               </div>
            </GlassCard>
          </div>

          {/* Real-time Telemetry Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, label: 'Pulse Frequency', value: '72 BPM', color: 'text-red-400' },
              { icon: Wind, label: 'Oxygen Saturation', value: '99%', color: 'text-zenith-emerald' },
              { icon: Activity, label: 'System Stress', value: 'Optimal', color: 'text-white' }
            ].map((node, i) => (
              <GlassCard key={i} className="p-10 group cursor-pointer hover:bg-white/5 transition-colors border-none shadow-none bg-white/[0.02]">
                 <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl glass-surface flex items-center justify-center group-hover:border-zenith-emerald transition-all transform group-hover:scale-110">
                       <node.icon className={cn("w-6 h-6", node.color)} />
                    </div>
                    <span className={cn("text-3xl font-display font-semibold", node.color)}>{node.value}</span>
                 </div>
                 <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] font-bold">{node.label}</p>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="glass-surface border-zenith-emerald/20 bg-zenith-emerald/5 flex items-center gap-12 p-12 transition-all group overflow-hidden relative">
            <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
               <Brain className="w-64 h-64 text-zenith-emerald" />
            </div>
            <div className="w-24 h-24 rounded-[2.5rem] glass-surface flex items-center justify-center border-zenith-emerald/30 group-hover:bg-zenith-emerald group-hover:scale-110 transition-all duration-700 relative z-10">
                <Brain className="w-12 h-12 text-zenith-emerald group-hover:text-black transition-colors animate-pulse" />
            </div>
            <div className="relative z-10 flex-1">
               <div className="h-[1px] w-12 bg-zenith-emerald mb-4" />
               <h4 className="text-[10px] font-mono text-zenith-emerald uppercase tracking-[0.4em] font-bold mb-4">Neural Health Sync</h4>
               <p className="text-3xl font-display font-light text-white leading-tight tracking-tight italic">
                  Deep sleep cycles are synchronised with <span className="text-zenith-emerald font-bold not-italic">Peak Hydration</span> levels. Adding 500ml of water now will optimize overnight equilibrium.
               </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
