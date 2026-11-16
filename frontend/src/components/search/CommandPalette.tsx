import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, Code2, Database, Layout, Palette, FileText, X } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Resource, ResourceType } from '../../types';
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
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

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
        className="fixed inset-0 bg-[#121110]/60 dark:bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#ded8cb] dark:border-[#2f2c27] bg-[#faf8f5]/50 dark:bg-[#161513]">
          <Search className="w-4 h-4 text-[#8a8277] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-[#191715] dark:text-[#f5f2ec] placeholder:text-[#8a8277] focus:outline-none"
            placeholder="Search across all resources, tags, and projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-[#f5f2eb] dark:bg-[#201e1b] text-[#8a8277] rounded border border-[#ded8cb] dark:border-[#2f2c27]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {isSearching ? (
            <div className="py-8 text-center text-xs text-[#8a8277]">Searching workspace...</div>
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
                      'w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#edf4f0] dark:bg-[#1a2b22] text-[#1e3a2f] dark:text-[#86efac]'
                        : 'hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] text-[#57524b] dark:text-[#aba499]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={cn('p-1 rounded-md shrink-0', isSelected ? 'bg-white dark:bg-[#22201d] text-[#1e3a2f] dark:text-[#86efac]' : 'bg-[#f5f2eb] dark:bg-[#201e1b] text-[#8a8277]')}>
                        {typeIcons[item.type]}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate text-[#191715] dark:text-[#f5f2ec]">{item.title}</div>
                        {item.description && (
                          <div className="text-[11px] text-[#8a8277] truncate">{item.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#f5f2eb] dark:bg-[#201e1b] text-[#8a8277]">
                        {item.type}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8a8277]" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="py-8 text-center text-xs text-[#8a8277]">
              No resources found matching "{query}"
            </div>
          ) : (
            <div className="py-3 px-3 text-xs text-[#8a8277] space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a8277] mb-2 px-1">
                Quick Jump
              </div>
              <div
                onClick={() => {
                  navigate('/library');
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] cursor-pointer"
              >
                <span className="text-[#191715] dark:text-[#f5f2ec]">Browse My Library</span>
                <kbd className="font-mono text-[10px] text-[#8a8277]">/library</kbd>
              </div>
              <div
                onClick={() => {
                  navigate('/projects');
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] cursor-pointer"
              >
                <span className="text-[#191715] dark:text-[#f5f2ec]">Active Projects</span>
                <kbd className="font-mono text-[10px] text-[#8a8277]">/projects</kbd>
              </div>
              <div
                onClick={() => {
                  navigate('/collections');
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] cursor-pointer"
              >
                <span className="text-[#191715] dark:text-[#f5f2ec]">Thematic Collections</span>
                <kbd className="font-mono text-[10px] text-[#8a8277]">/collections</kbd>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#ded8cb] dark:border-[#2f2c27] flex items-center justify-between text-[11px] text-[#8a8277] bg-[#faf8f5]/60 dark:bg-[#141311]">
          <div className="flex items-center gap-2">
            <span>Select: <kbd className="font-mono text-[10px] bg-[#f5f2eb] dark:bg-[#201e1b] px-1 py-0.5 rounded">↵</kbd></span>
            <span>Navigate: <kbd className="font-mono text-[10px] bg-[#f5f2eb] dark:bg-[#201e1b] px-1 py-0.5 rounded">↑↓</kbd></span>
          </div>
          <span className="font-mono text-[10px]">Shelfspace</span>
        </div>
      </div>
    </div>
  );
};
