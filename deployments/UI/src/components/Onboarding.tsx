import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Globe, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

type Mode = 'login' | 'register';

export default function Onboarding() {
  const [mode, setMode] = useState<Mode>('login');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, register, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (form.name.trim().length < 1) { setError('Name is required'); return; }
        if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
        await register(form.name, form.email, form.password, form.timezone);
      }
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      setError(msg ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-md)',
            background: 'var(--accent-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem', boxShadow: '0 4px 16px color-mix(in srgb, var(--accent-primary) 40%, transparent)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="14" height="2" rx="1" fill="white" />
              <rect x="3" y="10" width="10" height="2" rx="1" fill="white" />
              <rect x="3" y="15" width="12" height="2" rx="1" fill="white" />
              <circle cx="19" cy="16" r="3" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Productivity Suite
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', padding: '2rem',
        }}>
          <div style={{
            display: 'flex', gap: '0.25rem',
            background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
            padding: '0.25rem', marginBottom: '1.5rem',
          }}>
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: 'calc(var(--radius-md) - 2px)',
                  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                  transition: 'var(--transition)',
                  background: mode === m ? 'var(--bg-secondary)' : 'transparent',
                  color: mode === m ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <Input label="Name" placeholder="Your full name" value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                prefix={<User size={16} />} required />
            )}
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              prefix={<Mail size={16} />} required />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder={mode === 'register' ? 'Min 8 characters' : 'Your password'}
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              prefix={<Lock size={16} />}
              suffix={
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />
            {mode === 'register' && (
              <Input label="Timezone" value={form.timezone}
                onChange={(e) => setField('timezone', e.target.value)}
                prefix={<Globe size={16} />} helperText="Auto-detected — change if needed" />
            )}

            {error && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'color-mix(in srgb, var(--accent-coral) 12%, transparent)',
                color: 'var(--accent-coral)', fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" isLoading={isLoading}
              style={{ width: '100%', marginTop: '0.5rem' }}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
