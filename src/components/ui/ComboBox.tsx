'use client';

import * as Popover from '@radix-ui/react-popover';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export type ComboOption = { value: string; label: string };

type ComboBoxProps = {
  options: ComboOption[];
  value: string[]; // multi-select
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
};

export default function ComboBox({ options, value, onChange, placeholder = 'Seleccionar…', className = '' }: ComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const removeTag = (val: string) => onChange(value.filter(v => v !== val));
  const toggle = (val: string) => selected.has(val) ? removeTag(val) : onChange([...value, val]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[active];
      if (opt) toggle(opt.value);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className={`w-full min-h-[42px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-left ${className}`}>
          {value.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {value.map(v => {
                const label = options.find(o => o.value === v)?.label || v;
                return (
                  <span key={v} className="inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    {label}
                    <i className="fas fa-times cursor-pointer" onClick={(e) => { e.stopPropagation(); removeTag(v); }} />
                  </span>
                );
              })}
            </div>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 mt-1 w-[var(--radix-popover-trigger-width)] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg" align="start" sideOffset={4}>
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              className="w-full rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              placeholder="Buscar…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onKeyDown}
            />
          </div>
          <div ref={listRef} className="max-h-60 overflow-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Sin resultados</div>
            )}
            {filtered.map((o, idx) => (
              <button
                key={o.value}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${idx === active ? 'bg-gray-100 dark:bg-gray-700' : ''} ${selected.has(o.value) ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}
                onClick={() => toggle(o.value)}
              >
                <span>{o.label}</span>
                {selected.has(o.value) && <i className="fas fa-check"></i>}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

