import { InputHTMLAttributes, forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, value, onClear, placeholder = 'Search…', ...rest },
  ref,
) {
  const showClear = Boolean(value && String(value).length > 0 && onClear);
  return (
    <div
      className={cn('flex items-center gap-2 rounded-[10px] h-10 px-3 w-full', className)}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
      }}
    >
      <Search size={16} style={{ color: 'var(--text-muted)' }} />
      <input
        ref={ref}
        type="search"
        value={value}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-[14px]"
        style={{ color: 'var(--text-primary)' }}
        {...rest}
      />
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="p-0.5 rounded"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});
