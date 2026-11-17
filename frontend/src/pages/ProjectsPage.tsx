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
          <div className="flex items-center gap-2 text-xs text-[#8e8d8a] dark:text-[#71717a] font-mono">
            <span>Workspaces</span>
            <span>•</span>
            <span>{projects.length} projects</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5] mt-0.5">
            Active Projects
          </h1>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-1">
            Group resources by software applications, clients, design systems, and codebases.
          </p>
        </div>

        <Button
          variant="primary"
          pill
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs h-8 px-4 font-medium shadow-xs"
        >
          New Project
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-none bg-[#121316] animate-pulse border border-white/[0.08]"
            />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group relative flex flex-col justify-between p-4.5 bg-[#121316] border border-white/[0.08] rounded-none hover:border-[#09AE5B]/60 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-none bg-[#0E0F10] text-[#09AE5B] flex items-center justify-center border border-white/10">
                    <FolderKanban className="w-4 h-4" />
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1 rounded-none text-neutral-400 hover:text-[#09AE5B] hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProject(project)}
                      className="p-1 rounded-none text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="font-semibold text-sm text-[#E5E5E5] hover:text-[#09AE5B] block transition-colors"
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
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-[#09AE5B]" />
                  {project.resourceCount || 0} {project.resourceCount === 1 ? 'resource' : 'resources'}
                </span>

                <Link
                  to={`/projects/${project._id}`}
                  className="text-xs text-neutral-400 hover:text-[#09AE5B] flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-none border border-dashed border-white/[0.12] p-8 bg-[#121316]">
          <FolderKanban className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#E5E5E5] mb-1">
            No projects created
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Group your resources by repositories, client projects, or tools you build.
          </p>
          <Button
            variant="primary"
            size="xs"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create First Project
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
        description="Projects cluster related components, docs, palettes, and API endpoints."
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-none bg-rose-950/30 text-xs text-rose-400 border border-rose-900/40">
              {error}
            </div>
          )}

          <Input
            label="Project Name"
            placeholder="e.g. NextGen SaaS, E-Commerce Redesign"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-none p-2.5 text-xs bg-[#0E0F10] border border-white/10 text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-[#09AE5B]"
              placeholder="What is the scope or goals of this project?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Project Modal */}
      <DeleteConfirmModal
        isOpen={deletingProject !== null}
        title="Delete Project?"
        message={`Are you sure you want to delete "${deletingProject?.name}"? All associated resources will remain intact in your central library.`}
        confirmText="Delete Project"
        onCancel={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

