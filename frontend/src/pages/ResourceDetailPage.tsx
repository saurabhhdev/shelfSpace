import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ExternalLink,
  Star,
  Archive,
  Trash2,
  Edit2,
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  Globe,
  GitFork,
  BookOpen,
  Code2,
  Database,
  Palette,
  Layout,
  FileText,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { Resource, Project, Collection, ResourceType } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { formatDate, formatRelativeTime, cn } from '../lib/utils';

const typeIcons: Record<ResourceType, React.ReactNode> = {
  design: <Palette className="w-3.5 h-3.5" />,
  ui: <Layout className="w-3.5 h-3.5" />,
  development: <Code2 className="w-3.5 h-3.5" />,
  data: <Database className="w-3.5 h-3.5" />,
  learning: <BookOpen className="w-3.5 h-3.5" />,
  personal: <FileText className="w-3.5 h-3.5" />,
};

export const ResourceDetailPage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();

  const [resource, setResource] = useState<Resource | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

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
      navigate('/library');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        apiClient.get('/projects'),
        apiClient.get('/collections'),
      ]);
      if (pRes.data?.success) setProjects(pRes.data.data);
      if (cRes.data?.success) setCollections(cRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (resourceId) {
      fetchResource();
      fetchAuxData();
    }
  }, [resourceId]);

  const handleToggleFavourite = async () => {
    if (!resource) return;
    try {
      setResource({ ...resource, isFavourite: !resource.isFavourite });
      await apiClient.patch(`/resources/${resource._id}/favourite`);
    } catch {
      fetchResource();
    }
  };

  const handleArchive = async () => {
    if (!resource) return;
    try {
      const res = await apiClient.patch(`/resources/${resource._id}/archive`);
      if (res.data?.success) {
        setResource(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshMetadata = async () => {
    if (!resource) return;
    setIsRefreshing(true);
    try {
      const res = await apiClient.post(`/resources/${resource._id}/refresh-metadata`);
      if (res.data?.success) {
        setResource(res.data.data);
      }
    } catch (err) {
      console.error('Refresh metadata failed', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!resource) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/resources/${resource._id}`);
      navigate('/library');
    } catch (err) {
      console.error('Failed to trash', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !resource) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400">
        Loading resource details...
      </div>
    );
  }

  const projectList = (resource.projectIds || []).filter(
    (p): p is Project => typeof p === 'object' && p !== null
  );
  const collectionList = (resource.collectionIds || []).filter(
    (c): c is Collection => typeof c === 'object' && c !== null
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button & Action Toolbar */}
      <div className="flex items-center justify-between">
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>All Resources</span>
        </Link>

        {/* Action button toolbar */}
        <div className="flex items-center gap-1.5">
          {resource.url && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleRefreshMetadata}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-3 h-3" />}
              title="Refresh metadata"
            >
              Refresh
            </Button>
          )}

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
            onClick={handleArchive}
            leftIcon={<Archive className="w-3 h-3" />}
          >
            {resource.status === 'archived' ? 'Unarchive' : 'Archive'}
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
            variant="ghost"
            size="xs"
            onClick={() => setIsDeleteOpen(true)}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
            title="Move to trash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Resource Card */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-6 sm:p-7 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge type={resource.type}>
                {typeIcons[resource.type]}
                {resource.type}
              </Badge>
              {resource.status === 'archived' && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] text-neutral-400 border border-white/[0.08]">
                  Archived
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
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resource.url!);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                  className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                  title="Copy URL"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#09AE5B]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#09AE5B] hover:bg-[#07914b] text-black text-xs font-semibold shrink-0 transition-colors cursor-pointer self-start"
            >
              <span>Visit Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Thumbnail Preview Banner */}
        {resource.previewImage && (
          <div className="w-full max-h-72 rounded-md overflow-hidden border border-white/[0.08] bg-[#0E0F10]">
            <img
              src={resource.previewImage}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Description */}
        {resource.description && (
          <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {resource.description}
          </div>
        )}

        {/* Type specific metrics */}
        {resource.type === 'development' && resource.metadata && (
          <div className="p-4 rounded-md bg-[#0E0F10] border border-white/[0.08] space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Repository Details
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {resource.metadata.language && (
                <div>
                  <div className="text-neutral-500 text-[10px]">Language</div>
                  <div className="font-medium text-[#EDEDED] mt-0.5 font-mono">
                    {resource.metadata.language}
                  </div>
                </div>
              )}
              {resource.metadata.stars !== undefined && (
                <div>
                  <div className="text-neutral-500 text-[10px]">Stars</div>
                  <div className="font-medium text-[#EDEDED] mt-0.5 flex items-center gap-1 font-mono">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {resource.metadata.stars.toLocaleString()}
                  </div>
                </div>
              )}
              {resource.metadata.forks !== undefined && (
                <div>
                  <div className="text-neutral-500 text-[10px]">Forks</div>
                  <div className="font-medium text-[#EDEDED] mt-0.5 flex items-center gap-1 font-mono">
                    <GitFork className="w-3.5 h-3.5 text-neutral-400" />
                    {resource.metadata.forks.toLocaleString()}
                  </div>
                </div>
              )}
              {resource.metadata.license && (
                <div>
                  <div className="text-neutral-500 text-[10px]">License</div>
                  <div className="font-medium text-[#EDEDED] mt-0.5 font-mono">
                    {resource.metadata.license}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Color Palette Swatches */}
        {resource.type === 'design' && resource.metadata?.colors && (
          <div className="p-4 rounded-md bg-[#0E0F10] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <span>Color Palette</span>
              {copiedHex && <span className="text-[#09AE5B] font-mono">Copied {copiedHex}</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {resource.metadata.colors.map((hex: string, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    navigator.clipboard.writeText(hex);
                    setCopiedHex(hex);
                    setTimeout(() => setCopiedHex(null), 1500);
                  }}
                  className="flex flex-col rounded-md overflow-hidden border border-white/[0.08] hover:border-white/20 transition-colors cursor-pointer"
                >
                  <div className="h-12 w-full flex items-center justify-center" style={{ backgroundColor: hex }}>
                    {copiedHex === hex && <Check className="w-4 h-4 text-black drop-shadow" />}
                  </div>
                  <span className="p-1.5 text-center font-mono text-[11px] bg-[#0E0F10] text-[#E5E5E5]">
                    {hex}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {resource.notes && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Personal Notes
            </div>
            <pre className="p-3.5 rounded-md bg-[#0E0F10] border border-white/[0.08] font-mono text-xs text-[#E5E5E5] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {resource.notes}
            </pre>
          </div>
        )}

        {/* Tags, Collections, and Projects Footer */}
        <div className="pt-4 border-t border-white/[0.08] space-y-3 text-xs">
          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-neutral-500 font-mono text-[11px]">Tags:</span>
              {resource.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-white/[0.04] text-neutral-300 border border-white/[0.06]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Collections */}
          {collectionList.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-neutral-500 font-mono text-[11px]">Collections:</span>
              {collectionList.map((col) => (
                <Link
                  key={col._id}
                  to={`/collections/${col._id}`}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border border-white/[0.08] bg-[#141519] text-[#E5E5E5] hover:border-white/20 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.color || '#09AE5B' }} />
                  <span>{col.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Projects */}
          {projectList.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-neutral-500 font-mono text-[11px]">Projects:</span>
              {projectList.map((proj) => (
                <Link
                  key={proj._id}
                  to={`/projects/${proj._id}`}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#141519] text-[#E5E5E5] border border-white/[0.08] hover:border-white/20 transition-colors"
                >
                  📁 {proj.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-white/[0.04]">
            <span>Added {formatDate(resource.createdAt)}</span>
            <span>Updated {formatRelativeTime(resource.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditResourceModal
        isOpen={isEditOpen}
        resource={resource}
        projects={projects}
        collections={collections}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => fetchResource()}
      />

      {/* Delete modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        title="Move Resource to Trash?"
        message={`Are you sure you want to move "${resource.title}" to trash? You can restore it anytime within 30 days.`}
        confirmText="Move to Trash"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ResourceDetailPage;