import { useState } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { useAnalyticsSummary, useHeatmap } from '../hooks/useAnalytics';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Skeleton } from './ui/Skeleton';
import { ProgressBar } from './ui/ProgressBar';

type Period = 'week' | 'month' | 'year';

const HEATMAP_COLORS = ['var(--bg-primary)', 'color-mix(in srgb, var(--accent-primary) 25%, transparent)', 'color-mix(in srgb, var(--accent-primary) 50%, transparent)', 'color-mix(in srgb, var(--accent-primary) 75%, transparent)', 'var(--accent-primary)'];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardBody>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 0.25rem' }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>{sub}</p>}
      </CardBody>
    </Card>
  );
}

function Heatmap() {
  const { data, isLoading } = useHeatmap();
  if (isLoading) return <Skeleton lines={3} />;
  if (!data?.cells.length) return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No activity data yet.</p>;

  const now = new Date();
  const yearAgo = new Date(now.getTime() - 365 * 86400000);
  const cellMap = new Map(data.cells.map((c) => [c.date, c]));
  const weeks: { date: string; level: number }[][] = [];
  let current = new Date(yearAgo);
  current.setDate(current.getDate() - current.getDay());
  let week: { date: string; level: number }[] = [];

  while (current <= now) {
    const d = current.toISOString().split('T')[0];
    const cell = cellMap.get(d);
    week.push({ date: d, level: cell?.level ?? 0 });
    if (week.length === 7) { weeks.push(week); week = []; }
    current.setDate(current.getDate() + 1);
  }
  if (week.length) weeks.push(week);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 3, minWidth: 'fit-content' }}>
        {weeks.map((w, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {w.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${cellMap.get(day.date)?.value ?? 0} tasks`}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: HEATMAP_COLORS[day.level] ?? HEATMAP_COLORS[0],
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Less</span>
        {HEATMAP_COLORS.map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [period, setPeriod] = useState<Period>('week');
  const { data: summary, isLoading } = useAnalyticsSummary(period);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Analytics</h1>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <Button key={p} variant={period === p ? 'primary' : 'ghost'} size="sm" onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardBody><Skeleton lines={2} /></CardBody></Card>)
        ) : (
          <>
            <StatCard label="Tasks Completed" value={summary?.completedTasks ?? 0}
              sub={`${summary?.completionRate ?? 0}% rate`} />
            <StatCard label="Focus Time" value={`${Math.round((summary?.totalFocusMinutes ?? 0) / 60)}h ${(summary?.totalFocusMinutes ?? 0) % 60}m`}
              sub={`${summary?.pomodoroSessions ?? 0} pomodoros`} />
            <StatCard label="Active Goals" value={summary?.activeGoals ?? 0}
              sub={`${Math.round(summary?.avgGoalProgress ?? 0)}% avg`} />
            <StatCard label="Applications" value={summary?.careerApplications ?? 0} />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Task completion chart */}
        <Card>
          <CardBody>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
              Task Completions
            </h3>
            {isLoading ? <Skeleton lines={4} /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summary?.taskCompletionByDay ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: '0.8125rem' }}
                  />
                  <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        {/* Completion rate progress */}
        <Card>
          <CardBody>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
              Performance Overview
            </h3>
            {isLoading ? <Skeleton lines={4} /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Task Completion Rate</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{summary?.completionRate ?? 0}%</span>
                  </div>
                  <ProgressBar value={summary?.completionRate ?? 0} variant="primary" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Goal Progress (avg)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{Math.round(summary?.avgGoalProgress ?? 0)}%</span>
                  </div>
                  <ProgressBar value={summary?.avgGoalProgress ?? 0} variant="success" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{summary?.totalTasks ?? 0}</p>
                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Tasks</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>{summary?.completedTasks ?? 0}</p>
                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</p>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardBody>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
            Activity Heatmap (365 days)
          </h3>
          <Heatmap />
        </CardBody>
      </Card>
    </div>
  );
}
