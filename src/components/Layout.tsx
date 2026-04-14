import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  HeartPulse, 
  Briefcase, 
  Settings,
  Bell,
  User,
  Plus,
  Mic,
  Camera,
  Edit3,
  Timer as TimerIcon,
  BarChart3,
  Target,
  CheckSquare,
  Search,
  Droplets,
  Flame,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

type NavItem = {
  id: string;
  icon: React.ElementType;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'ai', icon: MessageSquareCode, label: 'NEXUS AI' },
  { id: 'health', icon: HeartPulse, label: 'Health' },
  { id: 'career', icon: Briefcase, label: 'Career' },
  { id: 'timer', icon: TimerIcon, label: 'Timer' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'goals', icon: Target, label: 'Goals' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTaskModal: (tab?: 'manual' | 'scan' | 'voice') => void;
}

export default function Layout({ children, activeTab, setActiveTab, onOpenTaskModal }: LayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [cmdKSearch, setCmdKSearch] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdKOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-white overflow-hidden relative">
      {/* PWA Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            exit={{ y: -40 }}
            className="fixed top-0 left-0 right-0 h-8 bg-amber text-background flex items-center justify-center text-xs font-bold z-[100]"
          >
            Offline — Changes will sync when reconnected.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className={cn("fixed left-0 h-full w-56 bg-surface border-r border-white/8 flex flex-col py-8 z-50", isOffline ? "top-8" : "top-0")}>
          <div className="px-6 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-electric-blue/10 rounded-xl flex items-center justify-center border border-electric-blue/20 shrink-0">
              <span className="text-electric-blue font-bold text-xl">N</span>
            </div>
            <span className="text-electric-blue font-bold text-xl tracking-tighter">NEXUS</span>
          </div>
          <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative shrink-0 w-full text-left",
                  activeTab === item.id 
                    ? "text-electric-blue bg-electric-blue/10 nav-active" 
                    : "text-gray-muted hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-300 shrink-0",
                  activeTab === item.id && "drop-shadow-[0_0_8px_rgba(0,191,255,0.8)]"
                )} />
                <span className="text-sm font-medium transition-colors">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        !isMobile ? "ml-56" : "mb-16",
        isOffline ? "mt-8" : ""
      )}>
        {/* Top Bar */}
        <header className="h-16 border-b border-white/8 bg-background/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && <span className="text-electric-blue font-bold text-xl tracking-tighter">NEXUS</span>}
          </div>
          
          <div className="hidden md:flex flex-col items-center">
            <p className="text-sm font-medium">Good Morning, User — Monday, Apr 13</p>
            <p className="text-xs text-gray-muted font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCmdKOpen(true)}
              className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-gray-muted transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono ml-2">⌘K</kbd>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-muted hover:text-white transition-colors"
              >
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                  transition={{ duration: 0.5, delay: 2, repeat: Infinity, repeatDelay: 10 }}
                >
                  <Bell className="w-5 h-5" />
                </motion.div>
                <span className="absolute top-1 right-1 w-4 h-4 bg-red text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background">3</span>
              </button>

              {/* Notification Center */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="font-bold">Notifications</h3>
                      <button className="text-xs text-electric-blue hover:text-white transition-colors">Mark all read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-muted px-2 py-1">Today</div>
                        <div className="p-2 hover:bg-white/5 rounded-xl cursor-pointer flex gap-3 transition-colors group">
                          <div className="w-8 h-8 rounded-full bg-red/20 flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-red" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Overdue Task</p>
                            <p className="text-xs text-gray-muted">Update Portfolio README was due yesterday.</p>
                          </div>
                        </div>
                        <div className="p-2 hover:bg-white/5 rounded-xl cursor-pointer flex gap-3 transition-colors group">
                          <div className="w-8 h-8 rounded-full bg-electric-blue/20 flex items-center justify-center shrink-0">
                            <Brain className="w-4 h-4 text-electric-blue" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">AI Suggestion</p>
                            <p className="text-xs text-gray-muted">You have 2 hours of free time. Start 'Deep Work'?</p>
                          </div>
                        </div>
                        <div className="p-2 hover:bg-white/5 rounded-xl cursor-pointer flex gap-3 transition-colors group">
                          <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center shrink-0">
                            <Flame className="w-4 h-4 text-amber" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Streak at Risk</p>
                            <p className="text-xs text-gray-muted">Complete your daily Pomodoro to keep the 8-day streak!</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 border-t border-white/5">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-muted px-2 py-1">Earlier</div>
                        <div className="p-2 hover:bg-white/5 rounded-xl cursor-pointer flex gap-3 transition-colors group opacity-70">
                          <div className="w-8 h-8 rounded-full bg-emerald-green/20 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4 text-emerald-green" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Job Goal Met</p>
                            <p className="text-xs text-gray-muted">You applied to 5 jobs yesterday. Great work!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-gray-muted" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isCmdKOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsCmdKOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center px-4 py-4 border-b border-white/10">
                <Search className="w-5 h-5 text-gray-muted mr-3" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search commands, tasks, or ask AI..." 
                  value={cmdKSearch}
                  onChange={(e) => setCmdKSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-gray-muted"
                />
                <kbd className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-gray-muted">ESC</kbd>
              </div>
              <div className="p-2 max-h-[60vh] overflow-y-auto">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-muted">Quick Actions</div>
                <button onClick={() => { setIsCmdKOpen(false); onOpenTaskModal('manual'); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                  <div className="w-8 h-8 rounded-lg bg-electric-blue/20 flex items-center justify-center"><Plus className="w-4 h-4 text-electric-blue" /></div>
                  <span className="flex-1 font-medium group-hover:text-electric-blue transition-colors">Add New Task</span>
                  <kbd className="bg-white/5 px-2 py-1 rounded text-xs font-mono text-gray-muted">T</kbd>
                </button>
                <button onClick={() => { setIsCmdKOpen(false); setActiveTab('timer'); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                  <div className="w-8 h-8 rounded-lg bg-amber/20 flex items-center justify-center"><TimerIcon className="w-4 h-4 text-amber" /></div>
                  <span className="flex-1 font-medium group-hover:text-amber transition-colors">Start Pomodoro</span>
                  <kbd className="bg-white/5 px-2 py-1 rounded text-xs font-mono text-gray-muted">P</kbd>
                </button>
                <button onClick={() => { setIsCmdKOpen(false); setActiveTab('health'); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-green/20 flex items-center justify-center"><Droplets className="w-4 h-4 text-emerald-green" /></div>
                  <span className="flex-1 font-medium group-hover:text-emerald-green transition-colors">Log Water</span>
                  <kbd className="bg-white/5 px-2 py-1 rounded text-xs font-mono text-gray-muted">W</kbd>
                </button>
                <button onClick={() => { setIsCmdKOpen(false); setActiveTab('ai'); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><Brain className="w-4 h-4 text-purple-500" /></div>
                  <span className="flex-1 font-medium group-hover:text-purple-500 transition-colors">Open NEXUS AI</span>
                  <kbd className="bg-white/5 px-2 py-1 rounded text-xs font-mono text-gray-muted">A</kbd>
                </button>

                <div className="px-3 py-2 mt-2 text-xs font-bold uppercase tracking-widest text-gray-muted border-t border-white/5 pt-4">Recent Tasks</div>
                <button onClick={() => { setIsCmdKOpen(false); setActiveTab('tasks'); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                  <CheckSquare className="w-4 h-4 text-gray-muted group-hover:text-white" />
                  <span className="flex-1 text-sm text-gray-300 group-hover:text-white">Review Q2 Strategy</span>
                  <span className="text-xs bg-p1/20 text-p1 px-2 py-0.5 rounded">P1</span>
                </button>
                <button onClick={() => { setIsCmdKOpen(false); setActiveTab('tasks'); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                  <CheckSquare className="w-4 h-4 text-gray-muted group-hover:text-white" />
                  <span className="flex-1 text-sm text-gray-300 group-hover:text-white">Morning Workout</span>
                  <span className="text-xs bg-p2/20 text-p2 px-2 py-0.5 rounded">P2</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <div className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-50">
        <AnimatePresence>
          {isFabOpen && (
            <div className="flex flex-col gap-3 mb-4 items-end">
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: 0.1 }}
                onClick={() => { onOpenTaskModal('manual'); setIsFabOpen(false); }}
                className="flex items-center gap-2 bg-surface border border-white/8 px-4 py-2 rounded-xl shadow-xl hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-medium">✏️ Add Manually</span>
                <Edit3 className="w-4 h-4 text-electric-blue" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: 0.05 }}
                onClick={() => { onOpenTaskModal('scan'); setIsFabOpen(false); }}
                className="flex items-center gap-2 bg-surface border border-white/8 px-4 py-2 rounded-xl shadow-xl hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-medium">📷 Scan / Photo</span>
                <Camera className="w-4 h-4 text-electric-blue" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                onClick={() => { onOpenTaskModal('voice'); setIsFabOpen(false); }}
                className="flex items-center gap-2 bg-surface border border-white/8 px-4 py-2 rounded-xl shadow-xl hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-medium">🎙️ Voice Input</span>
                <Mic className="w-4 h-4 text-electric-blue" />
              </motion.button>
            </div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-14 h-14 rounded-full bg-electric-blue text-background flex items-center justify-center shadow-[0_0_20px_rgba(0,191,255,0.4)] transition-transform hover:scale-110 active:scale-95"
        >
          <motion.div
            animate={{ rotate: isFabOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Plus className="w-8 h-8" />
          </motion.div>
        </button>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-lg border-t border-white/8 flex items-center justify-around px-2 z-50">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                activeTab === item.id ? "text-electric-blue" : "text-gray-muted"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                activeTab === item.id && "drop-shadow-[0_0_8px_rgba(0,191,255,0.8)]"
              )} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
