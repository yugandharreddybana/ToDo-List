import React, { useState } from 'react';
import { GlassCard, Button } from './UI';
import { 
  User, Bell, Server, Target, Link2, Palette, Database, 
  ChevronDown, ChevronRight, CheckCircle2, XCircle, Eye, EyeOff, Upload
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const [expandedSection, setExpandedSection] = useState<string | null>('mcp');
  const [showApiKey, setShowApiKey] = useState(false);
  const [mcpStatus, setMcpStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleTestConnection = () => {
    setMcpStatus('testing');
    setTimeout(() => setMcpStatus('success'), 1500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </header>

      {/* Profile Section */}
      <GlassCard className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-surface border-2 border-white/10 flex items-center justify-center overflow-hidden">
            <User className="w-10 h-10 text-gray-muted" />
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <h2 className="text-2xl font-bold">User Name</h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs">Edit Profile</Button>
          </div>
          <p className="text-gray-muted">user@example.com</p>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-muted">Timezone:</span>
            <select className="bg-surface border border-white/10 rounded-md text-sm p-1 focus:outline-none focus:border-electric-blue">
              <option>Europe/Dublin (GMT+1)</option>
              <option>America/New_York (GMT-4)</option>
              <option>Asia/Tokyo (GMT+9)</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Settings Accordion */}
      <div className="space-y-4">
        {/* 1. Notifications */}
        <GlassCard className="p-0 overflow-hidden">
          <button 
            onClick={() => toggleSection('notifications')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-electric-blue" />
              <h3 className="font-bold">Notifications</h3>
            </div>
            {expandedSection === 'notifications' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <AnimatePresence>
            {expandedSection === 'notifications' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 pt-0 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Reminder</p>
                      <p className="text-xs text-gray-muted">Morning briefing at 8:00 AM</p>
                    </div>
                    <div className="w-10 h-5 bg-electric-blue rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Water Reminders</p>
                      <p className="text-xs text-gray-muted">Every 2 hours</p>
                    </div>
                    <div className="w-10 h-5 bg-electric-blue rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* 2. MCP SERVER CONFIG */}
        <GlassCard className="p-0 overflow-hidden border-electric-blue/30">
          <button 
            onClick={() => toggleSection('mcp')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors bg-electric-blue/5"
          >
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-electric-blue" />
              <h3 className="font-bold text-electric-blue">MCP Server Config</h3>
            </div>
            {expandedSection === 'mcp' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <AnimatePresence>
            {expandedSection === 'mcp' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-6 border-t border-white/5 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-muted mb-2">API Endpoint URL</label>
                      <input type="text" defaultValue="http://localhost:3001/mcp" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-electric-blue font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-muted mb-2">API Key</label>
                      <div className="relative">
                        <input type={showApiKey ? "text" : "password"} defaultValue="sk-nexus-mcp-8f92a1b" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pr-10 text-sm focus:outline-none focus:border-electric-blue font-mono" />
                        <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-muted hover:text-white">
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-muted mb-2">AI Model</label>
                      <select className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-electric-blue">
                        <option>Gemini 2.0 Flash</option>
                        <option>GPT-4o</option>
                        <option>Claude 3.5 Sonnet</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Button onClick={handleTestConnection} className="bg-electric-blue text-background hover:bg-electric-blue/90">
                      {mcpStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                    </Button>
                    {mcpStatus === 'success' && <div className="flex items-center gap-2 text-emerald-green text-sm font-medium"><CheckCircle2 className="w-4 h-4" /> Connected</div>}
                    {mcpStatus === 'error' && <div className="flex items-center gap-2 text-red text-sm font-medium"><XCircle className="w-4 h-4" /> Connection Failed</div>}
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-muted mb-3">Enabled MCP Tools</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['suggest_tasks', 'generate_day_plan', 'analyze_productivity', 'check_health_metrics', 'reschedule_tasks'].map(tool => (
                        <label key={tool} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-black/20 text-electric-blue focus:ring-electric-blue focus:ring-offset-background" />
                          <span className="text-sm font-mono text-gray-300">{tool}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* 3. Goals & Targets */}
        <GlassCard className="p-0 overflow-hidden">
          <button onClick={() => toggleSection('goals')} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3"><Target className="w-5 h-5 text-emerald-green" /><h3 className="font-bold">Goals & Targets</h3></div>
            {expandedSection === 'goals' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </GlassCard>

        {/* 4. Integrations */}
        <GlassCard className="p-0 overflow-hidden">
          <button onClick={() => toggleSection('integrations')} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3"><Link2 className="w-5 h-5 text-amber" /><h3 className="font-bold">Integrations</h3></div>
            {expandedSection === 'integrations' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </GlassCard>

        {/* 5. Appearance */}
        <GlassCard className="p-0 overflow-hidden">
          <button onClick={() => toggleSection('appearance')} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3"><Palette className="w-5 h-5 text-purple-500" /><h3 className="font-bold">Appearance</h3></div>
            {expandedSection === 'appearance' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </GlassCard>

        {/* 6. Data */}
        <GlassCard className="p-0 overflow-hidden">
          <button onClick={() => toggleSection('data')} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3"><Database className="w-5 h-5 text-gray-400" /><h3 className="font-bold">Data & Export</h3></div>
            {expandedSection === 'data' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <AnimatePresence>
            {expandedSection === 'data' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-4 border-t border-white/5 space-y-3">
                  <Button variant="ghost" className="w-full justify-start border border-white/10">Export All Data as CSV</Button>
                  <Button variant="ghost" className="w-full justify-start border border-white/10">Export Analytics as PDF</Button>
                  <Button variant="ghost" className="w-full justify-start border border-red/30 text-red hover:bg-red/10 hover:text-red">Clear All Data</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}
