import React from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ExternalLink,
  Trash2,
  Edit2,
  Globe,
} from 'lucide-react';
import type { Resource } from '../../types';
import { Badge } from '../ui/Badge';
import { getResourceTypeLabel, getResourceTypeIcon } from '../../lib/resourceTypes';
import { cn, formatRelativeTime } from '../../lib/utils';

export interface ResourceCardProps {
  resource: Resource;
  viewMode?: 'grid' | 'list';
  onToggleFavourite: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onEdit: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  viewMode = 'list',
  onToggleFavourite,
  onDelete,
  onEdit,
}) => {
  // Extract domain cleanly
  const domain = resource.url
    ? (() => {
        try {
          return new URL(resource.url).hostname.replace(/^www\./, '');
        } catch {
          return null;
        }
      })()
    : null;

  const TypeIcon = getResourceTypeIcon(resource.type);
  const typeLabel = getResourceTypeLabel(resource.type);

  // Category name if assigned
  const category = (resource.collectionIds || [])[0];
  const categoryName = typeof category === 'object' && category !== null ? category.name : null;
  const categoryColor = typeof category === 'object' && category !== null ? category.color : null;

  // LIST VIEW LAYOUT (Default)
  if (viewMode === 'list') {
    return (
      <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#121316] border border-white/[0.08] hover:border-white/20 rounded-md transition-colors gap-2.5 sm:gap-4 font-sans">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          {/* Favicon or Type Icon */}
          <div className="w-7 h-7 rounded-md bg-[#16171b] flex items-center justify-center shrink-0 border border-white/[0.06] text-neutral-400 mt-0.5 sm:mt-0">
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
              <TypeIcon className="w-3.5 h-3.5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/library/${resource._id}`}
                className="font-medium text-xs sm:text-sm text-[#EDEDED] hover:text-white truncate transition-colors"
              >
                {resource.title}
              </Link>

              <Badge size="sm">
                <TypeIcon className="w-3 h-3 text-neutral-400" />
                <span>{typeLabel}</span>
              </Badge>

              {categoryName && (
                <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.06]">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: categoryColor || '#09AE5B' }}
                  />
                  <span className="truncate max-w-[100px]">{categoryName}</span>
                </span>
              )}

              {domain && (
                <span className="text-[11px] text-neutral-500 hidden md:inline truncate">
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

        {/* Compact Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
          <span className="text-[11px] text-neutral-500 mr-1 font-mono">
            {formatRelativeTime(resource.createdAt)}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavourite(resource._id)}
              className={cn(
                'p-1.5 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer',
                resource.isFavourite ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
              )}
              title={resource.isFavourite ? 'Remove favorite' : 'Add to favorites'}
            >
              <Star className={cn('w-3.5 h-3.5', resource.isFavourite && 'fill-amber-400')} />
            </button>

            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Open website in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => onEdit(resource)}
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Edit resource"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(resource._id, resource.title)}
              className="p-1.5 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Delete resource"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW LAYOUT
  return (
    <div className="group flex flex-col justify-between p-4 bg-[#121316] border border-white/[0.08] hover:border-white/20 rounded-md transition-colors font-sans">
      <div>
        {/* Top: Badge + Action buttons */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge size="sm">
            <TypeIcon className="w-3 h-3 text-neutral-400" />
            <span>{typeLabel}</span>
          </Badge>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleFavourite(resource._id)}
              className={cn(
                'p-1 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer',
                resource.isFavourite ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
              )}
              title={resource.isFavourite ? 'Remove favorite' : 'Add to favorites'}
            >
              <Star className={cn('w-3.5 h-3.5', resource.isFavourite && 'fill-amber-400')} />
            </button>

            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Open website"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => onEdit(resource)}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(resource._id, resource.title)}
              className="p-1 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/library/${resource._id}`}
          className="font-medium text-sm text-[#EDEDED] hover:text-white line-clamp-1 block transition-colors"
        >
          {resource.title}
        </Link>

        {/* Source / Domain */}
        {domain && (
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-1">
            <Globe className="w-3 h-3 text-neutral-500" />
            <span className="truncate">{domain}</span>
          </div>
        )}

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Category tag */}
        {categoryName && (
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.06]">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: categoryColor || '#09AE5B' }}
              />
              <span className="truncate max-w-[120px]">{categoryName}</span>
            </span>
          </div>
        )}
      </div>

      {/* Footer: Date & Details link */}
      <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-500">
        <span>{formatRelativeTime(resource.createdAt)}</span>
        <Link
          to={`/library/${resource._id}`}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          View details →
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
