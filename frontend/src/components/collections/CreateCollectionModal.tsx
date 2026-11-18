import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Flaticon } from '../ui/Flaticon';
import { apiClient } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { PRE_MADE_COLLECTIONS, type PreMadeCollection } from '../../lib/collectionTemplates';
import type { Collection } from '../../types';
import { cn } from '../../lib/utils';

const MUTED_COLORS = [
  '#D97757', // Terracotta (MX Icons)
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

export interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'premade' | 'custom';
  onSuccess?: (created: Collection) => void;
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'premade',
  onSuccess,
}) => {
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<'premade' | 'custom'>(initialTab);
  const [existingCategories, setExistingCategories] = useState<Collection[]>([]);

  // Custom creation state
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customColor, setCustomColor] = useState(MUTED_COLORS[0]);

  // Loading & error states
  const [creatingPreMadeName, setCreatingPreMadeName] = useState<string | null>(null);
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCustomName('');
      setCustomDescription('');
      setCustomColor(MUTED_COLORS[0]);
      setError('');
      setCreatingPreMadeName(null);
      fetchExisting();
    }
  }, [isOpen, initialTab]);

  const fetchExisting = async () => {
    try {
      const res = await apiClient.get('/collections');
      if (res.data?.success) {
        setExistingCategories(res.data.data);
      }
    } catch {
      // ignore
    }
  };

  const existingNamesSet = useMemo(() => {
    return new Set(existingCategories.map((c) => c.name.trim().toLowerCase()));
  }, [existingCategories]);

  // 1-Click Pre-made Collection Creation
  const handleSelectPreMade = async (item: PreMadeCollection) => {
    if (existingNamesSet.has(item.name.toLowerCase())) return;

    setCreatingPreMadeName(item.name);
    setError('');

    try {
      const res = await apiClient.post('/collections', {
        name: item.name,
        color: item.color,
      });

      if (res.data?.success) {
        notify(`Collection "${item.name}" created`, 'success');
        window.dispatchEvent(new CustomEvent('categories-updated'));
        onSuccess?.(res.data.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to create "${item.name}"`);
    } finally {
      setCreatingPreMadeName(null);
    }
  };

  // Custom Collection Creation
  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) {
      setError('Collection name is required.');
      return;
    }

    if (existingNamesSet.has(trimmed.toLowerCase())) {
      setError(`A collection named "${trimmed}" already exists.`);
      return;
    }

    setIsSubmittingCustom(true);
    setError('');

    try {
      const res = await apiClient.post('/collections', {
        name: trimmed,
        description: customDescription.trim() || undefined,
        color: customColor,
      });

      if (res.data?.success) {
        notify(`Collection "${trimmed}" created`, 'success');
        window.dispatchEvent(new CustomEvent('categories-updated'));
        onSuccess?.(res.data.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create collection.');
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="New Collection"
      description="Create a collection to organize your bookmarks and resources."
      maxWidth="sm"
    >
      <div className="font-sans space-y-4 pt-1">
        {/* Simple Two-Option Segmented Control */}
        <div className="flex items-center p-1 rounded-md bg-[#262624] border border-[#3E3E38] text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('premade');
              setError('');
            }}
            className={cn(
              'flex-1 py-1.5 px-3 rounded font-medium transition-colors text-center cursor-pointer',
              activeTab === 'premade'
                ? 'bg-white/[0.1] text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            )}
          >
            Pre-made Collections
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('custom');
              setError('');
            }}
            className={cn(
              'flex-1 py-1.5 px-3 rounded font-medium transition-colors text-center cursor-pointer',
              activeTab === 'custom'
                ? 'bg-white/[0.1] text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            )}
          >
            Create Custom
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* 1. Pre-made Collections List (Immediate One-Click Creation) */}
        {activeTab === 'premade' ? (
          <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
            {PRE_MADE_COLLECTIONS.map((item) => {
              const isExisting = existingNamesSet.has(item.name.toLowerCase());
              const isCreating = creatingPreMadeName === item.name;

              return (
                <button
                  key={item.name}
                  type="button"
                  disabled={isExisting || isCreating || Boolean(creatingPreMadeName)}
                  onClick={() => handleSelectPreMade(item)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors text-left group',
                    isExisting
                      ? 'opacity-40 cursor-default bg-transparent'
                      : 'hover:bg-white/[0.05] cursor-pointer text-[#FAF9F5]'
                  )}
                  title={isExisting ? `"${item.name}" already added` : `Click to create "${item.name}" immediately`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <Flaticon
                      name={item.iconName}
                      className="text-xs text-neutral-400 group-hover:text-white transition-colors shrink-0"
                    />
                    <span className="font-medium truncate">{item.name}</span>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isExisting ? (
                      <span className="text-[11px] text-neutral-500 font-mono">Added</span>
                    ) : isCreating ? (
                      <span className="text-[11px] text-[#D97757]">Creating...</span>
                    ) : (
                      <Flaticon
                        name="plus"
                        className="text-[10px] text-neutral-500 group-hover:text-[#D97757] transition-colors"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* 2. Custom Collection Form */
          <form onSubmit={handleCreateCustom} className="space-y-3.5">
            <div>
              <Input
                label="Collection Name"
                placeholder="e.g. Learning, Tools, Design"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Description (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of what this collection is for..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full rounded-md p-2.5 text-xs bg-[#262624] border border-[#3E3E38] text-[#FAF9F5] placeholder:text-neutral-500 focus:outline-hidden focus:border-[#D97757] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-2">
                Color Accent
              </label>
              <div className="flex items-center gap-2">
                {MUTED_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCustomColor(c)}
                    className={cn(
                      'w-6 h-6 rounded-full transition-transform cursor-pointer',
                      customColor === c && 'ring-2 ring-white ring-offset-2 ring-offset-[#1C1C1B]'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#3E3E38] flex items-center justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingCustom}>
                Create Collection
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
};

export default CreateCollectionModal;
