import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Flaticon } from '../components/ui/Flaticon';
import { apiClient } from '../api/client';
import type { Collection, Resource } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { Button } from '../components/ui/Button';
import { ResourceModal } from '../components/resources/ResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useNotification } from '../context/NotificationContext';
import { cn } from '../lib/utils';

export const CollectionDetailPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [allCategories, setAllCategories] = useState<Collection[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCollectionData = async () => {
    setIsLoading(true);
    try {
      const [res, catsRes] = await Promise.all([
        apiClient.get(`/collections/${collectionId}`),
        apiClient.get('/collections'),
      ]);
      if (res.data?.success) {
        setCollection(res.data.data.collection);
        setResources(res.data.data.resources);
      }
      if (catsRes.data?.success) {
        setAllCategories(catsRes.data.data);
      }
    } catch (err) {
      console.error('Category not found', err);
      navigate('/categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId) {
      fetchCollectionData();
    }
  }, [collectionId]);

  const handleToggleFavourite = async (id: string) => {
    try {
      const res = await apiClient.patch(`/resources/${id}/favourite`);
      const isFav = res.data?.data?.isFavourite;
      setResources((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isFavourite: isFav } : r))
      );
      notify(isFav ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch {
      notify('Failed to update favorite', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingResource) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/resources/${deletingResource.id}`);
      notify(`"${deletingResource.name}" moved to trash`, 'success');
      setDeletingResource(null);
      fetchCollectionData();
    } catch (err) {
      notify('Failed to delete resource', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="space-y-4">
        <Link
          to="/categories"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <Flaticon name="angle-small-left" className="text-xs" />
          <span>All Categories</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3E3E38]">
          <div className="flex items-center gap-3">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: collection?.color || '#D97757' }}
            />
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#FAF9F5]">
                {collection?.name || 'Category'}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {resources.length} {resources.length === 1 ? 'resource' : 'resources'} in this category
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View mode toggle */}
            <div className="flex rounded-md border border-[#3E3E38] bg-[#1C1C1B] p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-sm transition-colors cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-white/[0.1] text-white'
                    : 'text-neutral-400 hover:text-white'
                )}
                title="List view"
              >
                <Flaticon name="menu-burger" className="text-xs" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-sm transition-colors cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-white/[0.1] text-white'
                    : 'text-neutral-400 hover:text-white'
                )}
                title="Grid view"
              >
                <Flaticon name="apps" className="text-xs" />
              </button>
            </div>

            <Button
              onClick={() => setIsAddOpen(true)}
              leftIcon={<Flaticon name="plus" className="text-xs" />}
              size="sm"
            >
              Add Resource
            </Button>
          </div>
        </div>
      </div>

      {/* Resources list / grid */}
      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2')}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-md bg-[#1C1C1B] animate-pulse border border-[#3E3E38]"
            />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'space-y-2'
          )}
        >
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              viewMode={viewMode}
              onToggleFavourite={handleToggleFavourite}
              onDelete={(id, name) => setDeletingResource({ id, name })}
              onEdit={(r) => setEditingResource(r)}
            />
          ))}
        </div>
      ) : (
        <div className="py-14 text-center rounded-md border border-[#3E3E38] p-8 bg-[#1C1C1B] space-y-3">
          <h3 className="text-sm font-medium text-[#FAF9F5]">
            No resources in this category
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Save a resource and assign it to {collection?.name} to see it here.
          </p>
          <Button size="xs" leftIcon={<Flaticon name="plus" className="text-xs" />} onClick={() => setIsAddOpen(true)}>
            Add Resource
          </Button>
        </div>
      )}

      {/* Add Resource Modal */}
      <ResourceModal
        isOpen={isAddOpen}
        categories={allCategories}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => fetchCollectionData()}
        onCategoryCreated={(newCat) => setAllCategories((prev) => [...prev, newCat])}
      />

      {/* Edit Resource Modal */}
      {editingResource && (
        <ResourceModal
          isOpen={true}
          resource={editingResource}
          categories={allCategories}
          onClose={() => setEditingResource(null)}
          onSuccess={() => {
            setEditingResource(null);
            fetchCollectionData();
          }}
          onCategoryCreated={(newCat) => setAllCategories((prev) => [...prev, newCat])}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingResource}
        title="Delete Resource?"
        message={`Are you sure you want to delete "${deletingResource?.name}"? You can restore it from trash within 30 days.`}
        confirmText="Delete"
        onCancel={() => setDeletingResource(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CollectionDetailPage;
