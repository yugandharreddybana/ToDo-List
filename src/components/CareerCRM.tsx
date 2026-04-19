import React, { useState, useEffect } from 'react';
import { GlassCard, Button, Badge, Modal, ProgressBar, TechnicalLabel } from './UI';
import { 
  Plus, 
  MoreVertical, 
  Search, 
  Filter, 
  Briefcase, 
  Building2, 
  Brain, 
  X,
  Target,
  Loader2,
  Clock,
  ArrowRight,
  Trash2,
  ExternalLink,
  MessageSquare,
  FileText,
  ShieldCheck,
  Upload,
  FileCheck,
  AlertCircle,
  MapPin,
  DollarSign,
  ChevronRight,
  LineChart,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { getJobMatches, getOptimalApplicationTimes } from '../services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;

type Job = {
  id: string;
  company: string;
  role: string;
  stage: string;
  date: string;
  salary: string;
  nextAction: string;
  priority: 'critical' | 'high' | 'medium' | 'low' | 'backlog';
  location: string;
  appliedDate?: string;
  interviewDate?: string;
  skillRelevance?: string;
  cultureFit?: string;
  applyLink?: string;
};

const PIPELINE_STAGES = [
  { id: 'wishlist', label: 'Prospects', color: 'zenith-muted' },
  { id: 'applied', label: 'Applications', color: 'zenith-accent' },
  { id: 'interview', label: 'Interviews', color: 'zenith-warning' },
  { id: 'offer', label: 'Offers', color: 'zenith-success' },
];

const INITIAL_JOBS: Job[] = [
  { id: '1', company: 'Google', role: 'Senior UX Designer', stage: 'interview', date: '2d ago', salary: '$180k - $220k', nextAction: 'Prepare for panel interview', priority: 'critical', location: 'Dublin', appliedDate: '2024-04-10', interviewDate: '2024-04-18' },
  { id: '2', company: 'Stripe', role: 'Product Lead', stage: 'applied', date: '5d ago', salary: '$200k+', nextAction: 'Send follow-up', priority: 'high', location: 'Remote', appliedDate: '2024-04-12' },
];

export default function CareerCRM() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('career_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });
  
  const [activeStage, setActiveStage] = useState('wishlist');
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isCvMatrixOpen, setIsCvMatrixOpen] = useState(false);

  const [cvText, setCvText] = useState(() => localStorage.getItem('career_cv') || "");
  const [isParsingCV, setIsParsingCV] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [jobMatches, setJobMatches] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('career_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    if (!localStorage.getItem('career_cv')) setIsSetupOpen(true);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingCV(true);
    setParseProgress(20);
    setUploadStatus('idle');

    try {
      let text = '';
      if (file.type === 'text/plain') {
        setParseProgress(60);
        text = await file.text();
      } else if (file.type === 'application/pdf') {
        setParseProgress(40);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          text += textContent.items.map((item: any) => item.str).join(' ') + ' ';
          setParseProgress(40 + (i / pdf.numPages) * 40);
        }
      }
      
      setCvText(text);
      localStorage.setItem('career_cv', text);
      setParseProgress(100);
      setUploadStatus('success');
      setTimeout(() => setIsSetupOpen(false), 800);
    } catch (err) {
      setUploadStatus('error');
    } finally {
      setIsParsingCV(false);
    }
  };

  const getAiMatches = async () => {
    if (!cvText) return;
    setIsLoadingMatches(true);
    try {
      const matches = await getJobMatches(cvText, 70, 5);
      setJobMatches(matches);
      setIsAiPanelOpen(true);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    setSelectedJob(null);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-24 pb-32">
      
      {/* Professional Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-12 pt-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
             <div className="h-[1.5px] w-12 bg-zenith-emerald" />
             <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-zenith-emerald">Strategic Career Matrix</span>
          </div>
          <h1 className="text-8xl md:text-[8rem] font-display font-semibold text-white tracking-tighter leading-none italic">
             Enterprise <br /><span className="text-white/20 not-italic">Pipeline.</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={getAiMatches}
            disabled={isLoadingMatches}
            className="flex items-center gap-6 px-10 py-6 glass-surface border-white/5 hover:bg-white/10 transition-all group rounded-[2.5rem]"
          >
            {isLoadingMatches ? <Loader2 className="w-8 h-8 animate-spin text-zenith-emerald" /> : <Brain className="w-8 h-8 text-zenith-emerald group-hover:scale-125 transition-transform" />}
            <span className="text-sm font-bold text-white uppercase tracking-widest font-mono">Neural_Match</span>
          </button>
          
          <Button variant="zenith-emerald" onClick={() => setIsQuickAddOpen(true)} className="px-12 py-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,245,160,0.1)]">
            <Plus className="w-8 h-8 mr-4" />
            <span className="font-bold">NEW_ENTRY</span>
          </Button>
        </div>
      </header>

      {/* Professional Stages Rail */}
      <nav className="flex items-center gap-6 p-4 glass-surface border-white/5 rounded-[3rem] self-start overflow-x-auto scrollbar-hide max-w-full">
        {PIPELINE_STAGES.map(stage => (
          <button
            key={stage.id}
            onClick={() => setActiveStage(stage.id)}
            className={cn(
              "flex items-center gap-8 px-12 py-6 rounded-[2rem] transition-all duration-700 relative min-w-max group overflow-hidden",
              activeStage === stage.id ? "text-white bg-white/10" : "text-white/20 hover:text-white"
            )}
          >
            <span className="text-xs font-mono tracking-[0.4em] uppercase font-bold italic group-hover:not-italic transition-all">{stage.label}</span>
            <span className="glass-surface border-white/10 px-4 py-1.5 rounded-full text-[10px] font-mono font-bold text-white/40 group-hover:text-zenith-emerald group-hover:border-zenith-emerald/40 transition-all">
              {jobs.filter(j => j.stage === stage.id).length}
            </span>
            {activeStage === stage.id && (
              <motion.div layoutId="stage-glow" className="absolute bottom-0 inset-x-8 h-[2px] bg-zenith-emerald shadow-[0_0_15px_rgba(0,245,160,0.8)]" />
            )}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Job Entities Grid */}
        <div className="lg:col-span-8 space-y-12">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 gap-10"
            >
              {jobs.filter(j => j.stage === activeStage).length > 0 ? (
                jobs.filter(j => j.stage === activeStage).map(job => (
                  <div 
                    key={job.id} 
                    className="group interactive-pane p-12 overflow-hidden relative cursor-pointer border-white/5"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-[1.5px] bg-white/5 group-hover:bg-zenith-emerald transition-all duration-700 shadow-2xl" />
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 relative z-10">
                      <div className="flex items-center gap-10">
                        <div className="w-24 h-24 rounded-[3rem] glass-surface border-white/5 flex items-center justify-center font-display text-5xl text-white/10 group-hover:text-zenith-emerald group-hover:border-zenith-emerald/30 transition-all duration-700 italic font-black">
                          {job.company[0]}
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-5xl font-display font-light text-white group-hover:text-zenith-emerald transition-all italic leading-none tracking-tighter group-hover:not-italic group-hover:font-normal">{job.role}</h3>
                          <div className="flex items-center gap-8">
                            <span className="flex items-center gap-3 text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold group-hover:text-white/40 transition-colors">
                              <Building2 className="w-5 h-5" />
                              {job.company}
                            </span>
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                            <span className="flex items-center gap-3 text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold group-hover:text-white/40 transition-colors">
                              <MapPin className="w-5 h-5" />
                              {job.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-6 text-right">
                        <span className="text-4xl font-display font-black text-white italic opacity-40 group-hover:opacity-100 transition-opacity tracking-tighter">{job.salary}</span>
                        <Badge priority="P1" className="not-italic">ACTION_REQUIRED</Badge>
                      </div>
                    </div>

                    <div className="mt-12 flex items-center justify-between pt-10 border-t border-white/5 relative">
                      <div className="flex items-center gap-12">
                        <TechnicalLabel label="Next Node" value={job.nextAction} color="text-zenith-emerald" />
                        <TechnicalLabel label="Stage" value={activeStage} color="text-white/20" />
                      </div>
                      <div className="w-12 h-12 glass-surface border-white/5 rounded-2xl flex items-center justify-center group-hover:border-white transition-all duration-700 transform group-hover:rotate-45">
                         <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-32 glass-surface border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center opacity-40">
                   <Briefcase className="w-24 h-24 text-white/5 mb-8" />
                   <p className="text-white/20 font-display text-4xl font-light italic">No tactical entities detected.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Intelligence Overlays */}
        <div className="lg:col-span-4 space-y-12">
          <div className="interactive-pane p-12 space-y-12">
            <div className="space-y-4">
               <div className="h-[2px] w-12 bg-white/10" />
               <h3 className="text-3xl font-display font-semibold text-white italic">Strategic Parity</h3>
            </div>
            <div className="space-y-12">
              {[
                { label: 'Portfolio Density', value: jobs.length, total: 50, color: 'text-white' },
                { label: 'Market Resonance', value: 12, total: 100, color: 'text-zenith-emerald' },
                { label: 'Strategic Velocity', value: 85, total: 100, color: 'text-white/40' }
              ].map((stat, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold">
                    <span>{stat.label}</span>
                    <span className={stat.color}>{stat.value} / {stat.total}</span>
                  </div>
                  <ProgressBar progress={(stat.value / stat.total) * 100} />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-surface border-zenith-emerald/20 bg-zenith-emerald/5 p-12 relative overflow-hidden group rounded-[3rem]">
             <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-[2000ms] text-white transform rotate-12">
               <Brain className="w-64 h-64" />
             </div>
             <div className="relative z-10 flex flex-col gap-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 glass-surface border-white/10 rounded-[1.5rem] flex items-center justify-center group-hover:bg-zenith-emerald transition-all duration-700">
                    <Brain className="w-8 h-8 text-white group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="text-3xl font-display font-semibold text-white italic">Neural Advisor</h3>
               </div>
               <p className="text-white/40 text-xl leading-relaxed italic font-light">
                 System calibration complete. We recommend optimizing your <span className="text-white font-bold not-italic">Neural Architecture Core</span> to increase market parity by 14%.
               </p>
               <Button variant="outline" className="w-full py-8 text-xl rounded-[2rem] border-white/10 hover:border-zenith-emerald hover:text-zenith-emerald uppercase tracking-widest font-mono font-bold">Initiate Full Analysis</Button>
             </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.company}
      >
        {selectedJob && (
          <div className="space-y-12 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-10">
                <div>
                  <p className="text-[10px] font-mono text-zenith-muted uppercase tracking-[0.4em] mb-3 font-bold">Position Designation</p>
                  <h3 className="text-4xl font-display font-semibold text-zenith-text leading-tight tracking-tight">{selectedJob.role}</h3>
                </div>
                <div className="flex flex-wrap gap-5">
                  <TechnicalLabel label="Current State" value={selectedJob.stage} color="text-zenith-accent uppercase tracking-widest" />
                  <TechnicalLabel label="Asset Valuation" value={selectedJob.salary} color="text-zenith-success font-bold" />
                  <TechnicalLabel label="Temporal Stamp" value={selectedJob.date} />
                </div>
                <div className="p-8 glass-surface border-white/5 bg-white/[0.02] shadow-inner rounded-2xl">
                   <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] mb-4 font-bold">Mission_Node</p>
                   <p className="text-2xl font-display font-light text-white italic tracking-tight">{selectedJob.nextAction}</p>
                </div>
              </div>
 
              <div className="p-10 glass-surface border-zenith-emerald/20 bg-zenith-emerald/[0.03] shadow-soft flex flex-col justify-center rounded-3xl">
                 <div className="flex items-center gap-5 mb-8">
                   <Target className="w-8 h-8 text-zenith-emerald" />
                   <span className="text-[10px] font-mono text-zenith-emerald uppercase tracking-[0.5em] font-bold">Neural Resonance Analysis</span>
                 </div>
                 <div className="space-y-10">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-xl text-white font-light font-display italic">Technical Alignment</span>
                          <span className="font-mono text-zenith-emerald font-bold text-xl">92%</span>
                       </div>
                       <ProgressBar progress={92} />
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-xl text-white font-light font-display italic">Strategic Symmetry</span>
                          <span className="font-mono text-white/40 font-bold text-xl">78%</span>
                       </div>
                       <ProgressBar progress={78} />
                    </div>
                 </div>
              </div>
            </div>
 
            <div className="flex gap-8 border-t border-white/5 pt-12">
              <Button onClick={() => setSelectedJob(null)} variant="zenith-emerald" className="flex-1 py-10 text-xl font-display font-bold shadow-2xl rounded-2xl">SYNCHRONIZE_STATE</Button>
              <Button onClick={() => setDeleteConfirmId(selectedJob.id)} variant="outline" className="px-12 border-white/10 hover:border-red-500/50 hover:text-red-500 transition-all rounded-2xl group">
                <Trash2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
 
      {/* Setup Modal */}
      <Modal 
        isOpen={isSetupOpen} 
        onClose={() => setIsSetupOpen(false)}
        title="Initialize Portfolio Core"
      >
        <div className="space-y-12 py-12 text-center">
          <div className="mx-auto w-32 h-32 rounded-[2.5rem] glass-surface border-white/10 flex items-center justify-center shadow-inner mb-8 transform hover:rotate-3 transition-transform duration-700">
            <Cpu className="w-16 h-16 text-zenith-emerald animate-pulse" />
          </div>
          <div className="space-y-6">
             <h3 className="text-5xl font-display font-semibold text-white tracking-tighter italic">Portfolio Synchronization</h3>
             <p className="text-white/40 text-xl max-w-lg mx-auto leading-relaxed font-light italic">Please integrate your professional record to activate the <span className="text-white font-bold not-italic">Neural Analytics Engine.</span></p>
          </div>
 
          <label className={cn(
            "block p-24 border-2 border-dashed rounded-[4rem] transition-all duration-700 cursor-pointer group shadow-2xl relative overflow-hidden",
            isParsingCV ? "border-zenith-emerald bg-zenith-emerald/5" : "border-white/5 hover:border-zenith-emerald/40 hover:bg-white/5"
          )}>
            <input type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} disabled={isParsingCV} />
            {isParsingCV ? (
              <div className="space-y-10 text-center flex flex-col items-center">
                <Loader2 className="w-20 h-20 animate-spin text-zenith-emerald" />
                <div className="w-full max-w-md">
                   <ProgressBar progress={parseProgress} />
                   <p className="text-[10px] font-mono uppercase tracking-[0.6em] mt-8 font-bold text-zenith-emerald animate-pulse">{parseProgress < 50 ? 'Decrypting Record Layers...' : 'Calibrating Talent Nodes...'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-10 flex flex-col items-center">
                 <div className="w-24 h-24 glass-surface border-white/10 rounded-[2.5rem] flex items-center justify-center group-hover:shadow-[0_0_80px_rgba(255,255,255,0.05)] group-hover:scale-110 transition-all duration-700">
                    <Upload className="w-10 h-10 text-white/20 group-hover:text-zenith-emerald transition-colors" />
                 </div>
                 <span className="block text-2xl font-display font-light text-white italic tracking-tighter group-hover:not-italic group-hover:font-normal group-hover:text-zenith-emerald transition-all">Import Professional Data (PDF/TXT)</span>
              </div>
            )}
          </label>
        </div>
      </Modal>
 
      {/* Quick Add Form */}
      <Modal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} title="New Alignment Entity">
         <div className="space-y-16 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <label className="text-[10px] uppercase font-mono tracking-[0.5em] text-white/20 font-bold ml-2">Target Organization</label>
                   <input type="text" className="w-full glass-surface border border-white/5 rounded-[2rem] p-8 text-2xl focus:border-zenith-emerald outline-none transition-all duration-500 placeholder:text-white/5 font-display font-light italic text-white" placeholder="e.g. Google DeepMind" />
                </div>
                <div className="space-y-6">
                   <label className="text-[10px] uppercase font-mono tracking-[0.5em] text-white/20 font-bold ml-2">Designated Role</label>
                   <input type="text" className="w-full glass-surface border border-white/5 rounded-[2rem] p-8 text-2xl focus:border-zenith-emerald outline-none transition-all duration-500 placeholder:text-white/5 font-display font-light italic text-white" placeholder="e.g. Principal Strategy Executive" />
                </div>
            </div>
            <div className="space-y-6">
               <label className="text-[10px] uppercase font-mono tracking-[0.5em] text-white/20 font-bold ml-2">Geographic Parameters</label>
               <input type="text" className="w-full glass-surface border border-white/5 rounded-[2rem] p-8 text-2xl focus:border-zenith-emerald outline-none transition-all duration-500 placeholder:text-white/5 font-display font-light italic text-white" placeholder="e.g. Global Remote / EMEA Hub" />
            </div>
            <Button className="w-full py-10 text-2xl font-display font-bold shadow-2xl rounded-2xl active:scale-[0.98]" variant="zenith-emerald" onClick={() => setIsQuickAddOpen(false)}>INITIALIZE_STRATEGIC_PURSUANCE</Button>
         </div>
      </Modal>

      {/* Career Data Erasure Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-surface border-white/10 p-16 rounded-[4rem] text-center space-y-12 shadow-[0_0_100px_rgba(239,68,68,0.1)]"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-12 h-12 text-red-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                <h3 className="text-5xl font-display font-semibold text-white italic tracking-tighter">Terminate Career Node?</h3>
                <p className="text-2xl font-display font-light text-white/30 leading-relaxed italic">
                  This action will permanently purge the selected <span className="text-white">Enterprise Entity</span> from your strategic roadmap.
                </p>
              </div>
              <div className="flex gap-6 pt-8">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 h-20 rounded-[2rem] border-white/5 text-white/30 hover:text-white"
                >
                  STAY_CONNECTED
                </Button>
                <Button 
                  variant="zenith-emerald" 
                  size="lg" 
                  onClick={() => handleDeleteJob(deleteConfirmId)}
                  className="flex-1 h-20 rounded-[2rem] bg-red-500 hover:bg-red-600 border-none shadow-[0_0_50px_rgba(239,68,68,0.2)]"
                >
                  ERASE_PERMANENTLY
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
