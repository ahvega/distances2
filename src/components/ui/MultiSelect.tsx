'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

export type MultiSelectOption = { value: string; label: string };

type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
};

export default function MultiSelect({ options, value, onChange, placeholder = 'Seleccionar…', className = '' }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const removeTag = (val: string) => {
    onChange(value.filter(v => v !== val));
  };

  const toggleOption = (val: string) => {
    if (selected.has(val)) {
      onChange(value.filter(v => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="w-full min-h-[42px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 flex items-center gap-2 cursor-text"
        onClick={() => setOpen(true)}
        role="combobox"
        aria-expanded={open}
      >
        {value.length === 0 && (
          <span className="text-gray-400 dark:text-gray-500 select-none">{placeholder}</span>
        )}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {value.map(v => {
              const label = options.find(o => o.value === v)?.label || v;
              return (
                <span key={v} className="inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  {label}
                  <button type="button" className="opacity-70 hover:opacity-100" onClick={(e) => { e.stopPropagation(); removeTag(v); }} aria-label={`Remove ${label}`}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              );
            })}
          </div>
        )}
        <input
          className="ml-auto bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder={value.length === 0 ? placeholder : 'Buscar…'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-auto">
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Sin resultados</div>
          )}
          {filtered.map(o => (
            <button
              type="button"
              key={o.value}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${selected.has(o.value) ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}
              onClick={() => toggleOption(o.value)}
            >
              <span>{o.label}</span>
              {selected.has(o.value) && <i className="fas fa-check"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

