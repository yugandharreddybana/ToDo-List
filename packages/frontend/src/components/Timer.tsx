import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle2, Timer as TimerIcon } from 'lucide-react';
import { useStartSession, useCompleteSession, useSessions } from '../hooks/useSessions';
import { useSettingsStore } from '../stores/settings.store';
import type { SessionType } from '../hooks/useSessions';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Skeleton } from './ui/Skeleton';

const MODE_CONFIG: Record<string, { type: SessionType; label: string; icon: React.ElementType; color: string }> = {
  work: { type: 'POMODORO', label: 'Focus', icon: Brain, color: 'var(--accent-primary)' },
  short: { type: 'SHORT_BREAK', label: 'Short Break', icon: Coffee, color: 'var(--accent-green)' },
  long: { type: 'LONG_BREAK', label: 'Long Break', icon: Coffee, color: 'var(--accent-purple)' },
};

export default function Timer() {
  const settings = useSettingsStore();
  const startSession = useStartSession();
  const completeSession = useCompleteSession();
  const { data: sessions, isLoading: sessionsLoading } = useSessions({ limit: 10 });

  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [secondsLeft, setSecondsLeft] = useState(settings.pomodoroWorkMinutes * 60);
  const [running, setRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = {
    work: settings.pomodoroWorkMinutes * 60,
    short: settings.pomodoroBreakMinutes * 60,
    long: settings.pomodoroLongBreakMinutes * 60,
  }[mode];

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleComplete = useCallback(async () => {
    setRunning(false);
    if (sessionId) {
      await completeSession.mutateAsync({ id: sessionId });
      setSessionId(null);
    }
    setCompletedSessions((n) => n + 1);
    const nextCount = completedSessions + 1;
    if (mode === 'work') {
      const nextMode = nextCount % settings.pomodoroSessionsBeforeLong === 0 ? 'long' : 'short';
      setMode(nextMode);
      setSecondsLeft(nextMode === 'long' ? settings.pomodoroLongBreakMinutes * 60 : settings.pomodoroBreakMinutes * 60);
    } else {
      setMode('work');
      setSecondsLeft(settings.pomodoroWorkMinutes * 60);
    }
  }, [sessionId, mode, completedSessions, settings, completeSession]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, handleComplete]);

  async function handleStart() {
    if (!running) {
      const { id } = await startSession.mutateAsync({
        type: MODE_CONFIG[mode].type,
        durationMinutes: Math.ceil(totalSeconds / 60),
      });
      setSessionId(id);
    }
    setRunning((v) => !v);
  }

  function handleReset() {
    setRunning(false);
    setSessionId(null);
    setSecondsLeft(totalSeconds);
  }

  function switchMode(m: 'work' | 'short' | 'long') {
    setRunning(false);
    setMode(m);
    setSessionId(null);
    const secs = { work: settings.pomodoroWorkMinutes * 60, short: settings.pomodoroBreakMinutes * 60, long: settings.pomodoroLongBreakMinutes * 60 }[m];
    setSecondsLeft(secs);
  }

  const cfg = MODE_CONFIG[mode];
  const circumference = 2 * Math.PI * 90;
  const strokeDash = circumference * (1 - progress / 100);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Focus Timer</h1>

      {/* Mode selector */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '0.875rem 1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['work', 'short', 'long'] as const).map((m) => (
              <Button
                key={m}
                variant={mode === m ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => switchMode(m)}
              >
                {MODE_CONFIG[m].label}
              </Button>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <CheckCircle2 size={14} /> {completedSessions} completed
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Timer dial */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem' }}>
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <svg width={220} height={220} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={110} cy={110} r={90} fill="none" stroke="var(--border-subtle)" strokeWidth={8} />
              <circle
                cx={110} cy={110} r={90} fill="none"
                stroke={cfg.color} strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <cfg.icon size={24} style={{ color: cfg.color, marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{cfg.label}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="primary"
              size="lg"
              leftIcon={running ? <Pause size={18} /> : <Play size={18} />}
              onClick={handleStart}
              isLoading={startSession.isPending}
              style={{ minWidth: 140 }}
            >
              {running ? 'Pause' : sessionId ? 'Resume' : 'Start'}
            </Button>
            <Button variant="ghost" size="lg" onClick={handleReset}>
              <RotateCcw size={18} />
            </Button>
          </div>

          {/* Session dots */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
            {Array.from({ length: settings.pomodoroSessionsBeforeLong }).map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < (completedSessions % settings.pomodoroSessionsBeforeLong) ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }} />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Recent sessions */}
      <Card>
        <CardBody>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
            Recent Sessions
          </h3>
          {sessionsLoading ? (
            <Skeleton lines={3} />
          ) : !sessions?.length ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, textAlign: 'center', padding: '1rem' }}>
              No sessions yet. Start your first focus session!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sessions.slice(0, 8).map((s) => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <TimerIcon size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {s.type.replace('_', ' ')} · {s.durationMinutes}m
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(s.startTime).toLocaleDateString()}
                  </span>
                  <Badge variant={s.completed ? 'success' : 'default'}>
                    {s.completed ? 'Done' : 'Incomplete'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
