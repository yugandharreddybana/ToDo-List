import React, { useState } from 'react';
import { GlassCard, Button } from './UI';
import { Brain, Upload, FileText, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function RosterInput() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any[] | null>(null);

  const processRoster = () => {
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setResult([
        { time: '09:00', task: 'Morning Standup', priority: 'P1', category: 'Work' },
        { time: '10:30', task: 'Deep Work: Project Alpha', priority: 'P1', category: 'Work' },
        { time: '13:00', task: 'Lunch & Recovery', priority: 'P3', category: 'Health' },
        { time: '14:00', task: 'Client Review Meeting', priority: 'P2', category: 'Work' },
        { time: '16:30', task: 'Email Triage', priority: 'P3', category: 'Work' },
      ]);
      setIsProcessing(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <FileText className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Work Roster Optimizer</h2>
          <p className="text-xs text-gray-muted uppercase tracking-widest font-bold">AI-Powered Schedule Generation</p>
        </div>
      </header>

      {!result ? (
        <GlassCard className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-muted">Paste your roster or shift details</label>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Monday: 9am-5pm. Meetings at 10am and 2pm. Need to finish the report by EOD."
              className="w-full bg-surface border border-white/8 rounded-2xl p-4 min-h-[150px] focus:outline-none focus:border-purple-500/50 transition-colors resize-none text-sm"
            />
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1 py-4 gap-2">
              <Upload className="w-4 h-4" /> Upload PDF/Image
            </Button>
            <Button 
              onClick={processRoster}
              disabled={!input.trim() || isProcessing}
              className="flex-1 py-4 gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-electric-blue opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                <span>Generate Smart Todo List</span>
              </div>
            </Button>
          </div>
        </GlassCard>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-green flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Optimized Schedule Ready
            </h3>
            <button onClick={() => setResult(null)} className="text-xs text-gray-muted hover:text-white transition-colors">Reset</button>
          </div>

          <div className="space-y-3">
            {result.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 bg-surface border border-white/8 p-4 rounded-2xl group hover:border-purple-500/30 transition-all"
              >
                <div className="text-xs font-mono font-bold text-purple-400 w-12">{item.time}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold">{item.task}</h4>
                  <p className="text-[10px] text-gray-muted uppercase tracking-widest">{item.category}</p>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold border",
                  item.priority === 'P1' ? "border-p1/20 text-p1 bg-p1/5" :
                  item.priority === 'P2' ? "border-p2/20 text-p2 bg-p2/5" :
                  "border-p3/20 text-p3 bg-p3/5"
                )}>
                  {item.priority}
                </div>
              </motion.div>
            ))}
          </div>

          <Button className="w-full py-4 gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <CheckCircle2 className="w-5 h-5" /> Add All to My Day
          </Button>
        </motion.div>
      )}
    </div>
  );
}
