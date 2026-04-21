import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Droplets, Footprints, Flame, Activity,
  Plus, CheckCircle2, Trash2, TrendingUp,
  Heart, Zap, Target, Award,
} from 'lucide-react';
import {
  useHealthLogs, useUpsertHealthLog, useHabits,
  useCreateHabit, useHabitLogs, useLogHabit, useDeleteHabit,
  type HealthLog,
} from '../hooks/useHealth';

const TODAY = new Date().toISOString().split('T')[0];
const WEEK_DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return d.toISOString().split('T')[0];
});

/* ─── Utility ─────────────────────────────────────────────────── */
function pct(val: number | undefined, max: number) {
  return Math.min(100, ((val ?? 0) / max) * 100);
}
function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/* ─── Animated Arc Ring ───────────────────────────────────────── */
function ArcRing({
  value, max, color, size = 120, strokeWidth = 10, label, sublabel,
}: {
  value: number; max: number; color: string; size?: number;
  strokeWidth?: number; label: string; sublabel: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, value / max);
  const offset = circumference * (1 - progress);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: size > 100 ? '1.25rem' : '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
            {value.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
            {sublabel}
          </span>
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{label}</span>
    </div>
  );
}

/* ─── Neon Slider ─────────────────────────────────────────────── */
function NeonSlider({
  icon: Icon, label, value, unit, color, max, step = 1, onChange,
}: {
  icon: React.ElementType; label: string; value: number;
  unit: string; color: string; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  const p = pct(value, max);
  const inputRef = useRef<HTMLInputElement>(null);

  // Style the range track fill dynamically
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.setProperty('--val', `${p}%`);
  }, [p]);

  return (
    <div style={{
      padding: '1rem 1.25rem',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}22`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '0.875rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.625rem',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `${color}18`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 12px ${color}44`,
        }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', flex: 1 }}>{label}</span>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: '0.25rem',
          background: `${color}18`, borderRadius: '0.375rem',
          padding: '0.25rem 0.625rem',
        }}>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, color }}>{value.toLocaleString()}</span>
          <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)' }}>{unit}</span>
        </div>
      </div>
      {/* Track */}
      <div style={{ position: 'relative', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          animate={{ width: `${p}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
      <input
        ref={inputRef}
        type="range" min={0} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%', height: 0, opacity: 0,
          margin: '-0.5rem 0 0',
          cursor: 'pointer',
        }}
      />
      {/* Quick presets */}
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const preset = Math.round(max * ratio / step) * step;
          return (
            <button
              key={ratio}
              onClick={() => onChange(preset)}
              style={{
                flex: 1, padding: '0.25rem',
                borderRadius: '0.375rem',
                border: `1px solid ${Math.abs(value - preset) < step ? color : 'rgba(255,255,255,0.08)'}`,
                background: Math.abs(value - preset) < step ? `${color}22` : 'transparent',
                color: Math.abs(value - preset) < step ? color : 'rgba(255,255,255,0.35)',
                fontSize: '0.6875rem', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {preset >= 1000 ? `${(preset / 1000).toFixed(preset % 1000 === 0 ? 0 : 1)}k` : preset}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Week Sparkline Bar ──────────────────────────────────────── */
function WeekBar({
  logs, field, color, label, max,
}: {
  logs: HealthLog[]; field: keyof HealthLog; color: string; label: string; max: number;
}) {
  const barMap: Record<string, number> = {};
  logs.forEach((l) => { barMap[l.logDate] = (l[field] as number) ?? 0; });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'flex-end', height: 48 }}>
        {WEEK_DATES.map((date, i) => {
          const val = barMap[date] ?? 0;
          const h = Math.max(4, pct(val, max) * 0.48);
          const isToday = date === TODAY;
          return (
            <motion.div
              key={date}
              title={`${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}: ${val}`}
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
              style={{
                flex: 1,
                background: isToday
                  ? `linear-gradient(180deg, ${color}, ${color}88)`
                  : `${color}44`,
                borderRadius: '3px 3px 0 0',
                boxShadow: isToday ? `0 0 8px ${color}66` : 'none',
                cursor: 'default',
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {WEEK_DATES.map((date) => (
          <span key={date} style={{
            flex: 1, textAlign: 'center',
            fontSize: '0.5625rem', color: date === TODAY ? color : 'rgba(255,255,255,0.25)',
            fontWeight: date === TODAY ? 700 : 400,
          }}>
            {new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' })}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Today's Log Panel ──────────────────────────────────────── */
function TodayLogPanel() {
  const { data: logs, isLoading } = useHealthLogs({ from: TODAY, to: TODAY });
  const upsert = useUpsertHealthLog();
  const todayLog = logs?.[0];
  const [saved, setSaved] = useState(false);

  const [log, setLog] = useState<Partial<HealthLog>>({
    logDate: TODAY,
    sleepHours: 8,
    waterMl: 2000,
    stepsCount: 8000,
    calories: 2000,
    weightKg: undefined,
  });

  useEffect(() => {
    if (todayLog) setLog({ ...todayLog });
  }, [todayLog?.id]);

  async function save() {
    await upsert.mutateAsync({ ...log, logDate: TODAY });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ height: 96, borderRadius: '0.875rem', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <NeonSlider
        icon={Moon} label="Sleep" value={log.sleepHours ?? 8} unit="h"
        color="#a78bfa" max={12} step={0.5}
        onChange={(v) => setLog((l) => ({ ...l, sleepHours: v }))}
      />
      <NeonSlider
        icon={Droplets} label="Water" value={log.waterMl ?? 2000} unit="ml"
        color="#38bdf8" max={4000} step={250}
        onChange={(v) => setLog((l) => ({ ...l, waterMl: v }))}
      />
      <NeonSlider
        icon={Footprints} label="Steps" value={log.stepsCount ?? 8000} unit="steps"
        color="#34d399" max={15000} step={500}
        onChange={(v) => setLog((l) => ({ ...l, stepsCount: v }))}
      />
      <NeonSlider
        icon={Flame} label="Calories" value={log.calories ?? 2000} unit="kcal"
        color="#fb923c" max={3500} step={50}
        onChange={(v) => setLog((l) => ({ ...l, calories: v }))}
      />
      {/* Weight input */}
      <div style={{
        padding: '0.875rem 1.25rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(244,63,94,0.2)',
        borderLeft: '3px solid #f43f5e',
        borderRadius: '0.875rem',
        display: 'flex', alignItems: 'center', gap: '0.875rem',
      }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(244,63,94,0.3)' }}>
          <Activity size={15} style={{ color: '#f43f5e' }} />
        </div>
        <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>Weight</span>
        <input
          type="number" min={0} max={300} step={0.1}
          value={log.weightKg ?? ''}
          onChange={(e) => setLog((l) => ({ ...l, weightKg: e.target.value ? Number(e.target.value) : undefined }))}
          placeholder="—"
          style={{
            width: 80, textAlign: 'right',
            padding: '0.375rem 0.625rem',
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: '0.5rem', outline: 'none',
            fontSize: '1rem', fontWeight: 700, color: '#f43f5e',
          }}
        />
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>kg</span>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={save}
        disabled={upsert.isPending}
        style={{
          padding: '0.875rem',
          borderRadius: '0.875rem', border: 'none',
          cursor: upsert.isPending ? 'not-allowed' : 'pointer',
          fontWeight: 700, fontSize: '0.9375rem',
          background: saved
            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
            : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          color: '#fff',
          boxShadow: saved
            ? '0 0 20px rgba(34,197,94,0.4)'
            : '0 0 20px rgba(139,92,246,0.4)',
          transition: 'background 0.3s, box-shadow 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}
      >
        {upsert.isPending ? (
          <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        ) : saved ? (
          <><CheckCircle2 size={18} /> Saved!</>
        ) : (
          <><Zap size={18} /> {todayLog ? 'Update Log' : 'Save Today\'s Log'}</>
        )}
      </motion.button>
    </div>
  );
}

/* ─── Habit Tracker Panel ─────────────────────────────────────── */
function HabitPanel() {
  const { data: habits, isLoading } = useHabits();
  const { data: todayLogs } = useHabitLogs(null, { from: TODAY, to: TODAY });
  const createHabit = useCreateHabit();
  const logHabit = useLogHabit();
  const deleteHabit = useDeleteHabit();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#8b5cf6');

  const PRESET_COLORS = ['#8b5cf6', '#3b82f6', '#34d399', '#f97316', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899'];

  function isCompleted(habitId: string) {
    return todayLogs?.some((l) => l.habitId === habitId && l.completed) ?? false;
  }

  async function toggle(habitId: string) {
    await logHabit.mutateAsync({ habitId, logDate: TODAY, completed: !isCompleted(habitId) });
  }

  async function addHabit() {
    if (!newName.trim()) return;
    await createHabit.mutateAsync({ name: newName.trim(), targetFrequency: 7, color: newColor });
    setNewName(''); setAdding(false);
  }

  const completedCount = habits?.filter((h) => isCompleted(h.id)).length ?? 0;
  const totalCount = habits?.length ?? 0;
  const completionPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 56, borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Completion gauge */}
      {totalCount > 0 && (
        <div style={{
          padding: '0.875rem 1.25rem',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
          border: '1px solid rgba(139,92,246,0.2)', borderRadius: '0.875rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
            <svg width={48} height={48} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={24} cy={24} r={20} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
              <motion.circle
                cx={24} cy={24} r={20} fill="none"
                stroke="#8b5cf6" strokeWidth={5} strokeLinecap="round"
                strokeDasharray={125.7}
                initial={{ strokeDashoffset: 125.7 }}
                animate={{ strokeDashoffset: 125.7 * (1 - completionPct / 100) }}
                transition={{ duration: 0.8 }}
                style={{ filter: 'drop-shadow(0 0 4px #8b5cf6)' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa' }}>{Math.round(completionPct)}%</span>
            </div>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#fff' }}>
              {completedCount}/{totalCount} habits done
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
              {completedCount === totalCount ? '🎉 All habits completed today!' : `${totalCount - completedCount} remaining today`}
            </p>
          </div>
        </div>
      )}

      {/* Habit list */}
      <AnimatePresence>
        {habits?.map((habit) => {
          const done = isCompleted(habit.id);
          const color = habit.color ?? '#8b5cf6';
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1rem',
                background: done ? `${color}12` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${done ? color + '44' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '0.875rem',
                transition: 'all 0.25s',
              }}
            >
              <button
                onClick={() => toggle(habit.id)}
                style={{
                  background: done ? color : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${done ? color : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '50%', width: 28, height: 28,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: done ? `0 0 12px ${color}66` : 'none',
                  flexShrink: 0,
                }}
              >
                {done && <CheckCircle2 size={14} style={{ color: '#fff' }} />}
              </button>
              <span style={{
                flex: 1, fontSize: '0.9rem', fontWeight: 600,
                color: done ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                textDecoration: done ? 'none' : 'none',
              }}>
                {habit.name}
              </span>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: color, boxShadow: `0 0 6px ${color}`,
              }} />
              <button
                onClick={() => deleteHabit.mutateAsync(habit.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.2)',
                  display: 'flex', padding: '0.125rem',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Empty state */}
      {(!habits || habits.length === 0) && (
        <div style={{
          textAlign: 'center', padding: '2rem 1rem',
          background: 'rgba(255,255,255,0.02)', borderRadius: '0.875rem',
          border: '1px dashed rgba(255,255,255,0.1)',
        }}>
          <Target size={32} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            No habits yet. Build your streak!
          </p>
        </div>
      )}

      {/* Add habit */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              padding: '1rem', borderRadius: '0.875rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addHabit(); if (e.key === 'Escape') setAdding(false); }}
              placeholder="Habit name e.g. Morning workout"
              style={{
                padding: '0.625rem 0.875rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.625rem',
                fontSize: '0.875rem', color: '#fff', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: c, border: `2px solid ${newColor === c ? '#fff' : 'transparent'}`,
                    cursor: 'pointer', flexShrink: 0,
                    boxShadow: newColor === c ? `0 0 8px ${c}` : 'none',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setAdding(false)}
                style={{
                  flex: 1, padding: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem', background: 'none',
                  color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.8125rem',
                }}
              >Cancel</button>
              <button
                onClick={addHabit}
                disabled={!newName.trim() || createHabit.isPending}
                style={{
                  flex: 2, padding: '0.5rem',
                  border: 'none', borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  color: '#fff', fontWeight: 600,
                  cursor: !newName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '0.8125rem', opacity: !newName.trim() ? 0.6 : 1,
                }}
              >Add Habit</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setAdding(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          padding: '0.625rem',
          border: '1px dashed rgba(139,92,246,0.3)',
          borderRadius: '0.875rem', background: 'rgba(139,92,246,0.06)',
          color: '#a78bfa', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)')}
      >
        <Plus size={16} /> New Habit
      </button>
    </div>
  );
}

/* ─── Week History ────────────────────────────────────────────── */
function WeekHistory({ logs }: { logs: HealthLog[] }) {
  return (
    <div style={{
      padding: '1.25rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '1.25rem',
      display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.5rem',
    }}>
      <WeekBar logs={logs} field="sleepHours" color="#a78bfa" label="Sleep (h)" max={12} />
      <WeekBar logs={logs} field="waterMl" color="#38bdf8" label="Water (ml)" max={4000} />
      <WeekBar logs={logs} field="stepsCount" color="#34d399" label="Steps" max={15000} />
      <WeekBar logs={logs} field="calories" color="#fb923c" label="Calories (kcal)" max={3500} />
    </div>
  );
}

/* ─── Stats Overview ──────────────────────────────────────────── */
function StatsOverview({ logs }: { logs: HealthLog[] }) {
  const todayLog = logs.find((l) => l.logDate === TODAY);

  const metrics = [
    { icon: Moon, label: 'Sleep', value: todayLog?.sleepHours ?? 0, max: 12, unit: 'h', color: '#a78bfa' },
    { icon: Droplets, label: 'Water', value: todayLog?.waterMl ?? 0, max: 4000, unit: 'ml', color: '#38bdf8' },
    { icon: Footprints, label: 'Steps', value: todayLog?.stepsCount ?? 0, max: 15000, unit: 'steps', color: '#34d399' },
    { icon: Flame, label: 'Calories', value: todayLog?.calories ?? 0, max: 3500, unit: 'kcal', color: '#fb923c' },
  ];

  return (
    <div style={{
      padding: '1.5rem',
      background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: '1.25rem',
      display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap',
      gap: '1rem',
    }}>
      {metrics.map(({ label, value, max, unit, color }) => (
        <ArcRing key={label} value={value} max={max} color={color} size={110} strokeWidth={9} label={label} sublabel={unit} />
      ))}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function HealthTracker() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const { data: weekLogs = [], isLoading: weekLoading } = useHealthLogs({ from: sevenDaysAgo, to: TODAY });
  const [activeTab, setActiveTab] = useState<'log' | 'habits' | 'trends'>('log');

  const tabs = [
    { id: 'log', label: "Today's Log", icon: <Zap size={14} /> },
    { id: 'habits', label: 'Habits', icon: <Award size={14} /> },
    { id: 'trends', label: 'Trends', icon: <TrendingUp size={14} /> },
  ] as const;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.375rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '0.875rem',
            background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(244,63,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(244,63,94,0.2)',
          }}>
            <Heart size={22} style={{ color: '#f43f5e' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Health Tracker
            </h1>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)' }}>
              {fmt(TODAY)} · biometrics & habit intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Today's stats rings */}
      {!weekLoading && <StatsOverview logs={weekLogs} />}

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.375rem',
        margin: '1.5rem 0 1.25rem',
        padding: '0.3rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '0.875rem',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '0.625rem 0.75rem',
              borderRadius: '0.625rem', border: 'none',
              cursor: 'pointer', fontWeight: 600,
              fontSize: '0.8125rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))'
                : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.45)',
              boxShadow: activeTab === tab.id
                ? '0 0 16px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                : 'none',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'log' && <TodayLogPanel />}
          {activeTab === 'habits' && <HabitPanel />}
          {activeTab === 'trends' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {weekLoading ? (
                <div style={{ height: 200, borderRadius: '1.25rem', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
              ) : weekLogs.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '3rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '1.25rem',
                }}>
                  <TrendingUp size={40} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: '0.75rem' }} />
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                    Start logging to see your trends
                  </p>
                </div>
              ) : (
                <>
                  <WeekHistory logs={weekLogs} />
                  {/* Log table */}
                  <div style={{
                    padding: '1.25rem', borderRadius: '1.25rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    overflowX: 'auto',
                  }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                      7-Day Log
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                      <thead>
                        <tr>
                          {['Date', 'Sleep', 'Water', 'Steps', 'Calories', 'Weight'].map((h) => (
                            <th key={h} style={{
                              padding: '0.5rem 0.875rem', textAlign: 'left',
                              color: 'rgba(255,255,255,0.4)', fontWeight: 600,
                              fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...weekLogs].reverse().map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.625rem 0.875rem', color: log.logDate === TODAY ? '#a78bfa' : 'rgba(255,255,255,0.7)', fontWeight: log.logDate === TODAY ? 700 : 400 }}>
                              {log.logDate === TODAY ? 'Today' : new Date(log.logDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </td>
                            <td style={{ padding: '0.625rem 0.875rem', color: '#a78bfa' }}>{log.sleepHours ? `${log.sleepHours}h` : '—'}</td>
                            <td style={{ padding: '0.625rem 0.875rem', color: '#38bdf8' }}>{log.waterMl ? `${log.waterMl}ml` : '—'}</td>
                            <td style={{ padding: '0.625rem 0.875rem', color: '#34d399' }}>{log.stepsCount?.toLocaleString() ?? '—'}</td>
                            <td style={{ padding: '0.625rem 0.875rem', color: '#fb923c' }}>{log.calories ? `${log.calories} kcal` : '—'}</td>
                            <td style={{ padding: '0.625rem 0.875rem', color: '#f43f5e' }}>{log.weightKg ? `${log.weightKg} kg` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
