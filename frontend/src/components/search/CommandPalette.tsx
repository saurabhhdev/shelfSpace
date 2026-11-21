import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flaticon } from '../ui/Flaticon';
import { apiClient } from '../../api/client';
import { getResourceTypeLabel, getResourceTypeIcon } from '../../lib/resourceTypes';
import type { Resource } from '../../types';
import { cn } from '../../lib/utils';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 p-3 sm:p-4 font-sans">
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-[#1C1C1B] border border-[#3E3E38] rounded-lg shadow-2xl overflow-hidden z-10"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-[#3E3E38] bg-[#262624]">
          <Flaticon name="search" className="text-xs text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-[#FAF9F5] placeholder:text-neutral-500 focus:outline-none"
            placeholder="Search resources, tags, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-white p-1 cursor-pointer"
            >
              <Flaticon name="cross" className="text-[10px]" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.06] text-neutral-400 rounded border border-[#3E3E38]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5">
          {isSearching ? (
            <div className="py-8 text-center text-xs text-neutral-400">Searching...</div>
          ) : results.length > 0 ? (
            <div className="space-y-0.5">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const TypeIcon = getResourceTypeIcon(item.type);
                const typeLabel = getResourceTypeLabel(item.type);

                return (
                  <button
                    key={item._id}
                    onClick={() => {
                      navigate(`/library/${item._id}`);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-md text-left text-xs transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-white/[0.08] text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={cn('p-1 rounded shrink-0', isSelected ? 'bg-white/[0.08] text-[#D97757]' : 'bg-white/[0.04] text-neutral-400')}>
                        <TypeIcon className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate text-[#FAF9F5]">
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
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-neutral-400 border border-[#3E3E38]">
                        {typeLabel}
                      </span>
                      <Flaticon name="angle-small-right" className="text-xs text-neutral-500" />
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
            <div className="py-2 px-1 text-xs text-neutral-400 space-y-0.5">
              <div className="text-[11px] font-medium text-neutral-400 mb-1 px-2">
                Quick Navigation
              </div>
              <div
                onClick={() => {
                  navigate('/library');
                  onClose();
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/[0.04] cursor-pointer text-neutral-400 hover:text-white transition-colors"
              >
                <span>All Resources</span>
                <kbd className="font-mono text-[10px] text-neutral-500">/library</kbd>
              </div>
              <div
                onClick={() => {
                  navigate('/categories');
                  onClose();
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/[0.04] cursor-pointer text-neutral-400 hover:text-white transition-colors"
              >
                <span>Categories</span>
                <kbd className="font-mono text-[10px] text-neutral-500">/categories</kbd>
              </div>
              <div
                onClick={() => {
                  navigate('/favourites');
                  onClose();
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/[0.04] cursor-pointer text-neutral-400 hover:text-white transition-colors"
              >
                <span>Favorites</span>
                <kbd className="font-mono text-[10px] text-neutral-500">/favourites</kbd>
              </div>
              <div
                onClick={() => {
                  navigate('/settings');
                  onClose();
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/[0.04] cursor-pointer text-neutral-400 hover:text-white transition-colors"
              >
                <span>Settings</span>
                <kbd className="font-mono text-[10px] text-neutral-500">/settings</kbd>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#3E3E38] flex items-center justify-between text-[11px] text-neutral-500 bg-[#262624]">
          <div className="flex items-center gap-2">
            <span>Select: <kbd className="font-mono text-[10px] bg-white/[0.06] text-neutral-400 px-1 py-0.5 rounded border border-[#3E3E38]">↵</kbd></span>
            <span>Navigate: <kbd className="font-mono text-[10px] bg-white/[0.06] text-neutral-400 px-1 py-0.5 rounded border border-[#3E3E38]">↑↓</kbd></span>
          </div>
          <span className="text-[11px] text-neutral-500">Shelfspace</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
