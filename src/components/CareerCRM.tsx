import React, { useState, useEffect } from 'react';
import { GlassCard, Button, Badge } from './UI';
import { 
  Plus, 
  MoreVertical, 
  Search, 
  Filter, 
  Briefcase, 
  Building2, 
  Calendar, 
  DollarSign, 
  Brain, 
  ChevronLeft, 
  ChevronRight,
  Target,
  Loader2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { getJobMatches, getOptimalApplicationTimes } from '../services/geminiService';

const PIPELINE_STAGES = [
  { id: 'wishlist', label: 'Wishlist', color: 'border-p4' },
  { id: 'applied', label: 'Applied', color: 'border-p3' },
  { id: 'phone', label: 'Phone Screen', color: 'border-p2' },
  { id: 'interview', label: 'Interview', color: 'border-purple-500' },
  { id: 'offer', label: 'Offer', color: 'border-emerald-green' },
  { id: 'rejected', label: 'Rejected', color: 'border-p1' },
];

const JOBS = [
  { id: '1', company: 'Google', role: 'Senior UX Designer', stage: 'interview', date: '2d ago', salary: '$180k - $220k', nextAction: 'Prepare for interview', priority: 'high' },
  { id: '2', company: 'Stripe', role: 'Product Lead', stage: 'applied', date: '5d ago', salary: '$200k+', nextAction: 'Send follow-up', priority: 'medium' },
  { id: '3', company: 'Linear', role: 'Frontend Engineer', stage: 'wishlist', date: '1w ago', salary: 'Equity + $160k', nextAction: 'Research team', priority: 'high' },
];

export default function CareerCRM() {
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [cvText, setCvText] = useState("Frontend Developer with 5 years of experience in React, Next.js, and TypeScript. Looking for senior roles.");
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [optimalTimes, setOptimalTimes] = useState<Record<string, any>>({});
  const [loadingTimesFor, setLoadingTimesFor] = useState<string | null>(null);

  const fetchJobMatches = async () => {
    setIsLoadingMatches(true);
    const matches = await getJobMatches(cvText);
    setJobMatches(matches);
    setIsLoadingMatches(false);
  };

  const fetchOptimalTimes = async (jobId: string, company: string, role: string) => {
    if (optimalTimes[jobId]) return; // Already fetched
    setLoadingTimesFor(jobId);
    const times = await getOptimalApplicationTimes(company, role);
    if (times) {
      setOptimalTimes(prev => ({ ...prev, [jobId]: times }));
    }
    setLoadingTimesFor(null);
  };

  useEffect(() => {
    if (isAiPanelOpen && jobMatches.length === 0) {
      fetchJobMatches();
    }
  }, [isAiPanelOpen]);

  return (
    <div className="space-y-8 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Career Tracker</h1>
          <p className="text-gray-muted">Manage your professional evolution.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            className={cn(
              "p-3 rounded-xl border transition-all",
              isAiPanelOpen ? "bg-electric-blue/10 border-electric-blue/30 text-electric-blue" : "bg-surface border-white/8 text-gray-muted hover:text-white"
            )}
          >
            <Brain className="w-6 h-6" />
          </button>
          <Button size="lg" className="shadow-[0_0_20px_rgba(0,191,255,0.3)]">
            <Plus className="w-5 h-5" /> Quick Log
          </Button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Applied this month', val: '23', color: 'text-p3' },
          { label: 'Interviews', val: '4', color: 'text-purple-400' },
          { label: 'Offer Pending', val: '1', color: 'text-emerald-green' },
          { label: 'Rejected', val: '8', color: 'text-p1' },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-4">
            <p className="text-[10px] text-gray-muted uppercase font-bold tracking-widest mb-1">{stat.label}</p>
            <p className={cn("text-2xl font-mono font-bold", stat.color)}>{stat.val}</p>
          </GlassCard>
        ))}
      </div>

      {/* Pipeline View */}
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide min-h-[600px]">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.id} className="min-w-[300px] flex flex-col gap-4">
            <div className={cn("flex items-center justify-between pb-2 border-b-2", stage.color)}>
              <div className="flex items-center gap-2">
                <h3 className="font-bold uppercase tracking-widest text-xs">{stage.label}</h3>
                <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-muted">
                  {JOBS.filter(j => j.stage === stage.id).length}
                </span>
              </div>
              <button className="text-gray-muted hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {JOBS.filter(j => j.stage === stage.id).map((job) => (
                <GlassCard key={job.id} className="p-4 group relative hover:border-white/20 transition-all cursor-grab active:cursor-grabbing">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 font-bold text-lg text-electric-blue">
                        {job.company[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight">{job.role}</h4>
                        <p className="text-xs text-gray-muted">{job.company}</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-gray-muted" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-gray-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {job.date}
                      </span>
                      {job.salary && (
                        <span className="text-[10px] bg-emerald-green/10 text-emerald-green px-2 py-0.5 rounded-md flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {job.salary}
                        </span>
                      )}
                    </div>
                    
                    {optimalTimes[job.id] ? (
                      <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-lg p-2 mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="w-3 h-3 text-electric-blue" />
                          <span className="text-[10px] font-bold text-electric-blue uppercase">AI Timing Insight</span>
                        </div>
                        <p className="text-[10px] text-gray-300"><span className="font-semibold">Apply:</span> {optimalTimes[job.id].applyTime}</p>
                        <p className="text-[10px] text-gray-300"><span className="font-semibold">Follow-up:</span> {optimalTimes[job.id].followUpTime}</p>
                        <p className="text-[10px] text-gray-muted mt-1 italic">{optimalTimes[job.id].reasoning}</p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => fetchOptimalTimes(job.id, job.company, job.role)}
                        disabled={loadingTimesFor === job.id}
                        className="w-full mt-2 py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] flex items-center justify-center gap-2 transition-colors border border-white/5"
                      >
                        {loadingTimesFor === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3 text-electric-blue" />}
                        {loadingTimesFor === job.id ? 'Analyzing...' : 'Get Optimal Timing'}
                      </button>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          job.priority === 'high' ? "bg-p1" : "bg-p3"
                        )} />
                        <span className="text-[10px] font-bold text-electric-blue uppercase tracking-wider">{job.nextAction}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Panel Drawer */}
      <AnimatePresence>
        {isAiPanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiPanelOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-white/8 z-[70] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-electric-blue" />
                  <h2 className="text-xl font-bold">Career Insights</h2>
                </div>
                <button onClick={() => setIsAiPanelOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <GlassCard className="bg-electric-blue/5 border-electric-blue/20">
                  <p className="text-sm leading-relaxed">
                    "Based on your target of <span className="font-bold text-electric-blue">5 applications/day</span>, you need 2 more today to stay on track for your monthly goal."
                  </p>
                </GlassCard>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-muted flex items-center justify-between">
                    <span>Daily Job Matches (Ireland)</span>
                    <button onClick={fetchJobMatches} disabled={isLoadingMatches} className="text-electric-blue hover:text-white transition-colors">
                      {isLoadingMatches ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                  </h3>
                  
                  <div className="mb-4">
                    <label className="text-[10px] text-gray-muted uppercase tracking-widest mb-1 block">Your Profile / CV Summary</label>
                    <textarea 
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                      className="w-full bg-background border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-electric-blue/50 min-h-[80px]"
                      placeholder="Paste your CV or skills here..."
                    />
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {isLoadingMatches ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-muted">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-electric-blue" />
                        <p className="text-sm">Analyzing market fit in Ireland...</p>
                      </div>
                    ) : jobMatches.length > 0 ? (
                      jobMatches.map((comp, i) => (
                        <div key={i} className="flex flex-col p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-bold">{comp.company}</h4>
                              <p className="text-xs text-gray-300">{comp.role}</p>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-green bg-emerald-green/10 px-2 py-1 rounded-md">{comp.match} Match</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-gray-muted mb-3">
                            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {comp.location}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {comp.salary}</span>
                          </div>
                          <Button variant="secondary" className="w-full py-1.5 text-xs">
                            <Plus className="w-3 h-3 mr-1" /> Add to CRM
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-muted text-center py-4">No matches found. Update your CV and try again.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-muted">Market Trends</h3>
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-4 h-4 text-amber" />
                      <span className="text-xs font-bold">Skill Gap Identified</span>
                    </div>
                    <p className="text-xs text-gray-muted">
                      Many roles at Figma and Vercel require <span className="text-white">Next.js 15</span> and <span className="text-white">Motion</span>. Consider adding these to your portfolio.
                    </p>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
