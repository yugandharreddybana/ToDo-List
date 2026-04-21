import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Timer, Target, Briefcase,
  Heart, BarChart2, Bot, Calendar, Settings, LogOut, Menu, X, Bell, Zap,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { useUnreadCount } from '../hooks/useNotifications';

const NAV = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: '#8b5cf6' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks', color: '#3b82f6' },
  { path: '/timer', icon: Timer, label: 'Focus', color: '#06b6d4' },
  { path: '/goals', icon: Target, label: 'Goals', color: '#10b981' },
  { path: '/career', icon: Briefcase, label: 'Career', color: '#f59e0b' },
  { path: '/health', icon: Heart, label: 'Health', color: '#f43f5e' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics', color: '#ec4899' },
  { path: '/ai', icon: Bot, label: 'AI Coach', color: '#8b5cf6' },
  { path: '/roster', icon: Calendar, label: 'Roster', color: '#06b6d4' },
  { path: '/settings', icon: Settings, label: 'Settings', color: 'rgba(255,255,255,0.5)' },
];

function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size < 32 ? 11 : 13, fontWeight: 700, color: '#fff',
      flexShrink: 0, letterSpacing: '0.5px',
      boxShadow: '0 0 12px rgba(139,92,246,0.4)',
    }}>
      {initials}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const unread = useUnreadCount();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 280ms cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        zIndex: 20,
        position: 'relative',
      }}>
        {/* Subtle gradient overlay in sidebar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 200,
          background: 'radial-gradient(ellipse at top left, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{
          height: 60, display: 'flex', alignItems: 'center',
          padding: '0 0.875rem', borderBottom: '1px solid var(--border)',
          flexShrink: 0, gap: '0.75rem', position: 'relative',
        }}>
          <button
            onClick={toggleSidebar}
            style={{
              width: 34, height: 34, borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-secondary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition)', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
              <div style={{
                width: 26, height: 26, borderRadius: 6,
                background: 'var(--btn-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-glow-purple)', flexShrink: 0,
              }}>
                <Zap size={13} fill="#fff" color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                Nexus
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map(({ path, icon: Icon, label, color }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              style={{ display: 'block', marginBottom: '2px', position: 'relative', textDecoration: 'none' }}
              onMouseEnter={() => setHovered(path)}
              onMouseLeave={() => setHovered(null)}
            >
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
                  background: isActive
                    ? `linear-gradient(90deg, ${color}22 0%, ${color}08 100%)`
                    : hovered === path ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
                  color: isActive ? color : 'var(--text-secondary)',
                  transition: 'var(--transition)',
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.875rem',
                }}>
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  {sidebarOpen && <span>{label}</span>}
                  {!sidebarOpen && hovered === path && (
                    <div style={{
                      position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-sm)',
                      padding: '0.35rem 0.65rem', fontSize: '0.8125rem', fontWeight: 500,
                      whiteSpace: 'nowrap', zIndex: 999, marginLeft: 12,
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--shadow-md)',
                    }}>
                      {label}
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{
          padding: '0.75rem 0.5rem', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0,
        }}>
          <Avatar name={user?.name ?? 'U'} size={32} />
          {sidebarOpen && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem', borderRadius: 'var(--radius-sm)', flexShrink: 0, transition: 'var(--transition)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-coral)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 60, background: 'rgba(8,10,20,0.8)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem', flexShrink: 0,
          position: 'relative', zIndex: 10,
        }}>
          <div style={{ flex: 1 }} />
          <NavLink to="/settings" style={{ position: 'relative', display: 'flex', color: 'var(--text-muted)', transition: 'var(--transition)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
          >
            <Bell size={19} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                background: 'var(--accent-coral)', color: '#fff',
                borderRadius: 99, minWidth: 16, height: 16,
                fontSize: '0.65rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px',
                boxShadow: '0 0 8px rgba(244,63,94,0.5)',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>
          <Avatar name={user?.name ?? 'U'} size={32} />
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
