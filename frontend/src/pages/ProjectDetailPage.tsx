import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FolderKanban, ChevronLeft, LayoutGrid, List } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Project, Resource } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { Button } from '../components/ui/Button';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { cn } from '../lib/utils';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjectData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/projects/${projectId}`);
      if (res.data?.success) {
        setProject(res.data.data.project);
        setResources(res.data.data.resources);
      }
    } catch (err) {
      console.error('Project not found', err);
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const handleToggleFavourite = async (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r._id === id ? { ...r, isFavourite: !r.isFavourite } : r))
    );
    await apiClient.patch(`/resources/${id}/favourite`);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/resources/${deletingId}`);
      setDeletingId(null);
      fetchProjectData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !project) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-[#1e3a2f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs text-[#8a8277]">Loading project...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>All Projects</span>
        </Link>
      </div>

      {/* Project Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#edf4f0] dark:bg-[#1a2b22] text-[#1e3a2f] dark:text-[#86efac] flex items-center justify-center border border-[#cadfd5] dark:border-[#2d4d3c]">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#191715] dark:text-[#f5f2ec]">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-xs text-[#57524b] dark:text-[#aba499] mt-0.5">
                {project.description}
              </p>
            )}
            <div className="text-xs font-mono text-[#8a8277] mt-1">
              {resources.length} associated {resources.length === 1 ? 'resource' : 'resources'}
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-lg border border-[#ded8cb] dark:border-[#2f2c27] bg-white dark:bg-[#191816] p-0.5 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'grid'
                ? 'bg-[#f5f2eb] dark:bg-[#22201d] text-[#191715] dark:text-[#f5f2ec]'
                : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-[#f5f2eb] dark:bg-[#22201d] text-[#191715] dark:text-[#f5f2ec]'
                : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Associated Resources List */}
      {resources.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-2'
          )}
        >
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              viewMode={viewMode}
              onToggleFavourite={handleToggleFavourite}
              onDelete={(id) => setDeletingId(id)}
              onEdit={(r) => setEditingResource(r)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#ded8cb] dark:border-[#2f2c27] p-8">
          <p className="text-xs text-[#8a8277] mb-4">
            No resources associated with this project yet.
          </p>
          <Button
            size="sm"
            onClick={() => {
              const addBtn = document.querySelector('header button:has(svg)') as HTMLButtonElement;
              if (addBtn) addBtn.click();
            }}
          >
            Add Resource to Project
          </Button>
        </div>
      )}

      {/* Edit modal */}
      <EditResourceModal
        isOpen={editingResource !== null}
        resource={editingResource}
        projects={[project]}
        collections={[]}
        onClose={() => setEditingResource(null)}
        onSuccess={() => fetchProjectData()}
      />

      {/* Delete modal */}
      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
