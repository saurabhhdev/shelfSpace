import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Flaticon } from '../components/ui/Flaticon';
import { apiClient } from '../api/client';
import type { Project, Resource, Collection, ResourceType } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ResourceModal } from '../components/resources/ResourceModal';
import { AddResourcesModal } from '../components/projects/AddResourcesModal';
import { Button, IconButton } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useNotification } from '../context/NotificationContext';
import { RESOURCE_TYPES } from '../lib/resourceTypes';
import { cn, formatRelativeTime } from '../lib/utils';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [project, setProject] = useState<Project | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View & Filter States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Modals
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const [isCreateResourceModalOpen, setIsCreateResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Resource Action Confirmations
  const [resourceToRemove, setResourceToRemove] = useState<{ id: string; name: string } | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Edit Project Modal
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectImg, setProjectImg] = useState('');
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Delete Project Modal
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);

  const fetchProjectData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [projRes, catRes] = await Promise.all([
        apiClient.get(`/projects/${projectId}`),
        apiClient.get('/collections'),
      ]);

      if (projRes.data?.success) {
        setProject(projRes.data.data.project);
        setResources(projRes.data.data.resources || []);
        setProjectName(projRes.data.data.project.name);
        setProjectDesc(projRes.data.data.project.description || '');
        setProjectImg(projRes.data.data.project.imageUrl || '');
      }

      if (catRes.data?.success) {
        setCategories(catRes.data.data);
      }
    } catch (err) {
      console.error('Project not found', err);
      notify('Project not found', 'error');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleToggleFavourite = async (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r._id === id ? { ...r, isFavourite: !r.isFavourite } : r))
    );
    try {
      await apiClient.patch(`/resources/${id}/favourite`);
    } catch (err) {
      console.error('Failed to toggle favourite', err);
    }
  };

  // Remove resource from project (leaves resource intact in library)
  const handleRemoveFromProject = async () => {
    if (!resourceToRemove || !projectId) return;
    setIsActionLoading(true);
    try {
      await apiClient.delete(`/projects/${projectId}/resources/${resourceToRemove.id}`);
      notify(
        `"${resourceToRemove.name}" removed from project. It remains safely in your library.`,
        'success'
      );
      setResourceToRemove(null);
      fetchProjectData();
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to remove resource from project', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete resource globally
  const handleDeleteResource = async () => {
    if (!resourceToDelete) return;
    setIsActionLoading(true);
    try {
      await apiClient.delete(`/resources/${resourceToDelete.id}`);
      notify(`"${resourceToDelete.name}" moved to trash`, 'success');
      setResourceToDelete(null);
      fetchProjectData();
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to delete resource', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Update Project details
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !projectId) return;
    setIsSavingProject(true);
    try {
      await apiClient.patch(`/projects/${projectId}`, {
        name: projectName.trim(),
        description: projectDesc.trim(),
        imageUrl: projectImg.trim() || undefined,
      });
      notify('Project updated successfully', 'success');
      setIsEditProjectModalOpen(false);
      fetchProjectData();
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to update project', 'error');
    } finally {
      setIsSavingProject(false);
    }
  };

  // Toggle project archive
  const handleToggleArchiveProject = async () => {
    if (!projectId || !project) return;
    try {
      const res = await apiClient.patch(`/projects/${projectId}/archive`);
      if (res.data?.success) {
        const isArchived = res.data.data.isArchived;
        notify(
          isArchived ? `Project "${project.name}" archived` : `Project "${project.name}" unarchived`,
          'success'
        );
        fetchProjectData();
      }
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to update archive status', 'error');
    }
  };

  // Delete Project
  const handleDeleteProject = async () => {
    if (!projectId || !project) return;
    try {
      await apiClient.delete(`/projects/${projectId}`);
      notify(
        `Project "${project.name}" deleted. All associated resources remain in your library.`,
        'success'
      );
      navigate('/projects');
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to delete project', 'error');
    }
  };

  // Filtered resources inside this project
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Type filter
      if (selectedType !== 'all' && resource.type !== selectedType) {
        return false;
      }
      // Favorites filter
      if (onlyFavorites && !resource.isFavourite) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = resource.title.toLowerCase().includes(q);
        const matchesDesc = resource.description && resource.description.toLowerCase().includes(q);
        const matchesUrl = resource.url && resource.url.toLowerCase().includes(q);
        const matchesTag = resource.tags && resource.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesUrl && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [resources, selectedType, onlyFavorites, search]);

  if (isLoading || !project) {
    return (
      <div className="py-24 text-center text-xs text-neutral-400 font-sans">
        <div className="w-8 h-8 rounded-md bg-[#1C1C1B] border border-[#3E3E38] flex items-center justify-center mx-auto mb-3">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#D97757] animate-pulse"></span>
        </div>
        <span>Loading project details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* 1. Breadcrumb Back Link */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <Flaticon name="angle-small-left" className="text-xs" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* 2. Project Header Card Banner */}
      <div className="rounded-md bg-[#1C1C1B] border border-[#3E3E38] overflow-hidden">
        {/* Cover image if available */}
        {project.imageUrl && (
          <div className="w-full h-36 sm:h-48 bg-[#262624] border-b border-[#3E3E38] relative overflow-hidden">
            <img
              src={project.imageUrl}
              alt={project.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1B] via-transparent to-transparent"></div>
          </div>
        )}

        {/* Content & Action Bar */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-md bg-[#262624] text-neutral-400 flex items-center justify-center border border-[#3E3E38] shrink-0">
              <Flaticon name="folder-open" className="text-base text-[#D97757]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-semibold text-[#FAF9F5] tracking-tight">
                  {project.name}
                </h1>
                {project.isArchived && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-medium">
                    Archived
                  </span>
                )}
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-[#3E3E38]">
                  <Flaticon name="layers" className="text-xs text-[#D97757]" />
                  <span>
                    {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
                  </span>
                </span>
              </div>

              {project.description && (
                <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Add Resource & Manage */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="xs"
              leftIcon={<Flaticon name="plus" className="text-xs" />}
              onClick={() => setIsAddExistingModalOpen(true)}
              title="Add existing resources from your library"
            >
              Add Existing
            </Button>

            <Button
              size="xs"
              leftIcon={<Flaticon name="plus" className="text-xs" />}
              onClick={() => setIsCreateResourceModalOpen(true)}
              title="Create new resource directly inside this project"
            >
              New Resource
            </Button>

            <IconButton
              onClick={() => setIsEditProjectModalOpen(true)}
              variant="outline"
              size="sm"
              icon={<Flaticon name="pencil" className="text-xs" />}
              title="Edit project details"
            />

            <IconButton
              onClick={handleToggleArchiveProject}
              variant={project.isArchived ? "amber" : "outline"}
              size="sm"
              icon={project.isArchived ? (
                <Flaticon name="refresh" className="text-xs" />
              ) : (
                <Flaticon name="box-alt" className="text-xs" />
              )}
              title={project.isArchived ? 'Unarchive project' : 'Archive project'}
            />

            <IconButton
              onClick={() => setIsDeleteProjectOpen(true)}
              variant="danger"
              size="sm"
              icon={<Flaticon name="trash" className="text-xs" />}
              title="Delete project"
            />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-sm">
          <Flaticon name="search" className="text-xs text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within this project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#1C1C1B] border border-[#3E3E38] rounded-md text-[#FAF9F5] placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <Flaticon name="cross" className="text-[10px]" />
            </button>
          )}
        </div>

        {/* Right: Filters & Grid/List switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Filter Select */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#1C1C1B] border border-[#3E3E38] rounded-md text-[#FAF9F5] focus:outline-none focus:border-neutral-500 cursor-pointer"
          >
            <option value="all">All Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Favorites Filter */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={cn(
              'px-2.5 py-1.5 text-xs rounded-md border transition-colors flex items-center gap-1.5 cursor-pointer',
              onlyFavorites
                ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                : 'bg-[#1C1C1B] border-[#3E3E38] text-neutral-400 hover:text-white'
            )}
          >
            <Flaticon
              name="star"
              variant={onlyFavorites ? 'sr' : 'rr'}
              className={cn('text-xs', onlyFavorites && 'text-amber-400')}
            />
            <span>Favorites</span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex rounded-md border border-[#3E3E38] bg-[#1C1C1B] p-0.5 shrink-0 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded text-xs transition-all duration-150 cursor-pointer active:scale-95',
                viewMode === 'grid'
                  ? 'bg-[#262624] text-[#FAF9F5] shadow-xs border border-[#3E3E38]'
                  : 'text-[#83827D] hover:text-[#FAF9F5] border border-transparent'
              )}
              title="Grid view"
            >
              <Flaticon name="apps" className="text-xs" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded text-xs transition-all duration-150 cursor-pointer active:scale-95',
                viewMode === 'list'
                  ? 'bg-[#262624] text-[#FAF9F5] shadow-xs border border-[#3E3E38]'
                  : 'text-[#83827D] hover:text-[#FAF9F5] border border-transparent'
              )}
              title="List view"
            >
              <Flaticon name="menu-burger" className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Resources Grid / List Display */}
      {filteredResources.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5'
              : 'space-y-2'
          )}
        >
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              viewMode={viewMode}
              onToggleFavourite={handleToggleFavourite}
              onEdit={(r) => setEditingResource(r)}
              onDelete={(id, name) => setResourceToDelete({ id, name })}
              onRemoveFromProject={(id, name) => setResourceToRemove({ id, name })}
            />
          ))}
        </div>
      ) : resources.length > 0 ? (
        /* Filtered Empty State */
        <div className="py-16 text-center rounded-md border border-[#3E3E38] p-8 bg-[#1C1C1B]">
          <h3 className="text-sm font-medium text-[#FAF9F5] mb-1">
            No matching resources in this project
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Try adjusting your search query, type filter, or favorites toggle.
          </p>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              setSearch('');
              setSelectedType('all');
              setOnlyFavorites(false);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        /* Initial Project Empty State */
        <div className="py-16 text-center rounded-md border border-[#3E3E38] p-8 bg-[#1C1C1B]">
          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <Flaticon name="folder-open" className="text-base" />
          </div>
          <h3 className="text-sm font-medium text-[#FAF9F5] mb-1">
            No resources in this project yet
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Add existing resources from your library or save new developer tools and components directly into this project.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              size="xs"
              variant="outline"
              leftIcon={<Flaticon name="plus" className="text-xs" />}
              onClick={() => setIsAddExistingModalOpen(true)}
            >
              Add Existing
            </Button>
            <Button
              size="xs"
              leftIcon={<Flaticon name="plus" className="text-xs" />}
              onClick={() => setIsCreateResourceModalOpen(true)}
            >
              New Resource
            </Button>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* 1. Add Existing Resources Modal */}
      <AddResourcesModal
        isOpen={isAddExistingModalOpen}
        projectId={project._id}
        projectName={project.name}
        existingResourceIds={resources.map((r) => r._id)}
        onClose={() => setIsAddExistingModalOpen(false)}
        onSuccess={() => fetchProjectData()}
      />

      {/* 2. Create New Resource Modal (pre-assigned to this project) */}
      <ResourceModal
        isOpen={isCreateResourceModalOpen}
        categories={categories}
        initialProjectId={project._id}
        onClose={() => setIsCreateResourceModalOpen(false)}
        onSuccess={() => fetchProjectData()}
        onCategoryCreated={(newCat) => setCategories((prev) => [...prev, newCat])}
      />

      {/* 3. Edit Existing Resource Modal */}
      {editingResource && (
        <ResourceModal
          isOpen={editingResource !== null}
          resource={editingResource}
          categories={categories}
          onClose={() => setEditingResource(null)}
          onSuccess={() => fetchProjectData()}
        />
      )}

      {/* 4. Remove from Project Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={resourceToRemove !== null}
        title="Remove Resource from Project?"
        message={`Are you sure you want to remove "${resourceToRemove?.name}" from "${project.name}"? This resource will remain safely saved in your global library.`}
        confirmText="Remove from Project"
        onCancel={() => setResourceToRemove(null)}
        onConfirm={handleRemoveFromProject}
        isLoading={isActionLoading}
      />

      {/* 5. Delete Resource Globally Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={resourceToDelete !== null}
        title="Delete Resource?"
        message={`Are you sure you want to move "${resourceToDelete?.name}" to trash? It will be removed from all projects and the library.`}
        confirmText="Move to Trash"
        onCancel={() => setResourceToDelete(null)}
        onConfirm={handleDeleteResource}
        isLoading={isActionLoading}
      />

      {/* 6. Edit Project Details Modal */}
      <Dialog
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        title="Edit Project"
        description="Update project name, description, and cover image."
      >
        <form onSubmit={handleUpdateProject} className="space-y-4 font-sans">
          <Input
            label="Project Name *"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Short Description (optional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-md p-2.5 text-xs bg-[#1C1C1B] border border-[#3E3E38] text-[#FAF9F5] placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
              placeholder="What is this project about?"
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              maxLength={500}
            />
          </div>

          <div>
            <Input
              label="Cover Image URL (optional)"
              placeholder="https://example.com/project-cover.png"
              value={projectImg}
              onChange={(e) => setProjectImg(e.target.value)}
            />
            {projectImg && (
              <div className="mt-2 rounded border border-[#3E3E38] overflow-hidden h-24 bg-[#262624] flex items-center justify-center">
                <img
                  src={projectImg}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setIsEditProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="xs" isLoading={isSavingProject}>
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 7. Delete Project Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteProjectOpen}
        title="Delete Project?"
        message={`Are you sure you want to delete "${project.name}"? The resources associated with this project will remain safely saved in your global library.`}
        confirmText="Delete Project"
        onCancel={() => setIsDeleteProjectOpen(false)}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
};

export default ProjectDetailPage;
