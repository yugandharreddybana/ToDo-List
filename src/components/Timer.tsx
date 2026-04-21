import React, { useState, useEffect } from 'react';
import { GlassCard, Button, TechnicalLabel, Badge } from './UI';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Brain, 
  Clock, 
  Zap, 
  Activity, 
  ChevronDown,
  Terminal,
  Radiation
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const weeklyData = [
  { name: 'MON', value: 6.5 },
  { name: 'TUE', value: 8.2 },
  { name: 'WED', value: 4.8 },
  { name: 'THU', value: 7.4 },
  { name: 'FRI', value: 9.1 },
  { name: 'SAT', value: 3.5 },
  { name: 'SUN', value: 5.2 },
];

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'rest' | 'recharge'>('focus');
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    const times = { focus: 25 * 60, rest: 5 * 60, recharge: 15 * 60 };
    setTimeLeft(times[mode]);
  };

  const switchMode = (newMode: 'focus' | 'rest' | 'recharge') => {
    setMode(newMode);
    setIsActive(false);
    const times = { focus: 25 * 60, rest: 5 * 60, recharge: 15 * 60 };
    setTimeLeft(times[newMode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'focus' ? 25 * 60 : mode === 'rest' ? 5 * 60 : 15 * 60;
  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="space-y-24 pb-32 relative">
      <AnimatePresence>
        {showFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/10 z-[200] pointer-events-none backdrop-blur-xl"
          />
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pt-12 pb-8 border-b border-white/5">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="h-[1px] w-12 bg-white/20" />
             <span className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-white/40">Temporal Flow Alignment</span>
          </div>
          <h1 className="text-8xl md:text-[8rem] font-display font-semibold text-white tracking-tighter leading-none italic">
             Chronos <br /><span className="text-white/20 not-italic">Interface.</span>
          </h1>
        </div>
        <div className="flex items-center gap-8 glass-surface p-6 rounded-[2rem] border-white/5">
           <TechnicalLabel label="Operational Status" value={isActive ? 'ACTIVE' : 'STANDBY'} color={isActive ? 'text-zenith-emerald' : 'text-white/30'} />
           <div className="w-[1px] h-12 bg-white/10" />
           <TechnicalLabel label="Strategy Mode" value={mode.toUpperCase()} color="text-white/40" />
        </div>
      </header>

      {/* Main Dial Interface */}
      <section className="relative interactive-pane p-20 md:p-40 flex flex-col items-center justify-center overflow-hidden group">
        
        {/* Background Aura */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <AnimatePresence>
             {isActive && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 0.15, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.8 }}
                 transition={{ duration: 1.5 }}
                 className="absolute inset-0 bg-white blur-[180px] rounded-full scale-150"
               />
             )}
           </AnimatePresence>
           <Activity className="absolute bottom-[-20%] right-[-10%] w-[60rem] h-[60rem] text-white opacity-[0.02] rotate-12" />
        </div>

        <div className="relative w-[380px] h-[380px] md:w-[600px] md:h-[600px] flex items-center justify-center">
          {/* Outer Ring System */}
          <div className="absolute inset-0 rounded-full border border-white/5 scale-110" />
          <div className="absolute inset-4 rounded-full border border-dashed border-white/5 opacity-20" />
          
          <svg className="absolute inset-0 w-full h-full -rotate-90 filter drop-shadow-[0_0_40px_rgba(255,255,255,0.05)]">
             <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
             <motion.circle
               cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="8"
               strokeDasharray="100 100"
               animate={{ strokeDashoffset: progress }}
               className={cn(
                 "transition-all duration-1000",
                 mode === 'focus' ? "text-zenith-emerald" : mode === 'rest' ? "text-white" : "text-white/40"
               )}
               style={{ 
                 pathLength: progress / 100,
                 filter: `drop-shadow(0 0 15px currentColor)`
               }}
             />
          </svg>
          
          <div className="text-center relative z-10 flex flex-col items-center">
            <div className="mb-10 opacity-40 group-hover:opacity-100 transition-all duration-700">
               {isActive ? (
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}>
                    <Clock className="w-16 h-16 text-white" />
                 </motion.div>
               ) : (
                 <Clock className="w-16 h-16 text-white/10" />
               )}
            </div>
            <h2 className="text-[10rem] md:text-[14rem] font-display font-light leading-none tracking-tighter text-white italic group-hover:not-italic transition-all duration-1000">
              {formatTime(timeLeft)}
            </h2>
            <div className="mt-12 flex items-center gap-6 glass-surface py-4 px-10 rounded-[2.5rem] border-white/5 group-hover:border-zenith-emerald/30 transition-all">
               <Zap className="w-5 h-5 text-zenith-emerald animate-pulse" />
               <span className="text-xs font-mono font-bold text-white/50 uppercase tracking-[0.4em]">{Math.round(progress)}% COHERENCE</span>
            </div>
          </div>
        </div>

        <div className="flex gap-10 mt-24 relative z-20">
          <Button 
            variant="zenith-emerald" 
            className="w-28 h-28 rounded-[3rem] shadow-[0_0_50px_rgba(0,245,160,0.15)] group-hover:shadow-[0_0_80px_rgba(0,245,160,0.3)] transition-all duration-700"
            onClick={toggleTimer}
          >
            {isActive ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 fill-current" />}
          </Button>
          <div className="flex flex-col gap-4 justify-center">
            <button onClick={resetTimer} className="h-10 w-10 glass-surface border-white/5 hover:border-white transition-all rounded-xl flex items-center justify-center text-white/20 hover:text-white">
               <RotateCcw className="w-5 h-5" />
            </button>
            <button className="h-10 w-10 glass-surface border-white/5 hover:border-white transition-all rounded-xl flex items-center justify-center text-white/20 hover:text-white">
               <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-16 flex gap-4 p-3 glass-surface border-white/5 rounded-[2.5rem] z-20">
          {(['focus', 'rest', 'recharge'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "px-10 py-5 rounded-[2rem] text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all duration-500",
                mode === m ? "bg-white text-black shadow-2xl" : "text-white/20 hover:text-white hover:bg-white/5"
              )}
            >
              {m === 'focus' ? 'DEEP_SYNERGY' : m === 'rest' ? 'ADAPTIVE_PULSE' : 'HYPER_RECOVERY'}
            </button>
          ))}
        </div>
      </section>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="interactive-pane lg:col-span-2 p-12">
           <div className="flex items-center justify-between mb-16">
              <div className="space-y-2">
                 <h3 className="text-4xl font-display font-semibold text-white tracking-tight">Temporal Analytics</h3>
                 <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold">Strategic Performance Metrics</p>
              </div>
              <div className="glass-surface px-8 py-3 rounded-full border-white/5">
                 <span className="text-xl font-display font-bold text-white italic tracking-tighter">AVG_7.2H</span>
              </div>
           </div>
           
           <div className="h-[350px] w-full mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={40}>
                    {weeklyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 4 ? '#00f5a0' : 'rgba(255,255,255,0.05)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <section className="space-y-12">
           <div className="glass-surface border-zenith-emerald/20 bg-zenith-emerald/5 p-12 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-zenith-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10">
                 <div className="w-20 h-20 rounded-[2rem] glass-surface border-white/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700">
                    <Brain className="w-10 h-10 text-zenith-emerald animate-pulse" />
                 </div>
                 <h3 className="text-3xl font-display font-bold text-white mb-6 italic">Neural Recommendation</h3>
                 <p className="text-xl font-display font-light text-white/50 leading-relaxed italic">
                   Chronos patterns detect peak output at <span className="text-white font-bold not-italic">21:00</span>. Strategic mission alignment is recommended.
                 </p>
              </div>
              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                 <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">Confidence Index</span>
                 <span className="text-lg font-display font-black text-zenith-emerald">94.2%</span>
              </div>
           </div>

           <div className="glass-surface p-10 flex items-center gap-8 group">
              <div className="w-16 h-16 rounded-3xl glass-surface border-white/5 flex items-center justify-center shrink-0 group-hover:border-red-500/30 transition-all duration-700">
                 <Radiation className="w-8 h-8 text-red-500/40 group-hover:text-red-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                 <span className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em] block font-bold">Balance Critical</span>
                 <p className="text-xl font-display font-light text-white/30 leading-tight italic">Excessive cognitive load. Recommend <span className="text-white">Full Shutdown.</span></p>
              </div>
           </div>
        </section>
      </div>

      {/* Operation Log Matrix */}
      <div className="interactive-pane p-0">
        <header className="p-12 pb-8 border-b border-white/5 flex items-center justify-between">
           <div className="space-y-2">
              <h3 className="text-3xl font-display font-semibold text-white tracking-tight">Active Chronos Log</h3>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">Verified Strategic Sessions</p>
           </div>
           <Terminal className="w-10 h-10 text-white/10" />
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-12 py-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold">Universal Timestamp</th>
                <th className="px-12 py-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold">Strategic Objective</th>
                <th className="px-12 py-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] text-center font-bold">Dur.</th>
                <th className="px-12 py-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] text-center font-bold">Coherence</th>
                <th className="px-12 py-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] text-right font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[1, 2, 3].map(i => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-all cursor-default">
                  <td className="px-12 py-10 text-xs font-mono text-white/20 font-black">17-04-26 / 10:00:12</td>
                  <td className="px-12 py-10">
                     <span className="text-3xl font-display font-semibold text-white italic group-hover:not-italic group-hover:text-zenith-emerald transition-all duration-700">Strategic Objective Layer Audit</span>
                  </td>
                  <td className="px-12 py-10 text-center font-mono text-white/40 text-sm font-black">25:00</td>
                  <td className="px-12 py-10">
                     <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4].map(j => (
                          <div key={j} className="w-1.5 h-6 bg-zenith-emerald/50 group-hover:bg-zenith-emerald shadow-[0_0_10px_rgba(0,245,160,0.3)] transition-all" />
                        ))}
                        <div className="w-1.5 h-6 bg-white/5" />
                     </div>
                  </td>
                  <td className="px-12 py-10 text-right">
                    <Badge priority="P3">SYNC_OK</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
