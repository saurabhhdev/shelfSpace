import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Wrench,
  GitBranch,
  Layers,
  Code2,
  Palette,
  BookOpen,
  X,
  Plus,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { RESOURCE_TYPES, normalizeResourceType } from '../../lib/resourceTypes';
import { useNotification } from '../../context/NotificationContext';
import type { Resource, ResourceType, Collection } from '../../types';
import { cn } from '../../lib/utils';

export interface ResourceModalProps {
  isOpen: boolean;
  resource?: Resource | null; // If provided, modal is in Edit mode
  categories: Collection[];
  onClose: () => void;
  onSuccess: () => void;
  onCategoryCreated?: (newCategory: Collection) => void;
}

const MUTED_COLORS = [
  '#09AE5B', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#71717a', // Zinc
];

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  resource = null,
  categories,
  onClose,
  onSuccess,
  onCategoryCreated,
}) => {
  const isEdit = !!resource;
  const { notify } = useNotification();

  // Form Fields
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceType>('tools');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fetch & Duplicate check state
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Inline Category Creation
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(MUTED_COLORS[0]);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Unsaved changes confirmation
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const initialDataRef = useRef<string>('');

  // Populate on open or change
  useEffect(() => {
    if (isOpen) {
      if (resource) {
        setName(resource.title || '');
        setUrl(resource.url || '');
        setType(normalizeResourceType(resource.type));
        setDescription(resource.description || '');
        const primaryCat = resource.collectionIds?.[0];
        setCategoryId(typeof primaryCat === 'object' && primaryCat !== null ? primaryCat._id : primaryCat || '');
        setTags(resource.tags || []);
        setNotes(resource.notes || '');
      } else {
        setName('');
        setUrl('');
        setType('tools');
        setDescription('');
        setCategoryId('');
        setTags([]);
        setNotes('');
      }
      setTagInput('');
      setError('');
      setDuplicateWarning(false);
      setIsCreatingCategory(false);
      setShowDiscardConfirm(false);

      // Snapshot initial state
      initialDataRef.current = JSON.stringify({
        name: resource?.title || '',
        url: resource?.url || '',
        type: resource?.type || 'tools',
        description: resource?.description || '',
        tags: resource?.tags || [],
        notes: resource?.notes || '',
      });
    }
  }, [isOpen, resource]);

  // Check if form is dirty
  const isDirty = () => {
    const current = JSON.stringify({
      name,
      url,
      type,
      description,
      tags,
      notes,
    });
    return current !== initialDataRef.current;
  };

  // Safe Close with dirty check
  const handleRequestClose = () => {
    if (isDirty()) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Auto-fetch metadata & duplicate check on URL blur / valid URL
  const handleUrlBlur = async () => {
    const trimmed = url.trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) return;

    // 1. Check duplicate URL
    try {
      const res = await apiClient.get('/resources', { params: { search: trimmed, limit: 5 } });
      if (res.data?.success && Array.isArray(res.data.data)) {
        const found = res.data.data.find(
          (r: Resource) => r.url?.toLowerCase() === trimmed.toLowerCase() && r._id !== resource?._id
        );
        setDuplicateWarning(!!found);
      }
    } catch {
      // Ignore search check failures
    }

    // 2. Auto-fetch title & description if not set yet (only in create mode or empty fields)
    if (!name.trim() || !description.trim()) {
      setIsFetchingMeta(true);
      try {
        const metaRes = await apiClient.get('/resources/preview/meta', { params: { url: trimmed } });
        if (metaRes.data?.success && metaRes.data.data) {
          const extracted = metaRes.data.data;
          if (!name.trim() && extracted.title) {
            setName(extracted.title);
          }
          if (!description.trim() && extracted.description) {
            setDescription(extracted.description);
          }
          if (extracted.type && !isEdit) {
            setType(normalizeResourceType(extracted.type));
          }
        }
      } catch {
        // Failed metadata fetch is handled gracefully
      } finally {
        setIsFetchingMeta(false);
      }
    }
  };

  const handleAddTag = (t: string) => {
    const clean = t.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    try {
      const res = await apiClient.post('/collections', {
        name: newCategoryName.trim(),
        color: newCategoryColor,
      });
      if (res.data?.success && res.data.data) {
        const created = res.data.data;
        onCategoryCreated?.(created);
        setCategoryId(created._id);
        setIsCreatingCategory(false);
        setNewCategoryName('');
        notify(`Category "${created.name}" created`, 'success');
      }
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to create category', 'error');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      setError('Please fill in all required fields (Name and URL).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      title: name.trim(),
      url: url.trim(),
      type,
      description: description.trim(),
      collectionIds: categoryId ? [categoryId] : [],
      tags,
      notes: notes.trim(),
    };

    try {
      if (isEdit) {
        await apiClient.patch(`/resources/${resource!._id}`, payload);
        notify('Resource updated successfully', 'success');
      } else {
        await apiClient.post('/resources', payload);
        notify('Resource created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        isOpen={isOpen && !showDiscardConfirm}
        onClose={handleRequestClose}
        title={isEdit ? 'Edit Resource' : 'Add Resource'}
        description={isEdit ? 'Update details, tags, and category.' : 'Save a developer tool, repository, component, snippet, design, or reference.'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {error && (
            <div className="p-3 rounded-md bg-rose-950/20 border border-rose-900/40 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Resource Type Selection (6 options) */}
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">
              Resource Type <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RESOURCE_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-md border text-left text-xs transition-colors cursor-pointer',
                      isSelected
                        ? 'border-[#09AE5B]/60 bg-[#09AE5B]/10 text-white font-medium'
                        : 'border-white/[0.08] bg-[#0E0F10] text-neutral-400 hover:text-white hover:bg-white/[0.02]'
                    )}
                  >
                    <Icon className={cn('w-3.5 h-3.5 shrink-0', isSelected ? 'text-[#09AE5B]' : 'text-neutral-500')} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. URL (Required) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-300">
                URL <span className="text-rose-400">*</span>
              </label>
              {isFetchingMeta && (
                <span className="flex items-center gap-1 text-[11px] text-[#09AE5B]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Fetching title & description...</span>
                </span>
              )}
            </div>
            <Input
              type="url"
              placeholder="https://github.com/facebook/react or https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              required
            />
            {duplicateWarning && (
              <p className="mt-1.5 text-[11px] text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Note: A resource with this URL already exists in your library.</span>
              </p>
            )}
          </div>

          {/* 3. Name (Required) */}
          <div>
            <Input
              label="Resource Name"
              placeholder="e.g. React, Tailwind CSS, Lucide Icons"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* 4. Description (Optional) */}
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Description <span className="text-neutral-500 text-[11px]">(optional)</span>
            </label>
            <textarea
              rows={2}
              className="w-full rounded-md p-2.5 text-xs bg-[#0E0F10] border border-white/[0.08] text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="Brief description of what this resource is and why it is useful..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 5. Category Selection & Inline Creation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-300">
                Category <span className="text-neutral-500 text-[11px]">(optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-[11px] text-[#09AE5B] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{isCreatingCategory ? 'Select existing category' : 'Create new category'}</span>
              </button>
            </div>

            {isCreatingCategory ? (
              <div className="p-3 rounded-md bg-[#0E0F10] border border-white/[0.08] space-y-2.5">
                <div className="flex gap-2">
                  <Input
                    placeholder="Category name (e.g. Frontend, APIs, Books)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleQuickCreateCategory}
                    isLoading={isSavingCategory}
                  >
                    Save
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">Color:</span>
                  <div className="flex items-center gap-1.5">
                    {MUTED_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCategoryColor(c)}
                        className={cn(
                          'w-4 h-4 rounded-full transition-transform cursor-pointer',
                          newCategoryColor === c && 'ring-2 ring-white ring-offset-2 ring-offset-[#0E0F10]'
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-md px-3 text-xs bg-[#0E0F10] border border-white/[0.08] text-[#E5E5E5] focus:outline-none focus:border-white/20 transition-colors"
              >
                <option value="">No category (Uncategorized)</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 6. Tags (Optional) */}
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Tags <span className="text-neutral-500 text-[11px]">(optional)</span>
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddTag(tagInput)}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-white/[0.05] text-neutral-300 border border-white/[0.08]"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-neutral-400 hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 7. Notes (Optional) */}
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Personal Notes <span className="text-neutral-500 text-[11px]">(optional)</span>
            </label>
            <textarea
              rows={3}
              className="w-full rounded-md p-2.5 font-mono text-xs bg-[#0E0F10] border border-white/[0.08] text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="Installation commands, key takeaway, or code snippet..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleRequestClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isEdit ? 'Save Changes' : 'Add Resource'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Discard Changes Confirmation */}
      <Dialog
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        title="Discard Unsaved Changes?"
        description="You have unsaved changes in this resource. Are you sure you want to discard them?"
        maxWidth="sm"
      >
        <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDiscardConfirm(false)}
          >
            Keep Editing
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              setShowDiscardConfirm(false);
              onClose();
            }}
          >
            Discard
          </Button>
        </div>
      </Dialog>
    </>
  );
};

export default ResourceModal;
