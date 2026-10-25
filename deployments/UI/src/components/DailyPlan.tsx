import { useState } from 'react';
import { useTasks, useCreateTask } from '../hooks/useTasks';
import { useSessions } from '../hooks/useSessions';
import { useCommitments, useCreateCommitment, useDeleteCommitment } from '../hooks/usePlanning';
import { usePlans, useCreatePlan, useApprovePlan, useReplan, useLogEnergy, type PlanDraft, type PlanItem } from '../hooks/usePlans';
import { usePlanProposal } from '../hooks/usePlanProposal';
import { generateTasksFromPrompt } from '../services/ai';
import { useSettingsStore } from '../stores/settings.store';
import { useRosterShifts } from '../hooks/useRoster';

function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function message(error: unknown) {
  const detail = (error as { response?: { data?: { error?: { message?: unknown } } } })?.response?.data?.error?.message;
  return typeof detail === 'string' ? detail : error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
const inputStyle = { background: '#242136', color: '#fff', border: '1px solid #55506a', borderRadius: 8, padding: '9px 11px' };
const panel = { padding: 20, borderRadius: 14, background: 'rgba(255,255,255,.05)', marginBottom: 18 };

export default function DailyPlan() {
  const settings = useSettingsStore();
  const [date, setDate] = useState(localDate);
  const [taskText, setTaskText] = useState('');
  const [commitmentTitle, setCommitmentTitle] = useState('');
  const [commitmentStart, setCommitmentStart] = useState('09:00');
  const [commitmentEnd, setCommitmentEnd] = useState('10:00');
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [commitmentsConfirmed, setCommitmentsConfirmed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [energy, setEnergy] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [windowStart, setWindowStart] = useState(settings.planningWindowStart);
  const [windowEnd, setWindowEnd] = useState(settings.planningWindowEnd);
  const [questions, setQuestions] = useState<string[]>([]);
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  const [error, setError] = useState('');
  const [extracting, setExtracting] = useState(false);
  const { data: tasks = [] } = useTasks();
  const { data: sessions = [] } = useSessions();
  const { data: commitments = [] } = useCommitments();
  const { data: shifts = [] } = useRosterShifts({ from: date, to: date });
  const { data: plans = [] } = usePlans(date);
  const createTask = useCreateTask(); const createCommitment = useCreateCommitment(); const deleteCommitment = useDeleteCommitment();
  const proposal = usePlanProposal(); const create = useCreatePlan(); const replan = useReplan(); const approve = useApprovePlan(); const logEnergy = useLogEnergy();
  const latest = plans[0];
  const completed = sessions.filter(s => s.completed && s.type === 'POMODORO').slice(0, 10);
  const predictedEnergy = completed.length >= 3 ? (completed.reduce((n, s) => n + s.actualSeconds / Math.max(60, s.durationMinutes * 60), 0) / completed.length >= .8 ? 4 : 2) : 3;
  const rosterCommitments = shifts.filter(s => s.type !== 'OFF').map(s => ({ id: s.id, title: `Roster: ${s.type.toLowerCase().replace('_', ' ')}`,
    startTime: s.startTime, endTime: s.endTime, date: s.shiftDate, recurring: false, daysOfWeek: [], flexible: false }));

  async function addTasks() {
    if (!taskText.trim()) return;
    setExtracting(true); setError('');
    try {
      const extracted = await generateTasksFromPrompt(taskText);
      if (!extracted.length) { setError('No actionable tasks were found. Please add more detail.'); return; }
      for (const item of extracted) await createTask.mutateAsync({ title: item.title, description: item.description,
        priority: item.priority, estimatedMinutes: item.durationMinutes, status: 'TODO', tags: item.tags ?? [], isRecurring: item.isRecurring ?? false,
        recurrenceFreq: item.recurrenceFreq, dueDate: item.dueDate ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(item.dueDate) ? `${item.dueDate}T23:59:00` : item.dueDate).toISOString() : undefined });
      setTaskText('');
    } catch (e) { setError(message(e)); } finally { setExtracting(false); }
  }

  async function addCommitment() {
    if (!commitmentTitle.trim() || commitmentEnd <= commitmentStart) { setError('Enter a commitment name and valid time range.'); return; }
    try {
      await createCommitment.mutateAsync({ title: commitmentTitle.trim(), startTime: commitmentStart, endTime: commitmentEnd,
        daysOfWeek: repeatDaily ? [1, 2, 3, 4, 5, 6, 7] : [], recurring: repeatDaily,
        date: repeatDaily ? undefined : date, flexible: false });
      setCommitmentTitle(''); setCommitmentsConfirmed(true); setError('');
    } catch (e) { setError(message(e)); }
  }

  async function generate() {
    setError(''); setDraft(null); setQuestions([]);
    try {
      const result = await proposal.mutateAsync({ date, isToday: date === localDate(), currentTime: new Date().toTimeString().slice(0, 5),
        tasks: tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED'), commitments: [...commitments, ...rosterCommitments],
        commitmentsConfirmed: !settings.askAboutCommitments || commitmentsConfirmed || commitments.length + rosterCommitments.length > 0, feedback,
        preferences: { windowStart, windowEnd, bufferMinutes: settings.planningBufferMinutes, focusMinutes: settings.pomodoroWorkMinutes, shortBreakMinutes: settings.pomodoroBreakMinutes, longBreakMinutes: settings.pomodoroLongBreakMinutes },
        energy: { level: energy ?? predictedEnergy, mood }, history: { recentFocusSessions: completed } });
      if (result.questions?.length) setQuestions(result.questions);
      if (result.plan) setDraft(result.plan);
    } catch (e) { setError(message(e)); }
  }

  async function saveDraft() {
    if (!draft) return;
    try {
      if (latest?.status === 'APPROVED') await replan.mutateAsync({ id: latest.id, ...draft });
      else await create.mutateAsync(draft);
      setDraft(null); setError('');
    } catch (e) { setError(message(e)); }
  }

  async function approveDraft(id: string) {
    setError('');
    try { await approve.mutateAsync(id); }
    catch (e) { setError(message(e)); }
  }

  function editItem(index: number, patch: Partial<PlanItem>) {
    setDraft(current => current && ({ ...current, items: current.items.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  }

  return <div style={{ padding: 28, maxWidth: 1000, margin: '0 auto' }}>
    <h1 style={{ marginBottom: 4 }}>Daily Plan</h1>
    <p style={{ opacity: .7 }}>Tell the planner what matters, review the proposal, adjust the timing, then approve it.</p>
    {error && <p role="alert" style={{ color: '#f87171' }}>{error}</p>}
    <section style={panel} aria-label="Tasks for this day">
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Tasks</h2>
      <textarea aria-label="Describe today's tasks" value={taskText} onChange={e => setTaskText(e.target.value)} placeholder="Describe the tasks you need to do today..." style={{ ...inputStyle, width: '100%', minHeight: 70, boxSizing: 'border-box' }} />
      <button onClick={addTasks} disabled={extracting || !taskText.trim()} style={{ marginTop: 8 }}>{extracting ? 'Understanding tasks…' : 'Add tasks with AI'}</button>
      <div style={{ marginTop: 10, opacity: .7 }}>{tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED').length} unfinished tasks available for planning. You can edit priority, duration, difficulty and confidentiality on the Tasks page.</div>
    </section>
    <section style={panel} aria-label="Commitments">
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Fixed commitments</h2>
      <p style={{ opacity: .7 }}>Add meetings, sleep, and personal commitments here. These times remain protected.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input aria-label="Commitment title" value={commitmentTitle} onChange={e => setCommitmentTitle(e.target.value)} placeholder="Meeting or commitment" style={inputStyle} />
        <input aria-label="Commitment starts" type="time" value={commitmentStart} onChange={e => setCommitmentStart(e.target.value)} style={inputStyle} />
        <input aria-label="Commitment ends" type="time" value={commitmentEnd} onChange={e => setCommitmentEnd(e.target.value)} style={inputStyle} />
        <label><input type="checkbox" checked={repeatDaily} onChange={e => setRepeatDaily(e.target.checked)} /> Repeat daily</label>
        <button onClick={addCommitment}>Add</button>
      </div>
      <div style={{ marginTop: 10 }}>{commitments.filter(c => c.recurring || c.date === date).map(c => <div key={c.id} style={{ padding: 6 }}>{c.startTime}–{c.endTime} {c.title} <button aria-label={`Remove ${c.title}`} onClick={() => deleteCommitment.mutate(c.id)}>Remove</button></div>)}</div>
      {rosterCommitments.map(c => <div key={`roster-${c.id}`} style={{ padding: 6 }}>{c.startTime}–{c.endTime} {c.title} (from roster)</div>)}
      <label><input type="checkbox" checked={commitmentsConfirmed} onChange={e => setCommitmentsConfirmed(e.target.checked)} /> I have listed my fixed commitments, or have none today</label>
    </section>
    <section style={panel} aria-label="Energy and preferences">
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Energy and planning window</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <label>Date <input type="date" value={date} min={localDate()} onChange={e => setDate(e.target.value)} style={inputStyle} /></label>
        <label>From <input type="time" value={windowStart} onChange={e => setWindowStart(e.target.value)} style={inputStyle} /></label>
        <label>Until <input type="time" value={windowEnd} onChange={e => setWindowEnd(e.target.value)} style={inputStyle} /></label>
        <label>Energy <select value={energy ?? ''} onChange={e => setEnergy(e.target.value ? Number(e.target.value) : null)} style={inputStyle}><option value="">AI suggestion ({predictedEnergy}/5)</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}/5</option>)}</select></label>
        <label>Mood <select value={mood ?? ''} onChange={e => setMood(e.target.value ? Number(e.target.value) : null)} style={inputStyle}><option value="">Optional</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}/5</option>)}</select></label>
        <button onClick={() => logEnergy.mutate({ energy: energy ?? predictedEnergy, mood: mood ?? undefined, source: energy === null ? 'predicted' : 'manual' })}>Log energy</button>
      </div>
    </section>
    <section style={panel} aria-label="Planner conversation">
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Talk with the planner</h2>
      <textarea aria-label="Planning feedback" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Anything the planner should know? You can also ask it to reorder your day." style={{ ...inputStyle, width: '100%', minHeight: 60, boxSizing: 'border-box' }} />
      <button onClick={generate} disabled={proposal.isPending} style={{ marginTop: 10, padding: '10px 16px', borderRadius: 8, background: '#8b5cf6', color: 'white', border: 0 }}>{proposal.isPending ? 'Planning…' : draft || latest ? 'Revise proposal' : 'Generate proposal'}</button>
      {questions.map((q, i) => <p key={i} style={{ color: '#c4b5fd' }}>{q}</p>)}
    </section>
    {(draft || latest) && <section style={panel} aria-label="Daily plan proposal">
      <h2 style={{ marginTop: 0, fontSize: 18 }}>{draft ? 'Proposal — review before saving' : `Saved plan · ${latest.status.toLowerCase()} · version ${latest.version}`}</h2>
      <p>{(draft || latest).summary}</p>
      {(draft || latest).assumptions?.length > 0 && <p style={{ opacity: .7 }}>Assumptions: {(draft || latest).assumptions.join(' · ')}</p>}
      <div style={{ display: 'grid', gap: 8 }}>{(draft || latest).items.map((item, index) => <div key={item.id ?? index} style={{ padding: 12, borderRadius: 9, background: 'rgba(255,255,255,.06)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong style={{ minWidth: 170 }}>{item.title}</strong>
        {draft ? <><input aria-label={`${item.title} start`} type="time" value={item.startTime.slice(0, 5)} onChange={e => editItem(index, { startTime: e.target.value })} style={inputStyle} /><input aria-label={`${item.title} end`} type="time" value={item.endTime.slice(0, 5)} onChange={e => editItem(index, { endTime: e.target.value })} style={inputStyle} /></> : <span>{item.startTime}–{item.endTime}</span>}
        <span style={{ opacity: .65 }}>{item.itemType} · {item.energyLevel} energy · {item.bufferMinutes}m buffer</span>
      </div>)}</div>
      {draft && <button onClick={saveDraft} disabled={create.isPending || replan.isPending} style={{ marginTop: 16 }}>Save draft</button>}
      {!draft && latest?.status === 'DRAFT' && <button onClick={() => approveDraft(latest.id)} disabled={approve.isPending} style={{ marginTop: 16 }}>Approve this plan</button>}
    </section>}
    {!draft && !latest && <p>No plan yet. Add tasks and commitments, then generate a proposal.</p>}
  </div>;
}
