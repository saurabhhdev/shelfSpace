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
      <div className="py-20 text-center">
        <div className="w-6 h-6 border-2 border-zinc-950 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs text-[#8e8d8a]">Loading resource...</span>
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
          className="inline-flex items-center gap-1.5 text-xs text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white transition-colors"
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
                className={cn('w-3 h-3', resource.isFavourite && 'text-amber-500 fill-amber-500')}
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
            className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            title="Move to trash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Resource Card */}
      <div className="bg-[#121316] border border-white/10 rounded-none p-6 sm:p-7 space-y-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge type={resource.type}>
                {typeIcons[resource.type]}
                {resource.type}
              </Badge>
              {resource.status === 'archived' && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-none bg-[#141519] text-[#09AE5B] border border-white/10">
                  Archived
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#E5E5E5]">
              {resource.title}
            </h1>

            {resource.url && (
              <div className="flex items-center gap-2 text-xs">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#09AE5B] hover:underline flex items-center gap-1 font-mono truncate max-w-md"
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
                  className="text-neutral-400 hover:text-white p-1 rounded-none cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-[#09AE5B] hover:bg-[#07914b] text-black text-xs font-semibold shadow-none shrink-0 transition-all cursor-pointer"
            >
              <span>Visit Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Thumbnail Preview Banner */}
        {resource.previewImage && (
          <div className="w-full max-h-72 rounded-none overflow-hidden border border-white/10 bg-[#0E0F10]">
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
          <div className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {resource.description}
          </div>
        )}

        {/* TYPE SPECIFIC METADATA PANEL */}
        {/* 1. Development / GitHub */}
        {resource.type === 'development' && resource.metadata && (
          <div className="p-4 rounded-none bg-[#0E0F10] border border-white/10 space-y-2.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#09AE5B]">
              Repository Metrics
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {resource.metadata.language && (
                <div>
                  <div className="text-neutral-400 text-[10px]">Primary Language</div>
                  <div className="font-semibold text-[#E5E5E5] mt-0.5 font-mono">
                    {resource.metadata.language}
                  </div>
                </div>
              )}
              {resource.metadata.stars !== undefined && (
                <div>
                  <div className="text-neutral-400 text-[10px]">Stars</div>
                  <div className="font-semibold text-[#E5E5E5] mt-0.5 flex items-center gap-1 font-mono">
                    <Star className="w-3.5 h-3.5 text-[#09AE5B] fill-[#09AE5B]" />
                    {resource.metadata.stars.toLocaleString()}
                  </div>
                </div>
              )}
              {resource.metadata.forks !== undefined && (
                <div>
                  <div className="text-neutral-400 text-[10px]">Forks</div>
                  <div className="font-semibold text-[#E5E5E5] mt-0.5 flex items-center gap-1 font-mono">
                    <GitFork className="w-3.5 h-3.5 text-neutral-400" />
                    {resource.metadata.forks.toLocaleString()}
                  </div>
                </div>
              )}
              {resource.metadata.license && (
                <div>
                  <div className="text-neutral-400 text-[10px]">License</div>
                  <div className="font-semibold text-[#E5E5E5] mt-0.5 font-mono">
                    {resource.metadata.license}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Design Palettes */}
        {resource.type === 'design' && resource.metadata?.colors && (
          <div className="p-4 rounded-none bg-[#0E0F10] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              <span>Color Palette Swatches</span>
              {copiedHex && <span className="text-[#09AE5B] font-semibold font-mono">Copied {copiedHex}</span>}
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
                  className="flex flex-col rounded-none overflow-hidden border border-white/10 hover:border-[#09AE5B] transition-colors cursor-pointer"
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

        {/* 3. Notes / Code snippet */}
        {resource.notes && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#09AE5B] font-mono">
              Personal Notes & Code Snippet
            </div>
            <pre className="p-3.5 rounded-none bg-[#0E0F10] border border-white/10 font-mono text-xs text-[#E5E5E5] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {resource.notes}
            </pre>
          </div>
        )}

        {/* 4. Tags, Collections, and Projects Footer */}
        <div className="pt-4 border-t border-white/[0.08] space-y-3 text-xs">
          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-neutral-400 font-mono text-[11px]">Tags:</span>
              {resource.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-none font-mono text-[11px] bg-[#141519] text-[#09AE5B] border border-white/10"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Collections */}
          {collectionList.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-neutral-400 font-mono text-[11px]">Collections:</span>
              {collectionList.map((col) => (
                <Link
                  key={col._id}
                  to={`/collections/${col._id}`}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none font-mono text-[11px] border border-white/10 bg-[#141519] text-[#E5E5E5] hover:border-[#09AE5B]/60 hover:text-[#09AE5B] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: col.color || '#09AE5B' }} />
                  <span>{col.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Projects */}
          {projectList.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#9ca3af] font-mono text-[11px]">Projects:</span>
              {projectList.map((proj) => (
                <Link
                  key={proj._id}
                  to={`/projects/${proj._id}`}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#16161a] text-[#f4f4f6] border border-[#272730] hover:border-[#059669]/60 hover:text-[#059669] transition-colors"
                >
                  📁 {proj.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] font-mono text-[#636370] pt-2 border-t border-[#1f1f26]">
            <span>Added {formatDate(resource.createdAt)}</span>
            <span>Last updated {formatRelativeTime(resource.updatedAt)}</span>
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

