import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Search, GripVertical, CheckCircle2, Circle, Trash2,
  ChevronDown, ChevronUp, Tag, Calendar, Flag, Mic, MicOff,
  Sparkles, RefreshCw, LayoutGrid, List, X, Loader2,
  BrainCircuit,
} from 'lucide-react';
import {
  useTasks, useCreateTask, useUpdateTask, useUpdateTaskStatus,
  useDeleteTask, useReorderTasks,
} from '../hooks/useTasks';
import type { Task, TaskStatus, TaskPriority } from '../stores/task.store';
import { useTaskStore } from '../stores/task.store';
import { Modal } from './ui/Modal';
import { parseVoiceToTasks, generateTasksFromPrompt, type GeminiTask } from '../services/gemini';

/* ─── Constants ─────────────────────────────────────────────── */
const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: '#22c55e',
  MEDIUM: '#8b5cf6',
  HIGH: '#f97316',
  URGENT: '#f43f5e',
};

const STATUS_BG: Record<TaskStatus, string> = {
  TODO: 'rgba(255,255,255,0.08)',
  IN_PROGRESS: 'rgba(59,130,246,0.15)',
  DONE: 'rgba(34,197,94,0.12)',
  CANCELLED: 'rgba(255,255,255,0.04)',
};

const RECURRING_OPTIONS = [
  { value: '', label: 'Not recurring' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

/* ─── SpeechRecognition shim ─────────────────────────────────── */
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

/* ─── Utility styles ─────────────────────────────────────────── */
function glassInput(extra?: object) {
  return {
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.9)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    ...extra,
  };
}

function label(text: string) {
  return (
    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
      {text}
    </label>
  );
}

/* ─── Priority dot ───────────────────────────────────────────── */
function PriorityDot({ priority }: { priority: TaskPriority }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: PRIORITY_COLOR[priority],
      boxShadow: `0 0 6px ${PRIORITY_COLOR[priority]}88`,
      flexShrink: 0,
    }} />
  );
}

/* ─── Status pill ────────────────────────────────────────────── */
function StatusBadge({ status }: { status: TaskStatus }) {
  const labels: Record<TaskStatus, string> = {
    TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done', CANCELLED: 'Cancelled',
  };
  const colors: Record<TaskStatus, string> = {
    TODO: 'rgba(255,255,255,0.6)',
    IN_PROGRESS: '#60a5fa',
    DONE: '#4ade80',
    CANCELLED: 'rgba(255,255,255,0.3)',
  };
  return (
    <span style={{
      fontSize: '0.6875rem',
      fontWeight: 600,
      padding: '0.125rem 0.5rem',
      borderRadius: '999px',
      background: STATUS_BG[status],
      color: colors[status],
      border: `1px solid ${colors[status]}33`,
      flexShrink: 0,
    }}>
      {labels[status]}
    </span>
  );
}

/* ─── Sortable Task Row ──────────────────────────────────────── */
function SortableTask({
  task, onEdit, onDelete, onToggle,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (t: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? 'all 0.15s ease',
        opacity: isDragging ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        background: hovered ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)'}`,
        borderLeft: `3px solid ${task.status === 'DONE' ? '#4ade80' : PRIORITY_COLOR[task.priority]}`,
        marginBottom: '0.375rem',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle */}
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', color: 'rgba(255,255,255,0.2)', flexShrink: 0, display: 'flex' }}
      >
        <GripVertical size={15} />
      </span>

      {/* Toggle */}
      <button
        onClick={() => onToggle(task)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          color: task.status === 'DONE' ? '#4ade80' : 'rgba(255,255,255,0.3)',
          transition: 'color 0.15s',
          padding: 0,
        }}
      >
        {task.status === 'DONE' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PriorityDot priority={task.priority} />
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: task.status === 'DONE' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)',
            textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {task.title}
          </p>
          {task.isRecurring && (
            <span title="Recurring task">
              <RefreshCw size={11} style={{ color: '#8b5cf6', flexShrink: 0 }} />
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
          {task.dueDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)' }}>
              <Calendar size={10} />
              {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{
              fontSize: '0.625rem',
              fontWeight: 600,
              padding: '0.0625rem 0.375rem',
              borderRadius: '999px',
              background: 'rgba(139,92,246,0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(139,92,246,0.2)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Status badge */}
      <StatusBadge status={task.status} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.125rem', flexShrink: 0 }}>
        <button
          onClick={() => onEdit(task)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.25)',
            display: 'flex',
            padding: '0.25rem',
            borderRadius: '0.375rem',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#a78bfa')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
        >
          <Flag size={13} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.25)',
            display: 'flex',
            padding: '0.25rem',
            borderRadius: '0.375rem',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Board Column ───────────────────────────────────────────── */
function BoardColumn({
  title, tasks, onEdit, onDelete, onToggle, color,
}: {
  title: string;
  tasks: Task[];
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (t: Task) => void;
  color: string;
}) {
  return (
    <div style={{
      flex: 1,
      minWidth: 240,
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderTop: `3px solid ${color}`,
      borderRadius: '0.875rem',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '0.75rem 1rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{title}</span>
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          padding: '0.0625rem 0.4rem',
          borderRadius: '999px',
          background: `${color}22`,
          color,
        }}>
          {tasks.length}
        </span>
      </div>
      <div style={{ padding: '0 0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minHeight: 80 }}>
        {tasks.map((task) => (
          <SortableTask key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
        ))}
        {tasks.length === 0 && (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
            Empty
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Task Form ──────────────────────────────────────────────── */
interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string;
  isRecurring: boolean;
  recurringPattern: string;
}

const DEFAULT_FORM: TaskFormData = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  tags: '',
  isRecurring: false,
  recurringPattern: '',
};

/* ─── AI / Voice creation panel ─────────────────────────────── */
function AIVoicePanel({
  onTasksGenerated,
}: {
  onTasksGenerated: (tasks: GeminiTask[]) => void;
}) {
  const [tab, setTab] = useState<'ai' | 'voice'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  function startListening() {
    if (!SpeechRecognition) { setError('Speech recognition not supported in this browser.'); return; }
    const r = new SpeechRecognition();
    r.continuous = false;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onstart = () => setIsListening(true);
    r.onend = () => setIsListening(false);
    r.onerror = (e: any) => { setIsListening(false); setError(`Voice error: ${e.error}`); };
    r.onresult = (e: any) => {
      setTranscript(
        Array.from(e.results as SpeechRecognitionResultList)
          .map((r: any) => r[0].transcript)
          .join(' '),
      );
    };
    recognitionRef.current = r;
    r.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  async function processVoice() {
    if (!transcript.trim()) return;
    setIsProcessing(true); setError('');
    try {
      const tasks = await parseVoiceToTasks(transcript);
      onTasksGenerated(tasks);
      setTranscript('');
    } catch (e: any) { setError(e.message); }
    finally { setIsProcessing(false); }
  }

  async function processAI() {
    if (!aiPrompt.trim()) return;
    setIsProcessing(true); setError('');
    try {
      const tasks = await generateTasksFromPrompt(aiPrompt);
      onTasksGenerated(tasks);
      setAiPrompt('');
    } catch (e: any) { setError(e.message); }
    finally { setIsProcessing(false); }
  }

  return (
    <div style={{
      background: 'rgba(139,92,246,0.05)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: '0.875rem',
      padding: '1rem 1.25rem',
      marginBottom: '1rem',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
        {[
          { id: 'ai', icon: <Sparkles size={13} />, label: 'AI Generate' },
          { id: 'voice', icon: <Mic size={13} />, label: 'Voice Input' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'ai' | 'voice')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              border: `1px solid ${tab === t.id ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: tab === t.id ? 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(59,130,246,0.3))' : 'rgba(255,255,255,0.04)',
              color: tab === t.id ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* AI tab */}
      {tab === 'ai' && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && processAI()}
            placeholder="Describe your goals… AI creates the tasks"
            style={glassInput({ flex: 1 })}
            autoFocus
          />
          <button
            onClick={processAI}
            disabled={isProcessing || !aiPrompt.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: isProcessing || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              opacity: !aiPrompt.trim() ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {isProcessing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
            Generate
          </button>
        </div>
      )}

      {/* Voice tab */}
      {tab === 'voice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            Speak naturally — say multiple tasks at once. AI will parse and structure them.
          </p>
          {transcript && (
            <div style={{
              padding: '0.5rem 0.75rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.8)',
            }}>
              {transcript}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8125rem',
                background: isListening
                  ? 'linear-gradient(135deg, #f43f5e, #f97316)'
                  : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                color: '#fff',
              }}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              {isListening ? 'Stop Recording' : 'Start Recording'}
            </button>
            {transcript && !isListening && (
              <button
                onClick={processVoice}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(139,92,246,0.3)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  background: 'rgba(139,92,246,0.15)',
                  color: '#a78bfa',
                }}
              >
                {isProcessing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <BrainCircuit size={14} />}
                Parse Tasks
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#f43f5e' }}>{error}</p>
      )}
    </div>
  );
}

/* ─── Main Tasks Component ───────────────────────────────────── */
export default function Tasks() {
  const { filters, setFilters, viewMode, setViewMode } = useTaskStore();
  const { data: tasks, isLoading } = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const reorderTasks = useReorderTasks();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormData>(DEFAULT_FORM);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [pendingBulk, setPendingBulk] = useState<GeminiTask[]>([]);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const allTasks = tasks ?? [];
  const filtered = allTasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  const todoCount = allTasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = allTasks.filter((t) => t.status === 'DONE').length;

  /* ── Modal helpers ── */
  function openCreate() {
    setEditingTask(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      tags: task.tags.join(', '),
      isRecurring: task.isRecurring ?? false,
      recurringPattern: '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const payload = {
      title: form.title.trim(),
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      isRecurring: form.isRecurring,
    };
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    setModalOpen(false);
  }

  async function handleToggle(task: Task) {
    const newStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    await updateStatus.mutateAsync({ id: task.id, status: newStatus });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !tasks) return;
    const oldIdx = tasks.findIndex((t) => t.id === active.id);
    const newIdx = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIdx, newIdx);
    reorderTasks.mutate(reordered.map((t) => t.id));
  }

  /* ── Bulk save from AI/voice ── */
  async function saveBulkTasks() {
    setIsSavingBulk(true);
    try {
      await Promise.all(
        pendingBulk.map((t) =>
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
      setPendingBulk([]);
      setShowAIPanel(false);
    } finally {
      setIsSavingBulk(false);
    }
  }

  function addToPending(newTasks: GeminiTask[]) {
    setPendingBulk((prev) => [...prev, ...newTasks]);
  }

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: '5rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            margin: 0,
            background: 'linear-gradient(135deg, #c4b5fd, #93c5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Tasks
          </h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem' }}>
            {[
              { label: 'To Do', value: todoCount, color: 'rgba(255,255,255,0.5)' },
              { label: 'In Progress', value: inProgressCount, color: '#60a5fa' },
              { label: 'Done', value: doneCount, color: '#4ade80' },
            ].map((s) => (
              <span key={s.label} style={{ fontSize: '0.8125rem', color: s.color }}>
                <strong style={{ fontWeight: 700 }}>{s.value}</strong> {s.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* View mode toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.5rem',
            padding: '0.125rem',
            gap: '0.125rem',
          }}>
            {[
              { id: 'list', icon: <List size={15} /> },
              { id: 'board', icon: <LayoutGrid size={15} /> },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as 'list' | 'board')}
                style={{
                  background: viewMode === v.id ? 'rgba(139,92,246,0.3)' : 'none',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.375rem',
                  cursor: 'pointer',
                  color: viewMode === v.id ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                  display: 'flex',
                }}
              >
                {v.icon}
              </button>
            ))}
          </div>

          {/* AI panel toggle */}
          <button
            onClick={() => setShowAIPanel((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.875rem',
              borderRadius: '0.625rem',
              border: `1px solid ${showAIPanel ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
              background: showAIPanel ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: showAIPanel ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.15s',
            }}
          >
            <BrainCircuit size={15} />
            AI / Voice
          </button>

          {/* New Task */}
          <button
            onClick={openCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.625rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
            }}
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* ── AI / Voice Panel ── */}
      <AnimatePresence>
        {showAIPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <AIVoicePanel onTasksGenerated={addToPending} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pending Bulk Tasks ── */}
      <AnimatePresence>
        {pendingBulk.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '0.875rem',
              padding: '0.875rem 1.25rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#c4b5fd' }}>
                ✦ {pendingBulk.length} tasks ready to add
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPendingBulk([])}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  Discard
                </button>
                <button
                  onClick={saveBulkTasks}
                  disabled={isSavingBulk}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.3rem 0.875rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: isSavingBulk ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    color: '#fff',
                  }}
                >
                  {isSavingBulk ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={13} />}
                  Add All
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {pendingBulk.map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.375rem 0.625rem',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    color: 'rgba(255,255,255,0.8)',
                    borderLeft: `3px solid ${PRIORITY_COLOR[t.priority]}`,
                  }}
                >
                  <PriorityDot priority={t.priority} />
                  <span style={{ flex: 1 }}>{t.title}</span>
                  {t.isRecurring && <RefreshCw size={11} style={{ color: '#8b5cf6' }} />}
                  <button
                    onClick={() => setPendingBulk((prev) => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 0 }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search & Filters ── */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.875rem',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
            <input
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={glassInput({ paddingLeft: '2rem' })}
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: `1px solid ${showFilters ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: showFilters ? 'rgba(139,92,246,0.1)' : 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              color: showFilters ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
            }}
          >
            <Flag size={13} />
            Filters
            {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  value={filters.status ?? ''}
                  onChange={(e) => setFilters({ status: e.target.value as TaskStatus || undefined })}
                  style={glassInput({ width: 'auto', minWidth: 140, cursor: 'pointer' })}
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select
                  value={filters.priority ?? ''}
                  onChange={(e) => setFilters({ priority: e.target.value as TaskPriority || undefined })}
                  style={glassInput({ width: 'auto', minWidth: 140, cursor: 'pointer' })}
                >
                  <option value="">All Priorities</option>
                  {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {(filters.status || filters.priority) && (
                  <button
                    onClick={() => setFilters({ status: undefined, priority: undefined })}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Task List / Board ── */}
      {isLoading ? (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: 56, borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '1rem',
        }}>
          <CheckCircle2 size={48} style={{ color: 'rgba(139,92,246,0.4)', marginBottom: '1rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.9375rem' }}>
            {search ? `No tasks match "${search}"` : 'No tasks yet. Use AI, voice, or create manually!'}
          </p>
        </div>
      ) : viewMode === 'board' ? (
        /* Board view */
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {([
            { status: 'TODO', label: 'To Do', color: 'rgba(255,255,255,0.5)' },
            { status: 'IN_PROGRESS', label: 'In Progress', color: '#60a5fa' },
            { status: 'DONE', label: 'Done', color: '#4ade80' },
            { status: 'CANCELLED', label: 'Cancelled', color: 'rgba(255,255,255,0.3)' },
          ] as const).map((col) => (
            <BoardColumn
              key={col.status}
              title={col.label}
              tasks={filtered.filter((t) => t.status === col.status)}
              onEdit={openEdit}
              onDelete={(id) => deleteTask.mutate(id)}
              onToggle={handleToggle}
              color={col.color}
            />
          ))}
        </div>
      ) : (
        /* List view with DnD */
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {filtered.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  onEdit={openEdit}
                  onDelete={(id) => deleteTask.mutate(id)}
                  onToggle={handleToggle}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      )}

      {/* ── Create/Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Title */}
          <div>
            {label('Title *')}
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Task title"
              style={glassInput()}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            {label('Description')}
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional notes"
              rows={2}
              style={{ ...glassInput(), resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Priority + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <div>
              {label('Priority')}
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
                style={glassInput({ cursor: 'pointer' })}
              >
                {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              {label('Status')}
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
                style={glassInput({ cursor: 'pointer' })}
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Due Date + Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <div>
              {label('Due Date')}
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                style={glassInput({ cursor: 'pointer', colorScheme: 'dark' })}
              />
            </div>
            <div>
              {label('Tags')}
              <div style={{ position: 'relative' }}>
                <Tag size={13} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="work, urgent"
                  style={glassInput({ paddingLeft: '2rem' })}
                />
              </div>
            </div>
          </div>

          {/* Recurring */}
          <div>
            {label('Recurring')}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                <div
                  onClick={() => setForm((f) => ({ ...f, isRecurring: !f.isRecurring }))}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: '999px',
                    background: form.isRecurring ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    left: form.isRecurring ? 19 : 3,
                    transition: 'left 0.2s',
                  }} />
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)' }}>
                  Recurring task
                </span>
              </label>
              {form.isRecurring && (
                <select
                  value={form.recurringPattern}
                  onChange={(e) => setForm((f) => ({ ...f, recurringPattern: e.target.value }))}
                  style={glassInput({ width: 'auto', cursor: 'pointer' })}
                >
                  {RECURRING_OPTIONS.filter((o) => o.value !== '').map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.625rem',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.title.trim() || createTask.isPending || updateTask.isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.25rem',
                borderRadius: '0.625rem',
                border: 'none',
                cursor: !form.title.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '0.875rem',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                color: '#fff',
                opacity: !form.title.trim() ? 0.5 : 1,
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
              }}
            >
              {(createTask.isPending || updateTask.isPending) && (
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
              )}
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
