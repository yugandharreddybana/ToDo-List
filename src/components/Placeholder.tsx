import React from 'react';
import { GlassCard } from './UI';
import { Construction } from 'lucide-react';

export default function Placeholder({ name }: { name: string }) {
  return (
    <div className="space-y-24 py-16">
      <header className="space-y-6">
        <div className="flex items-center gap-6">
           <div className="h-[1.5px] w-12 bg-zenith-emerald" />
           <span className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-zenith-emerald">System Maintenance</span>
        </div>
        <h1 className="text-8xl font-display font-semibold text-white tracking-tighter italic">
          {name} <span className="text-white/20 not-italic">Refinement.</span>
        </h1>
      </header>

      <div className="interactive-pane p-32 flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
        <div className="w-32 h-32 glass-surface rounded-[3rem] flex items-center justify-center mb-12 border-white/5 group-hover:border-zenith-emerald/30 transition-all duration-1000 rotate-12 group-hover:rotate-0">
          <Construction className="w-16 h-16 text-white/20 group-hover:text-zenith-emerald animate-pulse" />
        </div>
        <h2 className="text-4xl font-display font-semibold text-white tracking-tight italic mb-8">Node Logic Stabilizing</h2>
        <p className="text-white/30 max-w-2xl mx-auto text-xl font-light leading-relaxed">
          The <span className="text-white font-medium">{name}</span> module is undergoing core logic synthesis. 
          Deployment is projected for next system cycle.
        </p>
        
        <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
           <div className="flex gap-2 rotate-180">
              {[80, 140, 200].map((h, i) => (
                <div key={i} className="w-[1px] bg-white" style={{ height: `${h}px` }} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
