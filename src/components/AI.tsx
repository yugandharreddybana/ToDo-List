import React, { useState, useRef, useEffect } from 'react';
import { GlassCard, Button, Badge, TechnicalLabel } from './UI';
import { 
  Send, 
  Cpu, 
  User, 
  Sparkles, 
  Loader2, 
  Brain, 
  Droplets, 
  AlertCircle, 
  Briefcase, 
  Moon,
  Mic,
  Calendar,
  BarChart3,
  RefreshCw,
  Plus,
  X,
  Zap,
  Terminal,
  Activity,
  Target,
  Clock
} from 'lucide-react';
import { getAIResponse, generateSubtasksAI } from '@/src/services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  proposedTasks?: any[];
};

const QUICK_ACTIONS = [
  { icon: Calendar, label: "Optimize Schedule" },
  { icon: Target, label: "Strategic Roadmap" },
  { icon: Sparkles, label: "Cognitive Insights" },
  { icon: RefreshCw, label: "Workflow Audit" },
];

interface AIProps {
  onSaveTask?: (task: any) => void;
  tasks?: any[];
}

export default function AIAssistant({ onSaveTask, tasks }: AIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingTasks, setRegeneratingTasks] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleUpdateSubtask = (msgId: string, taskIdx: number, stIdx: number, val: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || !m.proposedTasks) return m;
      const newTasks = [...m.proposedTasks];
      const newTask = { ...newTasks[taskIdx] };
      const newSubtasks = [...newTask.subtasks];
      newSubtasks[stIdx] = val;
      newTask.subtasks = newSubtasks;
      newTasks[taskIdx] = newTask;
      return { ...m, proposedTasks: newTasks };
    }));
  };

  const handleAddSubtask = (msgId: string, taskIdx: number) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || !m.proposedTasks) return m;
      const newTasks = [...m.proposedTasks];
      const newTask = { ...newTasks[taskIdx] };
      newTask.subtasks = [...(newTask.subtasks || []), ""];
      newTasks[taskIdx] = newTask;
      return { ...m, proposedTasks: newTasks };
    }));
  };

  const handleDeleteSubtask = (msgId: string, taskIdx: number, stIdx: number) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || !m.proposedTasks) return m;
      const newTasks = [...m.proposedTasks];
      const newTask = { ...newTasks[taskIdx] };
      newTask.subtasks = newTask.subtasks.filter((_: any, i: number) => i !== stIdx);
      newTasks[taskIdx] = newTask;
      return { ...m, proposedTasks: newTasks };
    }));
  };

  const handleRegenerateSubtasks = async (msgId: string, taskIdx: number) => {
    const key = `${msgId}-${taskIdx}`;
    const msg = messages.find(m => m.id === msgId);
    if (!msg || !msg.proposedTasks) return;
    const task = msg.proposedTasks[taskIdx];

    setRegeneratingTasks(prev => new Set(prev).add(key));
    try {
      const newSubtasks = await generateSubtasksAI(task.title, task.description);
      if (newSubtasks && newSubtasks.length > 0) {
        setMessages(prev => prev.map(m => {
          if (m.id !== msgId || !m.proposedTasks) return m;
          const newTasks = [...m.proposedTasks];
          newTasks[taskIdx] = { ...newTasks[taskIdx], subtasks: newSubtasks };
          return { ...m, proposedTasks: newTasks };
        }));
      }
    } catch (e) {
      console.error("Failed to regenerate subtasks:", e);
    } finally {
      setRegeneratingTasks(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('nexus_ai_v2_history');
    if (saved) {
       setMessages(JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    } else {
       setMessages([{
         id: '1',
         role: 'ai',
         content: "Neural systems synchronized. I am Zenith AI. Your strategic baseline is currently optimal. How shall we expand your developmental scope today?",
         timestamp: new Date()
       }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('nexus_ai_v2_history', JSON.stringify(messages));
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = text || input;
    if (!content.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content });
      
      const response = await getAIResponse(history);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.message,
        proposedTasks: response.proposedTasks,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-14rem)] flex flex-col gap-10 relative">
      
      <header className="flex items-center justify-between shrink-0 px-2 relative z-10">
        <div className="flex items-center gap-10">
          <div className="relative group">
            <div className="absolute inset-x-0 -bottom-2 h-1 bg-zenith-emerald blur-lg opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="w-20 h-20 rounded-3xl glass-surface flex items-center justify-center relative z-10 overflow-hidden">
               <Cpu className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-display font-semibold text-white tracking-tighter mb-2 italic">Neural Core</h1>
            <div className="flex items-center gap-6 text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] font-bold">
               <div className="flex items-center gap-2 text-zenith-emerald">
                 <div className="w-1.5 h-1.5 rounded-full bg-zenith-emerald shadow-[0_0_8px_rgba(0,245,160,0.6)]" />
                 <span>Link Established</span>
               </div>
               <span className="opacity-20">|</span>
               <span>Strategic Processing Unit</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-16">
           <TechnicalLabel label="Core Load" value="8.4%_IDLE" color="text-white" />
           <TechnicalLabel label="Latency" value="12MS" color="text-zenith-emerald" />
        </div>
      </header>

      {/* Primary Strategic Interface */}
      <div className="flex-1 interactive-pane p-0 overflow-hidden flex flex-col relative z-10">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-12 space-y-16 scrollbar-hide relative"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "flex gap-10 group",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border transition-all duration-700",
                  msg.role === 'ai' 
                    ? "glass-surface text-white border-white/20" 
                    : "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                )}>
                  {msg.role === 'ai' ? <Brain className="w-8 h-8" /> : <User className="w-8 h-8" />}
                </div>

                <div className={cn("flex-1 space-y-6 max-w-[85%]", msg.role === 'user' ? "text-right" : "text-left")}>
                  <div className={cn(
                    "relative p-10 rounded-[2.5rem] text-2xl font-light leading-relaxed group transition-all duration-700",
                    msg.role === 'ai' 
                      ? "bg-white/[0.04] border border-white/10 rounded-tl-none hover:bg-white/[0.07] hover:border-white/20" 
                      : "bg-white/10 border border-white/20 text-white rounded-tr-none"
                  )}>
                    {msg.role === 'ai' && (
                      <div className="absolute -top-4 left-0 flex items-center gap-3">
                        <div className="h-[1px] w-6 bg-zenith-emerald/40" />
                        <span className="text-[9px] font-mono text-zenith-emerald uppercase tracking-[0.4em] font-bold">Encrypted_Transmission</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] font-bold">{msg.timestamp.toLocaleTimeString()}</span>
                       {msg.role === 'ai' && <Sparkles className="w-5 h-5 text-zenith-emerald opacity-20 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </div>

                  {/* Task Synthesis Matrix */}
                  {msg.proposedTasks && msg.proposedTasks.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-12 glass-surface border-zenith-emerald/20 bg-zenith-emerald/5 rounded-[3rem] mt-10 space-y-10"
                    >
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-mono font-bold text-zenith-emerald uppercase tracking-[0.5em]">Suggested Roadmap Directives</h4>
                          <span className="px-4 py-1.5 rounded-full bg-zenith-emerald/10 text-[9px] font-mono text-zenith-emerald font-bold tracking-widest border border-zenith-emerald/20">{msg.proposedTasks.length} NODES</span>
                       </div>
                       <div className="grid grid-cols-1 gap-10">
                          {msg.proposedTasks.map((task: any, idx: number) => (
                             <div key={idx} className="glass-surface p-12 hover:border-zenith-emerald/30 transition-all group rounded-[3rem] space-y-10 relative overflow-hidden">
                                {/* Decorative Background Aura */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-zenith-emerald/5 blur-[80px] rounded-full pointer-events-none -translate-y-12 translate-x-12 group-hover:bg-zenith-emerald/10 transition-all duration-1000" />
                                
                                <div className="flex justify-between items-start relative z-10">
                                   <div className="space-y-4 text-left flex-1 min-w-0">
                                      <div className="flex items-center gap-6 flex-wrap">
                                         <Badge priority={task.priority as any} className="px-6 py-2 text-[8px] tracking-[0.2em] font-bold">
                                            {task.priority || 'P?'} — CORE_INTENSITY
                                         </Badge>
                                         <span className="flex items-center gap-3 px-6 py-2 glass-surface rounded-full border-white/5 text-[9px] font-mono text-zenith-emerald font-bold uppercase tracking-widest">
                                            <Terminal className="w-4 h-4" />
                                            {task.category} Sector
                                         </span>
                                      </div>
                                      <h4 className="text-6xl font-display font-semibold text-white group-hover:text-zenith-emerald transition-all leading-none italic tracking-tighter truncate pb-2">
                                         {task.title}
                                      </h4>
                                   </div>
                                   <div className="text-right shrink-0">
                                      <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold bg-white/5 px-8 py-3 rounded-full border border-white/5">
                                         {task.date || 'UNSCHEDULED'}
                                      </span>
                                   </div>
                                </div>
                                
                                {/* Tactical Metadata Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                   {task.duration && (
                                      <div className="flex flex-col gap-2 p-6 glass-surface rounded-[1.5rem] border-white/5 bg-white/[0.01]">
                                         <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Temporal Reqt.</span>
                                         <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-zenith-emerald" />
                                            <span className="text-[10px] font-mono text-white/60 font-bold">{task.duration}</span>
                                         </div>
                                      </div>
                                   )}
                                   {task.strategicValue && (
                                      <div className="flex flex-col gap-2 p-6 glass-surface rounded-[1.5rem] border-white/5 bg-white/[0.01]">
                                         <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Strategic ROI</span>
                                         <div className="flex items-center gap-3">
                                            <Activity className="w-5 h-5 text-zenith-emerald" />
                                            <span className="text-[10px] font-mono text-white/60 font-bold">{task.strategicValue}</span>
                                         </div>
                                      </div>
                                   )}
                                   {task.mentalLoad && (
                                      <div className="flex flex-col gap-2 p-6 glass-surface rounded-[1.5rem] border-white/5 bg-white/[0.01]">
                                         <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Cognitive Load</span>
                                         <div className="flex items-center gap-3">
                                            <Brain className="w-5 h-5 text-zenith-emerald" />
                                            <span className="text-[10px] font-mono text-white/60 font-bold">{task.mentalLoad}</span>
                                         </div>
                                      </div>
                                   )}
                                   {task.resources && (
                                      <div className="flex flex-col gap-2 p-6 glass-surface rounded-[1.5rem] border-white/5 bg-white/[0.01]">
                                         <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Resource Matrix</span>
                                         <div className="flex items-center gap-3">
                                            <Zap className="w-5 h-5 text-amber-400" />
                                            <span className="text-[10px] font-mono text-white/60 font-bold truncate">{task.resources}</span>
                                         </div>
                                      </div>
                                   )}
                                </div>

                                {task.description && (
                                   <div className="relative z-10 px-8 py-6 glass-surface border-white/5 rounded-[2rem] bg-black/20">
                                      <p className="text-3xl font-display font-light text-white/40 italic leading-relaxed group-hover:text-white/80 transition-all duration-700 text-left">
                                         {task.description}
                                      </p>
                                   </div>
                                )}

                                {task.subtasks && task.subtasks.length > 0 && (
                                   <div className="pt-6 space-y-8 relative z-10">
                                      <div className="flex items-center gap-8">
                                         <div className="h-[1px] flex-1 bg-white/5" />
                                         <div className="flex items-center gap-4">
                                           <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.6em] font-bold">Tactical Roadmap Matrix</span>
                                           <div className="flex items-center gap-2">
                                              <button 
                                                onClick={() => handleRegenerateSubtasks(msg.id, idx)}
                                                disabled={regeneratingTasks.has(`${msg.id}-${idx}`)}
                                                className="p-3 hover:bg-zenith-emerald/10 rounded-xl transition-all group/regen active:scale-95 disabled:opacity-50 border border-white/5"
                                                title="Regenerate Tactical Flow"
                                              >
                                                <RefreshCw className={cn(
                                                  "w-5 h-5 text-zenith-emerald/40 group-hover/regen:text-zenith-emerald transition-all",
                                                  regeneratingTasks.has(`${msg.id}-${idx}`) && "animate-spin"
                                                )} />
                                              </button>
                                              <button 
                                                onClick={() => handleAddSubtask(msg.id, idx)}
                                                className="p-3 hover:bg-zenith-emerald/10 rounded-xl transition-all group/add active:scale-95 text-zenith-emerald/40 hover:text-zenith-emerald border border-white/5"
                                                title="Append Tactical Node"
                                              >
                                                <Plus className="w-5 h-5" />
                                              </button>
                                           </div>
                                         </div>
                                         <div className="h-[1px] flex-1 bg-white/5" />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                                         {task.subtasks.map((st: string, sidx: number) => (
                                            <div key={sidx} className="flex items-center gap-6 group/st transition-all relative glass-surface border-white/[0.02] bg-white/[0.01] p-4 rounded-2xl hover:border-zenith-emerald/20">
                                               <div className="w-3 h-3 rounded-full border border-zenith-emerald/40 group-hover/st:bg-zenith-emerald group-hover/st:shadow-[0_0_20px_rgba(0,245,160,0.8)] transition-all shrink-0" />
                                               <input 
                                                 value={st}
                                                 onChange={(e) => handleUpdateSubtask(msg.id, idx, sidx, e.target.value)}
                                                 className="bg-transparent border-none outline-none text-2xl font-light italic text-white/20 focus:text-white group-hover/st:text-white/60 transition-colors uppercase tracking-tight w-full"
                                               />
                                               <button 
                                                 onClick={() => handleDeleteSubtask(msg.id, idx, sidx)}
                                                 className="opacity-0 group-hover/st:opacity-100 p-2 text-white/10 hover:text-red-500 transition-all font-bold"
                                                 title="Delete Tactical Node"
                                               >
                                                  <X className="w-4 h-4 text-white/20 group-hover:text-red-500" />
                                               </button>
                                            </div>
                                         ))}
                                      </div>
                                   </div>
                                )}
                             </div>
                          ))}
                       </div>
                       <Button variant="zenith-emerald" size="lg" className="w-full" onClick={() => {
                          msg.proposedTasks?.forEach(t => onSaveTask?.({ ...t, status: 'todo' }));
                          handleSend("Successfully synchronized all proposed tactical nodes to the primary registry.");
                       }}>
                         SYNCHRONIZE ALL DIRECTIVES
                       </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-10 items-center px-4">
              <div className="w-16 h-16 rounded-2xl glass-surface flex items-center justify-center border-zenith-emerald/30">
                 <Loader2 className="w-8 h-8 text-zenith-emerald animate-spin" />
              </div>
              <div className="flex gap-4">
                 {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.3, 1, 0.3], rotate: [0, 90, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      className="w-2.5 h-2.5 rounded-full bg-zenith-emerald shadow-[0_0_10px_rgba(0,245,160,0.8)]"
                    />
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Neural Input Interface */}
        <div className="p-12 border-t border-white/5 bg-white/[0.02] space-y-12 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-zenith-emerald/40 to-transparent" />
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {QUICK_ACTIONS.map((qa, i) => (
              <button 
                key={i}
                onClick={() => handleSend(qa.label)}
                className="flex items-center gap-5 whitespace-nowrap px-10 py-5 glass-surface hover:bg-white/10 transition-all group active:scale-95 rounded-2xl"
              >
                <qa.icon className="w-5 h-5 text-zenith-emerald group-hover:scale-125 transition-transform" />
                <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">{qa.label}</span>
              </button>
            ))}
          </div>

          <div className="relative group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-zenith-emerald/5 blur-[120px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <div className="relative flex items-center gap-8 glass-surface p-4 rounded-full border-white/20 group-focus-within:border-zenith-emerald/50 group-focus-within:shadow-[0_0_50px_rgba(0,245,160,0.1)] transition-all duration-700">
               <button className="w-16 h-16 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-white/30 hover:text-zenith-emerald transform hover:scale-110">
                 <Mic className="w-8 h-8" />
               </button>
               <input 
                 type="text" 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
                 placeholder="INITIALIZE NEURAL QUERY..."
                 className="flex-1 bg-transparent border-none outline-none text-3xl font-display font-medium text-white placeholder:text-white/10 px-4 tracking-tight"
               />
               <Button 
                 variant="zenith-emerald" 
                 className="h-20 w-20 p-0 rounded-full"
                 onClick={() => handleSend()}
                 disabled={!input.trim() || isLoading}
               >
                 <Send className="w-8 h-8" />
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
