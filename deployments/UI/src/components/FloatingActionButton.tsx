import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Mic, BrainCircuit, X, Sparkles, Zap,
  MicOff, Loader2, CheckCircle2, PenLine,
} from 'lucide-react';
import { useCreateTask } from '../hooks/useTasks';
import { parseVoiceToTasks, generateTasksFromPrompt, type GeminiTask } from '../services/gemini';

/* ─── Types ─────────────────────────────────────────────────── */
interface FABProps {
  onOpenAI?: () => void; // navigate to /ai page
}

type FABMode = 'idle' | 'menu' | 'voice' | 'ai-prompt' | 'manual';

/* ─── SpeechRecognition shim ─────────────────────────────────── */
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

/* ─── Tiny TaskPreviewPill ───────────────────────────────────── */
function TaskPill({
  task,
  onRemove,
}: {
  task: GeminiTask;
  onRemove: () => void;
}) {
  const priorityColors: Record<string, string> = {
    URGENT: '#f43f5e',
    HIGH: '#f97316',
    MEDIUM: '#8b5cf6',
    LOW: '#22c55e',
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderLeft: `3px solid ${priorityColors[task.priority] ?? '#8b5cf6'}`,
        borderRadius: '0.5rem',
        fontSize: '0.8125rem',
        color: 'rgba(255,255,255,0.9)',
      }}
    >
      <span style={{ flex: 1 }}>{task.title}</span>
      <span
        style={{
          fontSize: '0.6875rem',
          padding: '0.125rem 0.375rem',
          borderRadius: '999px',
          background: `${priorityColors[task.priority]}22`,
          color: priorityColors[task.priority],
          fontWeight: 600,
        }}
      >
        {task.priority}
      </span>
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.4)',
          display: 'flex',
          padding: 0,
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

/* ─── Main FAB ───────────────────────────────────────────────── */
export default function FloatingActionButton({ onOpenAI }: FABProps) {
  const [mode, setMode] = useState<FABMode>('idle');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [pendingTasks, setPendingTasks] = useState<GeminiTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [manualTitle, setManualTitle] = useState('');
  const [manualPriority, setManualPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [manualDueDate, setManualDueDate] = useState('');
  const [manualTags, setManualTags] = useState('');

  const recognitionRef = useRef<any>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);
  const manualTitleRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask();

  /* focus inputs when mode switches */
  useEffect(() => {
    if (mode === 'ai-prompt') setTimeout(() => aiInputRef.current?.focus(), 120);
    if (mode === 'manual') setTimeout(() => manualTitleRef.current?.focus(), 120);
  }, [mode]);

  /* cleanup on unmount */
  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  /* ── voice ── */
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      setIsListening(false);
      setError(`Voice error: ${e.error}`);
    };
    recognition.onresult = (e: any) => {
      const result = Array.from(e.results as SpeechRecognitionResultList)
        .map((r: any) => r[0].transcript)
        .join(' ');
      setTranscript(result);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  /* ── parse voice transcript via Gemini ── */
  const handleVoiceProcess = useCallback(async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setError('');
    try {
      const tasks = await parseVoiceToTasks(transcript);
      setPendingTasks((prev) => [...prev, ...tasks]);
      setTranscript('');
    } catch (e: any) {
      setError(e.message ?? 'Failed to parse voice input');
    } finally {
      setIsProcessing(false);
    }
  }, [transcript]);

  /* ── generate tasks from AI prompt ── */
  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setIsProcessing(true);
    setError('');
    try {
      const tasks = await generateTasksFromPrompt(aiPrompt);
      setPendingTasks((prev) => [...prev, ...tasks]);
      setAiPrompt('');
      setMode('menu'); // go back to menu to show tasks
    } catch (e: any) {
      setError(e.message ?? 'Failed to generate tasks');
    } finally {
      setIsProcessing(false);
    }
  }, [aiPrompt]);

  /* ── save all pending tasks ── */
  const handleSaveAll = useCallback(async () => {
    if (pendingTasks.length === 0) return;
    setIsProcessing(true);
    try {
      await Promise.all(
        pendingTasks.map((t) =>
          createTask.mutateAsync({
            title: t.title,
            description: t.description,
            priority: t.priority,
            tags: t.tags,
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : undefined,
            isRecurring: t.isRecurring ?? false,
            status: 'TODO',
          }),
        ),
      );
      setPendingTasks([]);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setMode('idle');
      }, 1500);
    } catch (e: any) {
      setError(e.message ?? 'Failed to save tasks');
    } finally {
      setIsProcessing(false);
    }
  }, [pendingTasks, createTask]);

  /* ── manually create a single task ── */
  const handleManualCreate = useCallback(async () => {
    if (!manualTitle.trim()) return;
    setIsProcessing(true);
    setError('');
    try {
      await createTask.mutateAsync({
        title: manualTitle.trim(),
        priority: manualPriority,
        dueDate: manualDueDate ? new Date(manualDueDate).toISOString() : undefined,
        tags: manualTags ? manualTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        status: 'TODO',
      });
      setManualTitle('');
      setManualPriority('MEDIUM');
      setManualDueDate('');
      setManualTags('');
      setSaved(true);
      setTimeout(() => { setSaved(false); setMode('idle'); }, 1200);
    } catch (e: any) {
      setError(e.message ?? 'Failed to create task');
    } finally {
      setIsProcessing(false);
    }
  }, [manualTitle, manualPriority, manualDueDate, manualTags, createTask]);

  function close() {
    stopListening();
    setMode('idle');
    setTranscript('');
    setAiPrompt('');
    setManualTitle('');
    setManualPriority('MEDIUM');
    setManualDueDate('');
    setManualTags('');
    setError('');
    setPendingTasks([]);
    setSaved(false);
  }

  /* ─── Render ─────────────────────────────────────────────── */
  const showPanel = mode === 'menu' || mode === 'voice' || mode === 'ai-prompt' || mode === 'manual';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.75rem',
      }}
    >
      {/* ── Expanded Panel ── */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              width: 340,
              background: 'rgba(10, 12, 24, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '1.25rem',
              boxShadow: '0 0 40px rgba(139,92,246,0.2), 0 24px 48px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1rem 1.25rem 0.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Zap size={16} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', flex: 1 }}>
                Quick Create
              </span>
              <button
                onClick={close}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)',
                  display: 'flex',
                  padding: '0.125rem',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div style={{ display: 'flex', padding: '0.75rem 1.25rem 0', gap: '0.5rem' }}>
              {[
                { id: 'manual', icon: <PenLine size={14} />, label: 'Manual' },
                { id: 'voice', icon: <Mic size={14} />, label: 'Voice' },
                { id: 'ai-prompt', icon: <Sparkles size={14} />, label: 'AI' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id as FABMode)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    transition: 'all 0.15s',
                    background: mode === tab.id
                      ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))'
                      : 'rgba(255,255,255,0.04)',
                    color: mode === tab.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                    borderBottom: mode === tab.id ? '2px solid #8b5cf6' : '2px solid transparent',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '0.875rem 1.25rem 1rem' }}>

              {/* Manual Mode */}
              {mode === 'manual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {/* Title */}
                  <input
                    ref={manualTitleRef}
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualCreate()}
                    placeholder="Task title…"
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '0.625rem',
                      fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.9)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {/* Priority */}
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => {
                      const colors: Record<string, string> = { LOW: '#22c55e', MEDIUM: '#8b5cf6', HIGH: '#f97316', URGENT: '#f43f5e' };
                      return (
                        <button
                          key={p}
                          onClick={() => setManualPriority(p)}
                          style={{
                            flex: 1,
                            padding: '0.375rem 0.25rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${manualPriority === p ? colors[p] : 'rgba(255,255,255,0.1)'}`,
                            background: manualPriority === p ? `${colors[p]}22` : 'rgba(255,255,255,0.03)',
                            color: manualPriority === p ? colors[p] : 'rgba(255,255,255,0.4)',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  {/* Due date + Tags row */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="date"
                      value={manualDueDate}
                      onChange={(e) => setManualDueDate(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '0.625rem',
                        fontSize: '0.8125rem',
                        color: 'rgba(255,255,255,0.7)',
                        outline: 'none',
                        colorScheme: 'dark',
                      }}
                    />
                    <input
                      value={manualTags}
                      onChange={(e) => setManualTags(e.target.value)}
                      placeholder="tags, comma-separated"
                      style={{
                        flex: 1.4,
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '0.625rem',
                        fontSize: '0.8125rem',
                        color: 'rgba(255,255,255,0.7)',
                        outline: 'none',
                      }}
                    />
                  </div>
                  {/* Create button */}
                  <button
                    onClick={handleManualCreate}
                    disabled={isProcessing || !manualTitle.trim()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem',
                      borderRadius: '0.625rem',
                      border: 'none',
                      cursor: isProcessing || !manualTitle.trim() ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      background: saved
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                      color: '#fff',
                      opacity: !manualTitle.trim() ? 0.5 : 1,
                      boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isProcessing
                      ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      : saved
                      ? <CheckCircle2 size={15} />
                      : <Plus size={15} />}
                    {saved ? 'Task Created!' : 'Create Task'}
                  </button>
                </div>
              )}

              {/* Voice Mode */}
              {mode === 'voice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                    Speak naturally — e.g. "Buy groceries tomorrow, call the doctor on Friday urgent, and review the quarterly report high priority"
                  </p>
                  <div
                    style={{
                      minHeight: 60,
                      padding: '0.625rem 0.875rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.625rem',
                      fontSize: '0.875rem',
                      color: transcript ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                      lineHeight: 1.5,
                    }}
                  >
                    {transcript || 'Your speech will appear here…'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={isListening ? stopListening : startListening}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem',
                        borderRadius: '0.625rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        background: isListening
                          ? 'linear-gradient(135deg, #f43f5e, #f97316)'
                          : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        color: '#fff',
                        animation: isListening ? 'pulse 1.5s infinite' : 'none',
                      }}
                    >
                      {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                      {isListening ? 'Stop' : 'Start Recording'}
                    </button>
                    {transcript && !isListening && (
                      <button
                        onClick={handleVoiceProcess}
                        disabled={isProcessing}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.375rem',
                          padding: '0.625rem 0.875rem',
                          borderRadius: '0.625rem',
                          border: '1px solid rgba(139,92,246,0.3)',
                          cursor: isProcessing ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          background: 'rgba(139,92,246,0.2)',
                          color: '#a78bfa',
                          opacity: isProcessing ? 0.7 : 1,
                        }}
                      >
                        {isProcessing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <BrainCircuit size={14} />}
                        Parse
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* AI Prompt Mode */}
              {mode === 'ai-prompt' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                    Describe your goals and AI will generate a todo list — "Plan my week for the product launch"
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      ref={aiInputRef}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                      placeholder="What do you want to accomplish?"
                      style={{
                        flex: 1,
                        padding: '0.625rem 0.875rem',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '0.625rem',
                        fontSize: '0.875rem',
                        color: 'rgba(255,255,255,0.9)',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={handleAIGenerate}
                      disabled={isProcessing || !aiPrompt.trim()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.625rem 0.875rem',
                        borderRadius: '0.625rem',
                        border: 'none',
                        cursor: isProcessing || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        color: '#fff',
                        opacity: !aiPrompt.trim() ? 0.5 : 1,
                      }}
                    >
                      {isProcessing
                        ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Sparkles size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(244,63,94,0.12)',
                  border: '1px solid rgba(244,63,94,0.3)',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#f43f5e',
                  marginTop: '0.5rem',
                }}>
                  {error}
                </div>
              )}

              {/* Pending tasks preview */}
              <AnimatePresence>
                {pendingTasks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.75rem' }}
                  >
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                      {pendingTasks.length} task{pendingTasks.length > 1 ? 's' : ''} ready to save
                    </p>
                    <AnimatePresence>
                      {pendingTasks.map((task, i) => (
                        <TaskPill
                          key={i}
                          task={task}
                          onRemove={() => setPendingTasks((prev) => prev.filter((_, j) => j !== i))}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer actions */}
            {pendingTasks.length > 0 && (
              <div style={{
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                gap: '0.5rem',
              }}>
                <button
                  onClick={() => setPendingTasks([])}
                  style={{
                    flex: 1,
                    padding: '0.625rem',
                    borderRadius: '0.625rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={isProcessing}
                  style={{
                    flex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem',
                    borderRadius: '0.625rem',
                    border: 'none',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    background: saved
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
                  }}
                >
                  {isProcessing ? (
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : saved ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Plus size={15} />
                  )}
                  {saved ? 'Saved!' : `Save ${pendingTasks.length} Task${pendingTasks.length > 1 ? 's' : ''}`}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu items (when mode === 'menu', show quick-action buttons above FAB) */}
      <AnimatePresence>
        {mode === 'idle' && (
          <>
            {/* AI button */}
            <motion.button
              key="ai-btn"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 0, y: 10, scale: 0.8 }} // hidden — integrated into panel
              exit={{ opacity: 0 }}
              onClick={() => onOpenAI?.()}
              style={{ display: 'none' }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Main FAB Button ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMode(mode === 'idle' ? 'manual' : 'idle')}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: mode !== 'idle'
            ? 'linear-gradient(135deg, #f43f5e, #f97316)'
            : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: mode !== 'idle'
            ? '0 0 0 4px rgba(244,63,94,0.2), 0 8px 24px rgba(244,63,94,0.4)'
            : '0 0 0 4px rgba(139,92,246,0.2), 0 8px 24px rgba(139,92,246,0.4)',
          transition: 'background 0.3s, box-shadow 0.3s',
          position: 'relative',
        }}
        aria-label={mode !== 'idle' ? 'Close' : 'Quick actions'}
      >
        <motion.div
          animate={{ rotate: mode !== 'idle' ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus size={24} />
        </motion.div>

        {/* Pulse ring when listening */}
        {isListening && (
          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(244,63,94,0.4)',
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.button>
    </div>
  );
}
