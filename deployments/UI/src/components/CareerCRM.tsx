import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Trash2, ExternalLink, MapPin, DollarSign, Briefcase,
  Upload, Loader2, Sparkles, ChevronDown, ChevronUp,
  Star, AlertTriangle, FileText, Download, Eye, Zap,
  Search, RefreshCw, CheckCircle2,
} from 'lucide-react';
import {
  useApplications, useCreateApplication, useUpdateApplication, useDeleteApplication,
  type CareerApplication, type CareerStage,
} from '../hooks/useCareer';
import { Modal } from './ui/Modal';
import { matchCVToRoles, findMatchingJobs, type JobMatch } from '../services/gemini';

/* ─── PDF text extraction (local worker) ─────────────────────── */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    // Use the bundled worker via Vite's asset handling
    const workerUrl = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text.trim();
  } catch {
    throw new Error('Could not read PDF. Make sure the file is a valid, non-scanned PDF.');
  }
}

/* ─── CV localStorage store (keyed by application ID) ────────── */
function saveCVForApp(appId: string, fileName: string, dataUrl: string) {
  try {
    localStorage.setItem(`cv_${appId}`, JSON.stringify({ fileName, dataUrl, savedAt: new Date().toISOString() }));
  } catch {
    // Storage full — ignore
  }
}

function getCVForApp(appId: string): { fileName: string; dataUrl: string; savedAt: string } | null {
  try {
    const raw = localStorage.getItem(`cv_${appId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function deleteCVForApp(appId: string) {
  localStorage.removeItem(`cv_${appId}`);
}

/* ─── Style helpers ──────────────────────────────────────────── */
function glassInput(extra?: object) {
  return {
    width: '100%', padding: '0.5rem 0.75rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '0.5rem', fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.9)', outline: 'none',
    boxSizing: 'border-box' as const, ...extra,
  };
}

function fLabel(text: string) {
  return (
    <label style={{
      fontSize: '0.6875rem', fontWeight: 700,
      color: 'rgba(255,255,255,0.4)', display: 'block',
      marginBottom: '0.25rem', textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    }}>
      {text}
    </label>
  );
}

/* ─── Constants ──────────────────────────────────────────────── */
const STAGES: CareerStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];
const PIPELINE_COLUMNS: { stage: CareerStage; label: string; color: string }[] = [
  { stage: 'APPLIED', label: 'Applied', color: '#8b5cf6' },
  { stage: 'SCREENING', label: 'Screening', color: '#3b82f6' },
  { stage: 'INTERVIEW', label: 'Interview', color: '#f97316' },
  { stage: 'OFFER', label: 'Offer', color: '#22c55e' },
];

/* ─── CV Analysis Panel ──────────────────────────────────────── */
interface CVAnalysis {
  topRoles: { role: string; match: number; reason: string }[];
  skills: string[];
  gaps: string[];
  summary: string;
}

function CVAnalyserPanel() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [isFetchingJobs, setIsFetchingJobs] = useState(false);
  const [error, setError] = useState('');
  const [cvText, setCvText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setIsAnalysing(true);
    setError('');
    setAnalysis(null);
    setJobs([]);
    try {
      const text = await extractTextFromPDF(file);
      if (!text) throw new Error('Could not extract text from PDF.');
      setCvText(text);
      const result = await matchCVToRoles(text);
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsAnalysing(false);
    }
  }, []);

  async function fetchJobs() {
    if (!analysis) return;
    setIsFetchingJobs(true);
    setError('');
    try {
      const matched = await findMatchingJobs(analysis.summary, analysis.skills);
      setJobs(matched);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsFetchingJobs(false);
    }
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '1rem',
      padding: '1.25rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '0 0 16px rgba(139,92,246,0.3)' }}>
          <Sparkles size={18} color="#fff" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>AI CV Analyser</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Upload your CV — Gemini matches you to best-fit roles & finds live jobs</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') processFile(f); else setError('Please upload a PDF.'); }}
        style={{ border: `2px dashed ${isDragging ? '#8b5cf6' : 'rgba(255,255,255,0.12)'}`, borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer', background: isDragging ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s', marginBottom: '1rem' }}
      >
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} style={{ display: 'none' }} />
        {isAnalysing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Loader2 size={28} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Analysing your CV with Gemini AI…</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
            <Upload size={28} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{fileName || 'Drop your CV or click to browse'}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>PDF format only</p>
          </div>
        )}
      </div>

      {error && <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', fontSize: '0.8125rem', color: '#f43f5e', marginBottom: '0.75rem' }}>{error}</div>}

      {analysis && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '0.625rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
            {analysis.summary}
          </div>

          {/* Top roles */}
          <div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best-Fit Roles</p>
            {analysis.topRoles.map((role, i) => (
              <div key={i} style={{ padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.625rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                  <Star size={13} style={{ color: '#f97316', flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', flex: 1 }}>{role.role}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px', background: role.match >= 85 ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.15)', color: role.match >= 85 ? '#4ade80' : '#fb923c' }}>{role.match}%</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.375rem' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${role.match}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: role.match >= 85 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #f97316, #fb923c)', borderRadius: '999px' }} />
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{role.reason}</p>
              </div>
            ))}
          </div>

          {/* Skills & gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {analysis.skills.map((s) => <span key={s} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '999px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>{s}</span>)}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Growth Areas</p>
              {analysis.gaps.map((g) => <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.25rem' }}><AlertTriangle size={11} style={{ color: '#f97316', flexShrink: 0 }} />{g}</div>)}
            </div>
          </div>

          {/* Find jobs button */}
          <button
            onClick={fetchJobs}
            disabled={isFetchingJobs}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem', borderRadius: '0.625rem', border: 'none', cursor: isFetchingJobs ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.875rem', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
          >
            {isFetchingJobs ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
            Find Matching Jobs (Last 48h, 80%+ ATS)
          </button>

          {/* Job matches */}
          {jobs.length > 0 && (
            <div>
              <p style={{ margin: '0 0 0.625rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{jobs.length} Matching Jobs Found</p>
              {jobs.map((job, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>{job.title}</span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.0625rem 0.375rem', borderRadius: '999px', background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>{job.atsScore}% match</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)' }}>{job.company} · {job.location}</p>
                      {job.salary && <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#22c55e' }}>{job.salary}</p>}
                      <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{job.matchReason}</p>
                    </div>
                    {job.url && (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.625rem', borderRadius: '0.375rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
                        <ExternalLink size={12} /> Apply
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ─── CV Upload per Application ──────────────────────────────── */
function AppCVUpload({ appId }: { appId: string }) {
  const [cv, setCv] = useState<{ fileName: string; dataUrl: string; savedAt: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setCv(getCVForApp(appId)); }, [appId]);

  async function handleUpload(file: File) {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      saveCVForApp(appId, file.name, dataUrl);
      setCv({ fileName: file.name, dataUrl, savedAt: new Date().toISOString() });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function handleDownload() {
    if (!cv) return;
    const a = document.createElement('a');
    a.href = cv.dataUrl;
    a.download = cv.fileName;
    a.click();
  }

  function handleView() {
    if (!cv) return;
    const win = window.open();
    win?.document.write(`<iframe src="${cv.dataUrl}" width="100%" height="100%" style="border:none;position:absolute;top:0;left:0"></iframe>`);
  }

  return (
    <div style={{ marginTop: '0.75rem' }}>
      {fLabel('CV / Resume for this application')}
      {cv ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem' }}>
          <FileText size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cv.fileName}</span>
          <button onClick={handleView} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b5cf6', display: 'flex', padding: '0.125rem' }} title="View"><Eye size={14} /></button>
          <button onClick={handleDownload} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', padding: '0.125rem' }} title="Download"><Download size={14} /></button>
          <button onClick={() => { deleteCVForApp(appId); setCv(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e', display: 'flex', padding: '0.125rem' }} title="Remove">×</button>
        </div>
      ) : (
        <div>
          <input ref={fileInputRef} type="file" accept="application/pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} style={{ display: 'none' }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', width: '100%', justifyContent: 'center' }}
          >
            {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
            {uploading ? 'Uploading…' : 'Attach CV used for this application (PDF/DOC)'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Application Card ───────────────────────────────────────── */
function ApplicationCard({ app, onEdit, onDelete }: { app: CareerApplication; onEdit: (a: CareerApplication) => void; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const hasCV = !!getCVForApp(app.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} layout
      onClick={() => onEdit(app)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: '0.75rem', borderRadius: '0.625rem', cursor: 'pointer', background: hovered ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${hovered ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.07)'}`, marginBottom: '0.375rem', transition: 'all 0.15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.375rem' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</p>
          <p style={{ margin: '0.125rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          {hasCV && <span title="CV attached"><FileText size={12} style={{ color: '#4ade80' }} /></span>}
          <button onClick={(e) => { e.stopPropagation(); onDelete(app.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', display: 'flex', padding: '0.125rem' }} onMouseEnter={(ev) => (ev.currentTarget.style.color = '#f43f5e')} onMouseLeave={(ev) => (ev.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
        {app.location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)' }}><MapPin size={10} />{app.location}</span>}
        {app.salary && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)' }}><DollarSign size={10} />{app.salary.toLocaleString()}</span>}
        {app.url && <a href={app.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6875rem', color: '#8b5cf6', textDecoration: 'none' }}><ExternalLink size={10} />Link</a>}
      </div>
      <p style={{ margin: '0.25rem 0 0', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.25)' }}>{new Date(app.appliedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
    </motion.div>
  );
}

/* ─── AppForm type ───────────────────────────────────────────── */
interface AppForm {
  company: string; role: string; stage: CareerStage;
  appliedDate: string; salary: string; url: string;
  location: string; remote: boolean; notes: string;
}

const DEFAULT_FORM: AppForm = {
  company: '', role: '', stage: 'APPLIED',
  appliedDate: new Date().toISOString().split('T')[0],
  salary: '', url: '', location: '', remote: false, notes: '',
};

/* ─── Main CareerCRM ─────────────────────────────────────────── */
export default function CareerCRM() {
  const { data: apps, isLoading } = useApplications();
  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();
  const deleteApp = useDeleteApplication();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<CareerApplication | null>(null);
  const [form, setForm] = useState<AppForm>(DEFAULT_FORM);
  const [showCV, setShowCV] = useState(false);

  function openCreate() { setEditingApp(null); setForm(DEFAULT_FORM); setModalOpen(true); }
  function openEdit(app: CareerApplication) {
    setEditingApp(app);
    setForm({ company: app.company, role: app.role, stage: app.stage, appliedDate: app.appliedDate.split('T')[0], salary: app.salary?.toString() ?? '', url: app.url ?? '', location: app.location ?? '', remote: app.remote, notes: app.notes ?? '' });
    setModalOpen(true);
  }

  async function handleSave() {
    const payload = { company: form.company.trim(), role: form.role.trim(), stage: form.stage, appliedDate: new Date(form.appliedDate).toISOString(), salary: form.salary ? Number(form.salary) : undefined, url: form.url || undefined, location: form.location || undefined, remote: form.remote, notes: form.notes || undefined };
    if (editingApp) await updateApp.mutateAsync({ id: editingApp.id, ...payload });
    else await createApp.mutateAsync(payload);
    setModalOpen(false);
  }

  const getAppsForStage = (stage: CareerStage) => (apps ?? []).filter((a) => a.stage === stage);
  const totalApps = apps?.length ?? 0;
  const interviewCount = apps?.filter((a) => a.stage === 'INTERVIEW').length ?? 0;
  const offerCount = apps?.filter((a) => ['OFFER', 'ACCEPTED'].includes(a.stage)).length ?? 0;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '3rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #c4b5fd, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Career Pipeline</h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem' }}>
            {[{ label: 'Applications', value: totalApps, color: 'rgba(255,255,255,0.5)' }, { label: 'Interviews', value: interviewCount, color: '#f97316' }, { label: 'Offers', value: offerCount, color: '#22c55e' }].map((s) => (
              <span key={s.label} style={{ fontSize: '0.8125rem', color: s.color }}><strong style={{ fontWeight: 700 }}>{s.value}</strong> {s.label}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowCV((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderRadius: '0.625rem', border: `1px solid ${showCV ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`, background: showCV ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: showCV ? '#c4b5fd' : 'rgba(255,255,255,0.6)', transition: 'all 0.15s' }}>
            <Zap size={14} />AI CV + Jobs
            {showCV ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
            <Plus size={16} />Add Application
          </button>
        </div>
      </div>

      {/* ── CV Analyser ── */}
      <AnimatePresence>
        {showCV && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <CVAnalyserPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Kanban ── */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {PIPELINE_COLUMNS.map((col) => <div key={col.stage} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.875rem', height: 200, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {PIPELINE_COLUMNS.map(({ stage, label, color }) => {
            const stageApps = getAppsForStage(stage);
            return (
              <div key={stage} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderTop: `3px solid ${color}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{label}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.0625rem 0.4rem', borderRadius: '999px', background: `${color}22`, color }}>{stageApps.length}</span>
                </div>
                <div style={{ padding: '0 0.5rem 0.75rem', minHeight: 80 }}>
                  <AnimatePresence>
                    {stageApps.map((app) => <ApplicationCard key={app.id} app={app} onEdit={openEdit} onDelete={(id) => { deleteApp.mutate(id); deleteCVForApp(id); }} />)}
                  </AnimatePresence>
                  {stageApps.length === 0 && <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}><Briefcase size={20} style={{ marginBottom: '0.375rem', display: 'block', margin: '0 auto 0.375rem' }} />Empty</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Closed ── */}
      {(getAppsForStage('REJECTED').length > 0 || getAppsForStage('WITHDRAWN').length > 0 || getAppsForStage('ACCEPTED').length > 0) && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Closed</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {[...getAppsForStage('ACCEPTED'), ...getAppsForStage('REJECTED'), ...getAppsForStage('WITHDRAWN')].map((app) => (
              <ApplicationCard key={app.id} app={app} onEdit={openEdit} onDelete={(id) => { deleteApp.mutate(id); deleteCVForApp(id); }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingApp ? 'Edit Application' : 'Add Application'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <div>{fLabel('Company *')}<input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Company name" style={glassInput()} /></div>
            <div>{fLabel('Role *')}<input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Job title" style={glassInput()} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <div>{fLabel('Stage')}<select value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as CareerStage }))} style={glassInput({ cursor: 'pointer' })}>{STAGES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div>{fLabel('Applied Date')}<input type="date" value={form.appliedDate} onChange={(e) => setForm((f) => ({ ...f, appliedDate: e.target.value }))} style={glassInput({ cursor: 'pointer', colorScheme: 'dark' })} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <div>{fLabel('Location')}<input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="City or Remote" style={glassInput()} /></div>
            <div>{fLabel('Salary')}<input value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} placeholder="e.g. 95000" type="number" style={glassInput()} /></div>
          </div>
          <div>{fLabel('Job URL')}<input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." style={glassInput()} /></div>
          <div>{fLabel('Notes')}<textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Next steps, contacts, prep notes…" rows={2} style={{ ...glassInput(), resize: 'vertical', fontFamily: 'inherit' }} /></div>

          {/* CV upload — only for existing applications */}
          {editingApp && <AppCVUpload appId={editingApp.id} />}

          <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button onClick={() => setModalOpen(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
            <button onClick={handleSave} disabled={!form.company.trim() || !form.role.trim() || createApp.isPending || updateApp.isPending} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', boxShadow: '0 4px 12px rgba(139,92,246,0.3)', opacity: !form.company.trim() || !form.role.trim() ? 0.5 : 1 }}>
              {(createApp.isPending || updateApp.isPending) && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
              {editingApp ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
