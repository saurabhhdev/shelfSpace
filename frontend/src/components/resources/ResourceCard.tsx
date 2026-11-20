import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flaticon } from '../ui/Flaticon';
import type { Resource } from '../../types';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/Button';
import { getResourceTypeLabel, getResourceTypeIcon } from '../../lib/resourceTypes';
import { cn, formatRelativeTime } from '../../lib/utils';

export interface ResourceCardProps {
  resource: Resource;
  viewMode?: 'grid' | 'list';
  onToggleFavourite: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onEdit: (resource: Resource) => void;
  onRemoveFromProject?: (id: string, name: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  viewMode = 'grid',
  onToggleFavourite,
  onDelete,
  onEdit,
  onRemoveFromProject,
}) => {
  const [imageError, setImageError] = useState(false);

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

  // Category info if assigned
  const category =
    (resource.collectionIds || []).find(
      (c: any) => typeof c === 'object' && c !== null && (c.type === 'category' || !c.type)
    ) || (resource.collectionIds || [])[0];
  const categoryName = typeof category === 'object' && category !== null ? category.name : null;
  const categoryColor = typeof category === 'object' && category !== null ? category.color : null;

  // Render Type-specific Visual Placeholder
  const renderPlaceholder = (isSmall = false) => (
    <div
      className={cn(
        'w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1C1C1B] to-[#262624] text-neutral-500 border border-[#3E3E38]',
        isSmall ? 'p-1.5' : 'p-4'
      )}
    >
      <div className={cn('rounded-full bg-white/[0.04] flex items-center justify-center text-neutral-400', isSmall ? 'w-6 h-6' : 'w-10 h-10 mb-1.5')}>
        <TypeIcon className={isSmall ? 'w-3 h-3' : 'w-5 h-5'} />
      </div>
      {!isSmall && (
        <span className="text-[11px] font-medium text-neutral-400 tracking-wide uppercase font-sans">
          {typeLabel}
        </span>
      )}
    </div>
  );

  // ==================== LIST VIEW LAYOUT ====================
  if (viewMode === 'list') {
    return (
      <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#1C1C1B] border border-[#3E3E38] hover:border-neutral-500 rounded-md transition-colors gap-3 font-sans">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Thumbnail Preview (Left) */}
          <div className="w-24 sm:w-28 h-16 sm:h-18 rounded-md overflow-hidden shrink-0 border border-[#3E3E38] bg-[#262624] relative">
            {resource.previewImage && !imageError ? (
              <img
                src={resource.previewImage}
                alt={resource.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              renderPlaceholder(true)
            )}
          </div>

          {/* Central Area: Title, Type, Category, Description */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/library/${resource._id}`}
                className="font-medium text-xs sm:text-sm text-[#FAF9F5] hover:text-white truncate transition-colors"
              >
                {resource.title}
              </Link>

              <Badge size="sm">
                <TypeIcon className="w-3 h-3 text-neutral-400" />
                <span>{typeLabel}</span>
              </Badge>

              {categoryName && (
                <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-white/[0.03] px-1.5 py-0.5 rounded border border-[#3E3E38]">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: categoryColor || '#D97757' }}
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

            <p className="text-xs text-neutral-400 line-clamp-1">
              {resource.description?.trim() || <span className="italic text-neutral-500">No description added.</span>}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3E3E38]">
          <span className="text-[11px] text-neutral-500 mr-1 font-mono">
            {formatRelativeTime(resource.createdAt)}
          </span>

          <div className="flex items-center gap-1">
            <IconButton
              onClick={() => onToggleFavourite(resource._id)}
              variant={resource.isFavourite ? 'amber' : 'ghost'}
              size="sm"
              title={resource.isFavourite ? 'Remove favorite' : 'Add to favorites'}
              icon={
                <Flaticon
                  name="star"
                  variant={resource.isFavourite ? 'sr' : 'rr'}
                  className={cn('text-xs', resource.isFavourite && 'text-amber-400')}
                />
              }
            />

            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all active:scale-[0.95]"
                title="Open website in new tab"
              >
                <Flaticon name="arrow-up-right" className="text-xs" />
              </a>
            )}

            <IconButton
              onClick={() => onEdit(resource)}
              variant="ghost"
              size="sm"
              title="Edit resource"
              icon={<Flaticon name="pencil" className="text-xs" />}
            />

            {onRemoveFromProject && (
              <IconButton
                onClick={() => onRemoveFromProject(resource._id, resource.title)}
                variant="ghost"
                size="sm"
                className="hover:text-amber-400"
                title="Remove from project"
                icon={<Flaticon name="folder-minus" className="text-xs" />}
              />
            )}

            <IconButton
              onClick={() => onDelete(resource._id, resource.title)}
              variant="danger"
              size="sm"
              title="Delete resource"
              icon={<Flaticon name="trash" className="text-xs" />}
            />
          </div>
        </div>
      </div>
    );
  }

  // ==================== GRID VIEW LAYOUT ====================
  return (
    <div className="group flex flex-col justify-between bg-[#1C1C1B] border border-[#3E3E38] hover:border-neutral-500 rounded-md transition-colors font-sans overflow-hidden">
      <div>
        {/* 1. Preview Image (Top, consistent 16:9 aspect ratio) */}
        <div className="w-full aspect-[16/9] bg-[#262624] border-b border-[#3E3E38] relative overflow-hidden">
          {resource.previewImage && !imageError ? (
            <img
              src={resource.previewImage}
              alt={resource.title}
              className="w-full h-full object-cover transition-opacity duration-150"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            renderPlaceholder(false)
          )}

          {/* Quick Favorite Star Floating Overlay */}
          <button
            onClick={() => onToggleFavourite(resource._id)}
            className={cn(
              'absolute top-2 right-2 p-1.5 rounded-md bg-black/60 backdrop-blur-xs border border-white/10 transition-colors cursor-pointer',
              resource.isFavourite ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
            )}
            title={resource.isFavourite ? 'Remove favorite' : 'Add to favorites'}
          >
            <Flaticon
              name="star"
              variant={resource.isFavourite ? 'sr' : 'rr'}
              className={cn('text-xs', resource.isFavourite && 'text-amber-400')}
            />
          </button>
        </div>

        {/* 2. Card Content Body */}
        <div className="p-4 space-y-2">
          {/* Type & Category Labels */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge size="sm">
              <TypeIcon className="w-3 h-3 text-neutral-400" />
              <span>{typeLabel}</span>
            </Badge>

            {categoryName && (
              <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-white/[0.03] px-1.5 py-0.5 rounded border border-[#3E3E38]">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: categoryColor || '#D97757' }}
                />
                <span className="truncate max-w-[110px]">{categoryName}</span>
              </span>
            )}
          </div>

          {/* Resource Title */}
          <Link
            to={`/library/${resource._id}`}
            className="font-medium text-sm text-[#FAF9F5] hover:text-white line-clamp-1 block transition-colors pt-0.5"
          >
            {resource.title}
          </Link>

          {/* Source / Domain */}
          {domain && (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
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
                <Flaticon name="globe" className="text-[11px] text-neutral-500" />
              )}
              <span className="truncate">{domain}</span>
            </div>
          )}

          {/* Meaningful Description (2-line clamp with consistent height) */}
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {resource.description?.trim() || <span className="italic text-neutral-500">No description added.</span>}
          </p>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {resource.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-neutral-400 border border-[#3E3E38]"
                >
                  #{tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="text-[10px] text-neutral-500 self-center">
                  +{resource.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Card Footer: Date & Actions */}
      <div className="px-4 py-2.5 border-t border-[#3E3E38] bg-[#262624]/50 flex items-center justify-between text-[11px] text-neutral-500">
        <span>{formatRelativeTime(resource.createdAt)}</span>

        <div className="flex items-center gap-1">
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all active:scale-[0.95]"
              title="Open website"
            >
              <Flaticon name="arrow-up-right" className="text-xs" />
            </a>
          )}

          <IconButton
            onClick={() => onEdit(resource)}
            variant="ghost"
            size="sm"
            title="Edit"
            icon={<Flaticon name="pencil" className="text-xs" />}
          />

          {onRemoveFromProject && (
            <IconButton
              onClick={() => onRemoveFromProject(resource._id, resource.title)}
              variant="ghost"
              size="sm"
              className="hover:text-amber-400"
              title="Remove from project"
              icon={<Flaticon name="folder-minus" className="text-xs" />}
            />
          )}

          <IconButton
            onClick={() => onDelete(resource._id, resource.title)}
            variant="danger"
            size="sm"
            title="Delete"
            icon={<Flaticon name="trash" className="text-xs" />}
          />
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
