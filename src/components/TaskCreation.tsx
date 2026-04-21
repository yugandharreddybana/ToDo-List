import React, { useState, useEffect, useRef } from 'react';
import { GlassCard, Button, Badge, Modal, TechnicalLabel } from './UI';
import { 
  X, 
  Brain, 
  Calendar, 
  Clock, 
  Plus, 
  Paperclip, 
  Camera, 
  Mic, 
  Upload,
  Loader2,
  Check,
  ChevronRight,
  RefreshCw,
  Square,
  RotateCcw,
  Edit2,
  Terminal,
  Cpu,
  Target,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { GoogleGenAI, Type } from '@google/genai';

interface TaskCreationProps {
  onClose: () => void;
  onSave?: (task: any) => void;
  initialTab?: 'manual' | 'scan' | 'voice';
  initialTask?: any;
}

type VoiceState = 'idle' | 'recording' | 'processing' | 'result' | 'error';

const DEFAULT_TASK = {
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  priority: 'P3',
  category: 'Work',
  subtasks: [] as string[],
  isRecurring: false,
  recurrence: 'none',
  duration: '1h',
  strategicValue: '',
  mentalLoad: 'Routine'
};

export default function TaskCreation({ onClose, onSave, initialTab = 'manual', initialTask }: TaskCreationProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'scan' | 'voice'>(initialTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasksData, setTasksData] = useState([ initialTask ? { ...DEFAULT_TASK, ...initialTask } : { ...DEFAULT_TASK } ]);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [analysisStep, setAnalysisStep] = useState("");
  const [transcript, setTranscriptState] = useState("");
  const transcriptRef = useRef("");
  const recognitionRef = useRef<any>(null);
  const [aiResult, setAiResult] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [focusPoint, setFocusPoint] = useState({ x: 50, y: 50 });
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState<Record<number, boolean>>({});

  const categories = ['Work', 'Study', 'Health', 'Career', 'Personal', 'Nexus'];

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSave = () => {
    if (activeTab === 'manual') {
      tasksData.forEach(task => {
        if (task.title.trim()) {
          onSave?.({ ...task, status: 'todo' });
        }
      });
    } else {
       aiResult?.forEach(task => onSave?.({ ...task, status: 'todo' }));
    }
    onClose();
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event: any) => {
          let current = "";
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          transcriptRef.current = current;
          setTranscriptState(current);
        };
      }
      setVoiceState('recording');
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceState('processing');
      setAnalysisStep("Analyzing Linguistic Patterns...");
      
      const text = transcriptRef.current;
      import('../services/geminiService').then(async (m) => {
        try {
          const stages = [
            "Analyzing Linguistic Patterns...",
            "Mapping Strategic Intent...",
            "Synthesizing Objective Modules...",
            "Finalizing Roadmap Parity..."
          ];
          let stageIdx = 0;
          const interval = setInterval(() => {
            stageIdx++;
            if (stageIdx < stages.length) setAnalysisStep(stages[stageIdx]);
          }, 1200);

          const results = await m.parseVoiceDirective(text);
          clearInterval(interval);
          setAiResult(results);
          setVoiceState('result');
        } catch (error) {
          console.error("AI Parsing failed:", error);
          setVoiceState('error');
        }
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setAnalysisStep("Analyzing Optical Data...");
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setScannedImage(base64);

      import('../services/geminiService').then(async (m) => {
        try {
          const stages = [
            "Capturing Optical Context...",
            "Identifying Roadmap Nodes...",
            "Deconstructing Visual Directives...",
            "Optimizing Operational Segments..."
          ];
          let stageIdx = 0;
          const interval = setInterval(() => {
            stageIdx++;
            if (stageIdx < stages.length) setAnalysisStep(stages[stageIdx]);
          }, 1500);

          const results = await m.parseVisualContext(base64);
          clearInterval(interval);
          setAiResult(results);
          setIsScanning(false);
          setActiveTab('manual');
          setTasksData(results);
        } catch (error) {
          console.error("Optical Analysis failed:", error);
          setIsScanning(false);
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAIDeconstruction = async (idx: number, replace: boolean = false) => {
    const task = tasksData[idx];
    if (!task.title.trim()) return;

    setIsGeneratingSubtasks(prev => ({ ...prev, [idx]: true }));
    import('../services/geminiService').then(async (m) => {
      try {
        const subtasks = await m.generateSubtasksAI(task.title, task.description);
        const next = [...tasksData];
        next[idx].subtasks = replace ? subtasks : [...(task.subtasks || []), ...subtasks];
        setTasksData(next);
      } catch (error) {
        console.error("Tactical deconstruction failed:", error);
      } finally {
        setIsGeneratingSubtasks(prev => ({ ...prev, [idx]: false }));
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 bg-black z-[100] flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0B] via-[#1A1C1E] to-black opacity-95" />
      <div className="absolute inset-0 backdrop-blur-[120px]" />
      
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col p-8 md:p-20 relative z-10 overflow-hidden">
        <header className="flex items-center justify-between mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
               <div className="h-[2px] w-12 bg-zenith-emerald" />
               <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-zenith-emerald">Strategic Deployment Unit</span>
            </div>
            <h2 className="text-7xl font-display font-semibold text-white tracking-tighter italic">Tactical <br /><span className="text-white/20 not-italic">Initialization.</span></h2>
          </div>
          <button onClick={onClose} className="p-6 hover:bg-white/5 rounded-full transition-all group border border-white/5 hover:border-white/10">
            <X className="w-10 h-10 text-white/30 group-hover:text-white" />
          </button>
        </header>

        {/* Navigation Interface */}
        <div className="flex bg-white/[0.02] p-2 border border-white/5 rounded-[2rem] mb-16 backdrop-blur-3xl p-3">
          {(['manual', 'voice', 'scan'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-6 px-10 rounded-[1.5rem] text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all duration-700 relative overflow-hidden group",
                activeTab === tab 
                  ? "text-black" 
                  : "text-white/30 hover:text-white"
              )}
            >
              {activeTab === tab && (
                <motion.div layoutId="creation-tab" className="absolute inset-0 bg-white" />
              )}
              <span className="relative z-10">{tab === 'manual' ? 'Specification' : tab === 'voice' ? 'Transcription' : 'Visual'}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'manual' && (
              <motion.div 
                key="manual"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-12 pb-20"
              >
                {tasksData.map((task, idx) => (
                  <div key={idx} className="interactive-pane p-16 relative group overflow-hidden">
                    <div className="space-y-16">
                      <div className="space-y-6">
                        <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold ml-2">Objective Designator</label>
                        <input 
                          type="text" 
                          placeholder="ASSIGN_IDENTIFIER..."
                          value={task.title}
                          onChange={e => {
                            const next = [...tasksData];
                            next[idx].title = e.target.value;
                            setTasksData(next);
                          }}
                          className="w-full bg-transparent text-6xl font-display font-semibold border-b border-white/5 pb-6 outline-none focus:border-white transition-all placeholder:text-white/5 italic focus:not-italic"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        <div className="space-y-6">
                           <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold ml-2">Contextual Layer</label>
                           <textarea 
                             rows={5}
                             placeholder="Capture tactical nuance or environmental constraints..."
                             value={task.description}
                             onChange={e => {
                               const next = [...tasksData];
                               next[idx].description = e.target.value;
                               setTasksData(next);
                             }}
                             className="w-full glass-surface border-white/5 rounded-[2rem] p-10 text-xl font-light outline-none focus:border-white focus:bg-white/[0.04] transition-all italic leading-relaxed text-white placeholder:text-white/5"
                           />
                        </div>

                        <div className="space-y-12">
                           <div className="grid grid-cols-2 gap-12">
                              <div className="space-y-6">
                                 <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold ml-2">Temporal Window</label>
                                 <div className="flex flex-col gap-4">
                                    <input 
                                      type="date" 
                                      value={task.date}
                                      onChange={e => {
                                        const next = [...tasksData];
                                        next[idx].date = e.target.value;
                                        setTasksData(next);
                                      }}
                                      className="p-6 glass-surface border-white/5 rounded-2xl text-[10px] font-mono font-bold text-white outline-none cursor-pointer invert brightness-200" 
                                    />
                                    <input 
                                      type="time" 
                                      value={task.time}
                                      onChange={e => {
                                        const next = [...tasksData];
                                        next[idx].time = e.target.value;
                                        setTasksData(next);
                                      }}
                                      className="p-6 glass-surface border-white/5 rounded-2xl text-[10px] font-mono font-bold text-white outline-none cursor-pointer invert brightness-200" 
                                    />
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold ml-2">Est. Duration</label>
                                 <input 
                                   type="text"
                                   placeholder="e.g. 1.5h, 45m"
                                   value={task.duration}
                                   onChange={e => {
                                     const next = [...tasksData];
                                     next[idx].duration = e.target.value;
                                     setTasksData(next);
                                   }}
                                   className="w-full p-6 glass-surface border-white/5 rounded-2xl text-xl font-light text-white outline-none focus:border-white transition-all placeholder:text-white/10"
                                 />
                              </div>
                           </div>

                           <div className="space-y-6">
                              <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold ml-2">Threat Level</label>
                              <div className="flex gap-4">
                                {['P1', 'P2', 'P3', 'P4'].map(p => (
                                  <button
                                    key={p}
                                    onClick={() => {
                                      const next = [...tasksData];
                                      next[idx].priority = p;
                                      setTasksData(next);
                                    }}
                                    className={cn(
                                      "flex-1 py-6 rounded-2xl text-[10px] font-mono font-bold border transition-all duration-700 relative overflow-hidden group/p",
                                      task.priority === p 
                                        ? p === 'P1' ? "bg-red-500 text-white border-red-500" : "bg-white text-black border-white"
                                        : "bg-white/[0.02] border-white/5 text-white/20 hover:border-white/20 hover:text-white"
                                    )}
                                  >
                                    <span className="relative z-10">{p}</span>
                                  </button>
                                ))}
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-12 border-t border-white/5">
                         <div className="space-y-6">
                            <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold ml-2">Tactical Sector Alignment</label>
                            <div className="flex flex-wrap gap-4">
                               {categories.map(c => (
                                 <button 
                                   key={c}
                                   onClick={() => {
                                     const next = [...tasksData];
                                     next[idx].category = c;
                                     setTasksData(next);
                                   }}
                                   className={cn(
                                     "px-10 py-5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all duration-700 border",
                                     task.category === c 
                                       ? "bg-zenith-emerald text-black border-zenith-emerald shadow-[0_0_20px_rgba(0,245,160,0.3)]" 
                                       : "bg-transparent border-white/5 text-white/20 hover:border-white/20 hover:text-white"
                                   )}
                                 >
                                   {c}
                                 </button>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-6">
                            <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold ml-2">Recurrence Pattern</label>
                            <div className="flex items-center gap-6">
                               <button 
                                 onClick={() => {
                                   const next = [...tasksData];
                                   next[idx].isRecurring = !next[idx].isRecurring;
                                   setTasksData(next);
                                 }}
                                 className={cn(
                                   "w-14 h-14 rounded-2xl glass-surface flex items-center justify-center transition-all",
                                   task.isRecurring ? "bg-zenith-emerald/20 border-zenith-emerald text-zenith-emerald" : "text-white/20"
                                 )}
                               >
                                  <RefreshCw className={cn("w-6 h-6", task.isRecurring && "animate-[spin_4s_linear_infinite]")} />
                               </button>
                               
                               {task.isRecurring && (
                                 <div className="flex-1 flex flex-col gap-3">
                                    <div className="flex gap-3">
                                      {['daily', 'weekly', 'monthly', 'custom'].map(r => (
                                        <button
                                          key={r}
                                          onClick={() => {
                                            const next = [...tasksData];
                                            next[idx].recurrence = r;
                                            setTasksData(next);
                                          }}
                                          className={cn(
                                            "flex-1 py-4 rounded-xl text-[9px] font-mono font-bold uppercase tracking-widest border transition-all",
                                            task.recurrence === r ? "bg-white text-black border-white" : "text-white/30 border-white/5 hover:border-white/20"
                                          )}
                                        >
                                          {r}
                                        </button>
                                      ))}
                                    </div>
                                    {task.recurrence === 'custom' && (
                                      <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5 mt-2">
                                        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Interval (Days)</span>
                                        <input 
                                          type="number"
                                          min="1"
                                          placeholder="e.g. 3"
                                          className="flex-1 bg-transparent text-xl font-mono text-white outline-none"
                                          onChange={(e) => {
                                            const next = [...tasksData];
                                            next[idx].customInterval = e.target.value;
                                            setTasksData(next);
                                          }}
                                        />
                                      </div>
                                    )}
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>

                       <div className="pt-12 border-t border-white/5 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold ml-2">Tactical Micro-Nodes</label>
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => handleAIDeconstruction(idx)}
                                  disabled={isGeneratingSubtasks[idx]}
                                  className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-full border border-zenith-emerald/20 bg-zenith-emerald/5 text-[9px] font-mono font-bold uppercase tracking-widest transition-all",
                                    isGeneratingSubtasks[idx] ? "opacity-50 cursor-wait" : "hover:bg-zenith-emerald/10 hover:border-zenith-emerald/40 text-zenith-emerald"
                                  )}
                                >
                                  {isGeneratingSubtasks[idx] ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3 h-3" />
                                  )}
                                  {isGeneratingSubtasks[idx] ? 'Synthesizing...' : 'AI Deconstruction'}
                                </button>
                                {task.subtasks?.length > 0 && !isGeneratingSubtasks[idx] && (
                                  <button 
                                    onClick={() => handleAIDeconstruction(idx, true)}
                                    className="p-2 glass-surface border-white/5 rounded-lg text-white/20 hover:text-zenith-emerald hover:border-zenith-emerald/20 transition-all shadow-sm"
                                    title="Regenerate Tactical Stream"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          <button 
                            onClick={() => {
                              const next = [...tasksData];
                              const currentSubtasks = task.subtasks || [];
                              next[idx].subtasks = [...currentSubtasks, ""];
                              setTasksData(next);
                            }}
                            className="text-[9px] font-mono text-zenith-emerald uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-3 h-3" /> Append Node
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                           {task.subtasks?.map((st: string, sidx: number) => (
                              <div key={sidx} className="flex items-center gap-4 group/st">
                                 <div className="w-1.5 h-1.5 rounded-full bg-zenith-emerald/30 group-hover/st:bg-zenith-emerald transition-colors shrink-0" />
                                 <input 
                                   type="text" 
                                   placeholder="Define tactical action..."
                                   value={st}
                                   onChange={e => {
                                      const next = [...tasksData];
                                      next[idx].subtasks[sidx] = e.target.value;
                                      setTasksData(next);
                                   }}
                                   className="flex-1 bg-transparent border-b border-white/5 py-2 text-lg font-light italic text-white outline-none focus:border-white transition-all placeholder:text-white/5"
                                 />
                                 <button 
                                   onClick={() => {
                                      const next = [...tasksData];
                                      next[idx].subtasks = task.subtasks.filter((_: any, i: number) => i !== sidx);
                                      setTasksData(next);
                                   }}
                                   className="opacity-0 group-hover/st:opacity-100 p-2 text-white/20 hover:text-red-500 transition-all font-bold"
                                 >
                                    <X className="w-4 h-4" />
                                 </button>
                              </div>
                           ))}
                           {(!task.subtasks || task.subtasks.length === 0) && (
                              <p className="col-span-full text-xl font-light text-white/5 italic py-4">No actionable sub-steps defined for this objective.</p>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                   onClick={() => setTasksData([...tasksData, { ...DEFAULT_TASK }])}
                   className="w-full glass-surface border-dashed border-2 border-white/5 rounded-[4rem] p-24 flex flex-col items-center justify-center gap-8 text-white/10 hover:text-zenith-emerald hover:border-zenith-emerald/30 hover:bg-zenith-emerald/5 transition-all group"
                >
                   <Plus className="w-16 h-16 group-hover:scale-125 transition-transform duration-700" />
                   <span className="text-2xl font-display font-light italic tracking-tighter">Append Operational Segment</span>
                </button>
              </motion.div>
            )}

            {activeTab === 'voice' && (
              <motion.div 
                key="voice"
                className="flex flex-col items-center justify-center py-40 space-y-24"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {voiceState === 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="w-72 h-72 rounded-full glass-surface flex items-center justify-center relative group border-white/5 shadow-2xl"
                  >
                    <div className="absolute inset-0 rounded-full bg-zenith-emerald animate-ping opacity-10 pointer-events-none" />
                    <Mic className="w-24 h-24 text-white/20 group-hover:text-white transition-all duration-1000" />
                  </motion.button>
                )}

                {/* Other states would follow same dark Zenith pattern */}
                {voiceState === 'recording' && (
                   <div className="flex flex-col items-center space-y-24 w-full">
                      <motion.button
                        onClick={stopRecording}
                        className="w-72 h-72 rounded-full bg-red-500/10 flex items-center justify-center shadow-2xl relative border border-red-500/20"
                      >
                         <Square className="w-20 h-20 text-red-500 fill-current" />
                      </motion.button>
                      <div className="flex gap-4 items-end h-32">
                         {[...Array(32)].map((_, i) => (
                           <motion.div 
                             key={i}
                             animate={{ height: [20, Math.random() * 120 + 20, 20] }}
                             transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.05 }}
                             className="w-3 bg-red-500/40 rounded-full shadow-sm"
                           />
                         ))}
                      </div>
                      <p className="text-4xl font-display font-light text-center italic text-white/40 max-w-4xl leading-relaxed">
                         {transcript || "Speak clearly to formalize your directive..."}
                      </p>
                   </div>
                )}
                {/* ... rest of your existing logic kept intact ... */}
                {voiceState === 'processing' && (
                  <div className="text-center space-y-12">
                     <div className="w-32 h-32 rounded-[2.5rem] glass-surface border border-white/5 flex items-center justify-center mx-auto shadow-2xl relative">
                        <Loader2 className="w-16 h-16 text-zenith-emerald animate-spin" />
                        <div className="absolute inset-x-0 -bottom-16">
                           <div className="h-[1px] w-full bg-white/5" />
                        </div>
                     </div>
                     <p className="text-[10px] font-mono text-zenith-emerald uppercase tracking-[0.5em] animate-pulse font-bold">{analysisStep || "Linguistic Layer Analysis_ACTIVE"}</p>
                  </div>
                )}
                {voiceState === 'result' && aiResult && (
                   <div className="w-full space-y-12 max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-1000">
                      <div className="space-y-6">
                        <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] font-bold ml-2">Captured Directive</label>
                        <div className="p-10 glass-surface border-white/5 bg-white/[0.02] rounded-[2.5rem] text-3xl font-light italic text-white/60 leading-relaxed shadow-inner">
                          {transcript}
                        </div>
                      </div>

                      <div className="flex items-center gap-10 bg-zenith-emerald/5 border border-zenith-emerald/20 p-12 rounded-[3rem]">
                         <Brain className="w-16 h-16 text-zenith-emerald" />
                         <p className="text-2xl font-display text-white italic font-light text-left">Synthesis complete. <span className="text-white font-bold not-italic">{aiResult.length}</span> objective modules mapped to target sectors.</p>
                      </div>
                      {aiResult.map((task, i) => (
                        <div key={i} className="interactive-pane p-12 rounded-[2.5rem] flex items-center justify-between group">
                           <div className="text-left space-y-2">
                              <h4 className="text-4xl font-display font-semibold text-white tracking-tight italic group-hover:not-italic transition-all duration-700">{task.title}</h4>
                              <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">{task.category} Domain / Status_PENDING</p>
                           </div>
                           <div className="w-16 h-16 rounded-full glass-surface border-zenith-emerald/30 flex items-center justify-center">
                              <Check className="w-8 h-8 text-zenith-emerald" />
                           </div>
                        </div>
                      ))}
                   </div>
                )}
              </motion.div>
            )}

            {activeTab === 'scan' && (
              <motion.div 
                key="scan"
                className="flex flex-col items-center justify-center py-40 text-center space-y-16"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                 <div 
                    onClick={(e) => {
                      if (!scannedImage || isScanning) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      setFocusPoint({ x, y });
                    }}
                    className={cn(
                      "w-[500px] h-96 rounded-[3rem] glass-surface border-white/5 flex items-center justify-center shadow-2xl relative overflow-hidden group",
                      scannedImage && !isScanning && "cursor-crosshair"
                    )}
                 >
                    {scannedImage ? (
                      <div className="absolute inset-0 group">
                        <img src={scannedImage} alt="Optical Context" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2000ms]" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                        
                        {/* Area Selector Simulation */}
                        <motion.div 
                          animate={{ left: `${focusPoint.x}%`, top: `${focusPoint.y}%` }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute w-48 h-48 border-2 border-dashed border-zenith-emerald/40 animate-pulse -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        >
                           <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-zenith-emerald" />
                           <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-zenith-emerald" />
                           <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-zenith-emerald" />
                           <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-zenith-emerald" />
                           <div className="absolute inset-0 flex items-center justify-center">
                              <Plus className="w-8 h-8 text-zenith-emerald/20" />
                           </div>
                        </motion.div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 glass-surface border-white/10 rounded-full text-[8px] font-mono text-white/40 uppercase tracking-widest whitespace-nowrap">
                           {isScanning ? 'AI Focus Region Locked' : 'Tap to Prioritize Optical Node'}
                        </div>
                      </div>
                    ) : (
                      <Camera className="w-20 h-20 text-white/10 group-hover:text-white transition-all duration-1000" />
                    )}
                    
                    <div className={cn(
                      "absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-zenith-emerald to-transparent top-0 shadow-[0_0_15px_rgba(0,245,160,0.8)] pointer-events-none",
                      isScanning ? "animate-[scan_2s_infinite_linear]" : "top-1/2 opacity-20"
                    )} />
                 </div>
                 <div className="space-y-6 max-w-2xl">
                   <h3 className="text-5xl font-display font-semibold text-white italic">{isScanning ? analysisStep : 'Optical Data Ingestion'}</h3>
                   <p className="text-white/30 text-2xl leading-relaxed font-light italic">
                     {isScanning 
                       ? 'Zenith AI is currently deconstructing visual nodes and mapping them to the strategic roadmap registry.' 
                       : 'Upload visual references, screenshots, or tactical notes to allow Zenith to synthesize them into actionable directives.'
                     }
                   </p>
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleFileUpload}
                   className="hidden" 
                   accept="image/*"
                 />
                 <Button 
                   variant="zenith-emerald" 
                   size="lg" 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isScanning}
                   className="h-16 px-12 rounded-full shadow-2xl"
                 >
                    {isScanning ? 'PROCESSING...' : 'INITIALIZE UPLINK'}
                 </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Control Bar */}
        <footer className="pt-16 border-t border-white/5 flex flex-col md:flex-row gap-12 mt-auto">
           <div className="flex-1 flex items-center gap-10 px-12 py-8 glass-surface border-white/5 rounded-[3rem] relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
              <Cpu className="w-12 h-12 text-white/10 group-hover:text-zenith-emerald transition-colors" />
              <div className="flex-1 space-y-4">
                 <div className="flex justify-between text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">
                    <span>Executive Synchronization</span>
                    <span className="text-zenith-emerald">Protocol_ACTIVE</span>
                 </div>
                 <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="h-full bg-zenith-emerald w-1/3 shadow-[0_0_20px_rgba(0,245,160,0.8)]" 
                    />
                 </div>
              </div>
           </div>
           <Button variant="zenith-emerald" size="lg" className="min-w-[350px] h-24 rounded-full text-3xl font-display font-black tracking-tighter shadow-2xl hover:scale-[1.02] transition-transform active:scale-95" onClick={handleSave}>
              DEPLOY_DIRECTIVES
              <ChevronRight className="ml-6 w-10 h-10" />
           </Button>
        </footer>
      </div>
    </motion.div>
  );
}
