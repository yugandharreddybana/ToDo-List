import React, { useState, useRef, useEffect } from 'react';
import { GlassCard, Button, Badge } from './UI';
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
  X
} from 'lucide-react';
import { getAIResponse } from '@/src/services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  tools?: any[];
  proposedTasks?: any[];
};

const INSIGHTS = [
  { icon: Droplets, text: "No water logged in 3hrs", color: "text-p3" },
  { icon: AlertCircle, text: "5 tasks overdue", color: "text-p1" },
  { icon: Briefcase, text: "2 jobs below daily goal", color: "text-p3" },
  { icon: Moon, text: "Sleep avg 5.9hrs this week — low", color: "text-p2" },
];

const QUICK_ACTIONS = [
  { icon: Calendar, label: "Plan My Day" },
  { icon: BarChart3, label: "Weekly Report" },
  { icon: Sparkles, label: "Suggest Tasks" },
  { icon: RefreshCw, label: "Reschedule Overloaded Day" },
  { icon: Briefcase, label: "Job Search Tips" },
  { icon: Moon, label: "Sleep Analysis" },
];

interface AIProps {
  onSaveTask?: (task: any) => void;
  tasks?: any[];
}

export default function AIAssistant({ onSaveTask, tasks }: AIProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'ai', 
      content: "Greetings. I am NEXUS AI, your cognitive co-pilot. I've analyzed your recent patterns and noticed your focus peaks in the late evening. Shall we optimize your schedule for tonight?", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const updateProposedTask = (msgId: string, taskIdx: number, field: string, value: any) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.proposedTasks) {
        const newTasks = [...m.proposedTasks];
        newTasks[taskIdx] = { ...newTasks[taskIdx], [field]: value };
        return { ...m, proposedTasks: newTasks };
      }
      return m;
    }));
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: messageText });

    const response = await getAIResponse(history);
    
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: response.message,
      timestamp: new Date(),
      proposedTasks: response.proposedTasks
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center border border-electric-blue/20">
            <Brain className="w-6 h-6 text-electric-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">NEXUS AI</h1>
              <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-500/20 uppercase tracking-tighter">Powered by MCP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-green animate-pulse" />
              <span className="text-[10px] text-gray-muted uppercase tracking-widest font-bold">Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Proactive Insights Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
        {INSIGHTS.map((insight, i) => (
          <button 
            key={i}
            onClick={() => handleSend(insight.text)}
            className="flex items-center gap-2 whitespace-nowrap bg-surface border border-white/8 px-3 py-1.5 rounded-full text-xs font-medium hover:border-white/20 transition-all group"
          >
            <insight.icon className={cn("w-3 h-3", insight.color)} />
            <span className="text-gray-muted group-hover:text-white transition-colors">{insight.text}</span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                  msg.role === 'ai' 
                    ? "bg-surface border-white/10 text-electric-blue" 
                    : "bg-electric-blue text-background"
                )}>
                  {msg.role === 'ai' ? <Brain className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="space-y-3">
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'ai' 
                      ? "bg-white/5 border border-white/8 rounded-tl-none" 
                      : "bg-electric-blue text-background font-medium rounded-tr-none"
                  )}>
                    {msg.content}
                    <div className={cn(
                      "text-[10px] mt-2 opacity-50 font-mono",
                      msg.role === 'user' ? "text-background" : "text-gray-muted"
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Proposed Tasks Output */}
                  {msg.proposedTasks && msg.proposedTasks.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <GlassCard className="p-4 bg-white/5 border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold uppercase tracking-widest text-electric-blue">Proposed Tasks ({msg.proposedTasks.length})</span>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              msg.proposedTasks?.forEach(task => {
                                if (onSaveTask) onSaveTask({ ...task, status: 'todo' });
                              });
                              // Add a confirmation message
                              setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                role: 'ai',
                                content: `I've successfully added all ${msg.proposedTasks?.length} tasks to your dashboard.`,
                                timestamp: new Date()
                              }]);
                            }}
                            className="h-8 text-xs shadow-[0_0_15px_rgba(0,191,255,0.3)]"
                          >
                            Confirm & Save All
                          </Button>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                          {msg.proposedTasks.map((task: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-xl bg-surface border border-white/5 space-y-2">
                              <div className="flex items-start gap-2">
                                <input 
                                  value={task.title} 
                                  onChange={(e) => updateProposedTask(msg.id, idx, 'title', e.target.value)}
                                  className="flex-1 bg-transparent border-b border-white/10 font-bold text-sm text-electric-blue focus:outline-none focus:border-electric-blue"
                                />
                                <select 
                                  value={task.priority}
                                  onChange={(e) => updateProposedTask(msg.id, idx, 'priority', e.target.value)}
                                  className="bg-surface border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                >
                                  <option value="P1">P1</option>
                                  <option value="P2">P2</option>
                                  <option value="P3">P3</option>
                                  <option value="P4">P4</option>
                                </select>
                              </div>
                              <input 
                                value={task.description || ''} 
                                onChange={(e) => updateProposedTask(msg.id, idx, 'description', e.target.value)}
                                placeholder="Description (optional)"
                                className="w-full bg-transparent border-b border-white/10 text-xs text-gray-muted focus:outline-none focus:border-electric-blue"
                              />
                              
                              <div className="space-y-1 mt-2">
                                {task.subtasks?.map((st: string, stIdx: number) => (
                                  <div key={stIdx} className="flex items-center gap-2 text-xs text-gray-300">
                                    <div className="w-1 h-1 rounded-full bg-electric-blue/50 shrink-0" />
                                    <input 
                                      value={st}
                                      onChange={(e) => {
                                        const newSubtasks = [...(task.subtasks || [])];
                                        newSubtasks[stIdx] = e.target.value;
                                        updateProposedTask(msg.id, idx, 'subtasks', newSubtasks);
                                      }}
                                      className="flex-1 bg-transparent border-b border-white/10 focus:outline-none focus:border-electric-blue"
                                    />
                                    <button 
                                      onClick={() => {
                                        const newSubtasks = task.subtasks.filter((_: any, i: number) => i !== stIdx);
                                        updateProposedTask(msg.id, idx, 'subtasks', newSubtasks);
                                      }}
                                      className="text-gray-muted hover:text-red"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                <button 
                                  onClick={() => {
                                    const newSubtasks = [...(task.subtasks || []), ''];
                                    updateProposedTask(msg.id, idx, 'subtasks', newSubtasks);
                                  }}
                                  className="text-[10px] text-electric-blue hover:underline"
                                >
                                  + Add Subtask
                                </button>
                              </div>
                              
                              <div className="flex items-center gap-2 pt-2">
                                <div className="flex items-center gap-1 text-[10px] text-gray-muted flex-1">
                                  <Calendar className="w-3 h-3" />
                                  <input 
                                    value={task.date}
                                    onChange={(e) => updateProposedTask(msg.id, idx, 'date', e.target.value)}
                                    className="bg-transparent border-b border-white/10 focus:outline-none focus:border-electric-blue w-full"
                                  />
                                </div>
                                <select 
                                  value={task.category}
                                  onChange={(e) => updateProposedTask(msg.id, idx, 'category', e.target.value)}
                                  className="bg-surface border border-white/10 rounded px-2 py-1 text-[10px] font-bold uppercase text-white focus:outline-none"
                                >
                                  {['Work', 'Study', 'Health', 'Career', 'Personal', 'Side Project'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-electric-blue">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/8 rounded-tl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-electric-blue rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-electric-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-electric-blue rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/8 bg-surface/30 space-y-4">
          {/* Quick Action Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_ACTIONS.map((action, i) => (
              <button 
                key={i}
                onClick={() => handleSend(action.label)}
                className="flex items-center gap-2 whitespace-nowrap bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 hover:border-white/10 transition-all"
              >
                <action.icon className="w-3 h-3 text-electric-blue" />
                {action.label}
              </button>
            ))}
          </div>

          <div className="relative flex items-center gap-2">
            <div className="absolute left-3 text-gray-muted">
              <Mic className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask NEXUS anything..." 
              className="flex-1 bg-surface border border-white/8 rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:border-electric-blue/50 transition-colors"
            />
            <Button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 w-10 h-10 p-0 rounded-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
