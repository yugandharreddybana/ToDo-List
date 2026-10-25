import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Coffee, Brain, CheckCircle2,
  Settings2, Flame, Zap,
} from 'lucide-react';
import { useStartSession, useCompleteSession, useSessions } from '../hooks/useSessions';
import type { SessionType } from '../hooks/useSessions';
import { useTasks, useUpdateTaskStatus } from '../hooks/useTasks';
import { useSettingsStore } from '../stores/settings.store';

/* ─── Map visual types to API SessionType ────────────────────── */
type VisualMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

const MODE_TO_API: Record<VisualMode, SessionType> = {
  FOCUS: 'POMODORO',
  SHORT_BREAK: 'SHORT_BREAK',
  LONG_BREAK: 'LONG_BREAK',
};

/* ─── Default durations (minutes) ───────────────────────────── */
const DEFAULT_DURATIONS: Record<VisualMode, number> = {
  FOCUS: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
};

const MODE_META: Record<VisualMode, { label: string; color: string; icon: React.ReactNode; desc: string }> = {
  FOCUS: { label: 'Focus', color: '#8b5cf6', icon: <Brain size={18} />, desc: 'Deep work session' },
  SHORT_BREAK: { label: 'Short Break', color: '#22c55e', icon: <Coffee size={18} />, desc: 'Rest & recharge' },
  LONG_BREAK: { label: 'Long Break', color: '#3b82f6', icon: <Zap size={18} />, desc: 'Extended recovery' },
};

function pad(n: number) { return String(n).padStart(2, '0'); }
function formatTime(seconds: number) {
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

/* ─── Circular SVG ring ──────────────────────────────────────── */
function RingTimer({ progress, color, size = 260, stroke = 12 }: {
  progress: number; color: string; size?: number; stroke?: number;
}) {
  const r = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: 'linear' }}
        filter={`drop-shadow(0 0 8px ${color}88)`}
      />
    </svg>
  );
}

/* ─── Main Timer ─────────────────────────────────────────────── */
export default function Timer() {
  const settings = useSettingsStore();
  const startSession = useStartSession();
  const completeSession = useCompleteSession();
  const { data: sessions } = useSessions();
  const { data: tasks = [] } = useTasks();
  const completeTask = useUpdateTaskStatus();

  const [mode, setMode] = useState<VisualMode>('FOCUS');
  const [customDurations, setCustomDurations] = useState<Record<VisualMode, number>>({ FOCUS: settings.pomodoroWorkMinutes, SHORT_BREAK: settings.pomodoroBreakMinutes, LONG_BREAK: settings.pomodoroLongBreakMinutes });
  const [showSettings, setShowSettings] = useState(false);
  const [draftDurations, setDraftDurations] = useState<Record<VisualMode, number>>(DEFAULT_DURATIONS);

  const totalSeconds = customDurations[mode] * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState('');
  const [error, setError] = useState('');
  const [completedCount, setCompletedCount] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const finishingRef = useRef(false);
  const recoveredRef = useRef(false);

  useEffect(() => {
    if (recoveredRef.current || !sessions) return;
    recoveredRef.current = true;
    const active = sessions.find(session => !session.endTime);
    if (!active || sessionId) return;
    const recoveredMode: VisualMode = active.type === 'SHORT_BREAK' ? 'SHORT_BREAK' : active.type === 'LONG_BREAK' ? 'LONG_BREAK' : 'FOCUS';
    let saved: { sessionId?: string; timeLeft?: number } | null = null;
    try { saved = JSON.parse(sessionStorage.getItem('tps-active-timer') ?? 'null'); } catch { /* ignore stale state */ }
    setCustomDurations(current => ({ ...current, [recoveredMode]: active.durationMinutes }));
    setMode(recoveredMode);
    setTaskId(active.taskId ?? '');
    setTimeLeft(saved?.sessionId === active.id && typeof saved.timeLeft === 'number' ? Math.max(0, Math.min(active.durationMinutes * 60, saved.timeLeft)) : active.durationMinutes * 60);
    setSessionId(active.id);
    setIsRunning(false);
    setError('An unfinished session was recovered and paused. Time while the app was closed was not counted; resume, finish, or reset it.');
  }, [sessions, sessionId]);

  useEffect(() => {
    if (!recoveredRef.current) return;
    if (sessionId) sessionStorage.setItem('tps-active-timer', JSON.stringify({ sessionId, timeLeft, mode, taskId }));
    else sessionStorage.removeItem('tps-active-timer');
  }, [sessionId, timeLeft, mode, taskId]);

  /* Reset when mode or duration changes */
  useEffect(() => {
    if (sessionId) return;
    clearInterval(intervalRef.current!);
    deadlineRef.current = null;
    setIsRunning(false);
    setTimeLeft(customDurations[mode] * 60);
    setJustCompleted(false);
  }, [mode, customDurations]);

  /* Tick */
  useEffect(() => {
    if (isRunning) {
      deadlineRef.current = Date.now() + timeLeft * 1000;
      intervalRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil(((deadlineRef.current ?? Date.now()) - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0 && !finishingRef.current) {
          setIsRunning(false);
          void handleComplete(totalSeconds);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, sessionId, mode, totalSeconds]);

  /* Page title */
  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(timeLeft)} · ${MODE_META[mode].label} — Productivity Suite`
      : 'Productivity Suite';
    return () => { document.title = 'Productivity Suite'; };
  }, [timeLeft, isRunning, mode]);

  async function handleStart() {
    if (sessionId) { if (timeLeft > 0) setIsRunning(true); return; }
    try {
      const result = await startSession.mutateAsync({
        type: MODE_TO_API[mode],
        durationMinutes: customDurations[mode],
        taskId: mode === 'FOCUS' && taskId ? taskId : undefined,
      });
      setSessionId(result?.id ?? null);
      setIsRunning(true);
      setError('');
    } catch {
      setError('Could not save the session. Please try again.');
    }
    setJustCompleted(false);
  }

  function handlePause() {
    if (deadlineRef.current) setTimeLeft(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)));
    setIsRunning(false);
  }

  async function handleReset() {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    if (sessionId) {
      try { await completeSession.mutateAsync({ id: sessionId, actualSeconds: totalSeconds - timeLeft, completed: false }); }
      catch { setError('Could not save interrupted focus time.'); return; }
    }
    setTimeLeft(customDurations[mode] * 60);
    setSessionId(null);
    setJustCompleted(false);
  }

  async function handleComplete(actualSeconds = totalSeconds - timeLeft): Promise<boolean> {
    if (finishingRef.current) return false;
    finishingRef.current = true;
    setIsRunning(false);
    if (sessionId) {
      try {
        await completeSession.mutateAsync({ id: sessionId, actualSeconds });
      } catch { setError('Session could not be completed. Please retry.'); finishingRef.current = false; return false; }
    }
    setCompletedCount((c) => c + 1);
    setJustCompleted(true);
    setSessionId(null);
    finishingRef.current = false;
    if (settings.soundEnabled) try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch { /* ignore */ }
    return true;
  }

  function saveSettings() {
    if (sessionId) { setError('Finish or reset the current session before changing durations.'); return; }
    setCustomDurations({ ...draftDurations });
    settings.setPomodoroSettings({ workMinutes: draftDurations.FOCUS, breakMinutes: draftDurations.SHORT_BREAK, longBreakMinutes: draftDurations.LONG_BREAK });
    setShowSettings(false);
  }

  const progress = timeLeft / totalSeconds;
  const meta = MODE_META[mode];

  const todayFocus = (sessions ?? []).filter(
    (s) => s.type === 'POMODORO' && s.completed &&
      new Date(s.startTime).toDateString() === new Date().toDateString(),
  ).length;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: '3rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 800, margin: 0,
            background: 'linear-gradient(135deg, #c4b5fd, #93c5fd)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Pomodoro Timer
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
            {todayFocus} focus session{todayFocus !== 1 ? 's' : ''} completed today
          </p>
        </div>
        <button
          onClick={() => { setDraftDurations({ ...customDurations }); setShowSettings((v) => !v); }}
          disabled={!!sessionId}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
            border: `1px solid ${showSettings ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: showSettings ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
            cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
            color: showSettings ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
          }}
        >
          <Settings2 size={14} />
          Custom Durations
        </button>
      </div>

      {/* ── Settings Panel ── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '1.25rem' }}
          >
            <div style={{
              padding: '1rem 1.25rem',
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '0.875rem',
            }}>
              <p style={{ margin: '0 0 0.875rem', fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                Set custom durations (minutes)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', marginBottom: '0.875rem' }}>
                {(Object.entries(MODE_META) as [VisualMode, typeof MODE_META[VisualMode]][]).map(([m, meta]) => (
                  <div key={m}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: meta.color, display: 'block', marginBottom: '0.375rem', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                      {meta.label}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number" min={1} max={90}
                        value={draftDurations[m]}
                        onChange={(e) => setDraftDurations((prev) => ({ ...prev, [m]: Math.max(1, Number(e.target.value)) }))}
                        style={{
                          width: '100%', padding: '0.5rem 0.625rem',
                          background: 'rgba(255,255,255,0.06)',
                          border: `1px solid ${meta.color}44`,
                          borderRadius: '0.5rem', fontSize: '0.875rem',
                          color: 'rgba(255,255,255,0.9)', outline: 'none',
                          textAlign: 'center' as const, boxSizing: 'border-box' as const,
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>min</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowSettings(false)} style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
                  Cancel
                </button>
                <button onClick={saveSettings} style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8125rem', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff' }}>
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mode Selector ── */}
      {error && <p role="alert" style={{ color: '#f87171' }}>{error}</p>}
      {mode === 'FOCUS' && <label style={{ display: 'block', marginBottom: 16, color: 'rgba(255,255,255,.8)' }}>Focus task
        <select value={taskId} disabled={!!sessionId} onChange={e => setTaskId(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, background: '#222035', color: 'white', borderRadius: 8 }}>
          <option value="">No specific task</option>
          {tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED').map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </label>}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.875rem', padding: '0.375rem' }}>
        {(Object.entries(MODE_META) as [VisualMode, typeof MODE_META[VisualMode]][]).map(([m, info]) => (
          <button
            key={m}
            disabled={!!sessionId}
            onClick={() => setMode(m)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.625rem 0.5rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.8125rem',
              background: mode === m ? `linear-gradient(135deg, ${info.color}40, ${info.color}20)` : 'transparent',
              color: mode === m ? '#fff' : 'rgba(255,255,255,0.4)',
              borderBottom: mode === m ? `2px solid ${info.color}` : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ color: mode === m ? info.color : 'rgba(255,255,255,0.3)', display: 'flex' }}>{info.icon}</span>
            {info.label}
            <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)' }}>
              {customDurations[m]}m
            </span>
          </button>
        ))}
      </div>

      {/* ── Timer Ring ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '2rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '1.5rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: `radial-gradient(circle, ${meta.color}12 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RingTimer progress={progress} color={meta.color} />
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{
              fontSize: '3.5rem', fontWeight: 800,
              color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.02em', lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatTime(timeLeft)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ color: meta.color, display: 'flex' }}>{meta.icon}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{meta.label}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{meta.desc}</span>
          </div>
        </div>

        <AnimatePresence>
          {justCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', borderRadius: '999px',
                background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                fontSize: '0.875rem', fontWeight: 700, color: '#4ade80',
              }}
            >
              <CheckCircle2 size={16} />
              Session complete! Great work 🎉
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: '0.875rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button
            onClick={handleReset}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <RotateCcw size={18} />
          </button>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={isRunning ? handlePause : handleStart}
            style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
              color: '#fff',
              boxShadow: `0 0 0 8px ${meta.color}22, 0 8px 32px ${meta.color}44`,
            }}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
          </motion.button>

          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={12} style={{ color: '#f97316' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#f97316', lineHeight: 1 }}>
              {completedCount}
            </span>
          </div>
        </div>
        {sessionId && mode === 'FOCUS' && taskId && <button onClick={async () => { if (await handleComplete()) { try { await completeTask.mutateAsync({ id: taskId, status: 'DONE' }); } catch { setError('Focus time was saved, but the task could not be marked complete. Please update the task manually.'); } } }} style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, border: 0, cursor: 'pointer' }}>Finish task and record focus time</button>}
        {sessionId && <button onClick={() => { void handleComplete(); }} disabled={completeSession.isPending} style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, border: 0, cursor: 'pointer' }}>Finish session and record actual time</button>}
      </div>

      {/* ── Recent Sessions ── */}
      {sessions && sessions.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '1rem', padding: '1rem 1.25rem',
        }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recent Sessions
          </p>
          {sessions.slice(0, 6).map((s) => {
            const modeEntry = (Object.entries(MODE_TO_API) as [VisualMode, SessionType][]).find(([, api]) => api === s.type);
            const info = modeEntry ? MODE_META[modeEntry[0]] : { label: s.type, color: '#8b5cf6', icon: <Brain size={13} /> };
            return (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.375rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ color: info.color, display: 'flex', flexShrink: 0 }}>{info.icon}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                  {info.label}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                  {s.endTime ? `${Math.round(s.actualSeconds / 60)}m actual` : `${s.durationMinutes}m planned`}
                </span>
                <span style={{ fontSize: '0.6875rem', color: s.completed ? '#4ade80' : 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                  {s.completed ? '✓ Done' : '—'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
