import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard, Button } from './UI';
import { Server, Target, Brain, ArrowRight, Check, Cpu, Zap, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [focus, setFocus] = useState<string[]>([]);

  const toggleFocus = (f: string) => {
    setFocus(prev => prev.includes(f) ? prev.filter(i => i !== f) : [...prev, f]);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-zenith-bg backdrop-blur-[100px]"
      />
      
      {/* Background Decor - Minimalist & Executive */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
         <div className="absolute top-0 right-0 p-32">
            <Target className="w-96 h-96 text-zenith-accent rotate-12" />
         </div>
         <div className="absolute bottom-0 left-0 p-32">
            <Activity className="w-96 h-96 text-zenith-success -rotate-12" />
         </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 1.05, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl px-8"
      >
        <div className="glass-surface p-16 md:p-24 flex flex-col min-h-[700px] border-white/5 bg-white/[0.02] shadow-2xl rounded-[4rem] relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000 rotate-12 text-white">
            <Cpu className="w-64 h-64" />
          </div>

          <div className="flex-1 relative z-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} transition={{ duration: 0.8 }} className="space-y-16">
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="h-[1.5px] w-12 bg-zenith-emerald" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-zenith-emerald">Initial Calibration_01</span>
                    </div>
                    <h2 className="text-7xl md:text-8xl font-display font-semibold text-white tracking-tighter italic leading-none">Biological <br /><span className="text-white/20 not-italic">Equilibrium.</span></h2>
                  </div>
                  
                  <div className="space-y-16 max-w-2xl">
                    <div className="space-y-6">
                      <div className="flex justify-between text-[10px] font-mono text-white/30 uppercase tracking-[0.5em] font-bold"><span>Nocturnal Recovery Depth</span><span className="text-white font-bold">8.0 HRS</span></div>
                      <div className="h-[1.5px] w-full bg-white/5 relative">
                         <div className="absolute inset-y-0 left-0 bg-white w-2/3 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between text-[10px] font-mono text-white/30 uppercase tracking-[0.5em] font-bold"><span>Tactical Hydration Goal</span><span className="text-zenith-emerald font-bold">3.5 L</span></div>
                      <div className="h-[1.5px] w-full bg-white/5 relative">
                         <div className="absolute inset-y-0 left-0 bg-zenith-emerald w-1/2 shadow-[0_0_15px_rgba(0,245,160,0.5)]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} transition={{ duration: 0.8 }} className="space-y-16">
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="h-[1.5px] w-12 bg-zenith-emerald" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-zenith-emerald">Initial Calibration_02</span>
                    </div>
                    <h2 className="text-7xl md:text-8xl font-display font-semibold text-white tracking-tighter italic leading-none">Neural <br /><span className="text-white/20 not-italic">Integration.</span></h2>
                  </div>
                  
                  <div className="space-y-12 max-w-2xl">
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold ml-2">Uplink Encryption Key</label>
                      <input type="password" placeholder="ZENITH_SECURE_NODE_..." className="w-full glass-surface border-white/5 rounded-3xl p-10 text-xl font-mono outline-none focus:border-white transition-all text-white placeholder:text-white/5" />
                    </div>
                    <div className="p-8 glass-surface border-white/5 bg-white/[0.02] rounded-3xl">
                       <p className="text-white/40 text-lg leading-relaxed italic font-light">By establishing a neural link, you authorize Zenith AI to manage your strategic roadmap autonomously with <span className="text-white font-bold not-italic">Level 5 Security protocols.</span></p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} transition={{ duration: 0.8 }} className="space-y-16">
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="h-[1.5px] w-12 bg-zenith-emerald" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-zenith-emerald">Initial Calibration_03</span>
                    </div>
                    <h2 className="text-7xl md:text-8xl font-display font-semibold text-white tracking-tighter italic leading-none">Strategic <br /><span className="text-white/20 not-italic">Directives.</span></h2>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 max-w-3xl">
                    {['ENTERPRISE', 'WELLNESS', 'STRATEGY', 'INNOVATION', 'PORTFOLIO', 'LIFESTYLE'].map(f => (
                      <button
                        key={f}
                        onClick={() => toggleFocus(f)}
                        className={cn(
                          "px-12 py-8 rounded-[2rem] text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all duration-700 border",
                          focus.includes(f) 
                            ? "bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.2)] scale-110" 
                            : "bg-transparent text-white/20 border-white/5 hover:border-white/20 hover:text-white"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-24 pt-12 border-t border-white/5 flex items-center justify-between relative z-10">
            <div className="flex gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("h-[1.5px] rounded-full transition-all duration-1000", step === i ? "bg-zenith-emerald w-16 shadow-[0_0_10px_rgba(0,245,160,0.8)]" : "bg-white/10 w-4")} />
              ))}
            </div>
            <div className="flex items-center gap-12">
              <button onClick={onComplete} className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold hover:text-white transition-all underline decoration-white/0 hover:decoration-white/20 underline-offset-8">SKIP_CALIBRATION</button>
              <Button 
                onClick={() => step < 3 ? setStep(step + 1) : onComplete()} 
                variant={step === 3 ? 'zenith-emerald' : 'outline'}
                className="gap-6 px-16 py-8 rounded-full text-sm font-bold tracking-widest uppercase font-mono shadow-2xl"
              >
                {step < 3 ? 'NEXT_PHASE' : 'FINALIZE_SYNC'}
                {step < 3 ? <ArrowRight className="w-5 h-5" /> : <Check className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
