import React, { useState, useEffect, useMemo } from 'react';
import { Check } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Flaticon } from '../ui/Flaticon';
import { apiClient } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import {
  COLLECTION_TEMPLATES,
  CATEGORY_SUGGESTIONS,
  type CollectionTemplate,
  type CategorySuggestion,
} from '../../lib/collectionTemplates';
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
  '#71717a', // Zinc
];

interface CollectionTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'templates' | 'suggestions' | 'custom';
  onSuccess?: (created: Collection) => void;
}

export const CollectionTemplateModal: React.FC<CollectionTemplateModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'templates',
  onSuccess,
}) => {
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<'templates' | 'suggestions' | 'custom'>(initialTab);
  const [existingCategories, setExistingCategories] = useState<Collection[]>([]);

  // Instant add state for Ready-made tab
  const [addingSugName, setAddingSugName] = useState<string | null>(null);
  const [isAddingAllSugs, setIsAddingAllSugs] = useState(false);

  // Search in templates
  const [searchQuery, setSearchQuery] = useState('');

  // Template preview / customization state
  const [selectedTemplate, setSelectedTemplate] = useState<CollectionTemplate | null>(null);
  const [customizedName, setCustomizedName] = useState('');
  const [customizedDescription, setCustomizedDescription] = useState('');
  const [customizedColor, setCustomizedColor] = useState(MUTED_COLORS[0]);
  const [customizedCategories, setCustomizedCategories] = useState<string[]>([]);
  const [customizedTags, setCustomizedTags] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Scratch creation state
  const [scratchName, setScratchName] = useState('');
  const [scratchDescription, setScratchDescription] = useState('');
  const [scratchColor, setScratchColor] = useState(MUTED_COLORS[0]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSelectedTemplate(null);
      setError('');
      setSearchQuery('');
      setSelectedSuggestions([]);
      setScratchName('');
      setScratchDescription('');
      setScratchColor(MUTED_COLORS[0]);
      fetchExistingCategories();
    }
  }, [isOpen, initialTab]);

  const fetchExistingCategories = async () => {
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

  const unaddedSuggestionsCount = useMemo(() => {
    return CATEGORY_SUGGESTIONS.filter(
      (s) => !existingNamesSet.has(s.name.toLowerCase())
    ).length;
  }, [existingNamesSet]);

  // Filter templates by query
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COLLECTION_TEMPLATES;
    return COLLECTION_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.suggestedCategories.some((c) => c.toLowerCase().includes(q)) ||
        t.suggestedTags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // When a template is clicked for customization
  const handleSelectTemplate = (template: CollectionTemplate) => {
    setSelectedTemplate(template);
    setCustomizedName(template.name);
    setCustomizedDescription(template.description);
    setCustomizedColor(template.color || MUTED_COLORS[0]);
    setCustomizedCategories([...template.suggestedCategories]);
    setCustomizedTags([...template.suggestedTags]);
    setError('');
  };

  // Add / Remove customized category badge
  const handleAddCustomCategory = () => {
    const val = newCategoryInput.trim();
    if (!val) return;
    if (!customizedCategories.some((c) => c.toLowerCase() === val.toLowerCase())) {
      setCustomizedCategories((prev) => [...prev, val]);
    }
    setNewCategoryInput('');
  };

  const handleRemoveCustomCategory = (catName: string) => {
    setCustomizedCategories((prev) => prev.filter((c) => c !== catName));
  };

  // Add / Remove customized tag badge
  const handleAddCustomTag = () => {
    const val = newTagInput.trim().toLowerCase().replace(/^#/, '');
    if (!val) return;
    if (!customizedTags.includes(val)) {
      setCustomizedTags((prev) => [...prev, val]);
    }
    setNewTagInput('');
  };

  const handleRemoveCustomTag = (tag: string) => {
    setCustomizedTags((prev) => prev.filter((t) => t !== tag));
  };

  // Submit template creation
  const handleCreateFromTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customizedName.trim();
    if (!finalName) {
      setError('Collection name is required.');
      return;
    }

    if (existingNamesSet.has(finalName.toLowerCase())) {
      setError(`A collection named "${finalName}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create the main collection
      const res = await apiClient.post('/collections', {
        name: finalName,
        description: customizedDescription.trim(),
        color: customizedColor,
      });

      const newCollection: Collection = res.data.data;

      // 2. Also ensure suggested categories exist in user's categories list if non-existent
      if (customizedCategories.length > 0) {
        const missingCats = customizedCategories.filter(
          (c) => !existingNamesSet.has(c.toLowerCase())
        );
        for (const catName of missingCats) {
          try {
            await apiClient.post('/collections', {
              name: catName,
              color: customizedColor,
              description: `Part of ${finalName}`,
            });
          } catch {
            // ignore individual duplicate or validation error
          }
        }
      }

      notify(`Collection "${finalName}" created from template!`, 'success');
      window.dispatchEvent(new CustomEvent('categories-updated'));
      onSuccess?.(newCollection);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create collection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle suggestion pill in scratch mode
  const toggleSuggestion = (sugName: string) => {
    if (existingNamesSet.has(sugName.toLowerCase())) return; // already exists
    setSelectedSuggestions((prev) =>
      prev.includes(sugName) ? prev.filter((s) => s !== sugName) : [...prev, sugName]
    );
  };

  // Instant 1-click addition for Ready-made Categories tab
  const handleInstantAddCategory = async (sug: CategorySuggestion) => {
    if (existingNamesSet.has(sug.name.toLowerCase())) return;
    setAddingSugName(sug.name);
    try {
      const res = await apiClient.post('/collections', {
        name: sug.name,
        color: sug.color,
        description: sug.description,
      });
      if (res.data?.success) {
        notify(`Category "${sug.name}" added to workspace!`, 'success');
        window.dispatchEvent(new CustomEvent('categories-updated'));
        fetchExistingCategories();
      }
    } catch (err: any) {
      notify(err.response?.data?.message || `Failed to add "${sug.name}"`, 'error');
    } finally {
      setAddingSugName(null);
    }
  };

  const handleAddAllRemainingSuggestions = async () => {
    const unadded = CATEGORY_SUGGESTIONS.filter(
      (s) => !existingNamesSet.has(s.name.toLowerCase())
    );
    if (unadded.length === 0) return;
    setIsAddingAllSugs(true);
    let count = 0;
    try {
      for (const sug of unadded) {
        try {
          await apiClient.post('/collections', {
            name: sug.name,
            color: sug.color,
            description: sug.description,
          });
          count++;
        } catch {
          // ignore duplicate
        }
      }
      if (count > 0) {
        notify(`Added ${count} ready-made categories!`, 'success');
        window.dispatchEvent(new CustomEvent('categories-updated'));
        fetchExistingCategories();
      }
    } catch {
      notify('Failed to add some categories', 'error');
    } finally {
      setIsAddingAllSugs(false);
    }
  };

  // Add multiple selected suggestions in scratch mode
  const handleAddSelectedSuggestions = async () => {
    if (selectedSuggestions.length === 0) return;
    setIsSubmitting(true);
    setError('');

    let addedCount = 0;
    try {
      for (const sugName of selectedSuggestions) {
        const item = CATEGORY_SUGGESTIONS.find((s) => s.name === sugName);
        if (!item) continue;
        try {
          await apiClient.post('/collections', {
            name: item.name,
            color: item.color,
            description: item.description || '',
          });
          addedCount++;
        } catch {
          // ignore duplicate
        }
      }

      if (addedCount > 0) {
        notify(`${addedCount} categories added to your workspace!`, 'success');
        window.dispatchEvent(new CustomEvent('categories-updated'));
        fetchExistingCategories();
        setSelectedSuggestions([]);
        onClose();
      } else {
        setError('Selected categories already exist.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add category suggestions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit custom single category from scratch
  const handleCreateFromScratch = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = scratchName.trim();
    if (!finalName) {
      setError('Category name is required.');
      return;
    }

    if (existingNamesSet.has(finalName.toLowerCase())) {
      setError(`A category named "${finalName}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await apiClient.post('/collections', {
        name: finalName,
        description: scratchDescription.trim(),
        color: scratchColor,
      });

      notify(`Category "${finalName}" created!`, 'success');
      window.dispatchEvent(new CustomEvent('categories-updated'));
      onSuccess?.(res.data.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        selectedTemplate
          ? `Template: ${selectedTemplate.name}`
          : activeTab === 'templates'
          ? 'Explore Collection Templates'
          : activeTab === 'suggestions'
          ? 'Ready-made Category Suggestions'
          : 'New Category'
      }
      description={
        selectedTemplate
          ? 'Review and customize the suggested categories and tags before creating.'
          : activeTab === 'templates'
          ? 'Jumpstart your workspace with pre-made developer collection templates.'
          : activeTab === 'suggestions'
          ? 'Curated developer categories ready to add to your workspace with 1 click.'
          : 'Create a custom category with a name and color accent.'
      }
      maxWidth="2xl"
    >
      <div className="font-sans">
      {/* Tab Switcher (when not in template preview mode) */}
      {!selectedTemplate && (
        <div className="flex items-center gap-1.5 mb-5 p-1 rounded-lg bg-[#141413] border border-[#3E3E38] text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('templates');
              setError('');
            }}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-md font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer',
              activeTab === 'templates'
                ? 'bg-[#262624] text-[#FAF9F5] shadow-xs border border-[#3E3E38]'
                : 'text-neutral-400 hover:text-white'
            )}
          >
            <Flaticon name="sparkles" className="text-xs text-[#D97757]" />
            <span>Templates ({COLLECTION_TEMPLATES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('suggestions');
              setError('');
            }}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-md font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer',
              activeTab === 'suggestions'
                ? 'bg-[#262624] text-[#FAF9F5] shadow-xs border border-[#3E3E38]'
                : 'text-neutral-400 hover:text-white'
            )}
          >
            <Flaticon name="bookmark" className="text-xs text-[#D97757]" />
            <span>Ready-made (12)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('custom');
              setError('');
            }}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-md font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer',
              activeTab === 'custom'
                ? 'bg-[#262624] text-[#FAF9F5] shadow-xs border border-[#3E3E38]'
                : 'text-neutral-400 hover:text-white'
            )}
          >
            <Flaticon name="plus" className="text-xs" />
            <span>Custom Category</span>
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* =========================================================================
          VIEW 1: TEMPLATE CUSTOMIZATION & CREATION
         ========================================================================= */}
      {selectedTemplate ? (
        <form onSubmit={handleCreateFromTemplate} className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setSelectedTemplate(null);
              setError('');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#B7B5A9] hover:text-white mb-1 transition-colors cursor-pointer"
          >
            <Flaticon name="angle-small-left" className="text-xs" />
            <span>Back to All Templates</span>
          </button>

          {/* Name & Color */}
          <div className="space-y-3">
            <Input
              label="Collection Name"
              value={customizedName}
              onChange={(e) => setCustomizedName(e.target.value)}
              placeholder="e.g. Frontend Development"
              required
              autoFocus
            />

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                Description
              </label>
              <textarea
                value={customizedDescription}
                onChange={(e) => setCustomizedDescription(e.target.value)}
                placeholder="Short summary of this collection..."
                rows={2}
                className="w-full rounded-md bg-[#141413] border border-[#3E3E38] px-3 py-2 text-xs text-[#FAF9F5] placeholder-neutral-500 focus:outline-none focus:border-[#D97757] transition-colors"
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
                    onClick={() => setCustomizedColor(c)}
                    className={cn(
                      'w-6 h-6 rounded-full transition-transform cursor-pointer',
                      customizedColor === c && 'ring-2 ring-white ring-offset-2 ring-offset-[#1C1C1B]'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Suggested Categories */}
          <div className="pt-2 border-t border-[#3E3E38]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#FAF9F5]">
                Suggested Categories ({customizedCategories.length})
              </label>
              <span className="text-[11px] text-neutral-500">Will be added to your workspace</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {customizedCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#141413] border border-[#3E3E38] text-[#FAF9F5]"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: customizedColor }}
                  />
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomCategory(cat)}
                    className="text-neutral-400 hover:text-white transition-colors"
                    title={`Remove ${cat}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="+ Add category"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomCategory();
                  }
                }}
                className="flex-1 rounded-md bg-[#141413] border border-[#3E3E38] px-2.5 py-1 text-xs text-[#FAF9F5] placeholder-neutral-500 focus:outline-none focus:border-[#D97757]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomCategory}
                disabled={!newCategoryInput.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Suggested Tags */}
          <div className="pt-2 border-t border-[#3E3E38]">
            <label className="text-xs font-medium text-[#FAF9F5] block mb-1.5">
              Relevant Suggested Tags ({customizedTags.length})
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {customizedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-white/[0.04] border border-[#3E3E38] text-[#B7B5A9]"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomTag(tag)}
                    className="text-neutral-400 hover:text-white transition-colors"
                    title={`Remove #${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="+ Add tag (e.g. react)"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                className="flex-1 rounded-md bg-[#141413] border border-[#3E3E38] px-2.5 py-1 text-xs text-[#FAF9F5] placeholder-neutral-500 focus:outline-none focus:border-[#D97757]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomTag}
                disabled={!newTagInput.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#3E3E38] flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">Creates an empty collection structure.</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Create Collection
              </Button>
            </div>
          </div>
        </form>
      ) : activeTab === 'templates' ? (
        /* =========================================================================
            VIEW 2: EXPLORE TEMPLATES GRID
           ========================================================================= */
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search templates by name, category, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md bg-[#141413] border border-[#3E3E38] pl-9 pr-3 py-2 text-xs text-[#FAF9F5] placeholder-neutral-500 focus:outline-none focus:border-[#D97757] transition-colors"
              autoFocus
            />
            <span className="absolute left-3 top-2.5 text-neutral-500">
              <Flaticon name="search" className="text-xs" />
            </span>
          </div>

          {/* Templates list */}
          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
            {filteredTemplates.map((template) => {
              const alreadyExists = existingNamesSet.has(template.name.toLowerCase());

              return (
                <div
                  key={template.id}
                  className="p-3.5 rounded-lg bg-[#141413] hover:bg-[#1C1C1B] border border-[#3E3E38] transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                        style={{ backgroundColor: template.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-[#FAF9F5] group-hover:text-white transition-colors">
                            {template.name}
                          </h4>
                          {alreadyExists && (
                            <span className="text-[10px] text-neutral-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                              Already in workspace
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#B7B5A9] mt-0.5 line-clamp-2 leading-relaxed">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant={alreadyExists ? 'outline' : 'primary'}
                      onClick={() => handleSelectTemplate(template)}
                      className="shrink-0 text-xs"
                    >
                      {alreadyExists ? 'Customize Again' : 'Use Template'}
                    </Button>
                  </div>

                  {/* Badges preview */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#3E3E38]/60 text-[11px]">
                    <span className="text-neutral-500 text-[10px] uppercase font-mono mr-1">
                      Includes:
                    </span>
                    {template.suggestedCategories.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded bg-white/[0.04] text-[#FAF9F5] text-[10px] border border-[#3E3E38]/50"
                      >
                        {c}
                      </span>
                    ))}
                    {template.suggestedTags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] text-[#B7B5A9] font-mono">
                        #{tag}
                      </span>
                    ))}
                    {template.suggestedTags.length > 4 && (
                      <span className="text-[10px] text-neutral-500 font-mono">
                        +{template.suggestedTags.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="py-12 text-center text-xs text-neutral-500">
                No templates found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#3E3E38] flex items-center justify-between text-xs text-neutral-500">
            <span>Or create your own structure from scratch.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('custom')}
            >
              Start from Scratch
            </Button>
          </div>
        </div>
      ) : activeTab === 'suggestions' ? (
        /* =========================================================================
            VIEW 3: READY-MADE CATEGORIES (12 CURATED DEVELOPER CATEGORIES)
           ========================================================================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#3E3E38]/60">
            <div>
              <h3 className="text-xs font-semibold text-[#FAF9F5] flex items-center gap-1.5">
                <Flaticon name="bookmark" className="text-xs text-[#D97757]" />
                <span>Ready-made Categories</span>
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Click any category or its "+ Add" button to add it instantly to your workspace.
              </p>
            </div>

            {unaddedSuggestionsCount > 0 && (
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleAddAllRemainingSuggestions}
                isLoading={isAddingAllSugs}
                className="text-xs shrink-0 bg-[#D97757] hover:bg-[#c66849]"
              >
                + Add All ({unaddedSuggestionsCount})
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
            {CATEGORY_SUGGESTIONS.map((sug) => {
              const isExisting = existingNamesSet.has(sug.name.toLowerCase());
              const isAdding = addingSugName === sug.name;

              return (
                <div
                  key={sug.name}
                  onClick={() => {
                    if (!isExisting && !isAdding && !isAddingAllSugs) {
                      handleInstantAddCategory(sug);
                    }
                  }}
                  className={cn(
                    'group p-3 rounded-lg border transition-all flex items-center justify-between gap-3 text-left',
                    isExisting
                      ? 'bg-white/[0.02] border-[#3E3E38]/40 opacity-60 cursor-default'
                      : 'bg-[#1C1C1B] hover:bg-[#262624] border-[#3E3E38] hover:border-[#D97757]/60 cursor-pointer shadow-xs'
                  )}
                  title={
                    isExisting
                      ? `"${sug.name}" is already in your categories`
                      : `Click to add "${sug.name}" instantly`
                  }
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: sug.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#FAF9F5] flex items-center gap-1.5">
                        <span className="truncate">{sug.name}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {sug.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isExisting ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-[#3E3E38]/50">
                        <Check className="w-3 h-3 text-[#D97757]" />
                        <span>Added</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isAdding || isAddingAllSugs}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FAF9F5] group-hover:text-white bg-[#262624] group-hover:bg-[#D97757] px-2.5 py-1 rounded transition-colors border border-[#3E3E38] group-hover:border-[#D97757]"
                      >
                        {isAdding ? 'Adding...' : '+ Add'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#3E3E38] flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('custom')}
              className="text-xs"
            >
              Need a custom category?
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW 4: CREATE CUSTOM CATEGORY FROM SCRATCH
           ========================================================================= */
        <div className="space-y-4">
          <form onSubmit={handleCreateFromScratch} className="space-y-3.5">
            <div>
              <Input
                label="Category Name"
                placeholder="e.g. Tools, Documentation, Libraries"
                value={scratchName}
                onChange={(e) => setScratchName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="What belongs in this category..."
                value={scratchDescription}
                onChange={(e) => setScratchDescription(e.target.value)}
                className="w-full rounded-md bg-[#141413] border border-[#3E3E38] px-3 py-1.5 text-xs text-[#FAF9F5] placeholder-neutral-500 focus:outline-none focus:border-[#D97757]"
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
                    onClick={() => setScratchColor(c)}
                    className={cn(
                      'w-6 h-6 rounded-full transition-transform cursor-pointer',
                      scratchColor === c && 'ring-2 ring-white ring-offset-2 ring-offset-[#1C1C1B]'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#3E3E38] flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('suggestions')}
                className="text-xs"
              >
                ← Back to Ready-made
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Create Category
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
      </div>
    </Dialog>
  );
};

export default CollectionTemplateModal;
