import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ExternalLink,
  Trash2,
  Edit2,
  Copy,
  Check,
  GitFork,
  BookOpen,
  Code2,
  Database,
  Palette,
  Layout,
  FileText,
  Type as TypeIcon,
  Globe,
} from 'lucide-react';
import type { Resource, ResourceType } from '../../types';
import { Badge } from '../ui/Badge';
import { cn, formatRelativeTime } from '../../lib/utils';

export interface ResourceCardProps {
  resource: Resource;
  viewMode?: 'grid' | 'list';
  onToggleFavourite: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (resource: Resource) => void;
}

const typeIcons: Record<ResourceType, React.ReactNode> = {
  design: <Palette className="w-3.5 h-3.5" />,
  ui: <Layout className="w-3.5 h-3.5" />,
  development: <Code2 className="w-3.5 h-3.5" />,
  data: <Database className="w-3.5 h-3.5" />,
  learning: <BookOpen className="w-3.5 h-3.5" />,
  personal: <FileText className="w-3.5 h-3.5" />,
};

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#eab308',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  viewMode = 'grid',
  onToggleFavourite,
  onDelete,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (resource.url) {
      navigator.clipboard.writeText(resource.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyColor = (e: React.MouseEvent, hex: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const projectList = (resource.projectIds || []).filter((p): p is any => typeof p === 'object' && p !== null);
  const collectionList = (resource.collectionIds || []).filter((c): c is any => typeof c === 'object' && c !== null);

  // Extract domain name cleanly
  const domain = resource.url
    ? (() => {
        try {
          return new URL(resource.url).hostname.replace(/^www\./, '');
        } catch {
          return null;
        }
      })()
    : null;

  // Type-specific preview snippet
  const renderTypeSpecificPreview = () => {
    // 1. Design with color swatches
    if (resource.type === 'design' && resource.metadata?.colors && Array.isArray(resource.metadata.colors)) {
      return (
        <div className="my-3 p-2.5 rounded-lg bg-[#f5f2eb]/70 dark:bg-[#1f1d1a] border border-[#e8e3d8] dark:border-[#2b2824]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#8a8277] mb-2 flex items-center justify-between">
            <span>Color Swatches</span>
            {copiedColor && <span className="text-[#1e3a2f] dark:text-[#86efac]">Copied {copiedColor}</span>}
          </div>
          <div className="flex items-center gap-2">
            {resource.metadata.colors.slice(0, 5).map((color: string, idx: number) => (
              <button
                key={idx}
                type="button"
                title={`Click to copy ${color}`}
                onClick={(e) => handleCopyColor(e, color)}
                className="group/color relative flex-1 h-7 rounded-md border border-black/10 dark:border-white/10 shadow-xs hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: color }}
              >
                {copiedColor === color && (
                  <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // 2. Font / Typography Preview
    if (resource.type === 'ui' && resource.tags?.includes('font')) {
      return (
        <div className="my-2.5 p-3 rounded-lg bg-[#f5f2eb]/60 dark:bg-[#1f1d1a] border border-[#e8e3d8] dark:border-[#2b2824]">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-[#8a8277] mb-1">
            <TypeIcon className="w-3 h-3" />
            <span>Font Sample</span>
          </div>
          <p className="text-sm font-medium text-[#191715] dark:text-[#f5f2ec] italic">
            Sphinx of black quartz, judge my vow.
          </p>
        </div>
      );
    }

    // 3. Development repository stats
    if (resource.type === 'development' && (resource.metadata?.stars !== undefined || resource.metadata?.language)) {
      const lang = resource.metadata?.language;
      const langColor = lang ? languageColors[lang] || '#8b949e' : null;

      return (
        <div className="flex flex-wrap items-center gap-3 my-2.5 text-xs text-[#57524b] dark:text-[#aba499]">
          {lang && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor || '#8b949e' }} />
              <span className="font-medium text-[#191715] dark:text-[#f5f2ec]">{lang}</span>
            </span>
          )}
          {resource.metadata?.stars !== undefined && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px]" title="GitHub Stars">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>{resource.metadata.stars.toLocaleString()}</span>
            </span>
          )}
          {resource.metadata?.forks !== undefined && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px]" title="Forks">
              <GitFork className="w-3.5 h-3.5 text-[#8a8277]" />
              <span>{resource.metadata.forks.toLocaleString()}</span>
            </span>
          )}
          {resource.metadata?.license && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#f5f2eb] dark:bg-[#22201d] border border-[#e2dcd0] dark:border-[#2f2c27] text-[#57524b] dark:text-[#aba499]">
              {resource.metadata.license}
            </span>
          )}
        </div>
      );
    }

    // 4. Data / API
    if (resource.type === 'data') {
      return (
        <div className="flex items-center gap-2 my-2.5 text-xs">
          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#f5f2eb] dark:bg-[#22201d] text-[#191715] dark:text-[#f5f2ec] border border-[#e2dcd0] dark:border-[#2f2c27]">
            {resource.metadata?.format?.toUpperCase() || 'REST / JSON'}
          </span>
          {resource.metadata?.authRequired !== undefined && (
            <span className="text-[11px] text-[#8a8277] font-mono">
              {resource.metadata.authRequired ? '🔒 Auth Required' : '🔓 Public Endpoint'}
            </span>
          )}
        </div>
      );
    }

    // 5. Learning
    if (resource.type === 'learning' && (resource.metadata?.estimatedTime || resource.metadata?.platform)) {
      return (
        <div className="flex items-center gap-2 my-2 text-xs text-[#8a8277]">
          {resource.metadata.platform && <span className="font-medium text-[#57524b] dark:text-[#aba499]">{resource.metadata.platform}</span>}
          {resource.metadata.estimatedTime && <span>• {resource.metadata.estimatedTime}</span>}
        </div>
      );
    }

    // 6. Personal / Notes
    if (resource.type === 'personal' && resource.notes) {
      return (
        <div className="my-2.5 p-2.5 rounded-lg bg-[#f5f2eb]/70 dark:bg-[#1a1917] border border-[#e6e0d5] dark:border-[#2b2824] text-xs font-mono text-[#57524b] dark:text-[#aba499] line-clamp-2 leading-relaxed">
          {resource.notes}
        </div>
      );
    }

    return null;
  };

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <div className="group relative flex items-center justify-between p-3.5 bg-white dark:bg-[#191816] border border-[#e6e0d5] dark:border-[#2b2824] rounded-xl hover:border-[#ded8cb] dark:hover:border-[#38342e] transition-all hover:shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
          {/* Favicon or Type Icon */}
          <div className="w-8 h-8 rounded-lg bg-[#f5f2eb] dark:bg-[#22201d] flex items-center justify-center shrink-0 border border-[#e2dcd0] dark:border-[#2f2c27] overflow-hidden">
            {resource.favicon ? (
              <img
                src={resource.favicon}
                alt=""
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-[#8a8277]">{typeIcons[resource.type]}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/library/${resource._id}`}
                className="font-medium text-sm text-[#191715] dark:text-[#f5f2ec] hover:text-[#1e3a2f] dark:hover:text-[#6ee7b7] truncate"
              >
                {resource.title}
              </Link>
              <Badge type={resource.type} size="sm">
                {resource.type}
              </Badge>
              {domain && (
                <span className="text-[11px] font-mono text-[#8a8277] hidden sm:inline">
                  {domain}
                </span>
              )}
            </div>

            {resource.description && (
              <p className="text-xs text-[#57524b] dark:text-[#aba499] truncate mt-0.5">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        {/* List Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-[#8a8277] mr-2 hidden md:inline font-mono">
            {formatRelativeTime(resource.createdAt)}
          </span>

          <button
            onClick={() => onToggleFavourite(resource._id)}
            className={cn(
              'p-1.5 rounded-md hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] transition-colors cursor-pointer',
              resource.isFavourite ? 'text-amber-500' : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
            )}
            title={resource.isFavourite ? 'Favorited' : 'Add to favorites'}
          >
            <Star className={cn('w-4 h-4', resource.isFavourite && 'fill-amber-500')} />
          </button>

          {resource.url && (
            <button
              onClick={handleCopyUrl}
              className="p-1.5 rounded-md text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] transition-colors cursor-pointer"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-[#1e3a2f] dark:text-[#6ee7b7]" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] transition-colors"
              title="Visit link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => onEdit(resource)}
            className="p-1.5 rounded-md text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(resource._id)}
            className="p-1.5 rounded-md text-[#8a8277] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            title="Move to trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // GRID VIEW LAYOUT (Editorial Card)
  return (
    <div className="group relative flex flex-col justify-between p-4.5 bg-white dark:bg-[#191816] border border-[#e6e0d5] dark:border-[#2b2824] rounded-xl hover:border-[#ded8cb] dark:hover:border-[#38342e] transition-all hover:shadow-xs">
      <div>
        {/* Top Header: Badge + Actions */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge type={resource.type} size="sm">
            {typeIcons[resource.type]}
            {resource.type}
          </Badge>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleFavourite(resource._id)}
              className={cn(
                'p-1 rounded-md hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] transition-colors cursor-pointer',
                resource.isFavourite ? 'text-amber-500' : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
              )}
              title={resource.isFavourite ? 'Favorited' : 'Add to favorites'}
            >
              <Star className={cn('w-4 h-4', resource.isFavourite && 'fill-amber-500')} />
            </button>

            {resource.url && (
              <button
                onClick={handleCopyUrl}
                className="p-1 rounded-md text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] transition-colors cursor-pointer"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#1e3a2f] dark:text-[#6ee7b7]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-md text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] transition-colors"
                title="Open URL"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => onEdit(resource)}
              className="p-1 rounded-md text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(resource._id)}
              className="p-1 rounded-md text-[#8a8277] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Move to trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Thumbnail Preview if available */}
        {resource.previewImage && (
          <div className="w-full h-32 mb-3 rounded-lg overflow-hidden border border-[#e6e0d5] dark:border-[#2b2824] bg-[#f5f2eb] dark:bg-[#22201d]">
            <img
              src={resource.previewImage}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Title */}
        <Link
          to={`/library/${resource._id}`}
          className="font-medium text-sm text-[#191715] dark:text-[#f5f2ec] hover:text-[#1e3a2f] dark:hover:text-[#6ee7b7] line-clamp-1 group-hover:underline"
        >
          {resource.title}
        </Link>

        {/* Domain if exists */}
        {domain && (
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#8a8277] mt-0.5">
            <Globe className="w-3 h-3 text-[#8a8277]" />
            <span>{domain}</span>
          </div>
        )}

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-[#57524b] dark:text-[#aba499] line-clamp-2 mt-1.5 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Type-specific metadata preview */}
        {renderTypeSpecificPreview()}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {resource.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f5f2eb] dark:bg-[#22201d] text-[#57524b] dark:text-[#aba499] border border-[#e6e0d5] dark:border-[#2b2824]"
              >
                #{tag}
              </span>
            ))}
            {resource.tags.length > 4 && (
              <span className="text-[10px] text-[#8a8277] font-mono">+{resource.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Project/Collection pills + Date */}
      <div className="mt-4 pt-3 border-t border-[#ede8df] dark:border-[#24221f] flex items-center justify-between text-[11px] text-[#8a8277]">
        <div className="flex items-center gap-1.5 truncate pr-2">
          {collectionList.map((col: any) => (
            <span
              key={col._id}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border truncate font-mono"
              style={{
                backgroundColor: `${col.color}10`,
                borderColor: `${col.color}30`,
                color: col.color,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
              <span className="truncate max-w-[80px]">{col.name}</span>
            </span>
          ))}

          {projectList.map((proj: any) => (
            <span
              key={proj._id}
              className="px-1.5 py-0.5 rounded text-[10px] bg-[#f5f2eb] dark:bg-[#22201d] text-[#57524b] dark:text-[#aba499] border border-[#e6e0d5] dark:border-[#2b2824] truncate max-w-[90px]"
            >
              📁 {proj.name}
            </span>
          ))}
        </div>

        <span className="shrink-0 font-mono text-[10px]">{formatRelativeTime(resource.createdAt)}</span>
      </div>
    </div>
  );
};
