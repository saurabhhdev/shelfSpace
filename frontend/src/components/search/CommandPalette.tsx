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
    }, 150);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-xl bg-[#121316] border border-white/10 rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 bg-[#0E0F10]">
          <Search className="w-4 h-4 text-[#09AE5B] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none font-mono"
            placeholder="Search resources, tags, projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-[#141519] text-[#09AE5B] rounded-none border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {isSearching ? (
            <div className="py-8 text-center text-xs text-neutral-400 font-mono">Searching workspace...</div>
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
                      'w-full flex items-center justify-between p-2.5 rounded-none text-left text-xs transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#09AE5B]/10 text-[#09AE5B] font-medium border-l-2 border-[#09AE5B]'
                        : 'hover:bg-white/[0.04] text-neutral-400 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={cn('p-1 rounded-none shrink-0', isSelected ? 'bg-white/[0.08] text-[#09AE5B]' : 'bg-white/[0.04] text-neutral-400')}>
                        {typeIcons[item.type]}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs truncate text-[#E5E5E5]">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-neutral-400 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-none bg-[#141519] text-[#09AE5B] border border-white/10">
                        {item.type}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No resources found matching "{query}"
            </div>
          ) : (
            <div className="py-2 px-2 text-xs text-neutral-400 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#09AE5B] mb-1.5 px-2 font-semibold">
                Quick Navigation
              </div>
              <div
                onClick={() => {
                  navigate('/library');
                  onClose();
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-none hover:bg-white/[0.04] cursor-pointer text-neutral-400 hover:text-[#09AE5B] transition-colors"
              >
                <span>Browse All Resources</span>
                <kbd className="font-mono text-[10px] text-neutral-500">/library</kbd>
              </div>
              <div
                onClick={() => {
                  navigate('/collections');
                  onClose();
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-none hover:bg-white/[0.04] cursor-pointer text-neutral-400 hover:text-[#09AE5B] transition-colors"
              >
                <span>Thematic Collections</span>
                <kbd className="font-mono text-[10px] text-neutral-500">/collections</kbd>
              </div>
              <div
                onClick={() => {
                  navigate('/projects');
                  onClose();
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-none hover:bg-white/[0.04] cursor-pointer text-neutral-400 hover:text-[#09AE5B] transition-colors"
              >
                <span>Active Projects</span>
                <kbd className="font-mono text-[10px] text-neutral-500">/projects</kbd>
              </div>
              <div
                onClick={() => {
                  navigate('/favourites');
                  onClose();
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-none hover:bg-white/[0.04] cursor-pointer text-neutral-400 hover:text-[#09AE5B] transition-colors"
              >
                <span>Starred Favorites</span>
                <kbd className="font-mono text-[10px] text-neutral-500">/favourites</kbd>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500 bg-[#0E0F10]">
          <div className="flex items-center gap-2">
            <span>Select: <kbd className="font-mono text-[10px] bg-[#141519] text-[#09AE5B] px-1 py-0.5 rounded-none border border-white/10">↵</kbd></span>
            <span>Navigate: <kbd className="font-mono text-[10px] bg-[#16161a] text-[#059669] px-1 py-0.5 rounded border border-[#272730]">↑↓</kbd></span>
          </div>
          <span className="font-mono text-[10px] text-[#059669]">Shelfspace</span>
        </div>
      </div>
    </div>
  );
};

