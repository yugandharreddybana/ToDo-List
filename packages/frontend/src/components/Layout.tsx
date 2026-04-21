import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Timer, Target, Briefcase,
  Heart, BarChart2, Bot, Calendar, Settings, LogOut, Menu, X, Bell,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { useUnreadCount } from '../hooks/useNotifications';
import { Avatar } from './ui/Avatar';

const NAV = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/timer', icon: Timer, label: 'Focus' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/career', icon: Briefcase, label: 'Career' },
  { path: '/health', icon: Heart, label: 'Health' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/ai', icon: Bot, label: 'AI Coach' },
  { path: '/roster', icon: Calendar, label: 'Roster' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const unread = useUnreadCount();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 250ms cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        zIndex: 10,
      }}>
        {/* Logo row */}
        <div style={{
          height: 60, display: 'flex', alignItems: 'center',
          padding: '0 1rem', borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0, gap: '0.75rem',
        }}>
          <button
            onClick={toggleSidebar}
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              border: 'none', cursor: 'pointer', background: 'transparent',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {sidebarOpen && (
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              Productivity
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
                textDecoration: 'none', fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' : 'transparent',
                transition: 'var(--transition)', whiteSpace: 'nowrap', marginBottom: '0.125rem',
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{
          padding: '0.75rem 0.5rem', borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0,
        }}>
          <Avatar name={user?.name ?? ''} src={user?.avatarUrl} size={32} />
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-coral)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          height: 60, background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem', flexShrink: 0,
        }}>
          <div style={{ flex: 1 }} />
          <NavLink to="/settings" style={{ position: 'relative', display: 'flex', color: 'var(--text-secondary)' }}>
            <Bell size={20} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                background: 'var(--accent-coral)', color: '#fff',
                borderRadius: 9, minWidth: 17, height: 17,
                fontSize: '0.65rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>
          <Avatar name={user?.name ?? ''} src={user?.avatarUrl} size={34} />
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
