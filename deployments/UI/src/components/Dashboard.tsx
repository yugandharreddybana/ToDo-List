import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, Target, TrendingUp, Plus, ArrowRight,
  Loader2, BrainCircuit, Flame, Star, Zap,
  Calendar, ListTodo, Activity,
} from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTaskStatus } from '../hooks/useTasks';
import { useAuthStore } from '../stores/auth.store';
import { getAIInsight } from '../services/gemini';
import type { Task, TaskPriority } from '../stores/task.store';

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: '#22c55e', MEDIUM: '#8b5cf6', HIGH: '#f97316', URGENT: '#f43f5e',
};

function greeting(name?: string | null) {
  const h = new Date().getHours();
  const time = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return name ? `${time}, ${name.split(' ')[0]} 👋` : time + ' 👋';
}

function StatCard({
  icon, label, value, sub, color, delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{
        padding: '1.125rem 1.25rem',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${color}33`,
        borderRadius: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        borderRadius: '50%', background: `${color}15`,
        transform: 'translate(20%, -20%)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
        <span style={{ color, display: 'flex', opacity: 0.9 }}>{icon}</span>
      </div>
      <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
        {label}
      </p>
      {sub && (
        <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color }}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}

function QuickTaskBar({ onCreate }: { onCreate: (title: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div style={{
      display: 'flex', gap: '0.5rem',
      padding: '0.75rem 1rem',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '0.875rem',
    }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            onCreate(value.trim());
            setValue('');
          }
        }}
        placeholder="Quick add a task… press Enter"
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)',
          fontFamily: 'inherit',
        }}
      />
      <button
        onClick={() => { if (value.trim()) { onCreate(value.trim()); setValue(''); } }}
        disabled={!value.trim()}
        style={{
          padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: 'none',
          cursor: value.trim() ? 'pointer' : 'not-allowed',
          background: value.trim() ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'rgba(255,255,255,0.08)',
          color: '#fff', fontSize: '0.8125rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          opacity: value.trim() ? 1 : 0.5,
        }}
      >
        <Plus size={14} /> Add
      </button>
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (t: Task) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
        background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <button
        onClick={() => onToggle(task)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0,
          color: task.status === 'DONE' ? '#4ade80' : 'rgba(255,255,255,0.25)', padding: 0,
        }}
      >
        {task.status === 'DONE' ? <CheckCircle2 size={17} /> : <Clock size={17} />}
      </button>
      <span style={{
        flex: 1, fontSize: '0.8125rem', fontWeight: 500,
        color: task.status === 'DONE' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)',
        textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {task.title}
      </span>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: PRIORITY_COLOR[task.priority],
        boxShadow: `0 0 5px ${PRIORITY_COLOR[task.priority]}88`,
      }} />
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: tasks } = useTasks();
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();

  const [aiInsight, setAiInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const allTasks = tasks ?? [];
  const todoTasks = allTasks.filter((t) => t.status === 'TODO');
  const doneTasks = allTasks.filter((t) => t.status === 'DONE');
  const inProgressTasks = allTasks.filter((t) => t.status === 'IN_PROGRESS');
  const urgentTasks = allTasks.filter((t) => t.priority === 'URGENT' && t.status !== 'DONE');

  const completionRate = allTasks.length > 0
    ? Math.round((doneTasks.length / allTasks.length) * 100)
    : 0;

  /* Load AI daily insight once */
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    const cacheKey = `ai_insight_${new Date().toDateString()}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setAiInsight(cached); return; }

    setIsLoadingInsight(true);
    const taskContext = tasks.slice(0, 15).map((t) => ({
      title: t.title, status: t.status, priority: t.priority,
    }));
    getAIInsight(
      `Give me a concise daily productivity insight in 2-3 sentences. Be motivating and practical based on my current tasks.`,
      { tasks: taskContext, userName: user?.name },
    )
      .then((text) => {
        setAiInsight(text);
        sessionStorage.setItem(cacheKey, text);
      })
      .catch(() => setAiInsight(''))
      .finally(() => setIsLoadingInsight(false));
  }, [tasks?.length]);

  async function quickCreateTask(title: string) {
    await createTask.mutateAsync({ title, status: 'TODO', priority: 'MEDIUM', tags: [], isRecurring: false });
  }

  async function handleToggle(task: Task) {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    await updateStatus.mutateAsync({ id: task.id, status: newStatus });
  }

  /* Focus tasks: urgent first, then high, take top 6 */
  const focusTasks = [
    ...allTasks.filter((t) => t.priority === 'URGENT' && t.status !== 'DONE'),
    ...allTasks.filter((t) => t.priority === 'HIGH' && t.status !== 'DONE'),
    ...allTasks.filter((t) => t.status === 'IN_PROGRESS'),
    ...allTasks.filter((t) => t.status === 'TODO' && t.priority === 'MEDIUM'),
  ]
    .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
    .slice(0, 6);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '3rem' }}>

      {/* ── Greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '1.75rem' }}
      >
        <h1 style={{
          fontSize: '1.875rem', fontWeight: 800, margin: 0,
          background: 'linear-gradient(135deg, #c4b5fd 0%, #93c5fd 60%, #6ee7b7 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {greeting(user?.name)}
        </h1>
        <p style={{ margin: '0.375rem 0 0', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.4)' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <StatCard icon={<ListTodo size={20} />} label="Tasks To Do" value={todoTasks.length} color="#8b5cf6" delay={0} />
        <StatCard icon={<Activity size={20} />} label="In Progress" value={inProgressTasks.length} color="#3b82f6" delay={0.05} />
        <StatCard icon={<CheckCircle2 size={20} />} label="Completed" value={doneTasks.length} color="#22c55e" sub={`${completionRate}% completion rate`} delay={0.1} />
        <StatCard icon={<Flame size={20} />} label="Urgent" value={urgentTasks.length} color="#f43f5e" delay={0.15} />
      </div>

      {/* ── Progress Bar ── */}
      {allTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '0.875rem 1.25rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.875rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Overall Progress</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4ade80' }}>{completionRate}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #8b5cf6, #22c55e)',
                borderRadius: '999px',
              }}
            />
          </div>
        </motion.div>
      )}

      {/* ── AI Daily Insight ── */}
      {(aiInsight || isLoadingInsight) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(244,63,94,0.06))',
            border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '0.5rem', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #f97316, #f43f5e)',
          }}>
            <BrainCircuit size={16} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Daily Insight
            </p>
            {isLoadingInsight ? (
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                <Loader2 size={13} style={{ color: '#f97316', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>Analysing your tasks…</span>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                {aiInsight}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Two-col layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }}>

        {/* Left: Focus + Quick add */}
        <div>
          {/* Focus Tasks */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '1rem',
            padding: '1rem 1.125rem',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={15} style={{ color: '#f97316' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Focus Tasks</span>
              </div>
              <Link
                to="/tasks"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  fontSize: '0.75rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600,
                }}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {focusTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                <CheckCircle2 size={28} style={{ marginBottom: '0.5rem', color: '#4ade80', opacity: 0.6 }} />
                <p style={{ margin: 0 }}>You're all caught up!</p>
              </div>
            ) : (
              <div>
                {focusTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={handleToggle} />
                ))}
              </div>
            )}
          </div>

          {/* Quick add */}
          <QuickTaskBar onCreate={quickCreateTask} />
        </div>

        {/* Right: Quick links + today summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

          {/* Quick nav */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '1rem',
            padding: '1rem',
          }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Access
            </p>
            {[
              { to: '/tasks', icon: <ListTodo size={15} />, label: 'All Tasks', color: '#8b5cf6' },
              { to: '/ai', icon: <BrainCircuit size={15} />, label: 'AI Coach', color: '#f97316' },
              { to: '/timer', icon: <Clock size={15} />, label: 'Pomodoro', color: '#3b82f6' },
              { to: '/goals', icon: <Target size={15} />, label: 'Goals', color: '#22c55e' },
              { to: '/analytics', icon: <TrendingUp size={15} />, label: 'Analytics', color: '#f43f5e' },
              { to: '/career', icon: <Zap size={15} />, label: 'Career', color: '#a78bfa' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
                  marginBottom: '0.125rem',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${item.color}15`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: item.color, display: 'flex' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
                  <ArrowRight size={11} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.2)' }} />
                </div>
              </Link>
            ))}
          </div>

          {/* Upcoming due */}
          {(() => {
            const upcoming = allTasks
              .filter((t) => t.dueDate && t.status !== 'DONE')
              .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
              .slice(0, 4);
            if (upcoming.length === 0) return null;
            return (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '1rem', padding: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Calendar size={13} style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Upcoming Due
                  </span>
                </div>
                {upcoming.map((task) => {
                  const due = new Date(task.dueDate!);
                  const isOverdue = due < new Date();
                  return (
                    <div key={task.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.375rem 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <span style={{ flex: 1, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </span>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0,
                        color: isOverdue ? '#f43f5e' : 'rgba(255,255,255,0.35)',
                      }}>
                        {due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
