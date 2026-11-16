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

  const projectList = (resource.projectIds || []).filter(
    (p): p is any => typeof p === 'object' && p !== null
  );
  const collectionList = (resource.collectionIds || []).filter(
    (c): c is any => typeof c === 'object' && c !== null
  );

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
    if (
      resource.type === 'design' &&
      resource.metadata?.colors &&
      Array.isArray(resource.metadata.colors)
    ) {
      return (
        <div className="my-2.5 p-2 rounded-lg bg-[#f7f7f5] dark:bg-[#202026] border border-[#ececeb] dark:border-[#2a2a34]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#8e8d8a] dark:text-[#71717a] mb-1.5 flex items-center justify-between">
            <span>Color Swatches</span>
            {copiedColor && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied {copiedColor}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {resource.metadata.colors.slice(0, 5).map((color: string, idx: number) => (
              <button
                key={idx}
                type="button"
                title={`Click to copy ${color}`}
                onClick={(e) => handleCopyColor(e, color)}
                className="group/color relative flex-1 h-6 rounded border border-black/10 dark:border-white/10 shadow-2xs hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: color }}
              >
                {copiedColor === color && (
                  <Check className="w-3 h-3 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
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
        <div className="my-2 p-2.5 rounded-lg bg-[#f7f7f5] dark:bg-[#202026] border border-[#ececeb] dark:border-[#2a2a34]">
          <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-[#8e8d8a] dark:text-[#71717a] mb-0.5">
            <TypeIcon className="w-3 h-3" />
            <span>Sample Typography</span>
          </div>
          <p className="text-xs font-serif italic text-[#2b2a28] dark:text-[#f4f4f5]">
            Sphinx of black quartz, judge my vow.
          </p>
        </div>
      );
    }

    // 3. Development repository stats
    if (
      resource.type === 'development' &&
      (resource.metadata?.stars !== undefined || resource.metadata?.language)
    ) {
      const lang = resource.metadata?.language;
      const langColor = lang ? languageColors[lang] || '#8b949e' : null;

      return (
        <div className="flex flex-wrap items-center gap-2.5 my-2 text-xs text-[#5f5e5b] dark:text-[#a1a1aa]">
          {lang && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor || '#8b949e' }} />
              <span className="font-medium text-[#2b2a28] dark:text-[#f4f4f5] text-[11px]">{lang}</span>
            </span>
          )}
          {resource.metadata?.stars !== undefined && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px]" title="GitHub Stars">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500/20" />
              <span>{resource.metadata.stars.toLocaleString()}</span>
            </span>
          )}
          {resource.metadata?.forks !== undefined && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px]" title="Forks">
              <GitFork className="w-3 h-3 text-[#8e8d8a]" />
              <span>{resource.metadata.forks.toLocaleString()}</span>
            </span>
          )}
          {resource.metadata?.license && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#f0f0ee] dark:bg-[#202026] border border-[#e5e5e3] dark:border-[#2a2a34] text-[#5f5e5b] dark:text-[#a1a1aa]">
              {resource.metadata.license}
            </span>
          )}
        </div>
      );
    }

    // 4. Data / API
    if (resource.type === 'data') {
      return (
        <div className="flex items-center gap-2 my-2 text-xs">
          <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#f0f0ee] dark:bg-[#202026] text-[#2b2a28] dark:text-[#f4f4f5] border border-[#e5e5e3] dark:border-[#2a2a34]">
            {resource.metadata?.format?.toUpperCase() || 'REST / JSON'}
          </span>
          {resource.metadata?.authRequired !== undefined && (
            <span className="text-[10px] text-[#8e8d8a] dark:text-[#71717a] font-mono">
              {resource.metadata.authRequired ? '🔒 Auth Required' : '🔓 Public Endpoint'}
            </span>
          )}
        </div>
      );
    }

    // 5. Learning
    if (resource.type === 'learning' && (resource.metadata?.estimatedTime || resource.metadata?.platform)) {
      return (
        <div className="flex items-center gap-2 my-1.5 text-xs text-[#8e8d8a] dark:text-[#71717a]">
          {resource.metadata.platform && (
            <span className="font-medium text-[#5f5e5b] dark:text-[#a1a1aa] text-[11px]">
              {resource.metadata.platform}
            </span>
          )}
          {resource.metadata.estimatedTime && <span className="text-[11px]">• {resource.metadata.estimatedTime}</span>}
        </div>
      );
    }

    // 6. Personal / Notes
    if (resource.type === 'personal' && resource.notes) {
      return (
        <div className="my-2 p-2 rounded-md bg-[#f7f7f5] dark:bg-[#1a1a20] border border-[#ececeb] dark:border-[#26262c] text-[11px] font-mono text-[#5f5e5b] dark:text-[#a1a1aa] line-clamp-2 leading-relaxed">
          {resource.notes}
        </div>
      );
    }

    return null;
  };

  // LIST VIEW LAYOUT (Notion-style High Density Row)
  if (viewMode === 'list') {
    return (
      <div className="group relative flex items-center justify-between p-3 bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] rounded-xl hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-all hover:shadow-2xs">
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
          {/* Favicon or Type Icon */}
          <div className="w-7 h-7 rounded-md bg-[#f7f7f5] dark:bg-[#202026] flex items-center justify-center shrink-0 border border-[#ececeb] dark:border-[#2a2a34] overflow-hidden">
            {resource.favicon ? (
              <img
                src={resource.favicon}
                alt=""
                className="w-3.5 h-3.5 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-[#8e8d8a]">{typeIcons[resource.type]}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/library/${resource._id}`}
                className="font-medium text-xs sm:text-sm text-[#2b2a28] dark:text-[#f4f4f5] hover:text-black dark:hover:text-white truncate"
              >
                {resource.title}
              </Link>
              <Badge type={resource.type} size="sm">
                {resource.type}
              </Badge>
              {domain && (
                <span className="text-[11px] font-mono text-[#8e8d8a] dark:text-[#71717a] hidden sm:inline">
                  {domain}
                </span>
              )}
            </div>

            {resource.description && (
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] truncate mt-0.5">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        {/* List Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] text-[#8e8d8a] dark:text-[#71717a] mr-2 hidden md:inline font-mono">
            {formatRelativeTime(resource.createdAt)}
          </span>

          <button
            onClick={() => onToggleFavourite(resource._id)}
            className={cn(
              'p-1.5 rounded-md hover:bg-[#f2f2ef] dark:hover:bg-[#22222a] transition-colors cursor-pointer',
              resource.isFavourite ? 'text-amber-500' : 'text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white'
            )}
            title={resource.isFavourite ? 'Favorited' : 'Add to favorites'}
          >
            <Star className={cn('w-3.5 h-3.5', resource.isFavourite && 'fill-amber-500')} />
          </button>

          {resource.url && (
            <button
              onClick={handleCopyUrl}
              className="p-1.5 rounded-md text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white hover:bg-[#f2f2ef] dark:hover:bg-[#22222a] transition-colors cursor-pointer"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white hover:bg-[#f2f2ef] dark:hover:bg-[#22222a] transition-colors"
              title="Visit link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => onEdit(resource)}
            className="p-1.5 rounded-md text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white hover:bg-[#f2f2ef] dark:hover:bg-[#22222a] transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(resource._id)}
            className="p-1.5 rounded-md text-[#8e8d8a] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Move to trash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // GRID VIEW LAYOUT (LinkNest & Notion Card)
  return (
    <div className="group relative flex flex-col justify-between p-4 bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] rounded-xl hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-all hover:shadow-2xs">
      <div>
        {/* Top Header: Badge + Actions */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge type={resource.type} size="sm">
            {typeIcons[resource.type]}
            {resource.type}
          </Badge>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleFavourite(resource._id)}
              className={cn(
                'p-1 rounded hover:bg-[#f2f2ef] dark:hover:bg-[#22222a] transition-colors cursor-pointer',
                resource.isFavourite ? 'text-amber-500' : 'text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white'
              )}
              title={resource.isFavourite ? 'Favorited' : 'Add to favorites'}
            >
              <Star className={cn('w-3.5 h-3.5', resource.isFavourite && 'fill-amber-500')} />
            </button>

            {resource.url && (
              <button
                onClick={handleCopyUrl}
                className="p-1 rounded text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white hover:bg-[#f2f2ef] dark:hover:bg-[#22222a] transition-colors cursor-pointer"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white hover:bg-[#f2f2ef] dark:hover:bg-[#22222a] transition-colors"
                title="Open URL"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => onEdit(resource)}
              className="p-1 rounded text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white hover:bg-[#f2f2ef] dark:hover:bg-[#22222a] transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(resource._id)}
              className="p-1 rounded text-[#8e8d8a] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Move to trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Thumbnail Preview if available (LinkNest style preview) */}
        {resource.previewImage && (
          <div className="w-full h-28 mb-2.5 rounded-lg overflow-hidden border border-[#ececeb] dark:border-[#26262c] bg-[#f7f7f5] dark:bg-[#202026]">
            <img
              src={resource.previewImage}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
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
          className="font-semibold text-xs sm:text-sm text-[#2b2a28] dark:text-[#f4f4f5] hover:text-black dark:hover:text-white line-clamp-1 block transition-colors"
        >
          {resource.title}
        </Link>

        {/* Domain with clean favicon badge */}
        {domain && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8e8d8a] dark:text-[#71717a] mt-1">
            {resource.favicon ? (
              <img
                src={resource.favicon}
                alt=""
                className="w-3 h-3 object-contain rounded-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-3 h-3 text-[#8e8d8a]" />
            )}
            <span>{domain}</span>
          </div>
        )}

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] line-clamp-2 mt-1.5 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Type-specific metadata preview */}
        {renderTypeSpecificPreview()}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {resource.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#f2f2ef] dark:bg-[#202026] text-[#5f5e5b] dark:text-[#a1a1aa] border border-[#e5e5e3] dark:border-[#2a2a34]"
              >
                #{tag}
              </span>
            ))}
            {resource.tags.length > 4 && (
              <span className="text-[10px] text-[#8e8d8a] dark:text-[#71717a] font-mono">
                +{resource.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Collection / Project Pills + Date */}
      <div className="mt-3 pt-2.5 border-t border-[#f1f1ef] dark:border-[#222227] flex items-center justify-between text-[11px] text-[#8e8d8a] dark:text-[#71717a]">
        <div className="flex items-center gap-1 truncate pr-2">
          {collectionList.map((col: any) => (
            <span
              key={col._id}
              className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] border truncate font-sans"
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
              className="px-1.5 py-0.2 rounded text-[10px] bg-[#f2f2ef] dark:bg-[#202026] text-[#5f5e5b] dark:text-[#a1a1aa] border border-[#e5e5e3] dark:border-[#2a2a34] truncate max-w-[90px]"
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
