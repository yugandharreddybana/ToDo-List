import React, { useState, useEffect, useRef } from 'react';
import { GlassCard, Button, Badge } from './UI';
import { 
  X, 
  Brain, 
  Calendar, 
  Clock, 
  Plus, 
  GripVertical, 
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
  Edit2
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
  date: 'Apr 13, 2026 • 09:00 AM',
  priority: 'P3',
  category: 'Work',
  subtasks: [] as string[],
  isRecurring: false,
  recurringDays: [] as string[],
  duration: '1h'
};

export default function TaskCreation({ onClose, onSave, initialTab = 'manual', initialTask }: TaskCreationProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'scan' | 'voice'>(initialTab);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // Task State (Array for bulk creation)
  const [tasksData, setTasksData] = useState([ initialTask ? { ...DEFAULT_TASK, ...initialTask } : { ...DEFAULT_TASK } ]);

  // Voice States
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscriptState] = useState("");
  const transcriptRef = useRef("");
  const [aiResult, setAiResult] = useState<any>(null);
  const [voiceError, setVoiceError] = useState("");
  const [clarificationMessage, setClarificationMessage] = useState("");
  const [clarificationInput, setClarificationInput] = useState("");
  const [conversationHistory, setConversationHistory] = useState<{role: string, text: string}[]>([]);
  const recognitionRef = useRef<any>(null);

  const categories = ['Work', 'Study', 'Health', 'Career', 'Personal', 'Side Project'];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const currentTranscript = final + interim;
        transcriptRef.current = currentTranscript;
        setTranscriptState(currentTranscript);
      };

      recognition.onend = () => {
        // Handle unexpected end if needed
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return; // Ignore these when stopping manually
        }
        if (event.error === 'not-allowed') {
          setVoiceError("Microphone access denied. Please check your browser permissions.");
        } else if (event.error === 'network') {
          setVoiceError("Network error. Speech recognition requires an active internet connection in some browsers.");
        } else {
          setVoiceError(`Speech recognition error: ${event.error}`);
        }
        setVoiceState('error');
      };
      
      recognitionRef.current = recognition;
    } else {
       setVoiceError("Speech recognition is not supported in this browser.");
       setVoiceState('error');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleDay = (taskIdx: number, day: string, dayIdx: number) => {
    const dayId = `${day}-${dayIdx}`;
    const newTasksData = [...tasksData];
    const task = newTasksData[taskIdx];
    task.recurringDays = task.recurringDays.includes(dayId) 
      ? task.recurringDays.filter(d => d !== dayId) 
      : [...task.recurringDays, dayId];
    setTasksData(newTasksData);
  };

  const addTaskRow = () => {
    setTasksData([...tasksData, { ...DEFAULT_TASK }]);
  };

  const removeTaskRow = (idx: number) => {
    if (tasksData.length > 1) {
      setTasksData(tasksData.filter((_, i) => i !== idx));
    }
  };

  const startRecording = () => {
    transcriptRef.current = "";
    setTranscriptState("");
    setVoiceState('recording');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
    }
  };

  const processVoiceInput = async (inputTranscript: string) => {
    setVoiceState('processing');
    
    if (!inputTranscript.trim() && conversationHistory.length === 0) {
      setVoiceError("No speech detected. Please try again.");
      setVoiceState('error');
      return;
    }

    const newHistory = [...conversationHistory, { role: 'user', text: inputTranscript }];
    setConversationHistory(newHistory);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `You are NEXUS AI, a productivity assistant helping a user create tasks from voice input.
Current Date and Time: ${new Date().toLocaleString()}
Categories allowed: Work, Study, Health, Career, Personal, Side Project.
Priorities allowed: P1 (Critical), P2 (High), P3 (Medium), P4 (Low).

If the user's request is ambiguous or missing critical details (like what the task actually is), set 'needsConfirmation' to true and provide a 'clarificationMessage' asking for the missing details.
CRITICAL INSTRUCTION: If the user provides a large or complex task (e.g., "build a portfolio website", "write a research paper", "plan a vacation"), you MUST automatically break it down into smaller, actionable steps. Use the 'subtasks' array for this, or generate multiple separate tasks if they have different timelines.
If the request is clear enough, generate the tasks and set 'needsConfirmation' to false.`;

      const formattedContents = newHistory.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              needsConfirmation: { type: Type.BOOLEAN, description: "True if the request is ambiguous or missing details." },
              clarificationMessage: { type: Type.STRING, description: "A question asking the user for clarification if needsConfirmation is true." },
              tasks: {
                type: Type.ARRAY,
                description: "List of tasks to create. If the user asks to break down a project, generate multiple tasks with subtasks.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "A concise, actionable title for the task" },
                    description: { type: Type.STRING, description: "Optional description or context" },
                    date: { type: Type.STRING, description: "The due date and time, formatted like 'Apr 14, 2026 • 09:00 AM'. If not specified, use a reasonable default based on the current date." },
                    priority: { type: Type.STRING, description: "Priority level: 'P1', 'P2', 'P3', or 'P4'. Default to P3 if not specified." },
                    category: { type: Type.STRING, description: "One of the allowed categories. Default to 'Personal' if not specified." },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1-3 relevant short tags" },
                    subtasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of subtasks if the task is complex" }
                  },
                  required: ["title", "date", "priority", "category", "tags", "subtasks"]
                }
              }
            },
            required: ["needsConfirmation", "tasks"]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.needsConfirmation && parsed.clarificationMessage) {
          setClarificationMessage(parsed.clarificationMessage);
          setConversationHistory(prev => [...prev, { role: 'ai', text: parsed.clarificationMessage }]);
          setVoiceState('result'); // We use result state to show the clarification UI
        } else {
          setClarificationMessage("");
          setAiResult(parsed.tasks || []);
          setVoiceState('result');
        }
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("AI Parsing error:", error);
      setVoiceError("Failed to parse task details. Please try again.");
      setVoiceState('error');
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const finalTranscript = transcriptRef.current;
    await processVoiceInput(finalTranscript);
  };

  const resetVoice = () => {
    setVoiceState('idle');
    transcriptRef.current = "";
    setTranscriptState("");
    setAiResult(null);
    setVoiceError("");
    setClarificationMessage("");
    setClarificationInput("");
    setConversationHistory([]);
  };

  const handleSave = () => {
    if (activeTab === 'manual') {
      tasksData.forEach(task => {
        if (task.title.trim()) {
          if (onSave) onSave({ ...task, status: 'todo' });
        }
      });
    } else if (activeTab === 'voice' && aiResult) {
      aiResult.forEach((task: any) => {
        if (onSave) onSave({ ...task, status: 'todo' });
      });
    } else if (activeTab === 'scan') {
      if (onSave) onSave({
        title: "Scanned Task",
        priority: "P2",
        category: "General",
        status: 'todo'
      });
    }
    
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="fixed inset-0 bg-background z-[100] overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto p-6 md:p-12 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Create New Task</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex bg-surface p-1 rounded-2xl border border-white/8 mb-8">
          {(['manual', 'scan', 'voice'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-semibold transition-all capitalize",
                activeTab === tab ? "bg-electric-blue text-background" : "text-gray-muted hover:text-white"
              )}
            >
              {tab === 'manual' ? 'Manual' : tab === 'scan' ? 'AI Scan' : 'Voice'}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                {tasksData.map((task, idx) => (
                  <div key={idx} className="space-y-6 p-6 bg-surface/30 border border-white/5 rounded-3xl relative group/task">
                    {tasksData.length > 1 && (
                      <button 
                        onClick={() => removeTaskRow(idx)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/task:opacity-100 transition-opacity z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Task Title" 
                        value={task.title}
                        onChange={(e) => {
                          const newTasks = [...tasksData];
                          newTasks[idx].title = e.target.value;
                          setTasksData(newTasks);
                        }}
                        className="w-full bg-transparent border-b border-white/10 text-3xl font-bold py-4 focus:outline-none focus:border-electric-blue transition-colors placeholder:text-white/10"
                      />
                      <textarea 
                        placeholder="Description (optional)" 
                        rows={2}
                        value={task.description}
                        onChange={(e) => {
                          const newTasks = [...tasksData];
                          newTasks[idx].description = e.target.value;
                          setTasksData(newTasks);
                        }}
                        className="w-full bg-surface border border-white/8 rounded-2xl p-4 focus:outline-none focus:border-electric-blue/50 transition-colors resize-none"
                      />

                      {/* Subtasks */}
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-muted">Subtasks</label>
                        {task.subtasks?.map((st, stIdx) => (
                          <div key={stIdx} className="flex items-center gap-3 group/st">
                            <div className="w-4 h-4 rounded border border-white/20 flex-shrink-0" />
                            <input
                              type="text"
                              value={st}
                              placeholder="Subtask description..."
                              onChange={(e) => {
                                const newTasks = [...tasksData];
                                newTasks[idx].subtasks[stIdx] = e.target.value;
                                setTasksData(newTasks);
                              }}
                              className="flex-1 bg-transparent border-b border-white/10 py-1 text-sm focus:outline-none focus:border-electric-blue transition-colors"
                            />
                            <button
                              onClick={() => {
                                const newTasks = [...tasksData];
                                newTasks[idx].subtasks = newTasks[idx].subtasks.filter((_, i) => i !== stIdx);
                                setTasksData(newTasks);
                              }}
                              className="p-1 text-gray-muted hover:text-red transition-colors opacity-0 group-hover/st:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newTasks = [...tasksData];
                            if (!newTasks[idx].subtasks) newTasks[idx].subtasks = [];
                            newTasks[idx].subtasks.push('');
                            setTasksData(newTasks);
                          }}
                          className="text-xs text-electric-blue hover:underline flex items-center gap-1 py-1"
                        >
                          <Plus className="w-3 h-3" /> Add Subtask
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-muted">Due Date & Time</label>
                        <button className="w-full bg-surface border border-white/8 rounded-xl p-3 flex items-center gap-3 text-sm hover:border-white/20 transition-colors">
                          <Calendar className="w-4 h-4 text-electric-blue" />
                          <span>{task.date}</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-muted">Duration</label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-electric-blue absolute left-3 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            value={task.duration || ''}
                            onChange={(e) => {
                              const newTasks = [...tasksData];
                              newTasks[idx].duration = e.target.value;
                              setTasksData(newTasks);
                            }}
                            placeholder="e.g. 1h 30m"
                            className="w-full bg-surface border border-white/8 rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-electric-blue transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-muted">Priority</label>
                        <div className="flex gap-2">
                          {['P1', 'P2', 'P3', 'P4'].map((p) => (
                            <button 
                              key={p}
                              onClick={() => {
                                const newTasks = [...tasksData];
                                newTasks[idx].priority = p;
                                setTasksData(newTasks);
                              }}
                              className={cn(
                                "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                                task.priority === p ? (
                                  p === 'P1' ? "bg-p1 border-p1 text-white" :
                                  p === 'P2' ? "bg-p2 border-p2 text-white" :
                                  p === 'P3' ? "bg-p3 border-p3 text-white" :
                                  "bg-p4 border-p4 text-white"
                                ) : (
                                  p === 'P1' ? "border-p1/20 text-p1 hover:bg-p1/10" :
                                  p === 'P2' ? "border-p2/20 text-p2 hover:bg-p2/10" :
                                  p === 'P3' ? "border-p3/20 text-p3 hover:bg-p3/10" :
                                  "border-p4/20 text-p4 hover:bg-p4/10"
                                )
                              )}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recurring Section */}
                    <div className="space-y-4 p-4 bg-surface border border-white/8 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RefreshCw className={cn("w-4 h-4", task.isRecurring ? "text-electric-blue" : "text-gray-muted")} />
                          <span className="text-sm font-bold">Recurring Task</span>
                        </div>
                        <button 
                          onClick={() => {
                            const newTasks = [...tasksData];
                            newTasks[idx].isRecurring = !newTasks[idx].isRecurring;
                            setTasksData(newTasks);
                          }}
                          className={cn(
                            "w-10 h-5 rounded-full transition-colors relative",
                            task.isRecurring ? "bg-electric-blue" : "bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                            task.isRecurring ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {task.isRecurring && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex justify-between pt-2">
                              {days.map((day, i) => (
                                <button
                                  key={`${day}-${i}`}
                                  onClick={() => toggleDay(idx, day, i)}
                                  className={cn(
                                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                    task.recurringDays.includes(`${day}-${i}`) 
                                      ? "bg-electric-blue text-background" 
                                      : "bg-white/5 text-gray-muted hover:bg-white/10"
                                  )}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-muted">Category</label>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((cat) => (
                          <button 
                            key={cat}
                            onClick={() => {
                              const newTasks = [...tasksData];
                              newTasks[idx].category = cat;
                              setTasksData(newTasks);
                            }}
                            className={cn(
                              "whitespace-nowrap px-4 py-2 rounded-full border text-xs font-medium transition-all",
                              task.category === cat ? "border-electric-blue text-electric-blue bg-electric-blue/10" : "border-white/8 hover:border-electric-blue hover:text-electric-blue"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addTaskRow}
                  className="w-full py-6 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center gap-2 text-gray-muted hover:border-electric-blue/30 hover:text-electric-blue transition-all group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-bold uppercase tracking-widest text-xs">Add Another Task</span>
                </button>

                <Button 
                  onClick={() => setIsAiEnhancing(true)}
                  className="w-full py-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-electric-blue to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-2">
                    {isAiEnhancing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                    <span>🧠 Let AI Enhance All Tasks</span>
                  </div>
                </Button>
              </motion.div>
            )}

            {activeTab === 'scan' && (
              <motion.div
                key="scan"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="relative aspect-[4/3] bg-surface rounded-3xl border-2 border-white/8 overflow-hidden">
                  {/* Viewfinder simulation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-electric-blue/30 rounded-2xl relative">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-electric-blue rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-electric-blue rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-electric-blue rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-electric-blue rounded-br-lg" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-white/20" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <Button variant="secondary" className="w-full py-4">
                    <Upload className="w-5 h-5" /> Upload Image
                  </Button>
                  <p className="text-center text-xs text-gray-muted">
                    NEXUS AI will extract tasks, dates, and priorities from your images.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'voice' && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center justify-center py-8 space-y-8"
              >
                {voiceState === 'idle' && (
                  <div className="flex flex-col items-center space-y-8">
                    <button 
                      onClick={startRecording}
                      className="w-40 h-40 rounded-full bg-electric-blue text-background flex items-center justify-center shadow-[0_0_40px_rgba(0,191,255,0.3)] hover:scale-105 transition-transform"
                    >
                      <Mic className="w-16 h-16" />
                    </button>
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold">Tap and speak</h3>
                      <p className="text-gray-muted">Speak your task naturally, NEXUS will do the rest.</p>
                    </div>
                  </div>
                )}

                {voiceState === 'recording' && (
                  <div className="flex flex-col items-center space-y-12 w-full">
                    <div className="relative">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-red rounded-full"
                      />
                      <button 
                        onClick={stopRecording}
                        className="w-40 h-40 rounded-full bg-red text-white flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(255,69,58,0.3)]"
                      >
                        <Square className="w-12 h-12 fill-current" />
                      </button>
                    </div>
                    
                    <div className="w-full h-16 flex items-center justify-center gap-1.5">
                      {[...Array(24)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [10, Math.random() * 60 + 10, 10] }}
                          transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.03 }}
                          className="w-1.5 bg-red/60 rounded-full"
                        />
                      ))}
                    </div>

                    <div className="text-center space-y-4 w-full max-w-md">
                      <h3 className="text-2xl font-bold animate-pulse text-red">Listening...</h3>
                      <div className="bg-surface/50 border border-red/20 rounded-2xl p-6 min-h-[100px] flex items-center justify-center">
                        <p className="text-lg text-white font-medium italic">
                          {transcript || "Speak your task naturally..."}
                        </p>
                      </div>
                      <Button variant="ghost" onClick={stopRecording} className="text-red hover:bg-red/10">
                        Stop Recording
                      </Button>
                    </div>
                  </div>
                )}

                {voiceState === 'processing' && (
                  <div className="flex flex-col items-center space-y-6 py-12">
                    <div className="w-20 h-20 rounded-2xl bg-electric-blue/10 flex items-center justify-center border border-electric-blue/20">
                      <Loader2 className="w-10 h-10 text-electric-blue animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">NEXUS is thinking</h3>
                      <p className="text-gray-muted">Parsing your request into a structured task...</p>
                    </div>
                  </div>
                )}

                {voiceState === 'error' && (
                  <div className="flex flex-col items-center space-y-6 py-12">
                    <div className="w-20 h-20 rounded-2xl bg-red/10 flex items-center justify-center border border-red/20">
                      <X className="w-10 h-10 text-red" />
                    </div>
                    <div className="text-center space-y-2 max-w-md">
                      <h3 className="text-xl font-bold text-red">Microphone Error</h3>
                      <p className="text-gray-muted">{voiceError}</p>
                    </div>
                    <Button variant="secondary" onClick={resetVoice} className="gap-2">
                      <RotateCcw className="w-4 h-4" /> Try Again
                    </Button>
                  </div>
                )}

                {voiceState === 'result' && clarificationMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full space-y-6"
                  >
                    <div className="flex items-start gap-4 bg-electric-blue/10 border border-electric-blue/20 rounded-2xl p-6">
                      <div className="w-10 h-10 rounded-xl bg-electric-blue/20 flex items-center justify-center shrink-0">
                        <Brain className="w-5 h-5 text-electric-blue" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-electric-blue">Clarification Needed</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">{clarificationMessage}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={clarificationInput}
                          onChange={(e) => setClarificationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && clarificationInput.trim()) {
                              processVoiceInput(clarificationInput);
                              setClarificationInput("");
                            }
                          }}
                          placeholder="Type your reply or use the microphone..." 
                          className="w-full bg-surface border border-white/8 rounded-xl py-4 pl-4 pr-12 focus:outline-none focus:border-electric-blue/50 transition-colors"
                        />
                        <Button 
                          onClick={() => {
                            if (clarificationInput.trim()) {
                              processVoiceInput(clarificationInput);
                              setClarificationInput("");
                            }
                          }}
                          disabled={!clarificationInput.trim()}
                          className="absolute right-2 top-2 bottom-2 w-10 p-0 rounded-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <div className="h-[1px] flex-1 bg-white/10" />
                        <span className="text-xs text-gray-muted uppercase tracking-widest font-bold">OR</span>
                        <div className="h-[1px] flex-1 bg-white/10" />
                      </div>

                      <Button 
                        variant="secondary" 
                        onClick={startRecording} 
                        className="w-full py-4 gap-2 border-electric-blue/30 hover:bg-electric-blue/10"
                      >
                        <Mic className="w-5 h-5 text-electric-blue" /> Reply with Voice
                      </Button>
                    </div>
                  </motion.div>
                )}

                {voiceState === 'result' && !clarificationMessage && aiResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-muted">Transcript</label>
                      <div className="bg-surface border border-white/8 rounded-2xl p-4 text-sm italic text-gray-muted">
                        "{transcript}"
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-muted">AI Generated Tasks ({aiResult.length})</label>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                        {aiResult.map((task: any, i: number) => (
                          <GlassCard key={i} className="p-5 border-electric-blue/30 bg-electric-blue/5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-bold text-electric-blue mb-1">{task.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-muted">
                                  <Calendar className="w-3 h-3" /> {task.date}
                                </div>
                              </div>
                              <Badge priority={task.priority}>{task.priority}</Badge>
                            </div>
                            {task.description && <p className="text-sm text-gray-muted mb-3">{task.description}</p>}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="mb-3 space-y-1.5">
                                {task.subtasks.map((st: string, j: number) => (
                                  <div key={j} className="flex items-start gap-2 text-sm text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-electric-blue/50 mt-1.5 shrink-0" />
                                    <span>{st}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                              <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-wider">{task.category}</span>
                              {task.tags?.map((tag: string) => (
                                <span key={tag} className="px-2 py-1 rounded-lg bg-white/5 text-[10px] text-gray-muted">#{tag}</span>
                              ))}
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={resetVoice} className="flex-1 py-4 gap-2">
                        <RotateCcw className="w-4 h-4" /> Re-record
                      </Button>
                      <Button variant="secondary" onClick={() => {
                        setTasksData(aiResult.map((t: any) => ({ ...DEFAULT_TASK, ...t })));
                        setActiveTab('manual');
                      }} className="flex-1 py-4 gap-2">
                        <Edit2 className="w-4 h-4" /> Review & Edit
                      </Button>
                      <Button onClick={() => {
                        aiResult.forEach((t: any) => {
                          if (onSave) onSave({ ...t, status: 'todo' });
                        });
                        onClose();
                      }} className="flex-1 py-4 gap-2 shadow-[0_0_20px_rgba(0,191,255,0.3)]">
                        <Check className="w-4 h-4" /> Confirm & Save All
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Bar */}
        <footer className="mt-8 flex gap-4 pt-8 border-t border-white/8">
          <Button variant="ghost" onClick={onClose} className="flex-1 py-4">Cancel</Button>
          <Button onClick={handleSave} className="flex-2 py-4 shadow-[0_0_20px_rgba(0,191,255,0.3)]">Save Task</Button>
        </footer>
      </div>
    </motion.div>
  );
}
