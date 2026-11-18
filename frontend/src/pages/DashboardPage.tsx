import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Resource, Collection } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ResourceModal } from '../components/resources/ResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { Button } from '../components/ui/Button';
import { Flaticon } from '../components/ui/Flaticon';
import { useNotification } from '../context/NotificationContext';

export const DashboardPage: React.FC = () => {
  const { notify } = useNotification();

  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [favouriteResources, setFavouriteResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Collection[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, recentRes, favRes, colRes] = await Promise.all([
        apiClient.get('/resources/stats'),
        apiClient.get('/resources', { params: { limit: 5, sortBy: 'recent', status: 'active' } }),
        apiClient.get('/resources', { params: { limit: 5, isFavourite: true, status: 'active' } }),
        apiClient.get('/collections'),
      ]);

      if (statsRes.data?.success) {
        setTotalCount(statsRes.data.data.total ?? 0);
        setFavoriteCount(statsRes.data.data.favorites ?? 0);
        setCategoryCount(statsRes.data.data.categories ?? 0);
      }

      if (recentRes.data?.success) {
        setRecentResources(recentRes.data.data);
      }

      if (favRes.data?.success) {
        setFavouriteResources(favRes.data.data);
      }

      if (colRes.data?.success) {
        setCategories(colRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleAdded = () => fetchDashboardData();
    window.addEventListener('resource-added', handleAdded);
    return () => window.removeEventListener('resource-added', handleAdded);
  }, []);

  const handleToggleFavourite = async (id: string) => {
    try {
      const res = await apiClient.patch(`/resources/${id}/favourite`);
      const isFav = res.data?.data?.isFavourite;
      notify(isFav ? 'Added to favorites' : 'Removed from favorites', 'success');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      notify('Failed to update favorite status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingResource) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/resources/${deletingResource.id}`);
      notify(`"${deletingResource.name}" moved to trash`, 'success');
      setDeletingResource(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      notify('Failed to delete resource', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* A. Add Resource Section (Top) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#EDEDED]">
            Resources
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Organize, manage, and quickly access your developer tools and references.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Flaticon name="plus" className="text-xs" />}
          size="sm"
          className="self-start sm:self-auto shrink-0"
        >
          Add Resource
        </Button>
      </div>

      {/* B. Resource Summary (Three Small Figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/library"
          className="p-3.5 rounded-md bg-[#1C1C1B] border border-[#3E3E38] hover:border-neutral-500 transition-colors group flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Total Resources</span>
            <span className="text-xl font-semibold tracking-tight text-[#FAF9F5]">
              {totalCount}
            </span>
          </div>
          <Flaticon name="layers" className="text-sm text-neutral-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          to="/favourites"
          className="p-3.5 rounded-md bg-[#1C1C1B] border border-[#3E3E38] hover:border-neutral-500 transition-colors group flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Favorites</span>
            <span className="text-xl font-semibold tracking-tight text-[#FAF9F5]">
              {favoriteCount}
            </span>
          </div>
          <Flaticon name="star" className="text-sm text-amber-400/80 group-hover:text-amber-400 transition-colors" />
        </Link>

        <Link
          to="/categories"
          className="p-3.5 rounded-md bg-[#1C1C1B] border border-[#3E3E38] hover:border-neutral-500 transition-colors group flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Categories</span>
            <span className="text-xl font-semibold tracking-tight text-[#FAF9F5]">
              {categoryCount}
            </span>
          </div>
          <Flaticon name="bookmark" className="text-sm text-neutral-500 group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* C. Recently Added (5 most recently added resources in list view) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#FAF9F5]">
            Recently Added
          </h2>
          <Link
            to="/library"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <Flaticon name="angle-small-right" className="text-xs" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-md bg-[#1C1C1B] animate-pulse border border-[#3E3E38]"
              />
            ))}
          </div>
        ) : recentResources.length === 0 ? (
          <div className="p-8 rounded-md bg-[#1C1C1B] border border-[#3E3E38] text-center space-y-3">
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Your library is currently empty. Add your first resource to get started.
            </p>
            <Button
              onClick={() => setIsAddOpen(true)}
              size="xs"
              leftIcon={<Flaticon name="plus" className="text-xs" />}
            >
              Add Resource
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentResources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                viewMode="list"
                onToggleFavourite={handleToggleFavourite}
                onDelete={(id, name) => setDeletingResource({ id, name })}
                onEdit={(res) => setEditingResource(res)}
              />
            ))}
          </div>
        )}
      </div>

      {/* D. Favorites (Compact section) */}
      <div className="space-y-3 pt-4 border-t border-[#3E3E38]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#FAF9F5]">
            Favorites
          </h2>
          <Link
            to="/favourites"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View All Favorites</span>
            <Flaticon name="angle-small-right" className="text-xs" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-md bg-[#1C1C1B] animate-pulse border border-[#3E3E38]"
              />
            ))}
          </div>
        ) : favouriteResources.length === 0 ? (
          <div className="p-6 rounded-md bg-[#1C1C1B] border border-[#3E3E38] text-center">
            <p className="text-xs text-neutral-400">
              No favorite resources yet. Click the star icon on any resource to add it here for quick access.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {favouriteResources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                viewMode="list"
                onToggleFavourite={handleToggleFavourite}
                onDelete={(id, name) => setDeletingResource({ id, name })}
                onEdit={(res) => setEditingResource(res)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Resource Modal */}
      <ResourceModal
        isOpen={isAddOpen}
        categories={categories}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => fetchDashboardData()}
        onCategoryCreated={(newCat) => setCategories((prev) => [...prev, newCat])}
      />

      {/* Edit Resource Modal */}
      {editingResource && (
        <ResourceModal
          isOpen={true}
          resource={editingResource}
          categories={categories}
          onClose={() => setEditingResource(null)}
          onSuccess={() => {
            setEditingResource(null);
            fetchDashboardData();
          }}
          onCategoryCreated={(newCat) => setCategories((prev) => [...prev, newCat])}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingResource}
        title="Delete Resource?"
        message={`Are you sure you want to delete "${deletingResource?.name}"? You can restore it anytime from trash within 30 days.`}
        confirmText="Delete"
        onCancel={() => setDeletingResource(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DashboardPage;
