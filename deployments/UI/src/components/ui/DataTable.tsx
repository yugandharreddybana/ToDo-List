import { ReactNode, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SearchInput } from './SearchInput';
import { EmptyState } from './EmptyState';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  accessor: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  searchable?: boolean;
  searchAccessor?: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

type SortDir = 'asc' | 'desc';

export function DataTable<T>({
  data,
  columns,
  rowKey,
  pageSize = 10,
  searchable = false,
  searchAccessor,
  emptyTitle = 'Nothing to show',
  emptyDescription,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchable || !query || !searchAccessor) return data;
    const q = query.toLowerCase();
    return data.filter((r) => searchAccessor(r).toLowerCase().includes(q));
  }, [data, searchable, searchAccessor, query]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: string) => {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: 'asc' };
      if (s.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
    setPage(1);
  };

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      {searchable && (
        <SearchInput
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          onClear={() => setQuery('')}
        />
      )}
      <div
        className="overflow-auto rounded-[10px]"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <table className="w-full text-[14px] border-collapse">
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    onClick={() => c.sortable && toggleSort(c.key)}
                    className={cn(
                      'text-left px-3 py-2.5 font-medium text-[12px] uppercase tracking-wide select-none',
                      c.sortable && 'cursor-pointer',
                    )}
                    style={{
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)',
                      width: c.width,
                      textAlign: c.align,
                      background: 'var(--bg-sidebar)',
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.header}
                      {c.sortable && active && (sort?.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={rowKey(row)} style={{ borderBottom: '1px solid var(--border)' }}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className="px-3 py-2.5 align-middle"
                      style={{ color: 'var(--text-primary)', textAlign: c.align }}
                    >
                      {c.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 flex items-center justify-center rounded-md disabled:opacity-40"
              style={{ border: '1px solid var(--border)' }}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 flex items-center justify-center rounded-md disabled:opacity-40"
              style={{ border: '1px solid var(--border)' }}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
