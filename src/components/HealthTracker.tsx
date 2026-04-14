import React, { useState } from 'react';
import { GlassCard, Button, Badge } from './UI';
import { 
  Moon, 
  Droplets, 
  Zap, 
  Smile, 
  ChevronRight, 
  Star, 
  Plus, 
  TrendingUp, 
  Brain 
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function HealthTracker() {
  const [water, setWater] = useState(1.8);
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState<number | null>(null);

  const addWater = (amount: number) => setWater(prev => Math.min(3.0, prev + amount));

  const moods = [
    { emoji: '😫', val: 1 },
    { emoji: '😕', val: 2 },
    { emoji: '😐', val: 3 },
    { emoji: '🙂', val: 4 },
    { emoji: '😄', val: 5 },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Health & Wellness</h1>
          <p className="text-gray-muted">Monday, April 13, 2026</p>
        </div>
        <Badge priority="P2">78 — Good</Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sleep Logger */}
        <GlassCard title="Sleep Logger">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-muted uppercase font-bold tracking-widest">Bedtime</p>
                <input type="time" defaultValue="23:00" className="bg-surface border border-white/8 rounded-xl p-3 w-full focus:outline-none focus:border-electric-blue/50" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-muted uppercase font-bold tracking-widest">Wake Time</p>
                <input type="time" defaultValue="06:30" className="bg-surface border border-white/8 rounded-xl p-3 w-full focus:outline-none focus:border-electric-blue/50" />
              </div>
            </div>
            <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-3xl font-mono font-bold text-electric-blue">7h 30m</p>
              <p className="text-xs text-gray-muted">Total Sleep Duration</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-gray-muted uppercase font-bold tracking-widest">Quality</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} className="text-gray-muted hover:text-amber transition-colors">
                    <Star className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full">Log Sleep</Button>
          </div>
        </GlassCard>

        {/* Water Intake */}
        <GlassCard title="Water Intake">
          <div className="flex gap-8 items-center">
            <div className="relative w-24 h-40 bg-white/5 rounded-2xl border-2 border-white/10 overflow-hidden">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(water / 3.0) * 100}%` }}
                className="absolute bottom-0 left-0 right-0 bg-electric-blue/40 backdrop-blur-sm border-t border-electric-blue"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Droplets className="w-8 h-8 text-electric-blue/50 mb-1" />
                <span className="text-xs font-mono font-bold">{water.toFixed(1)}L</span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[0.25, 0.5, 0.75, 1.0].map((amt) => (
                  <Button 
                    key={amt} 
                    variant="secondary" 
                    size="sm"
                    onClick={() => addWater(amt)}
                  >
                    +{amt * 1000}ml
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-gray-muted uppercase font-bold tracking-widest">Today's History</p>
                <div className="text-[10px] space-y-1">
                  <div className="flex justify-between text-gray-muted"><span>08:00</span><span>500ml</span></div>
                  <div className="flex justify-between text-gray-muted"><span>10:30</span><span>250ml</span></div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Energy Level */}
        <GlassCard title="Energy Level">
          <div className="space-y-8 py-4">
            <div className="text-center">
              <span className="text-6xl font-mono font-bold text-emerald-green">{energy}</span>
              <span className="text-gray-muted ml-2">/ 10</span>
            </div>
            <div className="space-y-4">
              <input 
                type="range" min="1" max="10" value={energy} 
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-red via-amber to-emerald-green rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-xl px-1">
                <span>😴</span><span>😐</span><span>⚡</span>
              </div>
            </div>
            <Button className="w-full">Log Energy</Button>
          </div>
        </GlassCard>

        {/* Mood Check-in */}
        <GlassCard title="Mood Check-in">
          <div className="space-y-8 py-4">
            <div className="flex justify-between items-center px-4">
              {moods.map((m) => (
                <button 
                  key={m.val}
                  onClick={() => setMood(m.val)}
                  className={cn(
                    "text-4xl transition-all duration-300 hover:scale-125",
                    mood === m.val ? "scale-125 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" : "opacity-40 grayscale"
                  )}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
            <textarea 
              placeholder="How are you feeling? (optional)" 
              className="w-full bg-surface border border-white/8 rounded-xl p-3 text-sm focus:outline-none focus:border-electric-blue/50 resize-none"
              rows={2}
            />
            <Button className="w-full">Log Mood</Button>
          </div>
        </GlassCard>
      </div>

      {/* Sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sleep', val: '7.2h', trend: '↑' },
          { label: 'Water', val: '2.4L', trend: '↓' },
          { label: 'Energy', val: '6.8', trend: '→' },
          { label: 'Mood', val: '4.2', trend: '↑' },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-3">
            <p className="text-[10px] text-gray-muted uppercase font-bold tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-lg font-mono font-bold">{stat.val}</span>
              <span className={cn(
                "text-xs font-bold",
                stat.trend === '↑' ? "text-emerald-green" : stat.trend === '↓' ? "text-red" : "text-amber"
              )}>{stat.trend}</span>
            </div>
            <div className="mt-2 h-8 flex items-end gap-1">
              {[...Array(7)].map((_, j) => (
                <div key={j} className="flex-1 bg-white/5 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }} />
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* AI Insight */}
      <GlassCard className="border-l-4 border-l-emerald-green bg-emerald-green/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-green/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-emerald-green" />
          </div>
          <p className="text-sm">
            <span className="font-bold text-emerald-green">AI Insight:</span> You sleep better on days with &gt;2L water. Today you're at 1.8L — add one more glass before bed.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
