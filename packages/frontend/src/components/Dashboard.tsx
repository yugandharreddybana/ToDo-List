import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Target, TrendingUp, Plus, ArrowRight, Calendar } from 'lucide-react';
import { useAnalyticsSummary } from '../hooks/useAnalytics';
import { useTasks, useCreateTask, useUpdateTaskStatus } from '../hooks/useTasks';
import { useAuthStore } from '../stores/auth.store';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Skeleton } from './ui/Skeleton';
import { ProgressBar } from './ui/ProgressBar';

const PRIORITY_COLOR: Record<string, 'primary' | 'warning' | 'danger' | 'default'> = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'warning',
  URGENT: 'danger',
};

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 0.25rem' }}>{label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{value}</p>
            {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>{sub}</p>}
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color,
          }}>
            <Icon size={20} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: summary, isLoading: statsLoading } = useAnalyticsSummary('week');
  const { data: tasks, isLoading: tasksLoading } = useTasks({ status: 'TODO' });
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const overdueTasks = tasks?.filter((t) => t.dueDate && new Date(t.dueDate) < new Date()) ?? [];
  const todayTasks = tasks?.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate).toDateString();
    return due === new Date().toDateString();
  }) ?? [];

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await createTask.mutateAsync({ title: newTaskTitle.trim(), priority: 'MEDIUM' });
    setNewTaskTitle('');
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>{today}</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardBody><Skeleton lines={2} /></CardBody></Card>
          ))
        ) : (
          <>
            <StatCard label="Tasks Completed" value={summary?.completedTasks ?? 0}
              sub={`${summary?.completionRate ?? 0}% completion rate`}
              icon={CheckCircle2} color="var(--accent-green)" />
            <StatCard label="Focus Time" value={`${Math.round((summary?.totalFocusMinutes ?? 0) / 60)}h`}
              sub={`${summary?.pomodoroSessions ?? 0} sessions this week`}
              icon={Clock} color="var(--accent-primary)" />
            <StatCard label="Active Goals" value={summary?.activeGoals ?? 0}
              sub={`${Math.round(summary?.avgGoalProgress ?? 0)}% avg progress`}
              icon={Target} color="var(--accent-purple)" />
            <StatCard label="Applications" value={summary?.careerApplications ?? 0}
              sub="career pipeline"
              icon={TrendingUp} color="var(--accent-amber)" />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
        {/* Tasks column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick add */}
          <Card>
            <CardBody>
              <form onSubmit={handleQuickAdd} style={{ display: 'flex', gap: '0.75rem' }}>
                <Input
                  placeholder="Add a task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  prefix={<Plus size={16} />}
                  style={{ flex: 1 }}
                />
                <Button type="submit" variant="primary" isLoading={createTask.isPending}>
                  Add
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Today's tasks */}
          <Card>
            <CardBody>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Due Today
                </h2>
                <Link to="/tasks" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 500 }}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {tasksLoading ? (
                <Skeleton lines={3} />
              ) : todayTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <CheckCircle2 size={32} style={{ marginBottom: '0.5rem', color: 'var(--accent-green)' }} />
                  <p style={{ margin: 0 }}>All clear for today!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {todayTasks.slice(0, 6).map((task) => (
                    <div key={task.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)', transition: 'var(--transition)',
                    }}>
                      <button
                        onClick={() => updateStatus.mutate({ id: task.id, status: 'DONE' })}
                        style={{
                          width: 18, height: 18, borderRadius: 4, border: '2px solid var(--border-input)',
                          background: 'transparent', cursor: 'pointer', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      />
                      <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {task.title}
                      </span>
                      <Badge variant={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <Card style={{ borderLeft: '3px solid var(--accent-coral)' }}>
              <CardBody>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-coral)', margin: '0 0 0.75rem' }}>
                  Overdue ({overdueTasks.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {overdueTasks.slice(0, 4).map((task) => (
                    <div key={task.id} style={{ fontSize: '0.875rem', color: 'var(--text-primary)', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      {task.title}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Weekly progress */}
          <Card>
            <CardBody>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
                Weekly Progress
              </h3>
              {statsLoading ? <Skeleton lines={3} /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tasks</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{summary?.completionRate ?? 0}%</span>
                    </div>
                    <ProgressBar value={summary?.completionRate ?? 0} variant="primary" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Goals</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{Math.round(summary?.avgGoalProgress ?? 0)}%</span>
                    </div>
                    <ProgressBar value={summary?.avgGoalProgress ?? 0} variant="success" />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick links */}
          <Card>
            <CardBody>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>
                Quick Links
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {[
                  { to: '/timer', label: 'Start Focus Session', icon: Clock },
                  { to: '/goals', label: 'Review Goals', icon: Target },
                  { to: '/career', label: 'Career Pipeline', icon: TrendingUp },
                  { to: '/health', label: 'Log Health', icon: Calendar },
                ].map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
