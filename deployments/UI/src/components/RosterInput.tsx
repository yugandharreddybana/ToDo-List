import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2, Clock, MapPin } from 'lucide-react';
import {
  useRosterShifts, useCreateShift, useUpdateShift, useDeleteShift,
  type RosterShift, type ShiftType,
} from '../hooks/useRoster';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Skeleton } from './ui/Skeleton';

const SHIFT_TYPES: ShiftType[] = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'CUSTOM'];

const SHIFT_COLOR: Record<ShiftType, string> = {
  MORNING: 'var(--accent-amber)',
  AFTERNOON: 'var(--accent-primary)',
  EVENING: 'var(--accent-purple)',
  NIGHT: 'var(--text-secondary)',
  CUSTOM: 'var(--accent-green)',
};

interface ShiftForm {
  shiftDate: string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  location: string;
  notes: string;
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const result = new Date(d);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function hourDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  return Math.round((endMins - startMins) / 60 * 10) / 10;
}

export default function RosterInput() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const { data: shifts, isLoading } = useRosterShifts({
    from: formatDate(weekStart),
    to: formatDate(weekEnd),
  });
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const deleteShift = useDeleteShift();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<RosterShift | null>(null);
  const [form, setForm] = useState<ShiftForm>({
    shiftDate: formatDate(new Date()),
    startTime: '09:00',
    endTime: '17:00',
    type: 'MORNING',
    location: '',
    notes: '',
  });

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  function shiftsForDay(d: Date): RosterShift[] {
    const key = formatDate(d);
    return (shifts ?? []).filter((s) => s.shiftDate === key);
  }

  function openCreate(d: Date) {
    setEditingShift(null);
    setForm({
      shiftDate: formatDate(d),
      startTime: '09:00',
      endTime: '17:00',
      type: 'MORNING',
      location: '',
      notes: '',
    });
    setModalOpen(true);
  }

  function openEdit(s: RosterShift) {
    setEditingShift(s);
    setForm({
      shiftDate: s.shiftDate,
      startTime: s.startTime.slice(0, 5),
      endTime: s.endTime.slice(0, 5),
      type: s.type,
      location: s.location ?? '',
      notes: s.notes ?? '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const payload = {
      shiftDate: form.shiftDate,
      startTime: form.startTime,
      endTime: form.endTime,
      type: form.type,
      location: form.location || undefined,
      notes: form.notes || undefined,
    };
    if (editingShift) {
      await updateShift.mutateAsync({ id: editingShift.id, ...payload });
    } else {
      await createShift.mutateAsync(payload);
    }
    setModalOpen(false);
  }

  function navigateWeek(dir: -1 | 1) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7 * dir);
    setWeekStart(next);
  }

  const totalHours = (shifts ?? []).reduce(
    (acc, s) => acc + hourDuration(s.startTime.slice(0, 5), s.endTime.slice(0, 5)),
    0,
  );

  const today = new Date().toDateString();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Roster</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            {totalHours.toFixed(1)} hours this week · {shifts?.length ?? 0} shifts
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => openCreate(new Date())}>
          Add Shift
        </Button>
      </div>

      {/* Week navigation */}
      <Card style={{ marginBottom: '1rem' }}>
        <CardBody style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft size={16} />
          </Button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)}>
            <ChevronRight size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            This Week
          </Button>
        </CardBody>
      </Card>

      {/* Week grid */}
      {isLoading ? (
        <Card><CardBody><Skeleton lines={5} /></CardBody></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {days.map((d) => {
            const dayShifts = shiftsForDay(d);
            const isToday = d.toDateString() === today;
            const dayHours = dayShifts.reduce(
              (acc, s) => acc + hourDuration(s.startTime.slice(0, 5), s.endTime.slice(0, 5)),
              0,
            );
            return (
              <div key={d.toISOString()} style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: isToday ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                border: isToday ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '0.75rem',
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {d.getDate()}
                    </p>
                  </div>
                  <button
                    onClick={() => openCreate(d)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex', borderRadius: 4 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {dayHours > 0 && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>
                    {dayHours.toFixed(1)}h
                  </div>
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {dayShifts.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto 0' }}>
                      No shifts
                    </p>
                  ) : (
                    dayShifts.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => openEdit(s)}
                        style={{
                          padding: '0.5rem',
                          background: `color-mix(in srgb, ${SHIFT_COLOR[s.type]} 12%, var(--bg-primary))`,
                          borderLeft: `3px solid ${SHIFT_COLOR[s.type]}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--text-primary)' }}>
                          <Clock size={10} />
                          {s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)}
                        </div>
                        {s.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginTop: 2 }}>
                            <MapPin size={10} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.location}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingShift ? 'Edit Shift' : 'Add Shift'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Date" type="date" value={form.shiftDate}
            onChange={(e) => setForm((f) => ({ ...f, shiftDate: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input label="Start Time" type="time" value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
            <Input label="End Time" type="time" value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Shift Type</label>
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ShiftType }))}>
              {SHIFT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <Input label="Location" value={form.location} placeholder="Optional"
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <Input label="Notes" value={form.notes} placeholder="Optional"
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
            {editingShift && (
              <Button
                variant="danger"
                leftIcon={<Trash2 size={14} />}
                onClick={async () => { await deleteShift.mutateAsync(editingShift.id); setModalOpen(false); }}
              >
                Delete
              </Button>
            )}
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} isLoading={createShift.isPending || updateShift.isPending}>
                {editingShift ? 'Save' : 'Add Shift'}
              </Button>
            </div>
          </div>
          <Badge variant="default" style={{ alignSelf: 'flex-start' }}>
            {hourDuration(form.startTime, form.endTime).toFixed(1)} hours
          </Badge>
        </div>
      </Modal>
    </div>
  );
}
