import { useState } from 'react';
import { Plus, Trash2, ExternalLink, MapPin, DollarSign, Briefcase } from 'lucide-react';
import {
  useApplications, useCreateApplication, useUpdateApplication, useDeleteApplication,
  type CareerApplication, type CareerStage,
} from '../hooks/useCareer';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Skeleton } from './ui/Skeleton';

const STAGES: CareerStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];

const STAGE_COLOR: Record<CareerStage, 'default' | 'primary' | 'warning' | 'success' | 'danger'> = {
  APPLIED: 'primary',
  SCREENING: 'primary',
  INTERVIEW: 'warning',
  OFFER: 'success',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'default',
};

const PIPELINE_COLUMNS: CareerStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'];

interface AppForm {
  company: string;
  role: string;
  stage: CareerStage;
  appliedDate: string;
  salary: string;
  url: string;
  location: string;
  remote: boolean;
  notes: string;
}

const DEFAULT_FORM: AppForm = {
  company: '', role: '', stage: 'APPLIED', appliedDate: new Date().toISOString().split('T')[0],
  salary: '', url: '', location: '', remote: false, notes: '',
};

function ApplicationCard({ app, onEdit, onDelete }: {
  app: CareerApplication;
  onEdit: (a: CareerApplication) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)', padding: '0.875rem',
      marginBottom: '0.5rem', cursor: 'pointer',
      transition: 'var(--transition)',
    }}
      onClick={() => onEdit(app)}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.company}
          </p>
          <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.role}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(app.id); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}
          onMouseEnter={(ev) => (ev.currentTarget.style.color = 'var(--accent-coral)')}
          onMouseLeave={(ev) => (ev.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {app.location && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <MapPin size={11} />{app.location}
          </span>
        )}
        {app.salary && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <DollarSign size={11} />{app.salary}
          </span>
        )}
        {app.url && (
          <a href={app.url} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
            <ExternalLink size={11} />Link
          </a>
        )}
      </div>
      <p style={{ margin: '0.375rem 0 0', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
        {new Date(app.appliedDate).toLocaleDateString()}
      </p>
    </div>
  );
}

export default function CareerCRM() {
  const { data: apps, isLoading } = useApplications();
  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();
  const deleteApp = useDeleteApplication();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<CareerApplication | null>(null);
  const [form, setForm] = useState<AppForm>(DEFAULT_FORM);

  function openCreate() {
    setEditingApp(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  }

  function openEdit(app: CareerApplication) {
    setEditingApp(app);
    setForm({
      company: app.company,
      role: app.role,
      stage: app.stage,
      appliedDate: app.appliedDate.split('T')[0],
      salary: app.salary?.toString() ?? '',
      url: app.url ?? '',
      location: app.location ?? '',
      remote: app.remote,
      notes: app.notes ?? '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      stage: form.stage,
      appliedDate: new Date(form.appliedDate).toISOString(),
      salary: form.salary ? Number(form.salary) : undefined,
      url: form.url || undefined,
      location: form.location || undefined,
      remote: form.remote,
      notes: form.notes || undefined,
    };
    if (editingApp) {
      await updateApp.mutateAsync({ id: editingApp.id, ...payload });
    } else {
      await createApp.mutateAsync(payload);
    }
    setModalOpen(false);
  }

  const getAppsForStage = (stage: CareerStage) =>
    (apps ?? []).filter((a) => a.stage === stage);

  const totalApps = apps?.length ?? 0;
  const interviewCount = apps?.filter((a) => a.stage === 'INTERVIEW').length ?? 0;
  const offerCount = apps?.filter((a) => a.stage === 'OFFER' || a.stage === 'ACCEPTED').length ?? 0;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Career Pipeline</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            {totalApps} applications · {interviewCount} interviews · {offerCount} offers
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreate}>
          Add Application
        </Button>
      </div>

      {/* Stage filters for non-pipeline stages */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STAGES.map((s) => {
          const count = getAppsForStage(s).length;
          if (count === 0) return null;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Badge variant={STAGE_COLOR[s]}>{s}</Badge>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {PIPELINE_COLUMNS.map((s) => (
            <Card key={s}><CardBody><Skeleton lines={4} /></CardBody></Card>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {PIPELINE_COLUMNS.map((stage) => {
            const stageApps = getAppsForStage(stage);
            return (
              <div key={stage}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  marginBottom: '0.75rem', padding: '0 0.25rem',
                }}>
                  <Badge variant={STAGE_COLOR[stage]}>{stage}</Badge>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {stageApps.length}
                  </span>
                </div>
                <div style={{
                  minHeight: 200, background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-lg)', padding: '0.75rem',
                }}>
                  {stageApps.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      <Briefcase size={24} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                      <p style={{ margin: 0 }}>Empty</p>
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <ApplicationCard key={app.id} app={app} onEdit={openEdit} onDelete={(id) => deleteApp.mutate(id)} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejected/Withdrawn */}
      {(getAppsForStage('REJECTED').length > 0 || getAppsForStage('WITHDRAWN').length > 0) && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Closed</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {[...getAppsForStage('REJECTED'), ...getAppsForStage('WITHDRAWN')].map((app) => (
              <ApplicationCard key={app.id} app={app} onEdit={openEdit} onDelete={(id) => deleteApp.mutate(id)} />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingApp ? 'Edit Application' : 'Add Application'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input label="Company" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Company name" required />
            <Input label="Role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Job title" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Stage</label>
              <Select value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as CareerStage }))}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <Input label="Applied Date" type="date" value={form.appliedDate} onChange={(e) => setForm((f) => ({ ...f, appliedDate: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="City or Remote" prefix={<MapPin size={14} />} />
            <Input label="Salary" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} placeholder="e.g. 95000" prefix={<DollarSign size={14} />} />
          </div>
          <Input label="Job URL" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." prefix={<ExternalLink size={14} />} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Next steps, contacts..." />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} isLoading={createApp.isPending || updateApp.isPending} disabled={!form.company.trim() || !form.role.trim()}>
              {editingApp ? 'Save Changes' : 'Add Application'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
