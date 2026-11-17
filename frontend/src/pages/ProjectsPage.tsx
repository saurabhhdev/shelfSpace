import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Layers, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Project } from '../types';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const res = await apiClient.get('/projects');
      if (res.data?.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
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
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (editingProject) {
        await apiClient.patch(`/projects/${editingProject._id}`, {
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
        });
      } else {
        await apiClient.post('/projects', {
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
        });
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/projects/${deletingProject._id}`);
      setDeletingProject(null);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#EDEDED]">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Organize resources by active projects and repositories ({projects.length} total).
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          size="sm"
          className="self-start sm:self-auto"
        >
          New Project
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-md bg-[#121316] animate-pulse border border-white/[0.08]"
            />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group relative flex flex-col justify-between p-4.5 bg-[#121316] border border-white/[0.08] rounded-md hover:border-white/20 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-md bg-[#0E0F10] text-neutral-400 flex items-center justify-center border border-white/10">
                    <FolderKanban className="w-4 h-4" />
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProject(project)}
                      className="p-1 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="font-medium text-sm text-[#EDEDED] hover:text-[#09AE5B] block transition-colors"
                >
                  {project.name}
                </Link>

                {project.description && (
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
                  <Layers className="w-3.5 h-3.5" />
                  {project.resourceCount || 0} {project.resourceCount === 1 ? 'resource' : 'resources'}
                </span>

                <Link
                  to={`/projects/${project._id}`}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-md border border-white/[0.08] p-8 bg-[#121316]">
          <h3 className="text-sm font-medium text-[#EDEDED] mb-1">
            No projects yet
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Create projects to keep related components, APIs, and documentation organized.
          </p>
          <Button
            size="xs"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Project
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
        description="Organize resources around a specific codebase or goal."
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-rose-500/10 text-xs text-rose-400 border border-rose-500/20">
              {error}
            </div>
          )}

          <Input
            label="Name"
            placeholder="e.g. Portfolio Redesign, Mobile App, API Backend"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-md p-2.5 text-xs bg-[#121316] border border-white/[0.08] text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-white/20"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
            <Button type="button" variant="ghost" size="xs" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="xs" isLoading={isSubmitting}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Project Modal */}
      <DeleteConfirmModal
        isOpen={deletingProject !== null}
        title="Delete Project?"
        message={`Are you sure you want to delete "${deletingProject?.name}"? The resources inside will remain safely saved in your library.`}
        confirmText="Delete Project"
        onCancel={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectsPage;