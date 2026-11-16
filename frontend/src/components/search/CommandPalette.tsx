import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ExternalLink, ArrowRight, BookOpen, Code2, Database, Layout, Palette, FileText, X } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Resource, ResourceType } from '../../types';
import { cn } from '../../lib/utils';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons: Record<ResourceType, React.ReactNode> = {
  design: <Palette className="w-3.5 h-3.5" />,
  ui: <Layout className="w-3.5 h-3.5" />,
  development: <Code2 className="w-3.5 h-3.5" />,
  data: <Database className="w-3.5 h-3.5" />,
  learning: <BookOpen className="w-3.5 h-3.5" />,
  personal: <FileText className="w-3.5 h-3.5" />,
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Resource[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiClient.get('/search', {
          params: { q: query, limit: 8 },
        });
        if (res.data?.success) {
          setResults(res.data.data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Command search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        navigate(`/library/${results[selectedIndex]._id}`);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
            placeholder="Type to search resources, tags, projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded border border-zinc-200 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {isSearching ? (
            <div className="py-8 text-center text-xs text-zinc-400">Searching your workspace...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item._id}
                    onClick={() => {
                      navigate(`/library/${item._id}`);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={cn('p-1 rounded-md shrink-0', isSelected ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500')}>
                        {typeIcons[item.type]}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{item.title}</div>
                        {item.description && (
                          <div className="text-[11px] text-zinc-400 truncate">{item.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {item.type}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No resources found matching "{query}"
            </div>
          ) : (
            <div className="py-4 px-3 text-xs text-zinc-400 space-y-2">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Quick Navigation
              </div>
              <div
                onClick={() => {
                  navigate('/library');
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer"
              >
                <span>Browse All Resources</span>
                <kbd className="font-mono text-[10px] text-zinc-400">/library</kbd>
              </div>
              <div
                onClick={() => {
                  navigate('/projects');
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer"
              >
                <span>Projects</span>
                <kbd className="font-mono text-[10px] text-zinc-400">/projects</kbd>
              </div>
              <div
                onClick={() => {
                  navigate('/collections');
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer"
              >
                <span>Collections</span>
                <kbd className="font-mono text-[10px] text-zinc-400">/collections</kbd>
              </div>
            </div>
          )}
        </div>

        {/* Command palette footer */}
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span>Navigate: <kbd className="font-mono text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">↑</kbd> <kbd className="font-mono text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">↓</kbd></span>
            <span>Select: <kbd className="font-mono text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">↵</kbd></span>
          </div>
          <span>Shelfspace Quick Search</span>
        </div>
      </div>
    </div>
  );
};
