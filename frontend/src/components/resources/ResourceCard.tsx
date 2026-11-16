import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ExternalLink,
  Archive,
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
} from 'lucide-react';
import { Resource, ResourceType } from '../../types';
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
  JavaScript: '#f7df1e',
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
  onArchive,
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

  // Type-specific preview snippet
  const renderTypeSpecificPreview = () => {
    // 1. Design with color swatches
    if (resource.type === 'design' && resource.metadata?.colors && Array.isArray(resource.metadata.colors)) {
      return (
        <div className="flex items-center gap-1.5 my-2.5">
          {resource.metadata.colors.slice(0, 5).map((color: string, idx: number) => (
            <button
              key={idx}
              title={`Click to copy ${color}`}
              onClick={(e) => handleCopyColor(e, color)}
              className="group/color relative w-6 h-6 rounded-md border border-black/10 dark:border-white/10 shadow-xs hover:scale-110 transition-transform flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              {copiedColor === color && (
                <Check className="w-3 h-3 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
              )}
            </button>
          ))}
          {copiedColor && (
            <span className="text-[10px] text-zinc-500 font-mono ml-1">Copied {copiedColor}</span>
          )}
        </div>
      );
    }

    // 2. Development repository stats
    if (resource.type === 'development' && (resource.metadata?.stars !== undefined || resource.metadata?.language)) {
      const lang = resource.metadata?.language;
      const langColor = lang ? languageColors[lang] || '#8b949e' : null;

      return (
        <div className="flex flex-wrap items-center gap-3 my-2 text-xs text-zinc-500 dark:text-zinc-400">
          {lang && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColor || '#8b949e' }} />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{lang}</span>
            </span>
          )}
          {resource.metadata?.stars !== undefined && (
            <span className="inline-flex items-center gap-1" title="GitHub Stars">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>{resource.metadata.stars.toLocaleString()}</span>
            </span>
          )}
          {resource.metadata?.forks !== undefined && (
            <span className="inline-flex items-center gap-1" title="Forks">
              <GitFork className="w-3.5 h-3.5" />
              <span>{resource.metadata.forks.toLocaleString()}</span>
            </span>
          )}
          {resource.metadata?.license && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              {resource.metadata.license}
            </span>
          )}
        </div>
      );
    }

    // 3. Data / API
    if (resource.type === 'data' && (resource.metadata?.format || resource.metadata?.authRequired !== undefined)) {
      return (
        <div className="flex items-center gap-2 my-2 text-xs">
          {resource.metadata.format && (
            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {resource.metadata.format.toUpperCase()}
            </span>
          )}
          {resource.metadata.authRequired !== undefined && (
            <span className="text-[11px] text-zinc-500">
              {resource.metadata.authRequired ? '🔒 Auth Required' : '🔓 Public Access'}
            </span>
          )}
        </div>
      );
    }

    // 4. Learning
    if (resource.type === 'learning' && (resource.metadata?.estimatedTime || resource.metadata?.platform)) {
      return (
        <div className="flex items-center gap-2 my-2 text-xs text-zinc-500">
          {resource.metadata.platform && <span>{resource.metadata.platform}</span>}
          {resource.metadata.estimatedTime && <span>• {resource.metadata.estimatedTime}</span>}
        </div>
      );
    }

    // 5. Personal / Notes
    if (resource.type === 'personal' && resource.notes) {
      return (
        <div className="my-2 p-2 rounded-md bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-mono text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {resource.notes}
        </div>
      );
    }

    return null;
  };

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <div className="group relative flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
          {/* Favicon or Type Icon */}
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/60 dark:border-zinc-700/60 overflow-hidden">
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
              <span className="text-zinc-500">{typeIcons[resource.type]}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/library/${resource._id}`}
                className="font-medium text-sm text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 truncate"
              >
                {resource.title}
              </Link>
              <Badge type={resource.type} size="sm">
                {resource.type}
              </Badge>
              {collectionList.map((col: any) => (
                <span
                  key={col._id}
                  className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.2 rounded border"
                  style={{
                    backgroundColor: `${col.color}15`,
                    borderColor: `${col.color}35`,
                    color: col.color,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.color }} />
                  {col.name}
                </span>
              ))}
            </div>

            {resource.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        {/* List Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-zinc-400 mr-2 hidden md:inline">
            {formatRelativeTime(resource.createdAt)}
          </span>

          <button
            onClick={() => onToggleFavourite(resource._id)}
            className={cn(
              'p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
              resource.isFavourite ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            )}
            title={resource.isFavourite ? 'Favorited' : 'Add to favorites'}
          >
            <Star className={cn('w-4 h-4', resource.isFavourite && 'fill-amber-500')} />
          </button>

          {resource.url && (
            <button
              onClick={handleCopyUrl}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Visit link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => onEdit(resource)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(resource._id)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Move to trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // GRID VIEW LAYOUT (Card)
  return (
    <div className="group relative flex flex-col justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-md">
      <div>
        {/* Top Header: Badge + Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge type={resource.type} size="sm">
            {typeIcons[resource.type]}
            {resource.type}
          </Badge>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleFavourite(resource._id)}
              className={cn(
                'p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
                resource.isFavourite ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
              )}
              title={resource.isFavourite ? 'Favorited' : 'Add to favorites'}
            >
              <Star className={cn('w-4 h-4', resource.isFavourite && 'fill-amber-500')} />
            </button>

            {resource.url && (
              <button
                onClick={handleCopyUrl}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Open URL"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => onEdit(resource)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(resource._id)}
              className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Move to trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Thumbnail Preview if available */}
        {resource.previewImage && (
          <div className="w-full h-32 mb-3 rounded-lg overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-100 dark:bg-zinc-800/50">
            <img
              src={resource.previewImage}
              alt=""
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
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
          className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 group-hover:underline"
        >
          {resource.title}
        </Link>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
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
                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium"
              >
                #{tag}
              </span>
            ))}
            {resource.tags.length > 4 && (
              <span className="text-[10px] text-zinc-400">+{resource.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Project/Collection pills + Date */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5 truncate pr-2">
          {collectionList.map((col: any) => (
            <span
              key={col._id}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border truncate"
              style={{
                backgroundColor: `${col.color}15`,
                borderColor: `${col.color}35`,
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
              className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 truncate max-w-[90px]"
            >
              📁 {proj.name}
            </span>
          ))}
        </div>

        <span className="shrink-0">{formatRelativeTime(resource.createdAt)}</span>
      </div>
    </div>
  );
};
