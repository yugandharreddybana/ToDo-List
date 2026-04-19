import React, { useState } from 'react';
import { GlassCard, Button, TechnicalLabel, Badge } from './UI';
import { 
  User, Bell, Server, Target, Link2, Palette, Database, 
  ChevronDown, ChevronRight, CheckCircle2, XCircle, Eye, EyeOff, Upload, Download,
  ShieldAlert, Cpu, Globe
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const [userName, setUserName] = useState(() => localStorage.getItem('nexus_user_name') || 'Zenith Executive');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('nexus_timezone') || 'Europe/Dublin (GMT+1)');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('mcp');
  const [showApiKey, setShowApiKey] = useState(false);
  const [mcpStatus, setMcpStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleTestConnection = () => {
    setMcpStatus('testing');
    setTimeout(() => setMcpStatus('success'), 1200);
  };

  const [showResetModal, setShowResetModal] = useState(false);

  const handleClearData = () => {
    const keysToRemove = [
      'nexus_tasks', 'nexus_jobs', 'nexus_cv_text', 'nexus_cv_metadata',
      'nexus_health_water', 'nexus_health_energy', 'nexus_health_mood',
      'nexus_health_sleep', 'nexus_goals', 'nexus_streaks', 'nexus_ai_conversations',
      'nexus_ai_telemetry'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    window.location.reload();
  };

  const handleSaveProfile = () => {
    localStorage.setItem('nexus_user_name', userName);
    localStorage.setItem('nexus_timezone', timezone);
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-24 pb-32">
      
      {/* Configuration Strategy Header */}
      <header className="relative pt-12 pb-8">
        <div className="flex items-center gap-12">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-6">
               <div className="h-[1px] w-12 bg-white/20" />
               <span className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-white/40">Infrastructure Control</span>
            </div>
            <h1 className="text-8xl md:text-[8rem] font-display font-semibold text-white tracking-tighter leading-none italic">
               System <br /><span className="text-white/20 not-italic">Console.</span>
            </h1>
          </div>
          <div className="hidden lg:block shrink-0 p-12 glass-surface rounded-[4rem] border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <Cpu className="w-24 h-24 text-white/10 group-hover:text-white transition-all duration-1000 rotate-12 group-hover:rotate-0" />
          </div>
        </div>
      </header>

      {/* Identity Node */}
      <div className="interactive-pane p-16 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000 rotate-45">
           <User className="w-96 h-96 text-white" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-20 relative z-10">
          <div className="relative group/avatar cursor-pointer">
            <div className="w-48 h-48 rounded-[3.5rem] glass-surface flex items-center justify-center overflow-hidden group-hover/avatar:border-white transition-all duration-700">
               <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
               <User className="w-20 h-20 text-white/20 group-hover/avatar:text-white transition-all duration-700" />
            </div>
            <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
               <div className="bg-white text-black px-6 py-2 rounded-full text-[9px] font-mono font-bold tracking-widest flex items-center gap-3 shadow-2xl">
                 <Upload className="w-3 h-3" /> UPLOAD_AVATAR
               </div>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-12">
              <div className="space-y-4 flex-1">
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">Executive Designation</span>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-white/40 pb-4 text-6xl font-display font-semibold text-white focus:outline-none focus:border-white transition-all tracking-tight"
                  />
                ) : (
                  <h2 className="text-7xl font-display font-semibold text-white tracking-tighter italic">{userName}</h2>
                )}
              </div>
              <Button 
                variant={isEditingProfile ? "zenith-emerald" : "outline"} 
                size="lg" 
                className="rounded-2xl h-16 min-w-[200px]"
                onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
              >
                {isEditingProfile ? 'SAVE_CONFIG' : 'MODIFY_PROFILE'}
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-20 pt-8 border-t border-white/5">
               <div className="space-y-3">
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">System Timezone</span>
                  <div className="flex items-center gap-4">
                     <Globe className="w-5 h-5 text-zenith-emerald" />
                     <p className="text-xl font-display font-medium text-white">{timezone}</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] font-bold">Data Sovereignty</span>
                  <div className="flex items-center gap-4">
                    <ShieldAlert className="w-5 h-5 text-white/30" />
                    <p className="text-xl font-mono text-white/40 tracking-wider">LOCAL_STORAGE_ONLY</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modular Config Base */}
      <div className="space-y-12">
        <div className="flex items-center gap-10">
           <h3 className="text-xs font-mono font-bold uppercase tracking-[0.6em] text-white/20 whitespace-nowrap">
              Operational Protocols
           </h3>
           <div className="h-[1px] flex-1 bg-white/5" />
        </div>

        <div className="space-y-8">
          
          {/* Integration Port */}
          <div className={cn(
            "interactive-pane p-0 overflow-hidden transition-all duration-700",
            expandedSection === 'mcp' && "ring-1 ring-white/20 bg-white/[0.04]"
          )}>
            <button 
              onClick={() => toggleSection('mcp')}
              className="w-full p-12 flex items-center justify-between group"
            >
              <div className="flex items-center gap-12">
                 <div className="w-20 h-20 rounded-3xl glass-surface flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                    <Server className="w-10 h-10 text-white/20 group-hover:text-zenith-emerald transition-colors" />
                 </div>
                 <div className="text-left space-y-2">
                    <h4 className="text-3xl font-display font-bold text-white tracking-tight italic">System Uplink</h4>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">External API Hub / Integration Protocols</p>
                 </div>
              </div>
              <div className={cn("p-4 rounded-full glass-surface transition-transform duration-700", expandedSection === 'mcp' && "rotate-180 bg-white text-black")}>
                <ChevronDown className="w-8 h-8" />
              </div>
            </button>
            
            <AnimatePresence>
              {expandedSection === 'mcp' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="px-16 pb-16 space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-4">
                         <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold ml-2">Uplink Gateway URL</label>
                         <input type="text" defaultValue="https://core.zenith.so/v1/mcp" className="w-full glass-surface border-white/5 rounded-2xl p-8 text-lg font-mono text-white focus:border-white outline-none" />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold ml-2">Neural Engine Affinity</label>
                         <select className="w-full glass-surface border-white/5 rounded-2xl p-8 text-xl font-display font-bold text-white focus:border-white outline-none cursor-pointer appearance-none bg-black">
                            <option>ZENITH_MODULAR_CORE v4.0</option>
                            <option>GPT_4_STREAMS</option>
                            <option>CLAUDE_STRATEGIC</option>
                         </select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                       <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold ml-2">Secure Access Key</label>
                       <div className="relative">
                          <input type={showApiKey ? "text" : "password"} defaultValue="zn_sk_0982-XXXX-99KL" className="w-full glass-surface border-white/5 rounded-2xl p-8 text-xl font-mono text-white focus:border-white outline-none pr-24" />
                          <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-all">
                            {showApiKey ? <EyeOff className="w-8 h-8" /> : <Eye className="w-8 h-8" />}
                          </button>
                       </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12 pt-8">
                       <Button variant="zenith-emerald" onClick={handleTestConnection} className="h-16 px-12 text-sm font-black rounded-full">
                          {mcpStatus === 'testing' ? 'IN_SYNCHRONIZATION...' : 'VALIDATE_PORT_UPLINK'}
                       </Button>
                       {mcpStatus === 'success' && <div className="flex items-center gap-4 text-zenith-emerald text-xs font-mono font-bold tracking-[0.4em] animate-pulse"><CheckCircle2 className="w-6 h-6" /> TELEMETRY_STABLE</div>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comms Protocol */}
          <div className="interactive-pane p-0 overflow-hidden group">
            <button className="w-full p-12 flex items-center justify-between hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-12">
                 <div className="w-20 h-20 rounded-3xl glass-surface border-white/5 flex items-center justify-center group-hover:border-zenith-emerald transition-colors">
                    <Bell className="w-10 h-10 text-white/10 group-hover:text-white transition-colors animate-pulse" />
                 </div>
                 <div className="text-left space-y-2">
                    <h4 className="text-3xl font-display font-medium text-white tracking-tight">Signal Relay</h4>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">Push Protocols & Alert Buffers</p>
                 </div>
              </div>
              <ChevronRight className="w-8 h-8 text-white/10 group-hover:text-white transition-all transform group-hover:translate-x-2" />
            </button>
          </div>

          {/* Critical Integrity Rest */}
          <div className={cn(
            "interactive-pane p-0 overflow-hidden transition-all duration-700",
            expandedSection === 'data' && "ring-1 ring-red-500/30 bg-red-500/[0.02]"
          )}>
            <button onClick={() => toggleSection('data')} className="w-full p-12 flex items-center justify-between group">
              <div className="flex items-center gap-12">
                 <div className="w-20 h-20 rounded-3xl glass-surface flex items-center justify-center border-red-500/20 group-hover:bg-red-500 group-hover:scale-110 transition-all duration-700">
                    <Database className="w-10 h-10 text-red-500/40 group-hover:text-white transition-colors" />
                 </div>
                 <div className="text-left space-y-2">
                    <h4 className="text-3xl font-display font-bold text-white tracking-tight italic">Registry Purge</h4>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] font-bold">Data Sovereignty Control</p>
                 </div>
              </div>
              <div className={cn("p-4 rounded-full glass-surface transition-transform duration-700", expandedSection === 'data' && "rotate-180 bg-red-500 text-white")}>
                <ChevronDown className="w-8 h-8" />
              </div>
            </button>
            <AnimatePresence>
              {expandedSection === 'data' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="px-16 pb-16 space-y-12">
                     <p className="text-2xl font-display font-light text-white/40 leading-relaxed italic max-w-4xl">
                        The Zenith repository contains all synchronized mission tracking and biosensory telemetry. Resetting the repository will permanently clear all recorded task histories and baseline configurations. This operation is <span className="text-red-500 font-bold not-italic">IRREVERSIBLE.</span>
                     </p>
                     <div className="flex flex-col md:flex-row gap-8">
                        <Button variant="outline" className="h-16 px-10 rounded-2xl flex-1 justify-center gap-6 border-white/5 text-white/40 hover:text-white hover:border-white uppercase font-mono text-xs tracking-[0.4em]">
                           <Download className="w-5 h-5" /> EXPORT_MISSION_LOG
                        </Button>
                        <Button 
                           variant="outline" 
                           onClick={() => setShowResetModal(true)}
                           className="h-16 px-10 rounded-2xl flex-1 justify-center gap-6 border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white transition-all uppercase font-mono text-xs tracking-[0.4em] font-black"
                        >
                           <ShieldAlert className="w-5 h-5" /> INITIALIZE_FULL_WIPE
                        </Button>
                     </div>

                     <AnimatePresence>
                       {showResetModal && (
                         <div className="fixed inset-0 z-[600] flex items-center justify-center p-8">
                           <motion.div 
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             exit={{ opacity: 0 }}
                             onClick={() => setShowResetModal(false)}
                             className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
                           />
                           <motion.div
                             initial={{ opacity: 0, scale: 0.9, y: 20 }}
                             animate={{ opacity: 1, scale: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.9, y: 20 }}
                             className="relative w-full max-w-2xl glass-surface border-white/10 p-16 rounded-[4rem] text-center space-y-12 shadow-[0_0_150px_rgba(239,68,68,0.15)]"
                           >
                             <div className="w-28 h-28 rounded-[3rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                               <ShieldAlert className="w-14 h-14 text-red-500 animate-pulse" />
                             </div>
                             <div className="space-y-4">
                               <h3 className="text-5xl font-display font-semibold text-white italic tracking-tighter">Emergency Purge?</h3>
                               <p className="text-2xl font-display font-light text-white/40 leading-relaxed italic">
                                 This directive will permanently erase all <span className="text-white font-bold">Strategic Nodes</span> and <span className="text-white font-bold">Tactical Assets</span>. Configuration parity will be lost.
                               </p>
                             </div>
                             <div className="flex gap-6 pt-8">
                               <Button 
                                 variant="outline" 
                                 size="lg" 
                                 onClick={() => setShowResetModal(false)}
                                 className="flex-1 h-20 rounded-[2rem] border-white/5 text-white/30 hover:text-white"
                               >
                                 ABORT_RESET
                               </Button>
                               <Button 
                                 variant="zenith-emerald" 
                                 size="lg" 
                                 onClick={handleClearData}
                                 className="flex-1 h-20 rounded-[2rem] bg-red-500 hover:bg-red-600 border-none shadow-[0_0_80px_rgba(239,68,68,0.2)]"
                               >
                                 EXECUTE_WIPE
                               </Button>
                             </div>
                           </motion.div>
                         </div>
                       )}
                     </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
