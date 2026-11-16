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
  design: <Palette className="w-4 h-4" />,
  ui: <Layout className="w-4 h-4" />,
  development: <Code2 className="w-4 h-4" />,
  data: <Database className="w-4 h-4" />,
  learning: <BookOpen className="w-4 h-4" />,
  personal: <FileText className="w-4 h-4" />,
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
        <div className="w-8 h-8 border-2 border-[#1e3a2f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs text-[#8a8277]">Loading resource details...</span>
      </div>
    );
  }

  const projectList = (resource.projectIds || []).filter((p): p is Project => typeof p === 'object' && p !== null);
  const collectionList = (resource.collectionIds || []).filter((c): c is Collection => typeof c === 'object' && c !== null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>

        {/* Action button toolbar */}
        <div className="flex items-center gap-2">
          {resource.url && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshMetadata}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              title="Refresh OpenGraph & GitHub metadata"
            >
              Refresh
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavourite}
            leftIcon={
              <Star
                className={cn('w-3.5 h-3.5', resource.isFavourite && 'text-amber-500 fill-amber-500')}
              />
            }
          >
            {resource.isFavourite ? 'Favorited' : 'Favorite'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleArchive}
            leftIcon={<Archive className="w-3.5 h-3.5" />}
          >
            {resource.status === 'archived' ? 'Unarchive' : 'Archive'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Move to trash"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Resource Card */}
      <div className="bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge type={resource.type}>
                {typeIcons[resource.type]}
                {resource.type}
              </Badge>
              {resource.status === 'archived' && (
                <span className="text-xs px-2 py-0.5 rounded bg-[#f5f2eb] dark:bg-[#201e1b] text-[#8a8277]">
                  Archived
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#191715] dark:text-[#f5f2ec]">
              {resource.title}
            </h1>

            {resource.url && (
              <div className="flex items-center gap-2 text-xs">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1e3a2f] dark:text-[#86efac] hover:underline flex items-center gap-1 font-mono truncate max-w-md"
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
                  className="text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] p-1 rounded cursor-pointer"
                  title="Copy URL"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#1e3a2f] dark:text-[#86efac]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1e3a2f] hover:bg-[#152b22] dark:bg-[#2d5d45] text-white text-xs font-medium shadow-xs shrink-0"
            >
              <span>Visit Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Thumbnail Preview Banner */}
        {resource.previewImage && (
          <div className="w-full max-h-72 rounded-xl overflow-hidden border border-[#ded8cb] dark:border-[#2f2c27] bg-[#f5f2eb] dark:bg-[#201e1b]">
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
          <div className="text-sm text-[#57524b] dark:text-[#aba499] leading-relaxed">
            {resource.description}
          </div>
        )}

        {/* TYPE SPECIFIC METADATA PANEL */}
        {/* 1. Development / GitHub */}
        {resource.type === 'development' && resource.metadata && (
          <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#ded8cb] dark:border-[#2f2c27] space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a8277]">
              Repository Information
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {resource.metadata.language && (
                <div>
                  <div className="text-[#8a8277] text-[11px]">Primary Language</div>
                  <div className="font-semibold text-[#191715] dark:text-[#f5f2ec] mt-0.5">
                    {resource.metadata.language}
                  </div>
                </div>
              )}
              {resource.metadata.stars !== undefined && (
                <div>
                  <div className="text-[#8a8277] text-[11px]">Stars</div>
                  <div className="font-semibold text-[#191715] dark:text-[#f5f2ec] mt-0.5 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {resource.metadata.stars.toLocaleString()}
                  </div>
                </div>
              )}
              {resource.metadata.forks !== undefined && (
                <div>
                  <div className="text-[#8a8277] text-[11px]">Forks</div>
                  <div className="font-semibold text-[#191715] dark:text-[#f5f2ec] mt-0.5 flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5 text-[#8a8277]" />
                    {resource.metadata.forks.toLocaleString()}
                  </div>
                </div>
              )}
              {resource.metadata.license && (
                <div>
                  <div className="text-[#8a8277] text-[11px]">License</div>
                  <div className="font-semibold text-[#191715] dark:text-[#f5f2ec] mt-0.5 font-mono">
                    {resource.metadata.license}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Design Palettes */}
        {resource.type === 'design' && resource.metadata?.colors && (
          <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#ded8cb] dark:border-[#2f2c27] space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a8277]">
              Color Palette (Click to copy hex)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {resource.metadata.colors.map((hex: string, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    navigator.clipboard.writeText(hex);
                    setCopiedHex(hex);
                    setTimeout(() => setCopiedHex(null), 1500);
                  }}
                  className="flex flex-col rounded-lg overflow-hidden border border-[#ded8cb] dark:border-[#2f2c27] group text-left transition-transform hover:scale-102 cursor-pointer"
                >
                  <div className="h-14 w-full flex items-center justify-center" style={{ backgroundColor: hex }}>
                    {copiedHex === hex && (
                      <span className="text-xs px-2 py-0.5 rounded bg-black/75 text-white font-mono">
                        Copied!
                      </span>
                    )}
                  </div>
                  <div className="p-2 bg-white dark:bg-[#191816] text-xs font-mono font-medium text-[#57524b] dark:text-[#aba499]">
                    {hex}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Personal Notes / Markdown */}
        {resource.notes && (
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a8277]">
              Personal Notes & Code Snippets
            </div>
            <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#ded8cb] dark:border-[#2f2c27] font-mono text-xs text-[#191715] dark:text-[#f5f2ec] whitespace-pre-wrap leading-relaxed">
              {resource.notes}
            </div>
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a8277]">Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {resource.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/library?tag=${tag}`}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#f5f2eb] dark:bg-[#201e1b] text-[#57524b] dark:text-[#aba499] border border-[#ded8cb] dark:border-[#2f2c27] hover:border-[#1e3a2f] transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Associated Collections & Projects */}
        <div className="pt-4 border-t border-[#ede8df] dark:border-[#24221f] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#8a8277] block mb-1.5 font-medium">Collections</span>
            {collectionList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {collectionList.map((col) => (
                  <Link
                    key={col._id}
                    to={`/collections/${col._id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono"
                    style={{
                      backgroundColor: `${col.color}10`,
                      borderColor: `${col.color}30`,
                      color: col.color,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span>{col.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <span className="text-[#8a8277]">Not assigned to any collection</span>
            )}
          </div>

          <div>
            <span className="text-[#8a8277] block mb-1.5 font-medium">Projects</span>
            {projectList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {projectList.map((proj) => (
                  <Link
                    key={proj._id}
                    to={`/projects/${proj._id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f5f2eb] dark:bg-[#201e1b] border border-[#ded8cb] dark:border-[#2f2c27] text-[#57524b] dark:text-[#aba499]"
                  >
                    📁 {proj.name}
                  </Link>
                ))}
              </div>
            ) : (
              <span className="text-[#8a8277]">Not assigned to any project</span>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="pt-4 border-t border-[#ede8df] dark:border-[#24221f] flex items-center justify-between text-[11px] font-mono text-[#8a8277]">
          <span>Added on {formatDate(resource.createdAt)}</span>
          <span>Last updated {formatRelativeTime(resource.updatedAt)}</span>
        </div>
      </div>

      {/* Edit Modal */}
      <EditResourceModal
        isOpen={isEditOpen}
        resource={resource}
        projects={projects}
        collections={collections}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => fetchResource()}
      />

      {/* Delete confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};
