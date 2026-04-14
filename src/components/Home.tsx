import React, { useState, useEffect } from 'react';
import { GlassCard, Button, Badge } from './UI';
import { Activity, CheckSquare, Target, Zap, Quote, Cpu } from 'lucide-react';
import { getMotivationalQuote } from '@/src/services/geminiService';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Home() {
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      const q = await getMotivationalQuote();
      setQuote(q);
      setLoading(false);
    };
    fetchQuote();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">System Overview</h1>
          <p className="text-gray-muted">Welcome back, Commander. All systems operational.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-muted uppercase tracking-widest font-mono">System Time</p>
            <p className="text-lg font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-electric-blue/20 flex items-center justify-center border border-electric-blue/30">
            <Zap className="w-6 h-6 text-electric-blue" />
          </div>
        </div>
      </header>

      {/* AI Quote */}
      <GlassCard className="relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Quote className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-green animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-green">AI Insight</span>
          </div>
          {loading ? (
            <div className="h-8 w-3/4 bg-white/5 animate-pulse rounded-lg" />
          ) : (
            <p className="text-2xl font-medium italic leading-relaxed max-w-3xl">
              "{quote.replace(/"/g, '')}"
            </p>
          )}
        </div>
      </GlassCard>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <CheckSquare className="w-6 h-6 text-p3" />
            <Badge priority="P3">Active</Badge>
          </div>
          <div>
            <p className="text-3xl font-mono font-bold">12</p>
            <p className="text-sm text-gray-muted">Tasks Pending</p>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <Activity className="w-6 h-6 text-emerald-green" />
            <Badge priority="P2">Optimal</Badge>
          </div>
          <div>
            <p className="text-3xl font-mono font-bold">94%</p>
            <p className="text-sm text-gray-muted">Health Score</p>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <Target className="w-6 h-6 text-amber" />
            <Badge priority="P2">On Track</Badge>
          </div>
          <div>
            <p className="text-3xl font-mono font-bold">3/5</p>
            <p className="text-sm text-gray-muted">Goals This Week</p>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <Zap className="w-6 h-6 text-electric-blue" />
            <Badge priority="P3">High</Badge>
          </div>
          <div>
            <p className="text-3xl font-mono font-bold">8.4</p>
            <p className="text-sm text-gray-muted">Focus Level</p>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2" title="Recent Tasks">
          <div className="space-y-4">
            {[
              { title: "Review Q2 Strategy", priority: "P1", time: "2h ago" },
              { title: "Morning Workout", priority: "P2", time: "5h ago" },
              { title: "Update Personal OS", priority: "P3", time: "Yesterday" },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    task.priority === 'P1' ? 'bg-p1' : task.priority === 'P2' ? 'bg-p2' : 'bg-p3'
                  )} />
                  <span className="font-medium">{task.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-muted font-mono">{task.time}</span>
                  <Badge priority={task.priority as any}>{task.priority}</Badge>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full mt-2">View All Tasks</Button>
          </div>
        </GlassCard>

        <GlassCard title="Quick Actions">
          <div className="grid grid-cols-1 gap-3">
            <Button className="justify-start">
              <CheckSquare className="w-4 h-4" /> New Task
            </Button>
            <Button variant="secondary" className="justify-start">
              <Activity className="w-4 h-4" /> Log Health Data
            </Button>
            <Button variant="secondary" className="justify-start">
              <Target className="w-4 h-4" /> Set New Goal
            </Button>
            <Button variant="outline" className="justify-start">
              <Cpu className="w-4 h-4" /> Ask AI Assistant
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
