import React, { useState } from 'react';
import { GlassCard, Button } from './UI';
import { Plus, Flame, HeartCrack, ChevronDown, ChevronUp, MoreVertical, CheckSquare, Square, Target } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const STREAKS = [
  { id: 1, name: 'Daily Water Goal', active: true, current: 12, best: 15, icon: '💧' },
  { id: 2, name: 'Job Applications', active: true, current: 5, best: 14, icon: '💼' },
  { id: 3, name: '6+ hrs Sleep', active: false, current: 0, best: 21, icon: '😴' },
  { id: 4, name: 'Pomodoro Daily', active: true, current: 8, best: 8, icon: '🍅' },
  { id: 5, name: 'Exercise', active: true, current: 3, best: 45, icon: '🏃' },
];

const INITIAL_GOALS = [
  {
    id: 1,
    title: 'Land Senior Frontend Role',
    category: 'Career',
    progress: 12,
    target: 100,
    unit: 'jobs applied',
    targetDate: '2026-06-01',
    daysRemaining: 48,
    milestones: [
      { id: 11, title: 'Update Resume & Portfolio', completed: true, date: 'Apr 1' },
      { id: 12, title: 'Apply to 10 jobs', completed: true, date: 'Apr 5' },
      { id: 13, title: 'Apply to 25 jobs', completed: false, date: 'Apr 20' },
      { id: 14, title: 'Complete 5 mock interviews', completed: false, date: 'May 10' },
    ]
  },
  {
    id: 2,
    title: 'Run a Half Marathon',
    category: 'Health',
    progress: 65,
    target: 100,
    unit: '% training plan',
    targetDate: '2026-07-15',
    daysRemaining: 92,
    milestones: [
      { id: 21, title: 'Run 5k without stopping', completed: true, date: 'Mar 15' },
      { id: 22, title: 'Run 10k under 1 hour', completed: true, date: 'Apr 10' },
      { id: 23, title: 'Complete 15k long run', completed: false, date: 'May 20' },
    ]
  }
];

export default function Goals() {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [expandedGoal, setExpandedGoal] = useState<number | null>(null);

  const toggleMilestone = (goalId: number, milestoneId: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const newMilestones = goal.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      
      // Recalculate progress based on milestones (simplified for demo)
      const completedCount = newMilestones.filter(m => m.completed).length;
      const newProgress = Math.round((completedCount / newMilestones.length) * goal.target);

      return { ...goal, milestones: newMilestones, progress: newProgress };
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals & Streaks</h1>
          <p className="text-gray-muted mt-1">Track your habits and long-term objectives.</p>
        </div>
        <Button className="gap-2 shadow-[0_0_20px_rgba(0,191,255,0.3)] shrink-0">
          <Plus className="w-4 h-4" /> New Goal
        </Button>
      </header>

      {/* Active Streaks Row */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {STREAKS.map(streak => (
          <GlassCard key={streak.id} className="min-w-[160px] p-4 flex flex-col items-center text-center shrink-0">
            <div className="text-2xl mb-2">{streak.icon}</div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-muted mb-3 h-8 flex items-center justify-center">{streak.name}</h4>
            
            <div className="flex items-center gap-2 mb-2">
              {streak.active ? (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Flame className="w-5 h-5 text-amber" />
                </motion.div>
              ) : (
                <HeartCrack className="w-5 h-5 text-gray-muted" />
              )}
              <span className={cn("font-bold", streak.active ? "text-amber" : "text-gray-muted")}>
                {streak.active ? `Day ${streak.current}` : 'Broken'}
              </span>
            </div>
            
            <div className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-gray-muted w-full">
              Best: {streak.best} days
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Goals Section */}
      <div className="space-y-4">
        {goals.map(goal => (
          <GlassCard key={goal.id} className="p-0 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold">{goal.title}</h3>
                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md text-gray-muted uppercase tracking-widest">
                      {goal.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-muted">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" /> {goal.progress} / {goal.target} {goal.unit}
                    </span>
                    <span>•</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-xs font-medium",
                      goal.daysRemaining < 30 ? "bg-amber/20 text-amber" : "bg-white/5 text-gray-300"
                    )}>
                      {goal.daysRemaining} days left (Target: {goal.targetDate})
                    </span>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-muted">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-electric-blue shadow-[0_0_10px_rgba(0,191,255,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(goal.progress / goal.target) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-end">
                <span className="text-xs font-bold text-electric-blue">
                  {Math.round((goal.progress / goal.target) * 100)}%
                </span>
              </div>

              {/* Expand Toggle */}
              <button 
                onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                className="mt-4 flex items-center gap-2 text-sm text-gray-muted hover:text-white transition-colors w-full justify-center py-2 border-t border-white/5"
              >
                {expandedGoal === goal.id ? (
                  <><ChevronUp className="w-4 h-4" /> Hide Milestones</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> View Milestones</>
                )}
              </button>
            </div>

            {/* Expanded Milestones */}
            <AnimatePresence>
              {expandedGoal === goal.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-black/20 border-t border-white/5 px-6 py-4 space-y-3"
                >
                  {goal.milestones.map(milestone => (
                    <div 
                      key={milestone.id} 
                      className="flex items-center gap-3 group cursor-pointer"
                      onClick={() => toggleMilestone(goal.id, milestone.id)}
                    >
                      <button className={cn(
                        "transition-colors",
                        milestone.completed ? "text-emerald-green" : "text-gray-muted group-hover:text-electric-blue"
                      )}>
                        {milestone.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                      <span className={cn(
                        "text-sm flex-1 transition-colors",
                        milestone.completed ? "text-gray-muted line-through" : "text-gray-300"
                      )}>
                        {milestone.title}
                      </span>
                      <span className="text-xs text-gray-muted font-mono">
                        {milestone.completed ? `done ${milestone.date}` : `target ${milestone.date}`}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        ))}

        {/* Add Goal Button Card */}
        <button className="w-full border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-muted hover:text-electric-blue hover:border-electric-blue/50 hover:bg-electric-blue/5 transition-all group">
          <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-electric-blue/20 flex items-center justify-center mb-3 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold">Add New Goal</span>
        </button>
      </div>
    </div>
  );
}
