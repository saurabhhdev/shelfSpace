import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Resource, ResourceType, Project, Collection } from '../../types';
import { apiClient } from '../../api/client';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EditResourceModalProps {
  isOpen: boolean;
  resource: Resource | null;
  projects: Project[];
  collections: Collection[];
  onClose: () => void;
  onSuccess: () => void;
}

export const EditResourceModal: React.FC<EditResourceModalProps> = ({
  isOpen,
  resource,
  projects,
  collections,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResourceType>('development');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resource) {
      setTitle(resource.title || '');
      setUrl(resource.url || '');
      setDescription(resource.description || '');
      setType(resource.type || 'development');
      setNotes(resource.notes || '');
      setTags(resource.tags || []);
      setSelectedProjects(
        (resource.projectIds || []).map((p) => (typeof p === 'object' ? p._id : p))
      );
      setSelectedCollections(
        (resource.collectionIds || []).map((c) => (typeof c === 'object' ? c._id : c))
      );
      setError('');
    }
  }, [resource]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource || !title.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.patch(`/resources/${resource._id}`, {
        title: title.trim(),
        url: url.trim() || undefined,
        description: description.trim(),
        type,
        notes,
        tags,
        projectIds: selectedProjects,
        collectionIds: selectedCollections,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!resource) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Resource"
      description="Update metadata, tags, and project associations."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
            {error}
          </div>
        )}

        <div>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Input
            label="URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#2b2a28] dark:text-[#f4f4f5] block mb-1">
            Category
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ResourceType)}
            className="w-full h-9 rounded-lg px-3 text-xs bg-white dark:bg-[#18181c] border border-zinc-200 dark:border-zinc-800 text-[#2b2a28] dark:text-[#f4f4f5]"
          >
            <option value="development">Development</option>
            <option value="ui">UI & Components</option>
            <option value="design">Design & Colors</option>
            <option value="data">Data & APIs</option>
            <option value="learning">Learning & Docs</option>
            <option value="personal">Personal Notes</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-[#2b2a28] dark:text-[#f4f4f5] block mb-1">
            Description
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg p-2.5 text-xs bg-white dark:bg-[#18181c] border border-zinc-200 dark:border-zinc-800 text-[#2b2a28] dark:text-[#f4f4f5] placeholder:text-[#9b9a97] dark:placeholder:text-[#63636e] focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-white/15 focus:border-zinc-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-[#2b2a28] dark:text-[#f4f4f5] block mb-1">
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
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-[#f2f2ef] dark:bg-[#202026] text-[#5f5e5b] dark:text-[#a1a1aa] border border-[#e5e5e3] dark:border-[#2a2a34]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Collections */}
        {collections.length > 0 && (
          <div>
            <label className="text-xs font-medium text-[#2b2a28] dark:text-[#f4f4f5] block mb-1">
              Collections
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
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer font-sans',
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium'
                        : 'border-[#ececeb] dark:border-[#26262c] hover:bg-[#f7f7f5] dark:hover:bg-[#1a1a20] text-[#5f5e5b] dark:text-[#a1a1aa]'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <label className="text-xs font-medium text-[#2b2a28] dark:text-[#f4f4f5] block mb-1">
              Projects
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
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer font-sans',
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-medium'
                        : 'border-[#ececeb] dark:border-[#26262c] hover:bg-[#f7f7f5] dark:hover:bg-[#1a1a20] text-[#5f5e5b] dark:text-[#a1a1aa]'
                    )}
                  >
                    <span>📁 {proj.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-[#2b2a28] dark:text-[#f4f4f5] block mb-1">
            Personal Notes (Markdown)
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg p-2.5 font-mono text-xs bg-white dark:bg-[#18181c] border border-zinc-200 dark:border-zinc-800 text-[#2b2a28] dark:text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-white/15 focus:border-zinc-400"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="pt-3 border-t border-[#ececeb] dark:border-[#222227] flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" pill isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
