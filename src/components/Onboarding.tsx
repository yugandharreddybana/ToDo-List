import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard, Button } from './UI';
import { Server, Target, Brain, ArrowRight, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg"
      >
        <GlassCard className="p-8 flex flex-col min-h-[400px]">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-electric-blue/30">
                      <Target className="w-8 h-8 text-electric-blue" />
                    </div>
                    <h2 className="text-2xl font-bold">Set Your Daily Targets</h2>
                    <p className="text-gray-muted text-sm mt-2">Establish your baseline for a productive day.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Sleep Goal</span><span className="font-mono text-electric-blue">8 hrs</span></div>
                      <input type="range" min="4" max="12" defaultValue="8" className="w-full accent-electric-blue" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Water Intake</span><span className="font-mono text-electric-blue">3.0 L</span></div>
                      <input type="range" min="1" max="5" step="0.5" defaultValue="3" className="w-full accent-electric-blue" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2"><span className="text-gray-300">Deep Work</span><span className="font-mono text-electric-blue">4 hrs</span></div>
                      <input type="range" min="1" max="10" defaultValue="4" className="w-full accent-electric-blue" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                      <Server className="w-8 h-8 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Connect Your AI</h2>
                    <p className="text-gray-muted text-sm mt-2">Link your MCP server for intelligent task management.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-muted mb-2">MCP Server URL</label>
                      <input type="text" placeholder="http://localhost:3001/mcp" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-electric-blue font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-muted mb-2">API Key</label>
                      <input type="password" placeholder="sk-..." className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-electric-blue font-mono" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-green/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-green/30">
                      <Brain className="w-8 h-8 text-emerald-green" />
                    </div>
                    <h2 className="text-2xl font-bold">Choose Your Focus</h2>
                    <p className="text-gray-muted text-sm mt-2">What are your primary areas of focus right now?</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 justify-center">
                    {['Career', 'Health', 'Side Projects', 'Study', 'Personal', 'Finance'].map(f => (
                      <button
                        key={f}
                        onClick={() => toggleFocus(f)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                          focus.includes(f) 
                            ? "bg-electric-blue text-background border-electric-blue shadow-[0_0_15px_rgba(0,191,255,0.4)]" 
                            : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
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

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("w-2 h-2 rounded-full transition-colors", step === i ? "bg-electric-blue" : "bg-white/20")} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onComplete} className="text-sm text-gray-muted hover:text-white transition-colors">Skip</button>
              <Button 
                onClick={() => step < 3 ? setStep(step + 1) : onComplete()} 
                className="gap-2 bg-electric-blue text-background hover:bg-electric-blue/90"
              >
                {step < 3 ? 'Next' : 'Get Started'}
                {step < 3 ? <ArrowRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
