import { createContext, useContext, ReactNode, useId } from 'react';
import { cn } from '../../lib/utils';

interface TabsContextValue {
  value: string;
  onChange: (v: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs children must be inside <Tabs>');
  return ctx;
}

export interface TabsProps {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onChange, children, className }: TabsProps) {
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value, onChange, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn('relative flex items-center gap-1', className)}
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const { value: active, onChange, baseId } = useTabsContext();
  const isActive = value === active;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      id={`${baseId}-tab-${value}`}
      onClick={() => onChange(value)}
      className="relative px-4 py-2.5 text-[14px] font-medium transition-all duration-200"
      style={{
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
    >
      {children}
      <span
        aria-hidden
        className="absolute left-0 right-0 -bottom-px h-[2px] transition-all duration-200"
        style={{
          background: isActive ? 'var(--accent-primary)' : 'transparent',
          borderRadius: 2,
        }}
      />
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: active, baseId } = useTabsContext();
  if (value !== active) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      className={cn('pt-4', className)}
    >
      {children}
    </div>
  );
}
