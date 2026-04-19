import React, { useState } from 'react';
import { GlassCard, Button, ProgressBar, TechnicalLabel, Badge } from './UI';
import { ChevronLeft, ChevronRight, Download, Brain, Clock, CheckCircle2, Navigation2, Cpu, Sparkles, Activity } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const radarData = [
  { subject: 'Cognitive', A: 80, B: 60, fullMark: 100 },
  { subject: 'Hydration', A: 70, B: 50, fullMark: 100 },
  { subject: 'Operations', A: 90, B: 85, fullMark: 100 },
  { subject: 'Recovery', A: 85, B: 90, fullMark: 100 },
  { subject: 'Career', A: 60, B: 40, fullMark: 100 },
];

const timelineData = [
  { time: '11:43 PM', task: 'Protocol Core Review', category: 'Ops', status: 'SYNCHRONIZED' },
  { time: '08:15 PM', task: 'Biometric-Log Sync', category: 'Health', status: 'SUCCESS' },
  { time: '02:00 PM', task: 'Strategic Market Analysis', category: 'Career', status: 'CATALOGED' },
];

export default function Analytics() {
  const [weekOffset, setWeekOffset] = useState(0);

  const heatmapData = Array.from({ length: 52 }, () => 
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
  );

  const getColor = (value: number) => {
    if (value === 0) return 'opacity-20 bg-zenith-border';
    if (value === 1) return 'bg-zenith-accent/10';
    if (value === 2) return 'bg-zenith-accent/30';
    if (value === 3) return 'bg-zenith-accent/60';
    return 'bg-zenith-accent shadow-soft';
  };

  return (
    <div className="space-y-24 pb-32">
      
      {/* Analytics Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-12 pt-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
             <div className="h-[1.5px] w-12 bg-zenith-emerald" />
             <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-zenith-emerald">Strategic Data Stream</span>
          </div>
          <h1 className="text-8xl md:text-[7rem] font-display font-semibold text-white tracking-tighter leading-none italic">
             Operational <br /><span className="text-white/20 not-italic">Intelligence.</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-4 p-3 glass-surface border-white/5 rounded-[2rem]">
              <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-4 hover:bg-white/5 rounded-2xl transition-all text-white/30 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold px-8 text-white tracking-[0.2em]">WK_15 / FY26</span>
              <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-4 hover:bg-white/5 rounded-2xl transition-all text-white/30 hover:text-white">
                <ChevronRight className="w-5 h-5" />
              </button>
           </div>
           <Button variant="zenith-emerald" onClick={() => window.print()} className="gap-4 py-8 px-12 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,245,160,0.1)]">
              <Download className="w-6 h-6" />
              <span className="hidden md:inline font-bold">EXPORT DATA</span>
           </Button>
        </div>
      </header>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Activity Heatmap */}
        <div className="lg:col-span-12">
          <div className="interactive-pane p-16">
            <div className="flex items-center justify-between mb-16">
              <div className="space-y-2">
                 <h3 className="text-4xl font-display font-semibold text-white italic">Neural Load Map</h3>
                 <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">Annual Execution Density Metrics</p>
              </div>
              <div className="glass-surface px-8 py-3 rounded-full border-white/5">
                 <span className="text-xl font-display font-bold text-white italic">ZENITH_SC: PRIME</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-12 scrollbar-hide">
              <div className="flex gap-2.5 min-w-max">
                {heatmapData.map((week, i) => (
                  <div key={i} className="flex flex-col gap-2.5">
                    {week.map((day, j) => (
                      <motion.div 
                        key={`${i}-${j}`}
                        whileHover={{ scale: 1.8, zIndex: 10, borderRadius: '6px' }}
                        className={cn("w-4 h-4 rounded-[4px] transition-all cursor-pointer border border-white/5", getColor(day))}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-8 text-[10px] font-mono text-white/20 mt-10 uppercase tracking-[0.4em] font-bold">
              <span>Resting baseline</span>
              <div className="flex gap-3">
                {[0, 1, 2, 3, 4].map(v => (
                  <div key={v} className={cn("w-4 h-4 rounded-[4px] border border-white/5", getColor(v))} />
                ))}
              </div>
              <span>Peak Equilibrium</span>
            </div>
          </div>
        </div>

        {/* Cognitive Balance Radar */}
        <div className="lg:col-span-6">
          <div className="interactive-pane p-16 h-full flex flex-col justify-between">
            <div className="space-y-4 mb-20">
               <div className="h-[2px] w-12 bg-white/10" />
               <h3 className="text-4xl font-display font-semibold text-white italic">Strategic Parity</h3>
               <p className="text-xl font-display font-light text-white/40 italic">Cross-module operational parity analysis.</p>
            </div>

            <div className="w-full h-[500px] relative flex items-center justify-center">
              <ResponsiveContainer width="95%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em' }} 
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Current Baseline" dataKey="A" stroke="#00F5A0" fill="#00F5A0" fillOpacity={0.1} strokeWidth={2} />
                  <Radar name="Historical Peak" dataKey="B" stroke="rgba(255,255,255,0.1)" fill="transparent" strokeDasharray="6 6" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', color: '#fff', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                 <span className="text-[10rem] font-display font-black text-white italic leading-none opacity-5">84</span>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <span className="text-7xl font-display font-light text-white italic tracking-tighter">84.2</span>
                    <p className="text-[10px] font-mono text-zenith-emerald tracking-[0.4em] font-bold mt-4">SC_COHERENCE</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Timeline */}
        <div className="lg:col-span-6">
           <div className="interactive-pane p-16 h-full">
              <div className="space-y-4 mb-20">
                 <div className="h-[2px] w-12 bg-white/10" />
                 <h3 className="text-4xl font-display font-semibold text-white italic">Event Horizon</h3>
                 <p className="text-xl font-display font-light text-white/40 italic">High-fidelity execution chain log.</p>
              </div>

              <div className="space-y-16 relative before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-[2px] before:bg-white/5">
                {timelineData.map((node, i) => (
                  <div key={i} className="flex gap-16 group relative pl-10">
                     <div className="absolute left-[17px] top-6 w-2.5 h-2.5 rounded-full bg-zenith-emerald shadow-[0_0_15px_rgba(0,245,160,0.8)] z-10" />
                     <div className="w-32 shrink-0 pt-4">
                        <span className="text-xs font-mono font-bold text-white/20 group-hover:text-white transition-colors tracking-[0.2em] font-bold">{node.time}</span>
                     </div>
                     <div className="flex-1 glass-surface hover:bg-white/5 p-10 group-hover:border-white/20 transition-all duration-700 rounded-[2.5rem] border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                        <div className="relative z-10">
                           <div className="flex items-center justify-between mb-8">
                              <h4 className="text-3xl font-display font-medium text-white italic group-hover:not-italic transition-all duration-700">{node.task}</h4>
                              <Badge priority="P3" className="not-italic">{node.status}</Badge>
                           </div>
                           <div className="flex items-center gap-6 text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold group-hover:text-zenith-emerald transition-colors">
                              <Activity className="w-5 h-5" />
                              {node.category} OPERATIONAL NODE
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* intelligence Synthesis Hub */}
        <div className="lg:col-span-12">
          <div className="glass-surface border-zenith-emerald/20 bg-zenith-emerald/5 p-20 relative overflow-hidden group rounded-[4rem]">
            <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-[2000ms] text-white transform rotate-12">
              <Cpu className="w-[40rem] h-[40rem]" />
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-32">
              <div className="lg:w-[45%] space-y-12">
                 <div className="flex items-center gap-10">
                    <div className="w-24 h-24 rounded-[2.5rem] glass-surface border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                       <Sparkles className="w-12 h-12 text-zenith-emerald animate-pulse" />
                    </div>
                    <div className="space-y-4">
                       <div className="h-[2px] w-12 bg-white/20" />
                       <h3 className="text-5xl font-display font-bold text-white italic">Neural Advisor</h3>
                    </div>
                 </div>
                 <p className="text-white/40 text-2xl leading-relaxed font-light italic">
                   Long-range synthesis indicates a <span className="text-white font-bold not-italic">22% projected baseline drift</span> in operational focus during Q4. Calibration of recovery nodes is <span className="text-white not-italic">Mandatory.</span>
                 </p>
                 <Button variant="zenith-emerald" className="w-full py-10 text-2xl rounded-[3rem] shadow-[0_0_80px_rgba(0,245,160,0.15)] group-hover:shadow-[0_0_120px_rgba(0,245,160,0.25)] transition-all duration-1000">
                    INITIATE SYSTEM SYNC
                 </Button>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-10 self-center">
                 {[
                   { label: 'Analytical Precision', value: '98.4%', color: 'text-zenith-emerald' },
                   { label: 'Latency Drift', value: '-0.2ms', color: 'text-white' },
                   { label: 'Logical Integrity', value: '100%', color: 'text-zenith-emerald' },
                   { label: 'Stability Index', value: 'PRIME', color: 'text-white/50' }
                 ].map((stat, i) => (
                   <div key={i} className="p-12 glass-surface border-white/5 text-center flex flex-col items-center justify-center group hover:bg-white/5 transition-all duration-700 rounded-[3rem]">
                      <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] mb-8 font-bold group-hover:text-white transition-colors">{stat.label}</p>
                      <span className={cn("text-4xl font-display font-black italic", stat.color)}>{stat.value}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
