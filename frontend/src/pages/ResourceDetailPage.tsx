import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ExternalLink,
  Star,
  Trash2,
  Edit2,
  ChevronLeft,
  Globe,
  Calendar,
  BookmarkCheck,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { Resource, Collection } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ResourceModal } from '../components/resources/ResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { getResourceTypeLabel, getResourceTypeIcon } from '../lib/resourceTypes';
import { useNotification } from '../context/NotificationContext';
import { formatDate, cn } from '../lib/utils';

export const ResourceDetailPage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [resource, setResource] = useState<Resource | null>(null);
  const [categories, setCategories] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResource = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/resources/${resourceId}`);
      if (res.data?.success) {
        setResource(res.data.data);
      }
    } catch (err) {
      console.error('Resource not found', err);
      notify('Resource not found', 'error');
      navigate('/library');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/collections');
      if (res.data?.success) setCategories(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (resourceId) {
      fetchResource();
      fetchCategories();
    }
  }, [resourceId]);

  const handleToggleFavourite = async () => {
    if (!resource) return;
    try {
      const res = await apiClient.patch(`/resources/${resource._id}/favourite`);
      const isFav = res.data?.data?.isFavourite;
      setResource({ ...resource, isFavourite: isFav });
      notify(isFav ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch {
      notify('Failed to update favorite', 'error');
    }
  };

  const handleDelete = async () => {
    if (!resource) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/resources/${resource._id}`);
      notify(`"${resource.title}" moved to trash`, 'success');
      navigate('/library');
    } catch (err) {
      notify('Failed to delete resource', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !resource) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400 font-sans">
        Loading resource details...
      </div>
    );
  }

  const TypeIcon = getResourceTypeIcon(resource.type);
  const typeLabel = getResourceTypeLabel(resource.type);

  const category = (resource.collectionIds || [])[0];
  const categoryName = typeof category === 'object' && category !== null ? category.name : null;
  const categoryColor = typeof category === 'object' && category !== null ? category.color : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Back button & Action Toolbar */}
      <div className="flex items-center justify-between">
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>All Resources</span>
        </Link>

        {/* Compact Action Menu */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={handleToggleFavourite}
            leftIcon={
              <Star
                className={cn('w-3 h-3', resource.isFavourite && 'text-amber-400 fill-amber-400')}
              />
            }
          >
            {resource.isFavourite ? 'Favorited' : 'Favorite'}
          </Button>

          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsEditOpen(true)}
            leftIcon={<Edit2 className="w-3 h-3" />}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            size="xs"
            onClick={() => setIsDeleteOpen(true)}
            leftIcon={<Trash2 className="w-3 h-3" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-6 space-y-6">
        {/* Header: Name, Type, External Link */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge size="sm">
                <TypeIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>{typeLabel}</span>
              </Badge>
              {categoryName && (
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: categoryColor || '#09AE5B' }}
                  />
                  <span>{categoryName}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#EDEDED]">
              {resource.title}
            </h1>

            {resource.url && (
              <div className="flex items-center gap-2 text-xs">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#09AE5B] hover:underline flex items-center gap-1.5 font-mono truncate max-w-md"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{resource.url}</span>
                </a>
              </div>
            )}
          </div>

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#09AE5B] hover:bg-[#07914b] text-black text-xs font-semibold shrink-0 transition-colors self-start"
            >
              <span>Open Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Description */}
        {resource.description && (
          <div className="space-y-1">
            <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Description
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {resource.description}
            </p>
          </div>
        )}

        {/* Notes (Plain-text) */}
        {resource.notes && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Personal Notes
            </h2>
            <div className="p-3.5 rounded-md bg-[#0E0F10] border border-white/[0.08] font-mono text-xs text-[#E5E5E5] whitespace-pre-wrap leading-relaxed">
              {resource.notes}
            </div>
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Tags
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {resource.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-xs bg-white/[0.04] text-neutral-300 border border-white/[0.06]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Meta: Date added */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Added {formatDate(resource.createdAt)}</span>
          </span>
          {categoryName && (
            <span className="flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Category: {categoryName}</span>
            </span>
          )}
        </div>
      </div>

      {/* Reusing ResourceModal for Editing */}
      {isEditOpen && (
        <ResourceModal
          isOpen={true}
          resource={resource}
          categories={categories}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => fetchResource()}
          onCategoryCreated={(newCat) => setCategories((prev) => [...prev, newCat])}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Resource?"
        message={`Are you sure you want to delete "${resource.title}"? You can restore it from trash within 30 days.`}
        confirmText="Delete"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ResourceDetailPage;
