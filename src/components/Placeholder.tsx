import React from 'react';
import { GlassCard } from './UI';
import { Construction } from 'lucide-react';

export default function Placeholder({ name }: { name: string }) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{name}</h1>
        <p className="text-gray-muted">System module under development.</p>
      </header>

      <div className="flex flex-col items-center justify-center py-40 text-center">
        <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center mb-8 border border-white/8 animate-pulse">
          <Construction className="w-12 h-12 text-amber" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Module Initializing</h2>
        <p className="text-gray-muted max-w-md mx-auto">
          The {name} module is currently being optimized for peak performance. 
          Check back soon for full system integration.
        </p>
      </div>
    </div>
  );
}
