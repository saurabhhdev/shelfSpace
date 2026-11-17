import React, { useState, useEffect } from 'react';
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
import type { ResourceType, Project, Collection } from '../../types';
import { apiClient } from '../../api/client';
import { cn } from '../../lib/utils';

export interface QuickAddDrawerProps {
  isOpen: boolean;
  initialUrl?: string;
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
  initialUrl = '',
  onClose,
  projects,
  collections,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'import' | 'manual'>('import');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Import state
  const [importUrl, setImportUrl] = useState(initialUrl);

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

  // Update importUrl when initialUrl changes or drawer opens
  useEffect(() => {
    if (initialUrl) {
      setImportUrl(initialUrl);
      setMode('import');
    }
  }, [initialUrl, isOpen]);

  const resetForm = () => {
    setImportUrl('');
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

  const toggleProject = (id: string) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

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

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

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
      title="Add to Shelfspace"
      description="Quickly import any URL with auto-extracted metadata, or craft a custom record."
      width="lg"
    >
      {/* Mode switcher tabs (Notion style) */}
      <div className="flex rounded-none bg-[#121316] p-1 mb-5 border border-white/10">
        <button
          type="button"
          onClick={() => setMode('import')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-none transition-all cursor-pointer',
            mode === 'import'
              ? 'bg-[#09AE5B] text-black font-semibold'
              : 'text-neutral-400 hover:text-white'
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Import URL</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('manual')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-none transition-all cursor-pointer',
            mode === 'manual'
              ? 'bg-[#09AE5B] text-black font-semibold'
              : 'text-neutral-400 hover:text-white'
          )}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Manual Entry</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-none bg-rose-950/30 border border-rose-900/40 text-xs text-rose-400">
          {errorMessage}
        </div>
      )}

      {/* MODE 1: IMPORT FROM URL */}
      {mode === 'import' && (
        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <Input
              label="Resource URL"
              type="url"
              placeholder="https://github.com/owner/repo, https://tailwindcss.com..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              required
              leftIcon={<LinkIcon className="w-4 h-4 text-neutral-500" />}
              hint="Shelfspace automatically scrapes the OpenGraph preview, description, favicon, and GitHub repository metrics."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-[#2b2a28] dark:text-[#f4f4f5] block mb-1">
              Tags (optional)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. react, icons, tool (press Enter)"
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-xs font-mono bg-[#141519] text-[#09AE5B] border border-white/10"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 cursor-pointer"
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
              <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
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
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs border transition-all cursor-pointer font-sans',
                        isSelected
                          ? 'border-[#09AE5B] bg-[#09AE5B] text-black font-semibold'
                          : 'border-white/10 bg-[#0E0F10] hover:border-[#09AE5B]/60 text-neutral-400'
                      )}
                    >
                      <span className="w-2 h-2 rounded-none" style={{ backgroundColor: col.color || '#09AE5B' }} />
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projects Selector */}
          {projects.length > 0 && (
            <div>
              <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
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
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs border transition-all cursor-pointer font-sans',
                        isSelected
                          ? 'border-[#09AE5B] bg-[#09AE5B] text-black font-semibold'
                          : 'border-white/10 bg-[#0E0F10] hover:border-[#09AE5B]/60 text-neutral-400'
                      )}
                    >
                      <span>📁 {proj.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Import Resource
            </Button>
          </div>
        </form>
      )}

      {/* MODE 2: MANUAL ENTRY */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSave} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#E5E5E5] block mb-1.5">
              Primary Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setType(opt.type)}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-none border text-left text-xs transition-all cursor-pointer',
                    type === opt.type
                      ? 'border-[#09AE5B] bg-[#09AE5B]/10 text-[#09AE5B] font-medium'
                      : 'border-white/10 bg-[#0E0F10] hover:border-[#09AE5B]/60 text-neutral-400'
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
              placeholder="e.g. Radix UI Primitives, Stripe API Docs..."
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
              leftIcon={<LinkIcon className="w-4 h-4 text-[#9ca3af]" />}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
              Description
            </label>
            <textarea
              rows={2}
              className="w-full rounded-none p-2.5 text-xs bg-[#0E0F10] border border-white/10 focus:outline-none focus:border-[#09AE5B] text-[#E5E5E5] placeholder:text-neutral-500"
              placeholder="What is this resource and why is it useful?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Type-Specific Controlled Fields */}
          {type === 'design' && (
            <div>
              <Input
                label="Color Palette (Hex Codes)"
                placeholder="#000000, #141519, #09AE5B"
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
              <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
                API / Data Format
              </label>
              <select
                value={dataFormat}
                onChange={(e) => setDataFormat(e.target.value)}
                className="w-full h-9 rounded-none px-3 text-xs bg-[#0E0F10] border border-white/10 text-[#E5E5E5] focus:outline-none focus:border-[#09AE5B]"
              >
                <option value="json" className="bg-[#0E0F10]">JSON / REST</option>
                <option value="graphql" className="bg-[#0E0F10]">GraphQL</option>
                <option value="csv" className="bg-[#0E0F10]">CSV / Dataset</option>
                <option value="grpc" className="bg-[#0E0F10]">gRPC / Protobuf</option>
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
            <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
              Personal Notes & Code Snippets (Markdown)
            </label>
            <textarea
              rows={3}
              className="w-full rounded-none p-2.5 font-mono text-xs bg-[#0E0F10] border border-white/10 focus:outline-none focus:border-[#09AE5B] text-[#E5E5E5] placeholder:text-neutral-500"
              placeholder="### Usage notes&#10;Install via: npm i package-name..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-xs font-mono bg-[#141519] text-[#09AE5B] border border-white/10"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 cursor-pointer"
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
              <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
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
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs border transition-all cursor-pointer font-sans',
                        isSelected
                          ? 'border-[#09AE5B] bg-[#09AE5B] text-black font-semibold'
                          : 'border-white/10 bg-[#0E0F10] hover:border-[#09AE5B]/60 text-neutral-400'
                      )}
                    >
                      <span className="w-2 h-2 rounded-none" style={{ backgroundColor: col.color || '#09AE5B' }} />
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projects Selector */}
          {projects.length > 0 && (
            <div>
              <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
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
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs border transition-all cursor-pointer font-sans',
                        isSelected
                          ? 'border-[#09AE5B] bg-[#09AE5B] text-black font-semibold'
                          : 'border-white/10 bg-[#0E0F10] hover:border-[#09AE5B]/60 text-neutral-400'
                      )}
                    >
                      <span>📁 {proj.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Resource
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  );
};

