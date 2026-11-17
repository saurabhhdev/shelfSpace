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
          <div className="p-3 rounded-none bg-rose-950/30 text-xs text-rose-400 border border-rose-900/40">
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
          <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
            Category
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ResourceType)}
            className="w-full h-9 rounded-none px-3 text-xs bg-[#0E0F10] border border-white/10 text-[#E5E5E5] focus:outline-none focus:border-[#09AE5B]"
          >
            <option value="development" className="bg-[#0E0F10]">Development</option>
            <option value="ui" className="bg-[#0E0F10]">UI & Components</option>
            <option value="design" className="bg-[#0E0F10]">Design & Colors</option>
            <option value="data" className="bg-[#0E0F10]">Data & APIs</option>
            <option value="learning" className="bg-[#0E0F10]">Learning & Docs</option>
            <option value="personal" className="bg-[#0E0F10]">Personal Notes</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
            Description
          </label>
          <textarea
            rows={2}
            className="w-full rounded-none p-2.5 text-xs bg-[#0E0F10] border border-white/10 text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-[#09AE5B]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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

        {/* Collections */}
        {collections.length > 0 && (
          <div>
            <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
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

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
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

        <div>
          <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
            Personal Notes (Markdown)
          </label>
          <textarea
            rows={3}
            className="w-full rounded-none p-2.5 font-mono text-xs bg-[#0E0F10] border border-white/10 text-[#E5E5E5] focus:outline-none focus:border-[#09AE5B]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

