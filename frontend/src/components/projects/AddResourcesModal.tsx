import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, Loader2, Globe } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiClient } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { getResourceTypeLabel, getResourceTypeIcon } from '../../lib/resourceTypes';
import type { Resource } from '../../types';

export interface AddResourcesModalProps {
  isOpen: boolean;
  projectId: string;
  projectName: string;
  existingResourceIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AddResourcesModal: React.FC<AddResourcesModalProps> = ({
  isOpen,
  projectId,
  projectName,
  existingResourceIds,
  onClose,
  onSuccess,
}) => {
  const { notify } = useNotification();
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setSearch('');
      return;
    }

    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/resources?limit=100');
        if (res.data?.success && res.data.data) {
          const list: Resource[] = Array.isArray(res.data.data)
            ? res.data.data
            : res.data.data.resources || [];
          // Filter out resources already in this project
          const existingSet = new Set(existingResourceIds);
          const filtered = list.filter((r) => !existingSet.has(r._id));
          setAvailableResources(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch library resources', err);
        notify('Failed to load available resources', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [isOpen, existingResourceIds, notify]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredResources.map((r) => r._id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleAddResources = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/projects/${projectId}/resources`, {
        resourceIds: selectedIds,
      });
      notify(
        `Added ${selectedIds.length} ${selectedIds.length === 1 ? 'resource' : 'resources'} to "${projectName}"`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to add resources to project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredResources = availableResources.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.url && r.url.toLowerCase().includes(q)) ||
      (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Existing Resources"
      description={`Select resources from your library to associate with "${projectName}".`}
      maxWidth="lg"
    >
      <div className="space-y-4 font-sans">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources by title, tag, or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#121316] border border-white/[0.08] rounded-md text-[#EDEDED] placeholder:text-neutral-500 focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Resources Selection List */}
        <div className="border border-white/[0.08] rounded-md bg-[#0E0F10] overflow-hidden">
          <div className="px-3 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
            <span>
              {availableResources.length} available in library{' '}
              {search && `(${filteredResources.length} matching)`}
            </span>
            {filteredResources.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllVisible}
                className="text-[11px] text-[#09AE5B] hover:underline cursor-pointer"
              >
                {filteredResources.every((r) => selectedIds.includes(r._id))
                  ? 'Deselect all'
                  : 'Select all'}
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-neutral-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#09AE5B]" />
                <span>Loading library resources...</span>
              </div>
            ) : filteredResources.length > 0 ? (
              filteredResources.map((resource) => {
                const isSelected = selectedIds.includes(resource._id);
                const TypeIcon = getResourceTypeIcon(resource.type);
                const typeLabel = getResourceTypeLabel(resource.type);
                const domain = resource.url
                  ? (() => {
                      try {
                        return new URL(resource.url).hostname.replace(/^www\./, '');
                      } catch {
                        return null;
                      }
                    })()
                  : null;

                return (
                  <div
                    key={resource._id}
                    onClick={() => toggleSelect(resource._id)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs cursor-pointer transition-colors select-none ${
                      isSelected
                        ? 'bg-[#09AE5B]/10 hover:bg-[#09AE5B]/15'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Checkbox box */}
                    <div
                      className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-[#09AE5B] border-[#09AE5B] text-black'
                          : 'border-white/20 bg-white/[0.04]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* Thumbnail / Icon */}
                    <div className="w-7 h-7 rounded bg-[#16171b] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {resource.previewImage ? (
                        <img
                          src={resource.previewImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <TypeIcon className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </div>

                    {/* Title and Domain */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#EDEDED] truncate">
                        {resource.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                        <Badge size="sm">
                          <span>{typeLabel}</span>
                        </Badge>
                        {domain && (
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <Globe className="w-2.5 h-2.5" />
                            {domain}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-xs text-neutral-500">
                {availableResources.length === 0
                  ? 'All of your existing resources are already in this project.'
                  : 'No matching resources found.'}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            {selectedIds.length > 0 ? (
              <span className="text-white font-medium">
                {selectedIds.length} {selectedIds.length === 1 ? 'resource' : 'resources'} selected
              </span>
            ) : (
              <span>Select resources to add</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="xs" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="xs"
              disabled={selectedIds.length === 0 || isSubmitting}
              isLoading={isSubmitting}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddResources}
            >
              Add to Project
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
