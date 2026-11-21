import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Flaticon } from '../ui/Flaticon';
import {
  Wrench,
  GitBranch,
  Layers,
  Code2,
  X,
  Plus,
  Sparkles,
  FolderKanban,
  Check,
  RotateCcw,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { Alert } from '../ui/Alert';
import { RESOURCE_TYPES, normalizeResourceType } from '../../lib/resourceTypes';
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
  '#D97757', // Terracotta (MX Icons)
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
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  // Projects & Collections lists
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [availableCollections, setAvailableCollections] = useState<Collection[]>([]);

  // Metadata Extraction States (Auto Add)
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [hasFetchedMeta, setHasFetchedMeta] = useState(false);
  const [fetchMetaStatus, setFetchMetaStatus] = useState<'idle' | 'fetching' | 'success' | 'partial' | 'failed' | 'invalid'>('idle');
  const [fetchMetaError, setFetchMetaError] = useState('');
  const [suggestedType, setSuggestedType] = useState<ResourceType | null>(null);
  const [typeConfidence, setTypeConfidence] = useState<'high' | 'medium' | 'low'>('medium');
  const [suggestedCategory, setSuggestedCategory] = useState<{
    name: string;
    isExisting: boolean;
    categoryId?: string;
    confidence: 'high' | 'medium' | 'low';
    reason?: string;
  } | null>(null);

  // Form organization states
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);

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

  // Fetch available projects & collections on open
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

      apiClient
        .get('/collections', { params: { type: 'collection' } })
        .then((res) => {
          if (res.data?.success) {
            setAvailableCollections(res.data.data || []);
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

        // Separate category (type === 'category' or default) from collections (type === 'collection')
        const allCols = resource.collectionIds || [];
        const catObj = allCols.find(
          (c: any) => typeof c === 'object' && c !== null && (c.type === 'category' || !c.type)
        );
        const primaryCat = catObj || allCols[0];
        setCategoryId(
          typeof primaryCat === 'object' && primaryCat !== null ? primaryCat._id : primaryCat || ''
        );

        const colObjs = allCols.filter(
          (c: any) => typeof c === 'object' && c !== null && c.type === 'collection'
        );
        setSelectedCollectionIds(colObjs.map((c: any) => c._id));

        setTags(resource.tags || []);
        setNotes(resource.notes || '');
        setPreviewImage(resource.previewImage || '');
        setFavicon(resource.favicon || '');
        const projIds = (resource.projectIds || []).map((p: any) =>
          typeof p === 'object' && p !== null ? p._id : p
        );
        setSelectedProjectIds(projIds);
        setHasFetchedMeta(false);
        setIsAdditionalOpen(Boolean(resource.notes || resource.previewImage));
      } else {
        setMode('auto');
        setName('');
        setUrl('');
        setType('tools');
        setDescription('');
        setCategoryId('');
        setSelectedCollectionIds([]);
        setTags([]);
        setNotes('');
        setPreviewImage('');
        setFavicon('');
        setSelectedProjectIds(initialProjectId ? [initialProjectId] : []);
        setHasFetchedMeta(false);
        setIsAdditionalOpen(false);
      }
      setTagInput('');
      setFormError('');
      setFetchMetaError('');
      setFetchMetaStatus('idle');
      setSuggestedType(null);
      setTypeConfidence('medium');
      setSuggestedCategory(null);
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
      setFetchMetaStatus('invalid');
      setFetchMetaError('Please enter a URL first.');
      return;
    }

    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
      setUrl(cleanUrl);
    }

    // URL validation
    const validUrlRegex = /^(https?:\/\/)?([\w.-]+\.[a-z]{2,}|localhost)(:\d+)?(\/.*)?$/i;
    if (!validUrlRegex.test(cleanUrl)) {
      setFetchMetaStatus('invalid');
      setFetchMetaError('Please enter a valid URL (e.g. https://github.com/... or https://example.com).');
      return;
    }

    setIsFetchingMeta(true);
    setFetchMetaError('');
    setFetchMetaStatus('fetching');

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
          if (data.typeConfidence) {
            setTypeConfidence(data.typeConfidence);
          }
        }

        // Tags suggestion (3-5 relevant auto tags)
        if (data.suggestedTags && Array.isArray(data.suggestedTags) && data.suggestedTags.length > 0) {
          setTags(data.suggestedTags);
        }

        // Category suggestion
        if (data.suggestedCategory) {
          setSuggestedCategory(data.suggestedCategory);
          if (data.suggestedCategory.isExisting && data.suggestedCategory.categoryId) {
            setCategoryId(data.suggestedCategory.categoryId);
          } else {
            setCategoryId('');
          }
        }

        const hasFull = Boolean(data.title && (data.description || data.previewImage));
        setFetchMetaStatus(hasFull ? 'success' : 'partial');
        setHasFetchedMeta(true);
        if (hasFull) {
          notify('Resource details retrieved successfully', 'success');
        } else {
          notify('Partial details retrieved. You can complete the remaining fields manually.', 'info');
        }
      } else {
        setHasFetchedMeta(true);
        setFetchMetaStatus('partial');
        setFetchMetaError('Could not retrieve full metadata. You can fill in details manually below.');
      }
    } catch (err: any) {
      try {
        const parsed = new URL(cleanUrl);
        const domain = parsed.hostname.replace(/^www\./, '');
        const prefix = domain.split('.')[0] || domain;
        const readable = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        if (!name) setName(readable);
      } catch {
        // ignore
      }
      setHasFetchedMeta(true);
      setFetchMetaStatus('failed');
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

  // Toggle Collection assignment
  const handleToggleCollection = (colId: string) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
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
        type: 'category',
      });
      if (res.data?.success && res.data.data) {
        const created = res.data.data;
        onCategoryCreated?.(created);
        setCategoryId(created._id);
        setIsCreatingCategory(false);
        setNewCategoryName('');
        setSuggestedCategory(null);
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
    setFetchMetaStatus('idle');
    setFetchMetaError('');
    setSuggestedType(null);
    setSuggestedCategory(null);
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

    const allCollectionIds = Array.from(
      new Set([categoryId, ...selectedCollectionIds].filter(Boolean))
    );

    const payload: any = {
      title: name.trim(),
      url: cleanUrl,
      type,
      description: description.trim(),
      collectionIds: allCollectionIds,
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
            : mode === 'auto'
            ? 'Paste a resource URL and Shelfspace will fetch its details for you. Review the information before saving.'
            : 'Fill in the resource details manually.'
        }
        maxWidth="lg"
      >
        <div className="font-sans space-y-4">
          {/* 1. Workflow Mode Segmented Switcher (Only when adding new resource) */}
          {!isEdit && (
            <div className="flex items-center p-1 bg-[#262624] border border-[#3E3E38] rounded-md">
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
                <Flaticon name="sparkles" className="text-xs text-[#D97757]" />
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
                <Flaticon name="pencil" className="text-xs" />
                <span>Manual Add</span>
                <span className="text-[10px] text-neutral-500 font-normal hidden sm:inline">
                  (Complete control)
                </span>
              </button>
            </div>
          )}

          {/* Duplicate URL Warning Banner */}
          {duplicateWarning && (
            <Alert
              variant="warning"
              title="Duplicate URL detected"
              className="mb-1"
            >
              A resource with this URL already exists in your library ({duplicateWarning.title}). You can still save it if this duplicate is intentional.
            </Alert>
          )}

          {/* Form Error Banner */}
          {formError && (
            <Alert
              variant="error"
              onDismiss={() => setFormError('')}
              className="mb-1"
            >
              {formError}
            </Alert>
          )}

          {/* ==================== AUTO ADD: STEP 1 (INITIAL URL INPUT) ==================== */}
          {mode === 'auto' && !isEdit && !hasFetchedMeta && !isFetchingMeta && (
            <div className="p-4 rounded-md bg-[#262624] border border-[#3E3E38] space-y-3">
              <p className="text-xs text-neutral-300">
                Paste a resource URL and Shelfspace will fetch its details for you. Review the information before saving.
              </p>

              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Flaticon name="globe" className="text-xs text-[#D97757]" />
                  <span>Enter Resource URL <span className="text-[#D97757]">*</span></span>
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
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (fetchMetaError) setFetchMetaError('');
                      if (fetchMetaStatus !== 'idle') setFetchMetaStatus('idle');
                    }}
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
                  leftIcon={<Flaticon name="sparkles" className="text-xs" />}
                  className="shrink-0"
                >
                  Fetch Details
                </Button>
              </div>

              {/* Retrieval Notice / Fallback Message */}
              {fetchMetaError && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1.5 pt-1">
                  <Flaticon name="info" className="text-xs shrink-0" />
                  <span>{fetchMetaError}</span>
                </div>
              )}

              {/* Skip to manual link */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px] text-neutral-500">
                <span>Pasting a link will extract title, description, and preview image automatically.</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('manual');
                    setFetchMetaError('');
                  }}
                  className="text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Or fill manually
                </button>
              </div>
            </div>
          )}

          {/* ==================== AUTO ADD: LOADING SKELETON ==================== */}
          {mode === 'auto' && isFetchingMeta && (
            <div className="p-6 rounded-md bg-[#262624] border border-[#3E3E38] space-y-3 text-center">
              <div className="w-8 h-8 rounded-full bg-[#1C1C1B] border border-[#3E3E38] flex items-center justify-center mx-auto text-[#D97757]">
                <Flaticon name="refresh" className="text-sm animate-spin" />
              </div>
              <div className="text-xs font-medium text-[#FAF9F5]">
                Retrieving resource metadata & classifying...
              </div>
              <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                Inspecting website tags, Open Graph preview, and classification heuristics for {url}
              </p>
            </div>
          )}

          {/* ==================== FORM BODY (Manual Mode, Edit Mode, or Auto Mode Post-Fetch) ==================== */}
          {(mode === 'manual' || isEdit || showAutoReviewForm) && !isFetchingMeta && (
            <form onSubmit={handleSubmit} className="flex flex-col">
              {/* Scrollable Form Content */}
              <div className="max-h-[58vh] overflow-y-auto pr-1 space-y-5">
                {/* Auto Mode: Top Status & URL Switcher */}
                {mode === 'auto' && !isEdit && (
                  <div className="space-y-2">
                    {/* Retrieval status alert */}
                    {fetchMetaStatus === 'success' && (
                      <Alert variant="success" onDismiss={() => setFetchMetaStatus('idle')} className="py-2 px-3 text-xs">
                        Details retrieved successfully. Review and edit the suggestions below before saving.
                      </Alert>
                    )}
                    {fetchMetaStatus === 'partial' && (
                      <Alert variant="warning" onDismiss={() => setFetchMetaStatus('idle')} className="py-2 px-3 text-xs">
                        Partial metadata retrieved. You can complete the remaining details manually below.
                      </Alert>
                    )}
                    {fetchMetaStatus === 'failed' && (
                      <Alert variant="warning" onDismiss={() => setFetchMetaStatus('idle')} className="py-2 px-3 text-xs">
                        Unable to retrieve automatic details from this URL. You can continue filling in details manually below.
                      </Alert>
                    )}

                    <div className="flex items-center justify-between p-2.5 rounded-md bg-[#262624] border border-[#3E3E38] text-xs">
                      <div className="flex items-center gap-2 truncate mr-2">
                        <Flaticon name="globe" className="text-xs text-[#D97757] shrink-0" />
                        <span className="text-neutral-300 truncate font-mono text-[11px]">{url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetAutoAdd}
                        className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white shrink-0 cursor-pointer"
                        title="Change URL"
                      >
                        <Flaticon name="refresh" className="text-[10px]" />
                        <span>Change URL</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Preview Image Banner (if available) */}
                {previewImage && (
                  <div className="relative w-full aspect-[16/9] max-h-44 rounded-md bg-[#262624] border border-[#3E3E38] overflow-hidden group">
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
                        <Flaticon name="cross" className="text-xs" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ================= 1. BASIC DETAILS ================= */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-[#3E3E38] text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    <Flaticon name="document" className="text-xs text-[#D97757]" />
                    <span>Basic Details</span>
                  </div>

                  {/* Manual Mode / Edit Mode URL Input */}
                  {(mode === 'manual' || isEdit) && (
                    <div>
                      <label className="text-xs font-medium text-neutral-300 block mb-1">
                        Resource URL <span className="text-[#D97757]">*</span>
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
                      Resource Name <span className="text-[#D97757]">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Next.js, Radix UI, Docker Documentation"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Resource Type Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-neutral-300">
                        Resource Type <span className="text-[#D97757]">*</span>
                      </label>
                      {suggestedType && (
                        <span className="text-[10px] text-[#D97757] flex items-center gap-1 font-mono">
                          <Sparkles className="w-2.5 h-2.5" />
                          Suggested type (editable)
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
                            title={t.description}
                            className={cn(
                              'flex items-center gap-2 p-2 rounded-md border text-xs text-left transition-colors cursor-pointer group',
                              isSelected
                                ? 'bg-[#D97757]/10 border-[#D97757] text-white font-medium'
                                : 'bg-[#1C1C1B] border-[#3E3E38] text-neutral-400 hover:text-white hover:border-neutral-500'
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-3.5 h-3.5 shrink-0',
                                isSelected ? 'text-[#D97757]' : 'text-neutral-500 group-hover:text-neutral-300'
                              )}
                            />
                            <div className="truncate flex-1">
                              <span className="truncate block">{t.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Description <span className="text-neutral-500 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      className="w-full rounded-md p-2.5 text-xs bg-[#1C1C1B] border border-[#3E3E38] text-[#FAF9F5] placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
                      placeholder="Brief summary of what this resource provides..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                    />
                  </div>
                </div>

                {/* ================= 2. ORGANIZATION ================= */}
                <div className="space-y-3.5 pt-1">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-[#3E3E38] text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    <Flaticon name="folder" className="text-xs text-[#D97757]" />
                    <span>Organization</span>
                  </div>

                  {/* Category Assignment & Creation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-neutral-300">
                        Category <span className="text-neutral-500 font-normal">(optional)</span>
                      </label>
                      {!isCreatingCategory && (
                        <button
                          type="button"
                          onClick={() => setIsCreatingCategory(true)}
                          className="text-[11px] text-[#D97757] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>New Category</span>
                        </button>
                      )}
                    </div>

                    {/* Inline Category Creator */}
                    {isCreatingCategory ? (
                      <div className="p-3 bg-[#262624] border border-[#3E3E38] rounded-md space-y-2 mb-2">
                        <div className="text-xs font-medium text-[#FAF9F5]">Create Category</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Category name..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs bg-[#1C1C1B] border border-[#3E3E38] rounded text-[#FAF9F5] focus:outline-none"
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
                            className="text-xs text-neutral-400 hover:text-white px-2 py-0.5 cursor-pointer"
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
                        className="w-full px-2.5 py-2 text-xs bg-[#1C1C1B] border border-[#3E3E38] rounded-md text-[#FAF9F5] focus:outline-none focus:border-neutral-500 cursor-pointer"
                      >
                        <option value="">No Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Suggested Category Matching / Creation Banner */}
                    {suggestedCategory?.isExisting && categoryId === suggestedCategory.categoryId && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] p-2 rounded bg-[#D97757]/10 border border-[#D97757]/20 text-[#D97757]">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Suggested Category: <strong>{suggestedCategory.name}</strong> <span className="text-neutral-400 text-[10px] font-normal">(editable suggestion)</span>
                        </span>
                      </div>
                    )}

                    {suggestedCategory && !suggestedCategory.isExisting && !categoryId && !isCreatingCategory && (
                      <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] p-2 rounded bg-white/[0.02] border border-[#3E3E38]">
                        <div className="flex items-center gap-1.5 text-neutral-300 truncate">
                          <Sparkles className="w-3.5 h-3.5 text-[#D97757] shrink-0" />
                          <span className="truncate">
                            Suggested Category: <strong className="text-white">{suggestedCategory.name}</strong> <span className="text-neutral-500 text-[10px]">(editable suggestion)</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickCreateCategory(suggestedCategory.name)}
                          className="text-[#D97757] hover:underline font-medium shrink-0 cursor-pointer"
                        >
                          + Create & Assign
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tags Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-neutral-300">
                        Tags <span className="text-neutral-500 font-normal">(optional)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {tags.length > 0 && mode === 'auto' && (
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {tags.length} suggested tags (editable)
                          </span>
                        )}
                        {mode === 'auto' && !isEdit && (
                          <button
                            type="button"
                            onClick={handleFetchMetadata}
                            className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            title="Re-analyse and refresh suggestions"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Refresh suggestions</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-white/[0.04] text-[#FAF9F5] border border-[#3E3E38]"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-neutral-500 hover:text-white cursor-pointer"
                            title={`Remove #${tag}`}
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
                        className="flex-1 px-2.5 py-1.5 text-xs bg-[#1C1C1B] border border-[#3E3E38] rounded-md text-[#FAF9F5] placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500"
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
                          Assign to Projects <span className="text-neutral-500 font-normal">(optional)</span>
                        </label>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {selectedProjectIds.length} selected
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-[#262624] border border-[#3E3E38] rounded-md">
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
                                  ? 'bg-[#D97757]/10 border-[#D97757] text-white font-medium'
                                  : 'bg-[#1C1C1B] border-[#3E3E38] text-neutral-400 hover:text-white'
                              )}
                            >
                              <FolderKanban
                                className={cn(
                                  'w-3 h-3',
                                  isAssigned ? 'text-[#D97757]' : 'text-neutral-500'
                                )}
                              />
                              <span>{p.name}</span>
                              {isAssigned && <Check className="w-2.5 h-2.5 ml-0.5 text-[#D97757]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Collections Assignment */}
                  {availableCollections.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-neutral-300">
                          Add to Collections <span className="text-neutral-500 font-normal">(optional)</span>
                        </label>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {selectedCollectionIds.length} selected
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-[#262624] border border-[#3E3E38] rounded-md">
                        {availableCollections.map((c) => {
                          const isAssigned = selectedCollectionIds.includes(c._id);
                          return (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => handleToggleCollection(c._id)}
                              className={cn(
                                'flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-colors cursor-pointer select-none',
                                isAssigned
                                  ? 'bg-[#D97757]/10 border-[#D97757] text-white font-medium'
                                  : 'bg-[#1C1C1B] border-[#3E3E38] text-neutral-400 hover:text-white'
                              )}
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: c.color || '#3b82f6' }}
                              />
                              <span>{c.name}</span>
                              {isAssigned && <Check className="w-2.5 h-2.5 ml-0.5 text-[#D97757]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ================= 3. ADDITIONAL DETAILS (COLLAPSIBLE) ================= */}
                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAdditionalOpen(!isAdditionalOpen)}
                    className="w-full flex items-center justify-between pb-1 border-b border-[#3E3E38] text-xs font-semibold text-neutral-300 uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Flaticon name="edit" className="text-xs text-[#D97757]" />
                      <span>Additional Details</span>
                      <span className="text-[10px] text-neutral-500 lowercase font-normal">(optional)</span>
                    </div>
                    <Flaticon
                      name={isAdditionalOpen ? "angle-up" : "angle-down"}
                      className="text-xs text-neutral-400"
                    />
                  </button>

                  {isAdditionalOpen && (
                    <div className="space-y-3.5 pt-1 animate-in fade-in duration-150">
                      {/* Personal Notes */}
                      <div>
                        <label className="text-xs font-medium text-neutral-300 block mb-1">
                          Personal Notes <span className="text-neutral-500 font-normal">(optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          className="w-full rounded-md p-2.5 text-xs bg-[#1C1C1B] border border-[#3E3E38] text-[#FAF9F5] placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
                          placeholder="Installation notes, quick usage commands, or personal reminders..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      {/* Custom Preview Image URL input */}
                      <div>
                        <label className="text-xs font-medium text-neutral-400 block mb-1">
                          Custom Preview Image URL <span className="text-neutral-500 font-normal">(optional)</span>
                        </label>
                        <Input
                          placeholder="https://example.com/og-image.png"
                          value={previewImage}
                          onChange={(e) => setPreviewImage(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Footer Actions */}
              <div className="pt-3 border-t border-[#3E3E38] flex items-center justify-between shrink-0 bg-[#1C1C1B] mt-3">
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
