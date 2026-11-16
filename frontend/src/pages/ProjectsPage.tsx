import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Layers, Edit2, Trash2 } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#1e3a2f] dark:text-[#86efac]">
            WORKSPACES
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#191715] dark:text-[#f5f2ec] mt-0.5">
            Projects
          </h1>
          <p className="text-xs text-[#57524b] dark:text-[#aba499] mt-1">
            Group resources by software applications, design systems, or client projects.
          </p>
        </div>

        <Button size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          New Project
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-xl bg-[#f5f2eb] dark:bg-[#201e1b] animate-pulse border border-[#ded8cb] dark:border-[#2f2c27]"
            />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group relative flex flex-col justify-between p-5 bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] rounded-xl hover:border-[#1e3a2f] dark:hover:border-[#387356] transition-all hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#edf4f0] dark:bg-[#1a2b22] text-[#1e3a2f] dark:text-[#86efac] flex items-center justify-center border border-[#cadfd5] dark:border-[#2d4d3c]">
                    <FolderKanban className="w-4 h-4" />
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1 rounded text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProject(project)}
                      className="p-1 rounded text-[#8a8277] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="font-semibold text-base text-[#191715] dark:text-[#f5f2ec] hover:text-[#1e3a2f] dark:hover:text-[#86efac] block"
                >
                  {project.name}
                </Link>

                {project.description && (
                  <p className="text-xs text-[#57524b] dark:text-[#aba499] line-clamp-2 mt-1">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#ede8df] dark:border-[#24221f] flex items-center justify-between text-xs text-[#8a8277]">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Layers className="w-3.5 h-3.5" />
                  {project.resourceCount || 0} associated {project.resourceCount === 1 ? 'item' : 'items'}
                </span>

                <Link
                  to={`/projects/${project._id}`}
                  className="text-[#1e3a2f] dark:text-[#86efac] hover:underline font-medium text-xs"
                >
                  View Resources →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#ded8cb] dark:border-[#2f2c27] p-8">
          <FolderKanban className="w-10 h-10 text-[#8a8277] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#191715] dark:text-[#f5f2ec] mb-1">
            No projects yet
          </h3>
          <p className="text-xs text-[#57524b] dark:text-[#aba499] max-w-sm mx-auto mb-5">
            Organize related resources across applications, design systems, or client projects.
          </p>
          <Button size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Create First Project
          </Button>
        </div>
      )}

      {/* Project Create/Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
        description="Projects associate and group resources without locking or owning them."
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
              {error}
            </div>
          )}

          <Input
            label="Project Name"
            placeholder="e.g. NextGen Mobile App or Design System v2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-medium text-[#45403a] dark:text-[#aba499] block mb-1">
              Description (optional)
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg p-2.5 text-sm bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] text-[#191715] dark:text-[#f5f2ec] focus:outline-none focus:ring-2 focus:ring-[#1e3a2f]/20 focus:border-[#1e3a2f]"
              placeholder="What software or goal does this project cover?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-[#ded8cb] dark:border-[#2f2c27] flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Project Modal */}
      <DeleteConfirmModal
        isOpen={deletingProject !== null}
        title="Delete Project?"
        message={`Are you sure you want to delete "${deletingProject?.name}"? All associated resources will be safely preserved in your library.`}
        confirmText="Delete Project"
        onCancel={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};
