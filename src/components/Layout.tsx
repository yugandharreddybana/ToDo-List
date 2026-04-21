import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  HeartPulse, 
  Briefcase, 
  Settings,
  Bell,
  Plus,
  Mic,
  Camera,
  Edit3,
  Timer as TimerIcon,
  BarChart3,
  Target,
  CheckSquare,
  Search,
  X,
  Cpu,
  Navigation2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { TechnicalLabel } from './UI';

type NavItem = {
  id: string;
  icon: React.ElementType;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: LayoutDashboard, label: 'Overview' },
  { id: 'tasks', icon: CheckSquare, label: 'Execution' },
  { id: 'ai', icon: MessageSquareCode, label: 'Zenith AI' },
  { id: 'health', icon: HeartPulse, label: 'Wellness' },
  { id: 'career', icon: Briefcase, label: 'Enterprise' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTaskModal: (tab?: 'manual' | 'scan' | 'voice') => void;
}

export default function Layout({ children, activeTab, setActiveTab, onOpenTaskModal }: LayoutProps) {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsCmdKOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zenith-bg text-white selection:bg-zenith-emerald/30 overflow-x-hidden relative selection:text-zenith-emerald">
      
      {/* Cinematic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] bg-gradient-to-br from-black via-black to-zenith-emerald/10 blur-[180px] opacity-20" 
        />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] aura-glow opacity-10" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full opacity-5" />
      </div>

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 h-28 px-12 flex items-center justify-between z-50 bg-zenith-bg/80 backdrop-blur-3xl border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="group relative">
            <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-14 h-14 rounded-2xl glass-surface flex items-center justify-center relative z-10 hover:scale-110 transition-transform cursor-pointer">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-white/30 font-bold mb-1">Strategic Command</span>
            <span className="text-3xl font-display font-semibold text-white tracking-widest uppercase">Zenith</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-12 px-10 py-4 glass-surface rounded-full">
            <TechnicalLabel label="System Mode" value="OPERATIONAL_ELITE" color="text-zenith-emerald" />
            <div className="w-[1px] h-8 bg-white/10" />
            <TechnicalLabel label="Status" value="COHERENCE_99%" color="text-white" />
          </div>
          <button 
            onClick={() => setIsCmdKOpen(true)}
            className="w-16 h-16 flex items-center justify-center glass-surface rounded-2xl hover:bg-white/10 transition-all active:scale-95 group shadow-inner"
          >
            <Search className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
          </button>
        </div>
      </header>

      {/* Main Narrative Viewport */}
      <main className="flex-1 relative z-10 pt-40 pb-52">
        <div className="max-w-screen-2xl mx-auto px-12 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Futuristic Floating Navigation */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4">
        <nav className="glass-surface p-2.5 rounded-full flex items-center gap-1 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "nav-pill group relative flex items-center justify-center w-14 h-14 md:w-auto md:px-8",
                activeTab === item.id ? "nav-pill-active" : "hover:bg-white/5 text-white/40 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-500",
                activeTab === item.id ? "scale-110" : "scale-100"
              )} />
              
              <span className={cn(
                "hidden md:inline text-[10px] font-mono font-bold uppercase tracking-widest ml-3 overflow-hidden transition-all duration-700",
                activeTab === item.id ? "max-w-[150px] opacity-100" : "max-w-0 opacity-0"
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 active:scale-90 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
            isFabOpen ? "bg-white text-black rotate-[135deg]" : "bg-zenith-emerald text-black"
          )}
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Modal Actions */}
      <AnimatePresence>
        {isFabOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/60 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsFabOpen(false)}
            />
            <div className="relative flex flex-col md:flex-row gap-8 max-w-7xl w-full">
              {[
                { label: 'Strategic Entry', icon: Edit3, id: 'manual', desc: 'Execute manual tactical override' },
                { label: 'Asset Scan', icon: Camera, id: 'scan', desc: 'Ingest visual data telemetry' },
                { label: 'Voice Link', icon: Mic, id: 'voice', desc: 'Secure neural voice command' }
              ].map((act, i) => (
                <motion.button
                  key={act.id}
                  initial={{ opacity: 0, y: 50, rotateX: -30 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  onClick={() => { onOpenTaskModal(act.id as any); setIsFabOpen(false); }}
                  className="flex-1 p-12 glass-surface group hover:bg-white/[0.08] transition-all text-left flex flex-col justify-between aspect-video rounded-3xl overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-zenith-emerald transition-all transform group-hover:scale-110 group-hover:rotate-6">
                    <act.icon className="w-8 h-8 group-hover:text-black transition-colors" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] mb-2 block">{act.desc}</span>
                    <span className="text-4xl font-display font-semibold tracking-tighter leading-none">{act.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Search Protocol */}
      <AnimatePresence>
        {isCmdKOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCmdKOpen(false)}
              className="absolute inset-0 bg-zenith-text/30 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, y: -40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.97 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-3xl glass-surface p-3 shadow-2xl border-white/10 rounded-[3rem]"
            >
              <div className="flex items-center gap-6 p-8 border-b border-white/5">
                <Search className="w-8 h-8 text-white/20" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Execute system search..."
                  className="flex-1 bg-transparent border-none outline-none text-4xl font-display font-light placeholder:text-white/5 text-white italic tracking-tighter"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <div className="flex items-center gap-2">
                   <kbd className="px-5 py-2 glass-surface border-white/10 text-xs font-mono text-white/40 font-bold uppercase tracking-widest">ESC</kbd>
                </div>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                <div className="flex items-center gap-3 p-6 text-[10px] uppercase tracking-[0.5em] font-mono text-zenith-emerald font-bold mb-4">
                  <Navigation2 className="w-4 h-4" /> Strategic Roadmap Nodes
                </div>
                {NAV_ITEMS.map(node => (
                  <button 
                    key={node.id}
                    onClick={() => { setActiveTab(node.id); setIsCmdKOpen(false); }}
                    className="w-full flex items-center justify-between p-8 hover:bg-white/5 rounded-[2.5rem] transition-all group text-left border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center gap-8">
                       <div className="p-5 glass-surface border-white/5 rounded-2xl group-hover:bg-zenith-emerald group-hover:border-zenith-emerald transition-all duration-500">
                          <node.icon className="w-7 h-7 text-white/40 group-hover:text-black transition-colors" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold mb-1">System Module</span>
                          <span className="text-2xl font-display font-semibold text-white group-hover:text-zenith-emerald transition-colors italic tracking-tight">{node.label} Interface</span>
                       </div>
                    </div>
                    <span className="text-[10px] font-mono p-3 px-6 glass-surface border-white/5 opacity-0 group-hover:opacity-100 uppercase tracking-widest font-bold text-white/40 transition-all rounded-full">INITIALIZE</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
