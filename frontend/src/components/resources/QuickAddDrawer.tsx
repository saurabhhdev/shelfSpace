import React, { useState } from 'react';
import {
  Link as LinkIcon,
  PenTool,
  Sparkles,
  Palette,
  Layout,
  Code2,
  Database,
  BookOpen,
  FileText,
  X,
  Plus,
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ResourceType, Project, Collection } from '../../types';
import { apiClient } from '../../api/client';
import { cn } from '../../lib/utils';

export interface QuickAddDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  collections: Collection[];
  onSuccess: () => void;
}

const typeOptions: Array<{ type: ResourceType; label: string; icon: React.ReactNode }> = [
  { type: 'development', label: 'Development', icon: <Code2 className="w-4 h-4" /> },
  { type: 'ui', label: 'UI / Components', icon: <Layout className="w-4 h-4" /> },
  { type: 'design', label: 'Design & Colors', icon: <Palette className="w-4 h-4" /> },
  { type: 'data', label: 'Data & APIs', icon: <Database className="w-4 h-4" /> },
  { type: 'learning', label: 'Learning & Docs', icon: <BookOpen className="w-4 h-4" /> },
  { type: 'personal', label: 'Personal Notes', icon: <FileText className="w-4 h-4" /> },
];

export const QuickAddDrawer: React.FC<QuickAddDrawerProps> = ({
  isOpen,
  onClose,
  projects,
  collections,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'import' | 'manual'>('import');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Import state
  const [importUrl, setImportUrl] = useState('');
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Manual state
  const [type, setType] = useState<ResourceType>('development');
  const [title, setTitle] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Type specific state
  const [hexColors, setHexColors] = useState('');
  const [devLanguage, setDevLanguage] = useState('');
  const [dataFormat, setDataFormat] = useState('json');
  const [learningPlatform, setLearningPlatform] = useState('');

  const resetForm = () => {
    setImportUrl('');
    setPreviewData(null);
    setTitle('');
    setManualUrl('');
    setDescription('');
    setTagInput('');
    setTags([]);
    setNotes('');
    setSelectedProjects([]);
    setSelectedCollections([]);
    setHexColors('');
    setDevLanguage('');
    setDataFormat('json');
    setLearningPlatform('');
    setErrorMessage('');
  };

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Toggle project selection
  const toggleProject = (id: string) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Toggle collection selection
  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Import handler
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await apiClient.post('/resources/import', {
        url: importUrl,
        projectIds: selectedProjects,
        collectionIds: selectedCollections,
        tags,
      });
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to import resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual save handler
  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Prepare metadata
    const metadata: Record<string, any> = {};
    if (type === 'design' && hexColors) {
      metadata.colors = hexColors
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.startsWith('#'));
    }
    if (type === 'development' && devLanguage) {
      metadata.language = devLanguage.trim();
    }
    if (type === 'data') {
      metadata.format = dataFormat;
    }
    if (type === 'learning' && learningPlatform) {
      metadata.platform = learningPlatform.trim();
    }

    try {
      await apiClient.post('/resources', {
        type,
        title: title.trim(),
        url: manualUrl.trim() || undefined,
        description: description.trim(),
        tags,
        projectIds: selectedProjects,
        collectionIds: selectedCollections,
        notes,
        metadata,
      });
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to create resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Library"
      description="Quickly import any URL with auto-metadata or craft a structured entry."
      width="lg"
    >
      {/* Mode switcher tabs */}
      <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 mb-6">
        <button
          type="button"
          onClick={() => setMode('import')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all',
            mode === 'import'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          Import from URL
        </button>

        <button
          type="button"
          onClick={() => setMode('manual')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all',
            mode === 'manual'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          )}
        >
          <PenTool className="w-3.5 h-3.5 text-indigo-500" />
          Manual Entry
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* MODE 1: IMPORT FROM URL */}
      {mode === 'import' && (
        <form onSubmit={handleImport} className="space-y-5">
          <div>
            <Input
              label="Resource URL"
              type="url"
              placeholder="https://github.com/owner/repo or any website..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              required
              leftIcon={<LinkIcon className="w-4 h-4" />}
              hint="Shelfspace will extract title, OpenGraph preview, description, and repository stats automatically."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Add Tags (optional)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. react, animation, tool (press Enter)"
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Collections Selector */}
          {collections.length > 0 && (
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Assign to Collections
              </label>
              <div className="flex flex-wrap gap-1.5">
                {collections.map((col) => {
                  const isSelected = selectedCollections.includes(col._id);
                  return (
                    <button
                      key={col._id}
                      type="button"
                      onClick={() => toggleCollection(col._id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all',
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                      {col.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projects Selector */}
          {projects.length > 0 && (
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Associate with Projects
              </label>
              <div className="flex flex-wrap gap-1.5">
                {projects.map((proj) => {
                  const isSelected = selectedProjects.includes(proj._id);
                  return (
                    <button
                      key={proj._id}
                      type="button"
                      onClick={() => toggleProject(proj._id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all',
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      📁 {proj.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Import Resource
            </Button>
          </div>
        </form>
      )}

      {/* MODE 2: MANUAL ENTRY */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSave} className="space-y-5">
          {/* Category selection */}
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
              Primary Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setType(opt.type)}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all',
                    type === opt.type
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  )}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Input
              label="Title"
              placeholder="e.g. Radix UI Primitives or Color Hunt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="URL (optional)"
              type="url"
              placeholder="https://..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              leftIcon={<LinkIcon className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg p-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              placeholder="What makes this resource useful?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Type-Specific Controlled Fields */}
          {type === 'design' && (
            <div>
              <Input
                label="Color Palette (Hex Codes)"
                placeholder="#3b82f6, #10b981, #f59e0b"
                value={hexColors}
                onChange={(e) => setHexColors(e.target.value)}
                hint="Comma-separated hex colors to show interactive swatches on the card"
              />
            </div>
          )}

          {type === 'development' && (
            <div>
              <Input
                label="Primary Language"
                placeholder="TypeScript, Rust, Python, Go..."
                value={devLanguage}
                onChange={(e) => setDevLanguage(e.target.value)}
              />
            </div>
          )}

          {type === 'data' && (
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                API / Data Format
              </label>
              <select
                value={dataFormat}
                onChange={(e) => setDataFormat(e.target.value)}
                className="w-full h-9 rounded-lg px-3 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="json">JSON / REST</option>
                <option value="graphql">GraphQL</option>
                <option value="csv">CSV / Dataset</option>
                <option value="grpc">gRPC / Protobuf</option>
              </select>
            </div>
          )}

          {type === 'learning' && (
            <div>
              <Input
                label="Learning Platform or Author"
                placeholder="e.g. Official Documentation, Coursera, FreeCodeCamp"
                value={learningPlatform}
                onChange={(e) => setLearningPlatform(e.target.value)}
              />
            </div>
          )}

          {/* Markdown Notes */}
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Personal Notes & Code Snippets (Markdown)
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg p-2.5 font-mono text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              placeholder="### How to use&#10;Install via: npm i package-name..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Tags
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Collections Selector */}
          {collections.length > 0 && (
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Assign to Collections
              </label>
              <div className="flex flex-wrap gap-1.5">
                {collections.map((col) => {
                  const isSelected = selectedCollections.includes(col._id);
                  return (
                    <button
                      key={col._id}
                      type="button"
                      onClick={() => toggleCollection(col._id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all',
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                      {col.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projects Selector */}
          {projects.length > 0 && (
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Associate with Projects
              </label>
              <div className="flex flex-wrap gap-1.5">
                {projects.map((proj) => {
                  const isSelected = selectedProjects.includes(proj._id);
                  return (
                    <button
                      key={proj._id}
                      type="button"
                      onClick={() => toggleProject(proj._id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all',
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      📁 {proj.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Resource
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  );
};
