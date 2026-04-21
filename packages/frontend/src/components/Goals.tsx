import { useState } from 'react';
import { Plus, Target, CheckCircle2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  useGoals, useCreateGoal, useDeleteGoal, useUpdateGoalProgress,
  useMilestones, useCreateMilestone, useToggleMilestone,
  type Goal, type GoalStatus, type GoalCategory,
} from '../hooks/useGoals';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { ProgressBar } from './ui/ProgressBar';
import { Skeleton } from './ui/Skeleton';

const CATEGORY_OPTIONS: GoalCategory[] = ['CAREER', 'HEALTH', 'LEARNING', 'PERSONAL', 'FINANCE', 'OTHER'];
const STATUS_OPTIONS: GoalStatus[] = ['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'];

const STATUS_COLOR: Record<GoalStatus, 'primary' | 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'primary', COMPLETED: 'success', PAUSED: 'warning', CANCELLED: 'danger',
};
const CATEGORY_COLOR: Record<GoalCategory, string> = {
  CAREER: 'var(--accent-primary)', HEALTH: 'var(--accent-coral)',
  LEARNING: 'var(--accent-purple)', PERSONAL: 'var(--accent-amber)',
  FINANCE: 'var(--accent-green)', OTHER: 'var(--text-muted)',
};

function GoalCard({ goal }: { goal: Goal }) {
  const [expanded, setExpanded] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');
  const { data: milestones } = useMilestones(expanded ? goal.id : null);
  const updateProgress = useUpdateGoalProgress();
  const deleteGoal = useDeleteGoal();
  const createMilestone = useCreateMilestone();
  const toggleMilestone = useToggleMilestone();

  const completedMilestones = milestones?.filter((m) => m.completed).length ?? 0;
  const totalMilestones = milestones?.length ?? 0;

  async function addMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!newMilestone.trim()) return;
    await createMilestone.mutateAsync({ goalId: goal.id, title: newMilestone.trim() });
    setNewMilestone('');
  }

  return (
    <Card>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0,
            background: CATEGORY_COLOR[goal.category],
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{goal.title}</h3>
              <Badge variant={STATUS_COLOR[goal.status]}>{goal.status}</Badge>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 99 }}>{goal.category}</span>
            </div>
            {goal.description && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{goal.description}</p>
            )}
            {goal.targetDate && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target: {new Date(goal.targetDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={() => deleteGoal.mutate(goal.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, display: 'flex', padding: '0.25rem' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-coral)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{goal.progress}%</span>
          </div>
          <ProgressBar value={goal.progress} variant="primary" />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[0, 25, 50, 75, 100].map((v) => (
              <button
                key={v}
                onClick={() => updateProgress.mutate({ id: goal.id, progress: v })}
                style={{
                  padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border-subtle)',
                  fontSize: '0.7rem', cursor: 'pointer', fontWeight: 500,
                  background: goal.progress === v ? 'var(--accent-primary)' : 'transparent',
                  color: goal.progress === v ? '#fff' : 'var(--text-muted)',
                }}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>

        {/* Milestones toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem', width: '100%',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
            fontSize: '0.8125rem', padding: '0.25rem 0', fontWeight: 500,
          }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Milestones {totalMilestones > 0 && `(${completedMilestones}/${totalMilestones})`}
        </button>

        {expanded && (
          <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
            {milestones?.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0' }}>
                <button
                  onClick={() => toggleMilestone.mutate({ goalId: goal.id, milestoneId: m.id, completed: !m.completed })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: m.completed ? 'var(--accent-green)' : 'var(--text-muted)' }}
                >
                  <CheckCircle2 size={16} />
                </button>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', textDecoration: m.completed ? 'line-through' : 'none', opacity: m.completed ? 0.6 : 1 }}>
                  {m.title}
                </span>
              </div>
            ))}
            <form onSubmit={addMilestone} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Input
                placeholder="Add milestone..."
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button type="submit" variant="ghost" size="sm" isLoading={createMilestone.isPending}>
                <Plus size={14} />
              </Button>
            </form>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

interface GoalForm {
  title: string;
  description: string;
  category: GoalCategory;
  targetDate: string;
}

export default function Goals() {
  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<GoalStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState<GoalCategory | ''>('');
  const [form, setForm] = useState<GoalForm>({ title: '', description: '', category: 'PERSONAL', targetDate: '' });

  const filtered = (goals ?? []).filter((g) => {
    if (filterStatus && g.status !== filterStatus) return false;
    if (filterCategory && g.category !== filterCategory) return false;
    return true;
  });

  async function handleCreate() {
    await createGoal.mutateAsync({
      title: form.title.trim(),
      description: form.description || undefined,
      category: form.category,
      targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : undefined,
    });
    setModalOpen(false);
    setForm({ title: '', description: '', category: 'PERSONAL', targetDate: '' });
  }

  const activeCount = goals?.filter((g) => g.status === 'ACTIVE').length ?? 0;
  const doneCount = goals?.filter((g) => g.status === 'COMPLETED').length ?? 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Goals</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            {activeCount} active · {doneCount} completed
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          New Goal
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as GoalStatus | '')} style={{ minWidth: 140 }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as GoalCategory | '')} style={{ minWidth: 140 }}>
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        {(filterStatus || filterCategory) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterStatus(''); setFilterCategory(''); }}>Clear</Button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardBody><Skeleton lines={3} /></CardBody></Card>)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '3rem' }}>
            <Target size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {goals?.length === 0 ? 'No goals yet. Create your first goal!' : 'No goals match the current filters.'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Goal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Title" placeholder="What do you want to achieve?" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <Input label="Description" placeholder="Why does this matter?" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Category</label>
              <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as GoalCategory }))}>
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <Input label="Target Date" type="date" value={form.targetDate}
              onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} isLoading={createGoal.isPending} disabled={!form.title.trim()}>
              Create Goal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
