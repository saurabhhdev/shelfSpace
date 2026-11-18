import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { apiClient } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import type { Project } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { notify } = useNotification();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setImageUrl('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Project name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await apiClient.post('/projects', {
        name: trimmedName,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      if (res.data?.success) {
        notify(`Project "${trimmedName}" created successfully!`, 'success');
        window.dispatchEvent(new CustomEvent('projects-updated'));
        onSuccess?.(res.data.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Organize your resources, bookmarks, and notes for a specific build or goal."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 text-xs rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">
            Project Name <span className="text-[#D97757]">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Portfolio V2, OSS Library, AI Agent"
            autoFocus
            required
            className="h-9 bg-[#262624] border-[#3E3E38] text-xs text-[#FAF9F5] focus:border-[#D97757]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">
            Description <span className="text-neutral-500 text-[10px]">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-md bg-[#262624] border border-[#3E3E38] text-[#FAF9F5] placeholder-neutral-500 focus:outline-hidden focus:border-[#D97757] resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">
            Cover Image URL <span className="text-neutral-500 text-[10px]">(optional)</span>
          </label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="h-9 bg-[#262624] border-[#3E3E38] text-xs text-[#FAF9F5] focus:border-[#D97757]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3E3E38]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-white text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            className="bg-[#D97757] hover:bg-[#c66849] text-white text-xs px-4"
          >
            Create Project
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
