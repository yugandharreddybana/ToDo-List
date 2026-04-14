import React, { useState } from 'react';
import { GlassCard, Button } from './UI';
import { ChevronLeft, ChevronRight, Download, Brain, Clock, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { cn } from '@/src/lib/utils';

const radarData = [
  { subject: 'Sleep Quality', A: 80, B: 60, fullMark: 100 },
  { subject: 'Hydration', A: 70, B: 50, fullMark: 100 },
  { subject: 'Tasks Done', A: 90, B: 85, fullMark: 100 },
  { subject: 'Work Hours', A: 85, B: 90, fullMark: 100 },
  { subject: 'Jobs Applied', A: 60, B: 40, fullMark: 100 },
  { subject: 'Mood', A: 75, B: 65, fullMark: 100 },
];

const timelineData = [
  { time: '11:43 PM', task: 'Update Portfolio README', category: 'Side Project', duration: '45m' },
  { time: '08:15 PM', task: 'Evening Workout', category: 'Health', duration: '1h' },
  { time: '04:30 PM', task: 'Team Sync Meeting', category: 'Work', duration: '30m' },
  { time: '02:00 PM', task: 'Apply to Stripe', category: 'Career', duration: '1h 15m' },
  { time: '10:00 AM', task: 'Deep Work: Feature X', category: 'Work', duration: '2h' },
];

export default function Analytics() {
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate mock heatmap data
  const heatmapData = Array.from({ length: 52 }, () => 
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
  );

  const getColor = (value: number) => {
    if (value === 0) return 'bg-[#161B22]';
    if (value === 1) return 'bg-[#00BFFF]/20';
    if (value === 2) return 'bg-[#00BFFF]/40';
    if (value === 3) return 'bg-[#00BFFF]/60';
    return 'bg-[#00BFFF]';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl p-1">
            <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-2">Week 15, Apr 7–13</span>
            <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <Button variant="ghost" className="gap-2 border border-white/10">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: Heatmap */}
        <GlassCard className="lg:col-span-3 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-muted mb-6">Task Completion Heatmap</h3>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-1 min-w-max">
              {heatmapData.map((week, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {week.map((day, j) => (
                    <div 
                      key={`${i}-${j}`} 
                      onClick={() => alert(`Opening tasks for Day ${j + 1}, Week ${i + 1}`)}
                      className={cn("w-3 h-3 rounded-sm transition-colors hover:ring-2 hover:ring-white/50 cursor-pointer", getColor(day))}
                      title={`${day} tasks completed on Day ${j + 1}, Week ${i + 1}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 text-xs text-gray-muted mt-2">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(v => (
                <div key={v} className={cn("w-3 h-3 rounded-sm", getColor(v))} />
              ))}
            </div>
            <span>More</span>
          </div>
        </GlassCard>

        {/* SECTION 2: Radar Chart */}
        <GlassCard className="p-6 flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-muted mb-2">Weekly Productivity</h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#8B949E', fontSize: 10, cursor: 'pointer' }} 
                  onClick={(e: any) => alert(`Opening details for ${e.value}`)}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Radar name="This Week" dataKey="A" stroke="#00BFFF" fill="#00BFFF" fillOpacity={0.3} />
                <Radar name="Last Week" dataKey="B" stroke="#8B949E" fill="#8B949E" fillOpacity={0.1} strokeDasharray="3 3" />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#8B949E' }} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-2xl font-bold text-white drop-shadow-lg">78</span>
              <span className="text-xs text-gray-muted block">/100</span>
            </div>
          </div>
        </GlassCard>

        {/* SECTION 3: Task Timeline */}
        <GlassCard className="p-6 flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-muted mb-6">Task Timeline</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 relative before:absolute before:inset-y-0 before:left-[4.5rem] before:w-px before:bg-white/10">
            {timelineData.map((item, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="w-16 text-right shrink-0 pt-1">
                  <span className="text-xs font-mono text-gray-muted">{item.time}</span>
                </div>
                <div className="absolute left-[4.5rem] top-2 -translate-x-1/2 w-2 h-2 rounded-full bg-electric-blue shadow-[0_0_8px_rgba(0,191,255,0.8)]" />
                <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-medium leading-tight">{item.task}</h4>
                    <CheckCircle2 className="w-4 h-4 text-emerald-green shrink-0" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-gray-muted">{item.category}</span>
                    <span className="text-[10px] text-gray-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* SECTION 4: AI Report Card */}
        <GlassCard className="p-6 flex flex-col border-electric-blue/30 bg-gradient-to-br from-surface to-electric-blue/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-electric-blue/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-electric-blue" />
            </div>
            <div>
              <h3 className="font-bold text-white">NEXUS Intelligence Report</h3>
              <p className="text-xs text-gray-muted">Weekly Summary</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-muted">😴 Sleep</span>
                <span className="font-bold text-emerald-green">B+</span>
              </div>
              <p className="text-[10px] text-gray-muted">6.8 avg hrs</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-muted">💧 Hydration</span>
                <span className="font-bold text-amber">C+</span>
              </div>
              <p className="text-[10px] text-gray-muted">2.1L avg</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-muted">✅ Tasks</span>
                <span className="font-bold text-electric-blue">A</span>
              </div>
              <p className="text-[10px] text-gray-muted">87% completion</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-muted">💼 Career</span>
                <span className="font-bold text-emerald-green">B</span>
              </div>
              <p className="text-[10px] text-gray-muted">14 apps this wk</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-muted">⏱ Work</span>
                <span className="font-bold text-emerald-green">B+</span>
              </div>
              <p className="text-[10px] text-gray-muted">28.5 hrs</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-muted">🧠 Focus</span>
                <span className="font-bold text-electric-blue">A-</span>
              </div>
              <p className="text-[10px] text-gray-muted">4.2 avg Pomo/day</p>
            </div>
          </div>

          <div className="space-y-3 mb-6 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-muted">Recommendations</h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-electric-blue mt-0.5">•</span>
                Increase water intake during afternoon work sessions.
              </li>
              <li className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-electric-blue mt-0.5">•</span>
                Consistent 11 PM bedtime will improve morning focus scores.
              </li>
              <li className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-electric-blue mt-0.5">•</span>
                Great job on task completion! Try tackling P1 tasks earlier in the day.
              </li>
            </ul>
          </div>

          <Button className="w-full bg-electric-blue/20 text-electric-blue hover:bg-electric-blue/30 border-none">
            Share Report
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
