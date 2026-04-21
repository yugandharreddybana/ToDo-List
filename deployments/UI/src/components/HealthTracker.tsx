import { useState } from 'react';
import { Plus, Droplets, Moon, Activity, Footprints, Flame, CheckCircle2, Circle } from 'lucide-react';
import {
  useHealthLogs, useUpsertHealthLog, useHabits, useCreateHabit, useHabitLogs, useLogHabit,
  type HealthLog,
} from '../hooks/useHealth';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { ProgressBar } from './ui/ProgressBar';
import { Skeleton } from './ui/Skeleton';

const TODAY = new Date().toISOString().split('T')[0];

function HealthMetric({ icon: Icon, label, value, unit, color, max, onChange }: {
  icon: React.ElementType; label: string; value: number | undefined;
  unit: string; color: string; max: number;
  onChange: (v: number) => void;
}) {
  const pct = Math.min(100, ((value ?? 0) / max) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={16} style={{ color }} />
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {value ?? '—'} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{unit}</span>
        </span>
      </div>
      <ProgressBar value={pct} variant="primary" height={6} />
      <input
        type="range" min={0} max={max} value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color }}
      />
    </div>
  );
}

function TodayLog() {
  const { data: logs, isLoading } = useHealthLogs({ from: TODAY, to: TODAY });
  const upsert = useUpsertHealthLog();
  const todayLog = logs?.[0];

  const [log, setLog] = useState<Partial<HealthLog>>({
    logDate: TODAY,
    sleepHours: 8,
    waterMl: 2000,
    stepsCount: 8000,
    calories: 2000,
    weightKg: undefined,
  });

  function initFromExisting() {
    if (todayLog && !log.id) {
      setLog((prev) => ({ ...prev, ...todayLog, id: todayLog.id }));
    }
  }

  if (isLoading) return <Skeleton lines={4} />;
  if (todayLog && !log.id) initFromExisting();

  async function save() {
    await upsert.mutateAsync({ ...log, logDate: TODAY });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <HealthMetric icon={Moon} label="Sleep" value={log.sleepHours} unit="h" color="var(--accent-purple)"
        max={12} onChange={(v) => setLog((l) => ({ ...l, sleepHours: v }))} />
      <HealthMetric icon={Droplets} label="Water" value={log.waterMl} unit="ml" color="var(--accent-sky)"
        max={4000} onChange={(v) => setLog((l) => ({ ...l, waterMl: v }))} />
      <HealthMetric icon={Footprints} label="Steps" value={log.stepsCount} unit="steps" color="var(--accent-green)"
        max={15000} onChange={(v) => setLog((l) => ({ ...l, stepsCount: v }))} />
      <HealthMetric icon={Flame} label="Calories" value={log.calories} unit="kcal" color="var(--accent-amber)"
        max={3000} onChange={(v) => setLog((l) => ({ ...l, calories: v }))} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Activity size={16} style={{ color: 'var(--accent-coral)' }} />
        <Input
          label="Weight (kg)"
          type="number"
          value={log.weightKg?.toString() ?? ''}
          onChange={(e) => setLog((l) => ({ ...l, weightKg: e.target.value ? Number(e.target.value) : undefined }))}
          placeholder="Optional"
          style={{ flex: 1 }}
        />
      </div>
      <Button variant="primary" onClick={save} isLoading={upsert.isPending} style={{ alignSelf: 'flex-end' }}>
        {todayLog ? 'Update Log' : 'Save Log'}
      </Button>
    </div>
  );
}

function HabitTracker() {
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: todayLogs } = useHabitLogs(null, { from: TODAY, to: TODAY });
  const createHabit = useCreateHabit();
  const logHabit = useLogHabit();
  const [modalOpen, setModalOpen] = useState(false);
  const [habitName, setHabitName] = useState('');

  function isCompleted(habitId: string) {
    return todayLogs?.some((l) => l.habitId === habitId && l.completed) ?? false;
  }

  async function toggle(habitId: string) {
    const completed = !isCompleted(habitId);
    await logHabit.mutateAsync({ habitId, logDate: TODAY, completed });
  }

  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!habitName.trim()) return;
    await createHabit.mutateAsync({ name: habitName.trim(), targetFrequency: 7 });
    setHabitName('');
    setModalOpen(false);
  }

  if (habitsLoading) return <Skeleton lines={4} />;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {habits?.map((habit) => (
          <div key={habit.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)',
            background: isCompleted(habit.id) ? 'color-mix(in srgb, var(--accent-green) 8%, transparent)' : 'var(--bg-primary)',
            transition: 'var(--transition)',
          }}>
            <button
              onClick={() => toggle(habit.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: isCompleted(habit.id) ? 'var(--accent-green)' : 'var(--text-muted)' }}
            >
              {isCompleted(habit.id) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>
              {habit.name}
            </span>
          </div>
        ))}
        {(!habits || habits.length === 0) && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
            No habits yet. Add your first habit!
          </p>
        )}
      </div>
      <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
        Add Habit
      </Button>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Habit">
        <form onSubmit={addHabit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Habit Name" value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder="e.g. Morning meditation" required />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={createHabit.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function HealthTracker() {
  const { data: logs, isLoading: logsLoading } = useHealthLogs({ from: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Health Tracker</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Today's log */}
        <Card>
          <CardBody>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>
              Today's Log
            </h2>
            <TodayLog />
          </CardBody>
        </Card>

        {/* Habits */}
        <Card>
          <CardBody>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>
              Daily Habits
            </h2>
            <HabitTracker />
          </CardBody>
        </Card>
      </div>

      {/* Week history */}
      <Card>
        <CardBody>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
            Last 7 Days
          </h2>
          {logsLoading ? <Skeleton lines={3} /> : !logs?.length ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>
              No logs in the past 7 days.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {['Date', 'Sleep', 'Water', 'Steps', 'Calories', 'Weight'].map((h) => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.8125rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>{new Date(log.logDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>{log.sleepHours ? `${log.sleepHours}h` : '—'}</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>{log.waterMl ? `${log.waterMl}ml` : '—'}</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>{log.stepsCount?.toLocaleString() ?? '—'}</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>{log.calories ? `${log.calories} kcal` : '—'}</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>{log.weightKg ? `${log.weightKg} kg` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
