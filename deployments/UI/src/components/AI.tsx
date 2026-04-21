import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Sparkles, BrainCircuit, Zap, ListTodo, TrendingUp,
  RefreshCw, Loader2, User, Bot, Plus,
} from 'lucide-react';
import { getAIInsight, generateTasksFromPrompt, type GeminiTask } from '../services/gemini';
import { useCreateTask } from '../hooks/useTasks';
import { useTasks } from '../hooks/useTasks';
import { useAuthStore } from '../stores/auth.store';
import type { TaskPriority } from '../stores/task.store';

/* ─── Types ─────────────────────────────────────────────────── */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tasks?: GeminiTask[];
  timestamp: Date;
}

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: '#22c55e',
  MEDIUM: '#8b5cf6',
  HIGH: '#f97316',
  URGENT: '#f43f5e',
};

/* ─── Prompt suggestions ────────────────────────────────────── */
const QUICK_PROMPTS = [
  { icon: '📅', text: 'Plan my day with 5 high-impact tasks' },
  { icon: '🎯', text: 'Help me beat procrastination today' },
  { icon: '⚡', text: 'Create a deep work schedule for me' },
  { icon: '📊', text: 'Analyse my current task load and give insights' },
  { icon: '🚀', text: 'Generate tasks to prepare for a product launch' },
  { icon: '💪', text: 'Build a 30-day self-improvement plan' },
];

/* ─── Message bubble ────────────────────────────────────────── */
function MessageBubble({
  message,
  onAddTasks,
  added,
}: {
  message: Message;
  onAddTasks?: (tasks: GeminiTask[]) => void;
  added?: boolean;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
        flexDirection: isUser ? 'row-reverse' : 'row',
        marginBottom: '1rem',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: isUser
          ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
          : 'linear-gradient(135deg, #f97316, #f43f5e)',
        boxShadow: isUser ? '0 0 12px rgba(139,92,246,0.4)' : '0 0 12px rgba(249,115,22,0.4)',
      }}>
        {isUser ? <User size={16} color="#fff" /> : <Bot size={16} color="#fff" />}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: isUser ? '1rem 0.25rem 1rem 1rem' : '0.25rem 1rem 1rem 1rem',
          background: isUser
            ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.2))'
            : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isUser ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
          fontSize: '0.875rem',
          color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}>
          {message.content}
        </div>

        {/* Suggested tasks */}
        {message.tasks && message.tasks.length > 0 && (
          <div style={{
            background: 'rgba(139,92,246,0.06)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '0.5rem 0.875rem',
              borderBottom: '1px solid rgba(139,92,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c4b5fd' }}>
                ✦ {message.tasks.length} suggested tasks
              </span>
              {onAddTasks && !added && (
                <button
                  onClick={() => onAddTasks(message.tasks!)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.2rem 0.625rem', borderRadius: '0.375rem', border: 'none',
                    cursor: 'pointer', fontSize: '0.6875rem', fontWeight: 700,
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff',
                  }}
                >
                  <Plus size={11} /> Add All
                </button>
              )}
              {added && (
                <span style={{ fontSize: '0.6875rem', color: '#4ade80', fontWeight: 600 }}>
                  ✓ Added to tasks
                </span>
              )}
            </div>
            <div style={{ padding: '0.5rem' }}>
              {message.tasks.map((task, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.5rem', borderRadius: '0.375rem',
                  fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)',
                  borderLeft: `3px solid ${PRIORITY_COLOR[task.priority]}`,
                  marginBottom: '0.2rem',
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: PRIORITY_COLOR[task.priority], display: 'inline-block',
                  }} />
                  <span style={{ flex: 1 }}>{task.title}</span>
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 700, padding: '0.0625rem 0.375rem',
                    borderRadius: '999px',
                    background: `${PRIORITY_COLOR[task.priority]}22`,
                    color: PRIORITY_COLOR[task.priority],
                  }}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.25)', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Main AI Component ──────────────────────────────────────── */
export default function AI() {
  const user = useAuthStore((s) => s.user);
  const { data: tasks } = useTasks();
  const createTask = useCreateTask();

  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: `Hey${user?.name ? ` ${user.name}` : ''}! 👋 I'm your AI productivity coach.\n\nI can help you:\n• Plan your day and prioritise tasks\n• Generate task lists from your goals\n• Analyse your workload and spot bottlenecks\n• Build better habits and routines\n\nWhat would you like to work on today?`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedMsgIds, setAddedMsgIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const taskContext = (tasks ?? []).slice(0, 20).map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
      }));

      const wantsTaskList = /creat|generat|plan|list|task|todo|schedule|suggest/i.test(content);
      let responseText = '';
      let suggestedTasks: GeminiTask[] | undefined;

      if (wantsTaskList) {
        [responseText, suggestedTasks] = await Promise.all([
          getAIInsight(content, { tasks: taskContext, userName: user?.name }),
          generateTasksFromPrompt(content),
        ]);
      } else {
        responseText = await getAIInsight(content, { tasks: taskContext, userName: user?.name });
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        tasks: suggestedTasks?.length ? suggestedTasks : undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ ${e.message ?? 'Something went wrong. Make sure VITE_GEMINI_API_KEY is set in .env'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, tasks, user]);

  async function addTasksFromMessage(tasks: GeminiTask[], msgId: string) {
    await Promise.all(tasks.map((t) =>
      createTask.mutateAsync({
        title: t.title,
        description: t.description,
        priority: t.priority,
        tags: t.tags,
        dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : undefined,
        isRecurring: t.isRecurring ?? false,
        status: 'TODO',
      }),
    ));
    setAddedMsgIds((prev) => new Set([...prev, msgId]));
  }

  const taskSummary = tasks ? {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
    urgent: tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'DONE').length,
  } : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', maxWidth: 1100, margin: '0 auto', height: 'calc(100vh - 130px)' }}>

      {/* ── Chat Column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '0.75rem' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.875rem 1.125rem',
          background: 'rgba(249,115,22,0.06)',
          border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: '1rem', flexShrink: 0,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #f97316, #f43f5e)',
            boxShadow: '0 0 20px rgba(249,115,22,0.3)',
          }}>
            <BrainCircuit size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: '1.125rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #fb923c, #f87171)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              AI Productivity Coach
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
              Powered by Google Gemini · generates tasks, plans & insights
            </p>
          </div>
          <button
            onClick={() => setMessages([{ id: 'welcome', role: 'assistant', content: `Fresh start! How can I help you today?`, timestamp: new Date() }])}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)', background: 'none',
              cursor: 'pointer', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
            }}
          >
            <RefreshCw size={12} />
            Clear
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', paddingRight: '0.25rem',
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.3) transparent',
        }}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              added={addedMsgIds.has(msg.id)}
              onAddTasks={msg.tasks ? (tasks) => addTasksFromMessage(tasks, msg.id) : undefined}
            />
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: 'linear-gradient(135deg, #f97316, #f43f5e)',
              }}>
                <Bot size={16} color="#fff" />
              </div>
              <div style={{
                padding: '0.75rem 1rem', borderRadius: '0.25rem 1rem 1rem 1rem',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', gap: '0.375rem', alignItems: 'center',
              }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: '#fb923c' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts — only before conversation starts */}
        {messages.length <= 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', flexShrink: 0 }}>
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.text}
                onClick={() => sendMessage(p.text)}
                style={{
                  padding: '0.375rem 0.75rem', borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)';
                  e.currentTarget.style.color = '#c4b5fd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                {p.icon} {p.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          display: 'flex', gap: '0.625rem', padding: '0.75rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.875rem', flexShrink: 0,
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder="Ask anything — plan tasks, get advice, or request a schedule… (Enter to send)"
            rows={2}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              resize: 'none', fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)',
              fontFamily: 'inherit', lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            style={{
              alignSelf: 'flex-end', width: 38, height: 38, borderRadius: '0.625rem',
              border: 'none', cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
              background: !input.trim() ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #f97316, #f43f5e)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background 0.2s',
              boxShadow: input.trim() ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
            }}
          >
            {isLoading
              ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={17} />}
          </button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', overflowY: 'auto' }}>

        {/* Task Stats */}
        {taskSummary && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '1rem', padding: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <TrendingUp size={14} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Your Overview</span>
            </div>
            {[
              { label: 'Total Tasks', value: taskSummary.total, color: 'rgba(255,255,255,0.6)' },
              { label: 'To Do', value: taskSummary.todo, color: 'rgba(255,255,255,0.5)' },
              { label: 'In Progress', value: taskSummary.inProgress, color: '#60a5fa' },
              { label: 'Completed', value: taskSummary.done, color: '#4ade80' },
              { label: '🔥 Urgent', value: taskSummary.urgent, color: '#f43f5e' },
            ].map((stat) => (
              <div key={stat.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.375rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)' }}>{stat.label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Capabilities */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '1rem', padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <Zap size={14} style={{ color: '#f97316' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>What I can do</span>
          </div>
          {[
            { icon: <ListTodo size={13} />, text: 'Generate task lists from goals', color: '#8b5cf6' },
            { icon: <Sparkles size={13} />, text: 'Plan your week intelligently', color: '#3b82f6' },
            { icon: <TrendingUp size={13} />, text: 'Analyse your productivity', color: '#22c55e' },
            { icon: <RefreshCw size={13} />, text: 'Suggest recurring habits', color: '#f97316' },
            { icon: <BrainCircuit size={13} />, text: 'Coaching & motivation', color: '#f43f5e' },
          ].map((item) => (
            <div key={item.text} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)',
            }}>
              <span style={{ color: item.color, display: 'flex', flexShrink: 0 }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
