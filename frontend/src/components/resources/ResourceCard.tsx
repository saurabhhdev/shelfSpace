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
        <div className="my-2 p-2 rounded-none bg-[#0E0F10] border border-white/[0.06]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
            <span>Color Swatches</span>
            {copiedColor && <span className="text-[#09AE5B] font-semibold font-mono">Copied {copiedColor}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {resource.metadata.colors.slice(0, 5).map((color: string, idx: number) => (
              <button
                key={idx}
                type="button"
                title={`Click to copy ${color}`}
                onClick={(e) => handleCopyColor(e, color)}
                className="group/color relative flex-1 h-5 rounded-none border border-white/10 hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: color }}
              >
                {copiedColor === color && (
                  <Check className="w-2.5 h-2.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
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
        <div className="my-2 p-2 rounded-none bg-[#0E0F10] border border-white/[0.06]">
          <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-neutral-400 mb-0.5">
            <TypeIcon className="w-3 h-3 text-[#09AE5B]" />
            <span>Sample Typography</span>
          </div>
          <p className="text-xs font-serif italic text-[#E5E5E5]">
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
        <div className="flex flex-wrap items-center gap-2.5 my-2 text-xs text-neutral-400">
          {lang && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: langColor || '#8b949e' }} />
              <span className="font-medium text-[#E5E5E5] text-[11px] font-mono">{lang}</span>
            </span>
          )}
          {resource.metadata?.stars !== undefined && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px]" title="GitHub Stars">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{resource.metadata.stars.toLocaleString()}</span>
            </span>
          )}
          {resource.metadata?.forks !== undefined && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px]" title="Forks">
              <GitFork className="w-3 h-3 text-neutral-400" />
              <span>{resource.metadata.forks.toLocaleString()}</span>
            </span>
          )}
          {resource.metadata?.license && (
            <span className="px-1.5 py-0.5 rounded-none text-[10px] font-mono bg-white/[0.05] text-[#09AE5B] border border-white/[0.06]">
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
          <span className="px-1.5 py-0.5 rounded-none font-mono text-[10px] bg-white/[0.05] text-[#09AE5B] border border-white/[0.06]">
            {resource.metadata?.format?.toUpperCase() || 'REST / JSON'}
          </span>
          {resource.metadata?.authRequired !== undefined && (
            <span className="text-[10px] text-neutral-400 font-mono">
              {resource.metadata.authRequired ? '🔒 Auth Required' : '🔓 Public'}
            </span>
          )}
        </div>
      );
    }

    // 5. Learning
    if (resource.type === 'learning' && (resource.metadata?.estimatedTime || resource.metadata?.platform)) {
      return (
        <div className="flex items-center gap-2 my-1.5 text-xs text-neutral-400">
          {resource.metadata.platform && (
            <span className="font-medium text-[#E5E5E5] text-[11px]">
              {resource.metadata.platform}
            </span>
          )}
          {resource.metadata.estimatedTime && <span className="text-[11px] font-mono">• {resource.metadata.estimatedTime}</span>}
        </div>
      );
    }

    // 6. Personal / Notes
    if (resource.type === 'personal' && resource.notes) {
      return (
        <div className="my-2 p-2 rounded-none bg-[#0E0F10] border border-white/[0.06] text-[11px] font-mono text-neutral-300 line-clamp-2 leading-relaxed">
          {resource.notes}
        </div>
      );
    }

    return null;
  };

  // LIST VIEW LAYOUT (Sharp Linear Row)
  if (viewMode === 'list') {
    return (
      <div className="group relative flex items-center justify-between p-3 bg-[#121316] border border-white/[0.08] rounded-none hover:border-white/20 transition-all">
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
          {/* Favicon or Type Icon */}
          <div className="w-8 h-8 rounded-none bg-[#141519] flex items-center justify-center shrink-0 border border-white/[0.08] overflow-hidden">
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
              <span className="text-[#09AE5B]">{typeIcons[resource.type]}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/library/${resource._id}`}
                className="font-semibold text-xs sm:text-sm text-[#E5E5E5] hover:text-[#09AE5B] truncate transition-colors"
              >
                {resource.title}
              </Link>
              <Badge type={resource.type} size="sm">
                {resource.type}
              </Badge>
              {domain && (
                <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                  {domain}
                </span>
              )}
            </div>

            {resource.description && (
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        {/* List Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] text-neutral-400 mr-2 hidden md:inline font-mono">
            {formatRelativeTime(resource.createdAt)}
          </span>

          <button
            onClick={() => onToggleFavourite(resource._id)}
            className={cn(
              'p-1.5 rounded-none hover:bg-white/[0.06] transition-colors cursor-pointer',
              resource.isFavourite ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
            )}
            title={resource.isFavourite ? 'Favorited' : 'Add to favorites'}
          >
            <Star className={cn('w-3.5 h-3.5', resource.isFavourite && 'fill-amber-400 text-amber-400')} />
          </button>

          {resource.url && (
            <button
              onClick={handleCopyUrl}
              className="p-1.5 rounded-none text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#09AE5B]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-none text-neutral-400 hover:text-[#09AE5B] hover:bg-white/[0.06] transition-colors"
              title="Visit link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => onEdit(resource)}
            className="p-1.5 rounded-none text-neutral-400 hover:text-[#09AE5B] hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(resource._id)}
            className="p-1.5 rounded-none text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
            title="Move to trash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // GRID VIEW LAYOUT (Sharp Box)
  return (
    <div className="group relative flex flex-col justify-between p-4 bg-[#121316] border border-white/[0.08] hover:border-[#09AE5B]/30 hover:bg-[#14161a] rounded-none transition-all shadow-sm hover:shadow-md">
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
                'p-1 rounded-none hover:bg-white/[0.06] transition-colors cursor-pointer',
                resource.isFavourite ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
              )}
              title={resource.isFavourite ? 'Favorited' : 'Add to favorites'}
            >
              <Star className={cn('w-3.5 h-3.5', resource.isFavourite && 'fill-amber-400 text-amber-400')} />
            </button>

            {resource.url && (
              <button
                onClick={handleCopyUrl}
                className="p-1 rounded-none text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#09AE5B]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-none text-neutral-400 hover:text-[#09AE5B] hover:bg-white/[0.06] transition-colors"
                title="Open URL"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => onEdit(resource)}
              className="p-1 rounded-none text-neutral-400 hover:text-[#09AE5B] hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(resource._id)}
              className="p-1 rounded-none text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
              title="Move to trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Thumbnail Preview if available */}
        {resource.previewImage && (
          <div className="w-full h-28 mb-2.5 rounded-none overflow-hidden border border-white/[0.08] bg-[#0E0F10]">
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
          className="font-semibold text-xs sm:text-sm text-[#E5E5E5] hover:text-[#09AE5B] line-clamp-1 block transition-colors mt-1"
        >
          {resource.title}
        </Link>

        {/* Domain with clean favicon badge */}
        {domain && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 mt-1">
            {resource.favicon ? (
              <img
                src={resource.favicon}
                alt=""
                className="w-3.5 h-3.5 object-contain rounded-none"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-3.5 h-3.5 text-[#09AE5B]" />
            )}
            <span>{domain}</span>
          </div>
        )}

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
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
                className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-white/[0.05] text-neutral-300 border border-white/[0.06]"
              >
                #{tag}
              </span>
            ))}
            {resource.tags.length > 4 && (
              <span className="text-[10px] text-neutral-400 font-mono self-center">
                +{resource.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Collection / Project Pills + Date */}
      <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-1 truncate pr-2">
          {collectionList.map((col: any) => (
            <span
              key={col._id}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[10px] border border-white/[0.06] bg-white/[0.04] text-neutral-300 truncate font-mono"
            >
              <span className="truncate max-w-[80px]">{col.name}</span>
            </span>
          ))}

          {projectList.map((proj: any) => (
            <span
              key={proj._id}
              className="px-1.5 py-0.5 rounded-none text-[10px] bg-white/[0.04] text-neutral-300 border border-white/[0.06] truncate max-w-[90px] font-mono"
            >
              📁 {proj.name}
            </span>
          ))}
        </div>

        <span className="shrink-0 font-mono text-[10px] text-neutral-400">{formatRelativeTime(resource.createdAt)}</span>
      </div>
    </div>
  );
};

export default ResourceCard;
