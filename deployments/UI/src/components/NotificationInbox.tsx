import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from '../hooks/useNotifications';

export default function NotificationInbox() {
  const navigate = useNavigate();
  const { data = [], isLoading, error } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();
  return <div style={{ maxWidth: 760, margin: '0 auto' }}>
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <h1>Notifications</h1>
      <button onClick={() => markAll.mutate()} disabled={!data.some(n => !n.read) || markAll.isPending}>Mark all read</button>
    </header>
    {isLoading && <p>Loading notifications…</p>}
    {error && <p role="alert">Could not load notifications.</p>}
    {!isLoading && !error && data.length === 0 && <p>No notifications yet.</p>}
    <div style={{ display: 'grid', gap: 10 }}>
      {data.map(n => <article key={n.id} style={{ padding: 16, borderRadius: 12, border: `1px solid ${n.read ? 'rgba(255,255,255,.1)' : '#8b5cf6'}`, background: 'rgba(255,255,255,.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><strong>{n.title}</strong><small>{new Date(n.createdAt).toLocaleString()}</small></div>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{n.body}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {n.type === 'REPLAN_SUGGESTION' && <button onClick={() => { if (!n.read) markRead.mutate(n.id); navigate('/plan'); }}>Review and replan</button>}
          {n.type.endsWith('_SUMMARY') && <button onClick={() => navigate('/analytics')}>Open analytics</button>}
          {!n.read && <button onClick={() => markRead.mutate(n.id)} disabled={markRead.isPending}>Mark read</button>}
          <button onClick={() => remove.mutate(n.id)} disabled={remove.isPending}>Dismiss</button>
        </div>
      </article>)}
    </div>
  </div>;
}
