import React, { useState } from 'react';
import { GlassCard, Button, TechnicalLabel, Badge } from './UI';
import { Brain, Upload, FileText, Loader2, Sparkles, CheckCircle2, Cpu, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { processRosterAI } from '@/src/services/geminiService';

interface RosterInputProps {
  onSaveTask?: (task: any) => void;
}

export default function RosterInput({ onSaveTask }: RosterInputProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any[] | null>(null);

  const processRoster = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const tasks = await processRosterAI(input);
      setResult(tasks);
    } catch (e) {
      console.error("Roster parsing failed:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddAll = () => {
    if (!result || !onSaveTask) return;
    
    result.forEach(item => {
      onSaveTask({
        id: Math.random().toString(36).substr(2, 9),
        title: item.task,
        priority: item.priority || 'P3',
        category: item.category || 'Work',
        date: new Date().toISOString().split('T')[0],
        status: 'todo',
        description: `Scheduled for ${item.time}`
      });
    });
    
    setResult(null);
    setInput("");
  };

  return (
    <div className="space-y-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-8 bg-zenith-emerald" />
            <span className="text-[10px] font-mono text-zenith-emerald uppercase tracking-[0.4em] font-bold">Neural Ingestion Protocol</span>
          </div>
          <h2 className="text-7xl font-display font-semibold text-white tracking-tighter leading-none italic">
            Strategic <span className="text-white/20 not-italic">Synthesis.</span>
          </h2>
        </div>
        <div className="hidden lg:block">
           <div className="w-24 h-24 rounded-[2.5rem] glass-surface border-white/5 flex items-center justify-center rotate-12 group hover:rotate-0 transition-transform duration-1000">
              <Terminal className="w-10 h-10 text-white/20 group-hover:text-white" />
           </div>
        </div>
      </header>

      {!result ? (
        <div className="interactive-pane p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000 rotate-12">
             <Cpu className="w-48 h-48 text-white" />
          </div>
          
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold ml-2">Unstructured Operational Log</label>
                  <p className="text-xl font-display font-light text-white/40 italic">Decrypting textual intent into strategic nodes...</p>
               </div>
            </div>
            
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. MISSION_RECON AT 0900. SYNC WITH COMMAND AT 1430..."
              className="w-full bg-transparent border-2 border-white/5 rounded-[3rem] p-12 min-h-[300px] focus:outline-none focus:border-white/20 transition-all resize-none text-3xl font-display font-light text-white tracking-tight placeholder:text-white/5 italic focus:not-italic"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-8 relative z-10 pt-12">
            <Button variant="outline" className="h-20 flex-1 gap-6 border-white/5 text-white/40 hover:text-white hover:border-white rounded-[2rem] uppercase font-mono text-[10px] tracking-[0.4em] font-black">
              <Upload className="w-6 h-6" /> 
              TELEMETRY_UPLOAD
            </Button>
            <Button 
              onClick={processRoster}
              disabled={!input.trim() || isProcessing}
              variant="zenith-emerald"
              className="h-20 flex-1 gap-6 rounded-[2rem] text-xl font-display font-bold shadow-[0_0_30px_rgba(0,245,160,0.1)]"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Brain className="w-6 h-6" />}
              EXECUTE_NEURAL_MAPPING
            </Button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/20 tracking-[0.4em]">
             <div className="flex items-center gap-4">
                <Sparkles className="w-4 h-4 text-zenith-emerald animate-pulse" />
                <span className="font-bold">COGNITIVE_CORE_ONLINE</span>
             </div>
             <div className="flex items-center gap-10">
                <span className="font-bold">UPTIME: 99.9%</span>
                <span className="font-bold">LATENCY: 0.04ms</span>
             </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-8">
            <div className="flex items-center gap-6">
               <div className="relative">
                  <div className="absolute inset-0 bg-zenith-emerald/30 blur-xl animate-pulse" />
                  <CheckCircle2 className="w-8 h-8 text-zenith-emerald relative z-10" />
               </div>
               <h3 className="text-sm font-mono font-bold uppercase tracking-[0.5em] text-zenith-emerald">
                 Synthesis Manifold Optimized
               </h3>
            </div>
            <button onClick={() => setResult(null)} className="text-[10px] font-mono text-white/20 hover:text-white transition-all border-b border-white/10 uppercase tracking-[0.4em] font-bold">Resync_Base</button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {result.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="interactive-pane p-10 flex items-center gap-12 group hover:scale-[1.01] transition-all duration-700"
              >
                <div className="flex flex-col items-center gap-2 w-24 border-r border-white/5">
                   <span className="text-[10px] font-mono text-white/20 uppercase font-black">Time</span>
                   <span className="text-2xl font-display font-black text-white italic group-hover:not-italic group-hover:text-zenith-emerald transition-all">{item.time || '--:--'}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-4xl font-display font-semibold text-white tracking-tight leading-tight">{item.task}</h4>
                  <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">{item.category} Sector</p>
                </div>
                <Badge priority={item.priority || 'P3'}>{item.priority}</Badge>
              </motion.div>
            ))}
          </div>

          <Button 
            onClick={handleAddAll}
            variant="zenith-emerald"
            className="w-full h-24 rounded-[3rem] text-3xl font-display font-black tracking-tighter shadow-[0_0_50px_rgba(0,245,160,0.2)]"
          >
            COMMIT_TO_ACTIVE_REGISTRY
          </Button>
        </motion.div>
      )}
    </div>
  );
}
