import React, { useState, useEffect } from 'react';
import { GlassCard, Button } from './UI';
import { Play, Pause, RotateCcw, SkipForward, Brain, Star, ChevronDown, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const weeklyData = [
  { name: 'Mon', 'Side Project': 2, 'Work': 4, 'Study': 1 },
  { name: 'Tue', 'Side Project': 1, 'Work': 5, 'Study': 2 },
  { name: 'Wed', 'Side Project': 3, 'Work': 3, 'Study': 0 },
  { name: 'Thu', 'Side Project': 0, 'Work': 6, 'Study': 1 },
  { name: 'Fri', 'Side Project': 2, 'Work': 4, 'Study': 2 },
  { name: 'Sat', 'Side Project': 4, 'Work': 0, 'Study': 3 },
  { name: 'Sun', 'Side Project': 5, 'Work': 0, 'Study': 2 },
];

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');

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
    setTimeLeft(mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60);
  };

  const switchMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : newMode === 'shortBreak' ? 5 * 60 : 15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 relative">
      <AnimatePresence>
        {showFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/20 z-50 pointer-events-none mix-blend-overlay"
          />
        )}
      </AnimatePresence>
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Work Tracker</h1>
        <Button variant="ghost" className="text-electric-blue hover:text-electric-blue/80">View History</Button>
      </header>

      {/* Active Timer Section */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-[240px] h-[240px] flex items-center justify-center mb-8">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
            <motion.circle
              cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="4"
              strokeDasharray="301.59"
              animate={{ strokeDashoffset: (301.59 * (100 - progress)) / 100 }}
              className={cn("transition-all duration-1000", mode === 'focus' ? "text-electric-blue" : "text-emerald-green")}
            />
          </svg>
          <div className="text-center z-10">
            <h2 className="text-6xl font-mono font-bold tracking-tighter">{formatTime(timeLeft)}</h2>
          </div>
        </div>

        <div className="flex gap-2 mb-8 bg-surface border border-white/10 p-1 rounded-xl">
          <button onClick={() => switchMode('focus')} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", mode === 'focus' ? "bg-white/10 text-white" : "text-gray-muted hover:text-white")}>🍅 Focus 25m</button>
          <button onClick={() => switchMode('shortBreak')} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", mode === 'shortBreak' ? "bg-white/10 text-white" : "text-gray-muted hover:text-white")}>☕ Short Break 5m</button>
          <button onClick={() => switchMode('longBreak')} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", mode === 'longBreak' ? "bg-white/10 text-white" : "text-gray-muted hover:text-white")}>🌿 Long Break 15m</button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={resetTimer} className="p-4 rounded-full bg-surface border border-white/8 text-gray-muted hover:text-white transition-all hover:scale-110"><RotateCcw className="w-5 h-5" /></button>
          <button onClick={toggleTimer} className={cn("w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg", isActive ? "bg-amber text-background" : "bg-electric-blue text-background")}>
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button className="p-4 rounded-full bg-surface border border-white/8 text-gray-muted hover:text-white transition-all hover:scale-110"><SkipForward className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Session Context */}
      <GlassCard className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-muted mb-2">Project</label>
          <div className="relative">
            <select className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-electric-blue appearance-none">
              <option>NEXUS Personal OS</option>
              <option>Client Website</option>
              <option>Learning Rust</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-muted pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-muted mb-2">Linked Task</label>
          <div className="relative">
            <select className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-electric-blue appearance-none">
              <option>Review Q2 Strategy</option>
              <option>Update Personal OS</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-muted pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-muted mb-2">Session Note (Optional)</label>
          <input type="text" placeholder="What will you focus on?" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-electric-blue" />
        </div>
      </GlassCard>

      {/* Session Log Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-widest text-gray-muted">
              <tr>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Project</th>
                <th className="p-3 font-medium">Task</th>
                <th className="p-3 font-medium">Duration</th>
                <th className="p-3 font-medium">Focus Rating</th>
                <th className="p-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-3 text-gray-muted">Today, 10:00 AM</td>
                <td className="p-3"><span className="bg-p1/20 text-p1 px-2 py-1 rounded-md text-[10px] font-bold">Work</span></td>
                <td className="p-3">Review Q2 Strategy</td>
                <td className="p-3 font-mono">25m</td>
                <td className="p-3"><div className="flex gap-1"><Star className="w-3 h-3 fill-amber text-amber" /><Star className="w-3 h-3 fill-amber text-amber" /><Star className="w-3 h-3 fill-amber text-amber" /><Star className="w-3 h-3 fill-amber text-amber" /><Star className="w-3 h-3 text-gray-muted" /></div></td>
                <td className="p-3 text-gray-muted truncate max-w-[150px]">Finished first draft</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-3 text-gray-muted">Today, 11:30 AM</td>
                <td className="p-3"><span className="bg-electric-blue/20 text-electric-blue px-2 py-1 rounded-md text-[10px] font-bold">Side Project</span></td>
                <td className="p-3">Update Personal OS</td>
                <td className="p-3 font-mono">50m</td>
                <td className="p-3"><div className="flex gap-1"><Star className="w-3 h-3 fill-amber text-amber" /><Star className="w-3 h-3 fill-amber text-amber" /><Star className="w-3 h-3 fill-amber text-amber" /><Star className="w-3 h-3 fill-amber text-amber" /><Star className="w-3 h-3 fill-amber text-amber" /></div></td>
                <td className="p-3 text-gray-muted truncate max-w-[150px]">Deep focus state achieved</td>
              </tr>
            </tbody>
            <tfoot className="bg-white/5 border-t border-white/10 font-bold">
              <tr>
                <td colSpan={3} className="p-3 text-right">Today's Total:</td>
                <td colSpan={3} className="p-3 text-electric-blue font-mono">4h 25m</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-muted">Weekly Distribution</h3>
            <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-lg">This week: 22.5 hrs</span>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#8B949E', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#161B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Work" stackId="a" fill="#00BFFF" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Side Project" stackId="a" fill="#BF5AF2" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Study" stackId="a" fill="#00E676" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* AI Insight */}
        <GlassCard className="p-6 border-electric-blue/30 bg-gradient-to-br from-surface to-electric-blue/5 flex flex-col justify-center">
          <div className="w-12 h-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-electric-blue" />
          </div>
          <h3 className="font-bold text-white mb-2">NEXUS Insight</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            You're most focused during <span className="text-electric-blue font-bold">9PM–1AM</span> sessions. 
            3 Pomodoros completed today — on track for your 6 Pomodoro daily goal.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
