import { useState } from 'react';
import { User, Lock, Bell, Timer, Save, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useSettingsStore } from '../stores/settings.store';
import { api } from '../lib/api';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Toggle } from './ui/Toggle';
import { Badge } from './ui/Badge';

type Tab = 'profile' | 'security' | 'pomodoro' | 'notifications';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const settings = useSettingsStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    timezone: user?.timezone ?? 'UTC',
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
  });

  async function saveProfile() {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put(`/api/users/profile`, profile);
      updateUser(data as typeof user & { name: string; timezone: string });
      flash();
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    if (security.newPassword !== security.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (security.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.put(`/api/users/password`, {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '', showCurrent: false, showNew: false });
      flash();
    } catch {
      setError('Failed to update password. Check your current password.');
    } finally {
      setSaving(false);
    }
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'pomodoro', label: 'Focus Timer', icon: Timer },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Settings</h1>
        {saved && <Badge variant="success">Saved!</Badge>}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Tab list */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setError(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.6rem 0.875rem', borderRadius: 'var(--radius-md)',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontWeight: activeTab === id ? 600 : 400, fontSize: '0.875rem',
                  color: activeTab === id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: activeTab === id ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' : 'transparent',
                  transition: 'var(--transition)',
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card>
            <CardBody>
              {error && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'color-mix(in srgb, var(--accent-coral) 12%, transparent)', borderRadius: 'var(--radius-md)', color: 'var(--accent-coral)', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>Profile Information</h2>
                  <Input label="Display Name" value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    prefix={<User size={15} />} />
                  <Input label="Email" value={user?.email ?? ''} disabled
                    helperText="Email cannot be changed" />
                  <Input label="Timezone" value={profile.timezone}
                    onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                    helperText="Used for scheduling and reminders" />
                  <Button variant="primary" leftIcon={<Save size={15} />} onClick={saveProfile} isLoading={saving} style={{ alignSelf: 'flex-start' }}>
                    Save Profile
                  </Button>
                </div>
              )}

              {activeTab === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>Change Password</h2>
                  <Input
                    label="Current Password"
                    type={security.showCurrent ? 'text' : 'password'}
                    value={security.currentPassword}
                    onChange={(e) => setSecurity((s) => ({ ...s, currentPassword: e.target.value }))}
                    prefix={<Lock size={15} />}
                    suffix={
                      <button type="button" onClick={() => setSecurity((s) => ({ ...s, showCurrent: !s.showCurrent }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        {security.showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                  <Input
                    label="New Password"
                    type={security.showNew ? 'text' : 'password'}
                    value={security.newPassword}
                    onChange={(e) => setSecurity((s) => ({ ...s, newPassword: e.target.value }))}
                    prefix={<Lock size={15} />}
                    helperText="Minimum 8 characters"
                    suffix={
                      <button type="button" onClick={() => setSecurity((s) => ({ ...s, showNew: !s.showNew }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        {security.showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity((s) => ({ ...s, confirmPassword: e.target.value }))}
                    prefix={<Lock size={15} />}
                  />
                  <Button variant="primary" leftIcon={<Save size={15} />} onClick={savePassword} isLoading={saving}
                    disabled={!security.currentPassword || !security.newPassword || !security.confirmPassword}
                    style={{ alignSelf: 'flex-start' }}>
                    Update Password
                  </Button>
                </div>
              )}

              {activeTab === 'pomodoro' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>Focus Timer Settings</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <Input label="Work Duration (min)" type="number" min={1} max={60}
                      value={settings.pomodoroWorkMinutes}
                      onChange={(e) => settings.setPomodoroSettings({ workMinutes: Number(e.target.value) })} />
                    <Input label="Short Break (min)" type="number" min={1} max={30}
                      value={settings.pomodoroBreakMinutes}
                      onChange={(e) => settings.setPomodoroSettings({ breakMinutes: Number(e.target.value) })} />
                    <Input label="Long Break (min)" type="number" min={1} max={60}
                      value={settings.pomodoroLongBreakMinutes}
                      onChange={(e) => settings.setPomodoroSettings({ longBreakMinutes: Number(e.target.value) })} />
                    <Input label="Sessions Before Long Break" type="number" min={2} max={8}
                      value={settings.pomodoroSessionsBeforeLong}
                      onChange={(e) => settings.setPomodoroSettings({ sessionsBeforeLong: Number(e.target.value) })} />
                  </div>
                  <div style={{ padding: '0.875rem 1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Each cycle: {settings.pomodoroSessionsBeforeLong} × {settings.pomodoroWorkMinutes}min work + {settings.pomodoroSessionsBeforeLong - 1} × {settings.pomodoroBreakMinutes}min break + 1 × {settings.pomodoroLongBreakMinutes}min long break
                    = {settings.pomodoroSessionsBeforeLong * settings.pomodoroWorkMinutes + (settings.pomodoroSessionsBeforeLong - 1) * settings.pomodoroBreakMinutes + settings.pomodoroLongBreakMinutes}min total
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>Notification Preferences</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { label: 'Enable Notifications', sub: 'Receive in-app notifications', key: 'notificationsEnabled' as const, value: settings.notificationsEnabled, set: settings.setNotificationsEnabled },
                      { label: 'Sound Effects', sub: 'Play sounds for timer and alerts', key: 'soundEnabled' as const, value: settings.soundEnabled, set: settings.setSoundEnabled },
                    ].map(({ label, sub, value, set }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{label}</p>
                          <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{sub}</p>
                        </div>
                        <Toggle checked={value} onChange={set} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Default Task View</label>
                    <Select value={settings.defaultTaskView} onChange={(e) => settings.setDefaultTaskView(e.target.value as 'list' | 'board' | 'timeline')}>
                      <option value="list">List</option>
                      <option value="board">Board</option>
                      <option value="timeline">Timeline</option>
                    </Select>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
