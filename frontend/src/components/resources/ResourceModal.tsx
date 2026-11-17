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
  AlertTriangle,
  Loader2,
  ExternalLink,
  Sparkles,
  PenLine,
  FolderKanban,
  Globe,
  Image as ImageIcon,
  Check,
  RotateCcw,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { RESOURCE_TYPES, normalizeResourceType, getResourceTypeIcon } from '../../lib/resourceTypes';
import { useNotification } from '../../context/NotificationContext';
import type { Resource, ResourceType, Collection, Project } from '../../types';
import { cn } from '../../lib/utils';

export interface ResourceModalProps {
  isOpen: boolean;
  resource?: Resource | null; // If provided, modal is in Edit mode
  categories: Collection[];
  initialProjectId?: string;
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
  initialProjectId,
  onClose,
  onSuccess,
  onCategoryCreated,
}) => {
  const isEdit = !!resource;
  const { notify } = useNotification();

  // Workflow Mode: 'auto' | 'manual'
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  // Form Fields
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceType>('tools');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [favicon, setFavicon] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Projects list
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  // Metadata Extraction States (Auto Add)
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [hasFetchedMeta, setHasFetchedMeta] = useState(false);
  const [fetchMetaError, setFetchMetaError] = useState('');
  const [suggestedType, setSuggestedType] = useState<ResourceType | null>(null);
  const [suggestedCategoryName, setSuggestedCategoryName] = useState<string | null>(null);

  // Duplicate Check State
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; title?: string } | null>(null);
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  // Inline Category Creation
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(MUTED_COLORS[0]);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Unsaved changes confirmation
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const initialDataRef = useRef<string>('');

  // Fetch available projects on open
  useEffect(() => {
    if (isOpen) {
      apiClient
        .get('/projects?status=active')
        .then((res) => {
          if (res.data?.success) {
            setAvailableProjects(res.data.data || []);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Populate form fields on open or resource change
  useEffect(() => {
    if (isOpen) {
      if (resource) {
        setMode('manual');
        setName(resource.title || '');
        setUrl(resource.url || '');
        setType(normalizeResourceType(resource.type));
        setDescription(resource.description || '');
        const primaryCat = resource.collectionIds?.[0];
        setCategoryId(
          typeof primaryCat === 'object' && primaryCat !== null ? primaryCat._id : primaryCat || ''
        );
        setTags(resource.tags || []);
        setNotes(resource.notes || '');
        setPreviewImage(resource.previewImage || '');
        setFavicon(resource.favicon || '');
        const projIds = (resource.projectIds || []).map((p: any) =>
          typeof p === 'object' && p !== null ? p._id : p
        );
        setSelectedProjectIds(projIds);
        setHasFetchedMeta(false);
      } else {
        setMode('auto');
        setName('');
        setUrl('');
        setType('tools');
        setDescription('');
        setCategoryId('');
        setTags([]);
        setNotes('');
        setPreviewImage('');
        setFavicon('');
        setSelectedProjectIds(initialProjectId ? [initialProjectId] : []);
        setHasFetchedMeta(false);
      }
      setTagInput('');
      setFormError('');
      setFetchMetaError('');
      setSuggestedType(null);
      setSuggestedCategoryName(null);
      setDuplicateWarning(null);
      setAllowDuplicate(false);
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
        previewImage: resource?.previewImage || '',
      });
    }
  }, [isOpen, resource, initialProjectId]);

  // Check duplicate URL whenever URL changes (debounced)
  useEffect(() => {
    if (!url.trim() || !/^https?:\/\//i.test(url.trim())) {
      setDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.get(
          `/resources/check-duplicate?url=${encodeURIComponent(url.trim())}`
        );
        if (res.data?.success && res.data.data?.isDuplicate) {
          const existing = res.data.data.existing;
          // Don't warn if editing the same resource
          if (resource && resource._id === existing?._id) {
            setDuplicateWarning(null);
          } else {
            setDuplicateWarning({
              isDuplicate: true,
              title: existing?.title || 'Existing resource',
            });
          }
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        // Silently ignore duplicate check network errors
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [url, resource]);

  // Auto Add: Fetch metadata from backend
  const handleFetchMetadata = async () => {
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setFetchMetaError('Please enter a URL first.');
      return;
    }

    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
      setUrl(cleanUrl);
    }

    setIsFetchingMeta(true);
    setFetchMetaError('');

    try {
      const res = await apiClient.get(
        `/resources/preview/meta?url=${encodeURIComponent(cleanUrl)}`
      );

      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        if (data.title) setName(data.title);
        if (data.description) setDescription(data.description);
        if (data.previewImage) setPreviewImage(data.previewImage);
        if (data.favicon) setFavicon(data.favicon);

        if (data.type) {
          const normType = normalizeResourceType(data.type);
          setType(normType);
          setSuggestedType(normType);
        }

        // Tags suggestion
        if (data.suggestedTags && Array.isArray(data.suggestedTags) && data.suggestedTags.length > 0) {
          setTags(Array.from(new Set([...tags, ...data.suggestedTags])));
        }

        // Category suggestion
        if (data.suggestedCategory) {
          setSuggestedCategoryName(data.suggestedCategory);
          // Try to match existing category
          const match = categories.find(
            (c) =>
              c.name.toLowerCase() === data.suggestedCategory.toLowerCase() ||
              data.suggestedCategory.toLowerCase().includes(c.name.toLowerCase())
          );
          if (match) {
            setCategoryId(match._id);
          }
        }

        setHasFetchedMeta(true);
        notify('Resource metadata retrieved successfully', 'success');
      } else {
        setHasFetchedMeta(true);
        setFetchMetaError('Could not retrieve full metadata. You can fill in details manually below.');
      }
    } catch (err: any) {
      setHasFetchedMeta(true);
      setFetchMetaError(
        'Unable to retrieve automatic details from this URL. You can continue filling in details manually below.'
      );
    } finally {
      setIsFetchingMeta(false);
    }
  };

  // Add tag
  const handleAddTag = (t: string) => {
    const clean = t.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  // Remove tag
  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  // Toggle Project assignment
  const handleToggleProject = (projId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projId) ? prev.filter((id) => id !== projId) : [...prev, projId]
    );
  };

  // Inline Category Creation
  const handleQuickCreateCategory = async (catName?: string) => {
    const nameToUse = (catName || newCategoryName).trim();
    if (!nameToUse) return;

    setIsSavingCategory(true);
    try {
      const res = await apiClient.post('/collections', {
        name: nameToUse,
        color: newCategoryColor,
      });
      if (res.data?.success && res.data.data) {
        const created = res.data.data;
        onCategoryCreated?.(created);
        setCategoryId(created._id);
        setIsCreatingCategory(false);
        setNewCategoryName('');
        setSuggestedCategoryName(null);
        notify(`Category "${created.name}" created and assigned`, 'success');
      }
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to create category', 'error');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Check if form is dirty
  const isDirty = () => {
    const current = JSON.stringify({
      name,
      url,
      type,
      description,
      tags,
      notes,
      previewImage,
    });
    return current !== initialDataRef.current;
  };

  const handleRequestClose = () => {
    if (isDirty()) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Reset Auto Add back to initial URL input
  const handleResetAutoAdd = () => {
    setHasFetchedMeta(false);
    setFetchMetaError('');
    setSuggestedType(null);
    setSuggestedCategoryName(null);
    setName('');
    setDescription('');
    setPreviewImage('');
    setTags([]);
  };

  // Final Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Resource name is required.');
      return;
    }

    if (!url.trim()) {
      setFormError('Resource URL is required.');
      return;
    }

    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
      setUrl(cleanUrl);
    }

    setIsSubmitting(true);
    setFormError('');

    const payload: any = {
      title: name.trim(),
      url: cleanUrl,
      type,
      description: description.trim(),
      collectionIds: categoryId ? [categoryId] : [],
      projectIds: selectedProjectIds,
      tags,
      notes: notes.trim(),
      previewImage: previewImage.trim() || undefined,
      favicon: favicon.trim() || undefined,
      allowDuplicate: allowDuplicate || Boolean(duplicateWarning),
    };

    try {
      if (isEdit) {
        await apiClient.patch(`/resources/${resource!._id}`, payload);
        notify('Resource updated successfully', 'success');
      } else {
        await apiClient.post('/resources', payload);
        notify('Resource saved to your collection', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409 && !allowDuplicate) {
        setDuplicateWarning({
          isDuplicate: true,
          title: 'Another resource with this URL already exists.',
        });
        setFormError('A resource with this URL already exists. Click "Save Anyway" if this duplicate is intentional.');
        setAllowDuplicate(true);
      } else {
        setFormError(err.response?.data?.message || err.message || 'Failed to save resource');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const TypeIcon = getResourceTypeIcon(type);

  // Determine whether the review/details form should be shown in Auto mode
  const showAutoReviewForm = mode === 'auto' && (hasFetchedMeta || isFetchingMeta);

  return (
    <>
      <Dialog
        isOpen={isOpen && !showDiscardConfirm}
        onClose={handleRequestClose}
        title={isEdit ? 'Edit Resource' : 'Add Resource'}
        description={
          isEdit
            ? 'Update resource information, type, category, or project assignments.'
            : 'Save developer tools, repositories, components, snippets, and references.'
        }
        maxWidth="lg"
      >
        <div className="font-sans space-y-4">
          {/* 1. Workflow Mode Segmented Switcher (Only when adding new resource) */}
          {!isEdit && (
            <div className="flex items-center p-1 bg-[#0E0F10] border border-white/[0.08] rounded-md">
              <button
                type="button"
                onClick={() => {
                  setMode('auto');
                  setFormError('');
                }}
                className={cn(
                  'flex-1 py-1.5 px-3 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
                  mode === 'auto'
                    ? 'bg-white/[0.1] text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#09AE5B]" />
                <span>Auto Add</span>
                <span className="text-[10px] text-neutral-500 font-normal hidden sm:inline">
                  (Retrieve via URL)
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('manual');
                  setFormError('');
                }}
                className={cn(
                  'flex-1 py-1.5 px-3 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
                  mode === 'manual'
                    ? 'bg-white/[0.1] text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                )}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Manual Add</span>
                <span className="text-[10px] text-neutral-500 font-normal hidden sm:inline">
                  (Complete control)
                </span>
              </button>
            </div>
          )}

          {/* Duplicate URL Warning Banner */}
          {duplicateWarning && (
            <div className="p-3 rounded-md bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">Duplicate URL detected:</span> A resource with this URL already exists in your library ({duplicateWarning.title}). You can still save it if this duplicate is intentional.
              </div>
            </div>
          )}

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 rounded-md bg-rose-950/20 border border-rose-900/40 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* ==================== AUTO ADD: STEP 1 (INITIAL URL INPUT) ==================== */}
          {mode === 'auto' && !isEdit && !hasFetchedMeta && !isFetchingMeta && (
            <div className="p-4 rounded-md bg-[#0E0F10] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#09AE5B]" />
                  <span>Enter Resource URL *</span>
                </label>
                <span className="text-[11px] text-neutral-500">
                  GitHub repo, documentation, or tool URL
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="https://github.com/facebook/react or https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFetchMetadata();
                      }
                    }}
                    autoFocus
                  />
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleFetchMetadata}
                  disabled={!url.trim() || isFetchingMeta}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="shrink-0"
                >
                  Fetch Details
                </Button>
              </div>

              {/* Retrieval Notice / Fallback Message */}
              {fetchMetaError && (
                <div className="text-[11px] text-amber-400/90 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fetchMetaError}</span>
                </div>
              )}

              {/* Skip to manual link */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px] text-neutral-500">
                <span>Pasting a link will extract title, description, and preview image automatically.</span>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className="text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Or fill manually
                </button>
              </div>
            </div>
          )}

          {/* ==================== AUTO ADD: LOADING SKELETON ==================== */}
          {mode === 'auto' && isFetchingMeta && (
            <div className="p-6 rounded-md bg-[#0E0F10] border border-white/[0.08] space-y-3 text-center">
              <div className="w-8 h-8 rounded-full bg-[#16171b] border border-white/10 flex items-center justify-center mx-auto text-[#09AE5B]">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="text-xs font-medium text-[#EDEDED]">
                Retrieving resource metadata & classifying...
              </div>
              <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                Inspecting website tags, Open Graph preview, and classification heuristics for {url}
              </p>
            </div>
          )}

          {/* ==================== FORM BODY (Manual Mode, Edit Mode, or Auto Mode Post-Fetch) ==================== */}
          {(mode === 'manual' || isEdit || showAutoReviewForm) && !isFetchingMeta && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Auto Mode: Top bar to change URL or re-fetch */}
              {mode === 'auto' && !isEdit && (
                <div className="flex items-center justify-between p-2.5 rounded-md bg-[#0E0F10] border border-white/[0.08] text-xs">
                  <div className="flex items-center gap-2 truncate mr-2">
                    <Globe className="w-3.5 h-3.5 text-[#09AE5B] shrink-0" />
                    <span className="text-neutral-400 truncate">{url}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetAutoAdd}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white shrink-0 cursor-pointer"
                    title="Change URL"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Change URL</span>
                  </button>
                </div>
              )}

              {/* Preview Image Banner (if available) */}
              {previewImage && (
                <div className="relative w-full aspect-[16/9] max-h-44 rounded-md bg-[#0E0F10] border border-white/[0.08] overflow-hidden group">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewImage('')}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-3">
                    <span className="text-[11px] text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      Preview Image
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewImage('')}
                      className="p-1 rounded-md bg-black/70 text-neutral-300 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove preview image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Mode / Edit Mode URL Input */}
              {(mode === 'manual' || isEdit) && (
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Resource URL *
                  </label>
                  <Input
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                  {url && !/^https?:\/\//i.test(url) && (
                    <span className="text-[11px] text-neutral-500 mt-1 block">
                      URL should begin with https:// or http://
                    </span>
                  )}
                </div>
              )}

              {/* Title / Name */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Resource Name *
                </label>
                <Input
                  placeholder="e.g. Next.js, Radix UI, Docker Documentation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Resource Type Selection (6 Core Types) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Resource Type *
                  </label>
                  {suggestedType && (
                    <span className="text-[10px] text-[#09AE5B] flex items-center gap-1 font-mono">
                      <Sparkles className="w-2.5 h-2.5" />
                      Suggested based on website
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {RESOURCE_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-md border text-xs text-left transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-[#09AE5B]/10 border-[#09AE5B] text-white font-medium'
                            : 'bg-[#121316] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-3.5 h-3.5 shrink-0',
                            isSelected ? 'text-[#09AE5B]' : 'text-neutral-500'
                          )}
                        />
                        <span className="truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-md p-2.5 text-xs bg-[#121316] border border-white/[0.08] text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="Brief summary of what this resource provides..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                />
              </div>

              {/* Category Assignment & Creation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Category (optional)
                  </label>
                  {!isCreatingCategory && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(true)}
                      className="text-[11px] text-[#09AE5B] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Category</span>
                    </button>
                  )}
                </div>

                {/* Inline Category Creator */}
                {isCreatingCategory ? (
                  <div className="p-3 bg-[#0E0F10] border border-white/[0.08] rounded-md space-y-2 mb-2">
                    <div className="text-xs font-medium text-[#EDEDED]">Create Category</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Category name..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs bg-[#121316] border border-white/[0.08] rounded text-[#EDEDED] focus:outline-none"
                      />
                      <div className="flex items-center gap-1">
                        {MUTED_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewCategoryColor(c)}
                            className={cn(
                              'w-4 h-4 rounded-full transition-transform',
                              newCategoryColor === c ? 'scale-125 ring-1 ring-white' : 'opacity-70'
                            )}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(false)}
                        className="text-xs text-neutral-400 hover:text-white px-2 py-0.5"
                      >
                        Cancel
                      </button>
                      <Button
                        type="button"
                        size="xs"
                        isLoading={isSavingCategory}
                        onClick={() => handleQuickCreateCategory()}
                      >
                        Create & Select
                      </Button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#121316] border border-white/[0.08] rounded-md text-[#EDEDED] focus:outline-none focus:border-white/20 cursor-pointer"
                  >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Suggested Category Quick Action Banner */}
                {suggestedCategoryName && !categoryId && !isCreatingCategory && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px] p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-neutral-400">
                      Suggested Category: <strong className="text-white">{suggestedCategoryName}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickCreateCategory(suggestedCategoryName)}
                      className="text-[#09AE5B] hover:underline font-medium cursor-pointer"
                    >
                      + Create "{suggestedCategoryName}"
                    </button>
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Tags (optional)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-white/[0.04] text-[#EDEDED] border border-white/[0.08]"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-neutral-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add custom tag (press Enter)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-[#121316] border border-white/[0.08] rounded-md text-[#EDEDED] placeholder:text-neutral-500 focus:outline-none focus:border-white/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => handleAddTag(tagInput)}
                    disabled={!tagInput.trim()}
                  >
                    Add Tag
                  </Button>
                </div>
              </div>

              {/* Projects Assignment */}
              {availableProjects.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Assign to Projects (optional)
                    </label>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {selectedProjectIds.length} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-[#0E0F10] border border-white/[0.08] rounded-md">
                    {availableProjects.map((p) => {
                      const isAssigned = selectedProjectIds.includes(p._id);
                      return (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => handleToggleProject(p._id)}
                          className={cn(
                            'flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-colors cursor-pointer select-none',
                            isAssigned
                              ? 'bg-[#09AE5B]/10 border-[#09AE5B] text-white font-medium'
                              : 'bg-[#121316] border-white/[0.06] text-neutral-400 hover:text-white'
                          )}
                        >
                          <FolderKanban
                            className={cn(
                              'w-3 h-3',
                              isAssigned ? 'text-[#09AE5B]' : 'text-neutral-500'
                            )}
                          />
                          <span>{p.name}</span>
                          {isAssigned && <Check className="w-2.5 h-2.5 ml-0.5 text-[#09AE5B]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Personal Notes */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Personal Notes (optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-md p-2.5 text-xs bg-[#121316] border border-white/[0.08] text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="Installation notes, quick usage commands, or personal reminders..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Custom Preview Image URL input */}
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  Custom Preview Image URL (optional)
                </label>
                <Input
                  placeholder="https://example.com/og-image.png"
                  value={previewImage}
                  onChange={(e) => setPreviewImage(e.target.value)}
                />
              </div>

              {/* Sticky Footer Actions */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between sticky bottom-0 bg-[#121316] pb-1 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleRequestClose}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={!isSubmitting ? <Check className="w-3.5 h-3.5" /> : undefined}
                >
                  {isEdit
                    ? 'Save Changes'
                    : duplicateWarning && allowDuplicate
                    ? 'Save Anyway'
                    : 'Save Resource'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Dialog>

      {/* Discard Changes Confirmation */}
      {showDiscardConfirm && (
        <Dialog
          isOpen={showDiscardConfirm}
          onClose={() => setShowDiscardConfirm(false)}
          title="Discard Unsaved Changes?"
          description="You have unsaved changes in this form. Are you sure you want to close and discard them?"
        >
          <div className="flex justify-end gap-2 pt-2">
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setShowDiscardConfirm(false)}
            >
              Keep Editing
            </Button>
            <Button
              size="xs"
              variant="danger"
              onClick={() => {
                setShowDiscardConfirm(false);
                onClose();
              }}
            >
              Discard Changes
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default ResourceModal;
