import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Layers,
  Edit2,
  Trash2,
  ArrowRight,
  Search,
  Archive,
  ArchiveRestore,
  ExternalLink,
  MoreVertical,
  X,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { Project } from '../types';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useNotification } from '../context/NotificationContext';
import { formatRelativeTime } from '../lib/utils';

export const ProjectsPage: React.FC = () => {
  const { notify } = useNotification();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete modal
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/projects?status=all');
      if (res.data?.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
      notify('Failed to load projects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description || '');
    setImageUrl(p.imageUrl || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingProject) {
        await apiClient.patch(`/projects/${editingProject._id}`, {
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
        });
        notify(`Project "${name.trim()}" updated successfully`, 'success');
      } else {
        await apiClient.post('/projects', {
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
        });
        notify(`Project "${name.trim()}" created successfully`, 'success');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleArchive = async (project: Project) => {
    try {
      const res = await apiClient.patch(`/projects/${project._id}/archive`);
      if (res.data?.success) {
        const isNowArchived = res.data.data.isArchived;
        notify(
          isNowArchived
            ? `Project "${project.name}" archived`
            : `Project "${project.name}" unarchived`,
          'success'
        );
        fetchProjects();
      }
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to update project status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/projects/${deletingProject._id}`);
      notify(
        `Project "${deletingProject.name}" deleted. Associated resources remain safely in your library.`,
        'success'
      );
      setDeletingProject(null);
      fetchProjects();
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter projects by status & search
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Status filter
      if (statusFilter === 'active' && p.isArchived) return false;
      if (statusFilter === 'archived' && !p.isArchived) return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description && p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [projects, statusFilter, search]);

  const activeCount = projects.filter((p) => !p.isArchived).length;
  const archivedCount = projects.filter((p) => p.isArchived).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#EDEDED]">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Organize developer resources, tools, and repositories around specific initiatives and codebases.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          size="sm"
          className="self-start sm:self-auto shrink-0"
        >
          Create Project
        </Button>
      </div>

      {/* 2. Controls & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#121316] border border-white/[0.08] rounded-md text-[#EDEDED] placeholder:text-neutral-500 focus:outline-none focus:border-white/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-[#121316] border border-white/[0.08] rounded-md self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white/[0.1] text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              statusFilter === 'archived'
                ? 'bg-white/[0.1] text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Archived ({archivedCount})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white/[0.1] text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({projects.length})
          </button>
        </div>
      </div>

      {/* 3. Project Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-md bg-[#121316] animate-pulse border border-white/[0.08]"
            />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="group flex flex-col justify-between bg-[#121316] border border-white/[0.08] hover:border-white/20 rounded-md transition-colors overflow-hidden"
            >
              <div>
                {/* Cover Image or Fallback Visual (16:9 aspect ratio) */}
                <div className="w-full aspect-[16/9] bg-[#0E0F10] border-b border-white/[0.06] relative overflow-hidden flex items-center justify-center">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover transition-opacity duration-150"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#16171b] to-[#0E0F10] text-neutral-500 p-4">
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-neutral-400 mb-1.5">
                        <FolderKanban className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-500">
                        Project
                      </span>
                    </div>
                  )}

                  {/* Archived status tag */}
                  {project.isArchived && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10 text-[10px] text-amber-400 font-medium">
                      Archived
                    </div>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/projects/${project._id}`}
                      className="font-medium text-sm text-[#EDEDED] hover:text-[#09AE5B] truncate block transition-colors"
                    >
                      {project.name}
                    </Link>

                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] shrink-0">
                      <Layers className="w-3 h-3 text-[#09AE5B]" />
                      <span>{project.resourceCount || 0}</span>
                    </span>
                  </div>

                  {/* Short Description (2-line clamp with uniform height) */}
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {project.description?.trim() || (
                      <span className="italic text-neutral-500">No description added.</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Card Footer: Last Updated & Compact Actions */}
              <div className="px-4 py-2.5 border-t border-white/[0.06] bg-[#0E0F10]/50 flex items-center justify-between text-[11px] text-neutral-500">
                <span>
                  Updated {formatRelativeTime(project.updatedAt || project.createdAt)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Edit project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleArchive(project)}
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title={project.isArchived ? 'Unarchive project' : 'Archive project'}
                  >
                    {project.isArchived ? (
                      <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => setDeletingProject(project)}
                    className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    to={`/projects/${project._id}`}
                    className="ml-1 pl-1.5 border-l border-white/[0.08] text-neutral-400 hover:text-white flex items-center gap-0.5 transition-colors"
                    title="Open project"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center rounded-md border border-white/[0.08] p-8 bg-[#121316]">
          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <FolderKanban className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-medium text-[#EDEDED] mb-1">
            {search
              ? 'No matching projects found'
              : statusFilter === 'archived'
              ? 'No archived projects'
              : 'No projects yet'}
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            {search
              ? `No projects matched "${search}". Try adjusting your search query.`
              : statusFilter === 'archived'
              ? 'Archived projects will be preserved and listed here for future reference.'
              : 'Create a project to cluster related APIs, design kits, snippets, and tools around a specific build.'}
          </p>
          {search ? (
            <Button size="xs" variant="ghost" onClick={() => setSearch('')}>
              Clear search
            </Button>
          ) : (
            <Button
              size="xs"
              onClick={openCreateModal}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Project
            </Button>
          )}
        </div>
      )}

      {/* 4. Create / Edit Project Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create Project'}
        description={
          editingProject
            ? 'Update project details and cover image.'
            : 'Group and organize resources around a specific initiative or repository.'
        }
      >
        <form onSubmit={handleSave} className="space-y-4 font-sans">
          {error && (
            <div className="p-3 rounded-md bg-rose-950/20 text-xs text-rose-400 border border-rose-900/40">
              {error}
            </div>
          )}

          <Input
            label="Project Name *"
            placeholder="e.g. Design System v2, Mobile App, AI Backend"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Short Description (optional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-md p-2.5 text-xs bg-[#121316] border border-white/[0.08] text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          <div>
            <Input
              label="Cover Image URL (optional)"
              placeholder="https://example.com/project-cover.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <div className="mt-2 rounded border border-white/10 overflow-hidden h-24 bg-[#0E0F10] flex items-center justify-center">
                <img
                  src={imageUrl}
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
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="xs" isLoading={isSubmitting}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 5. Delete Project Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletingProject !== null}
        title="Delete Project?"
        message={`Are you sure you want to delete "${deletingProject?.name}"? The resources associated with this project will remain safely saved in your global library.`}
        confirmText="Delete Project"
        onCancel={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectsPage;
