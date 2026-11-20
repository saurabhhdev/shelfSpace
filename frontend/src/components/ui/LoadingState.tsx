import React from 'react';
import { cn } from '../../lib/utils';
import { ShelfspaceLogoIcon } from './ShelfspaceLogo';

/**
 * Clean, minimal full-page loading screen for auth check & initial hydration.
 */
export const LoadingScreen: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#262624] select-none text-[#FAF9F5]">
      <div className="flex flex-col items-center gap-3">
        <ShelfspaceLogoIcon size={28} />
        <div className="w-10 h-[2px] bg-white/[0.08] rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#D97757] rounded-full animate-pulse" />
        </div>
        {message && (
          <p className="text-[11px] font-mono text-[#83827D] tracking-wider uppercase mt-1">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Minimal inline spinner for drawers, modals, and small sections.
 */
export const LoadingInline: React.FC<{ label?: string; className?: string }> = ({
  label,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-8 text-neutral-400 text-xs font-sans', className)}>
      <span className="w-3.5 h-3.5 border-[1.5px] border-[#D97757] border-t-transparent rounded-full animate-spin shrink-0" />
      {label && <span className="text-neutral-400 text-xs">{label}</span>}
    </div>
  );
};

/**
 * Polished skeleton for Resource Cards matching both list and grid view.
 */
export const ResourceCardSkeleton: React.FC<{ viewMode?: 'grid' | 'list' }> = ({
  viewMode = 'list',
}) => {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-3 bg-[#1C1C1B] border border-[#3E3E38]/60 rounded-md animate-pulse">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-7 h-7 rounded bg-white/[0.05] shrink-0" />
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="h-3 w-40 sm:w-56 bg-white/[0.07] rounded" />
            <div className="h-2 w-24 sm:w-36 bg-white/[0.03] rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-5 w-12 bg-white/[0.03] rounded" />
          <div className="w-6 h-6 bg-white/[0.04] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between p-3.5 bg-[#1C1C1B] border border-[#3E3E38]/60 rounded-md h-40 animate-pulse">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="w-7 h-7 rounded bg-white/[0.05] shrink-0" />
          <div className="w-5 h-5 rounded bg-white/[0.03]" />
        </div>
        <div className="h-3.5 w-3/4 bg-white/[0.07] rounded mb-2" />
        <div className="space-y-1">
          <div className="h-2 w-full bg-white/[0.03] rounded" />
          <div className="h-2 w-4/5 bg-white/[0.03] rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#3E3E38]/40">
        <div className="h-3 w-16 bg-white/[0.04] rounded" />
        <div className="h-3 w-10 bg-white/[0.03] rounded" />
      </div>
    </div>
  );
};

/**
 * Polished skeleton for Project Cards matching the compact card design.
 */
export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-[#1C1C1B] border border-[#3E3E38]/60 rounded-lg animate-pulse flex flex-col justify-between min-h-[148px]">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-md bg-white/[0.05] shrink-0" />
            <div className="h-4 w-32 bg-white/[0.07] rounded" />
          </div>
          <div className="h-5 w-10 bg-white/[0.04] rounded" />
        </div>
        <div className="space-y-1.5 min-h-[2.5rem]">
          <div className="h-2.5 w-full bg-white/[0.03] rounded" />
          <div className="h-2.5 w-2/3 bg-white/[0.03] rounded" />
        </div>
      </div>
      <div className="pt-3 border-t border-[#3E3E38]/40 flex items-center justify-between">
        <div className="h-3 w-20 bg-white/[0.03] rounded" />
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded bg-white/[0.03]" />
          <div className="w-5 h-5 rounded bg-white/[0.03]" />
        </div>
      </div>
    </div>
  );
};

/**
 * Polished skeleton for Collections / Categories rows.
 */
export const CollectionRowSkeleton: React.FC = () => {
  return (
    <div className="p-3.5 bg-[#1C1C1B] border border-[#3E3E38]/60 rounded-md animate-pulse flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-3 h-3 rounded-full bg-white/[0.06] shrink-0" />
        <div className="h-3.5 w-36 bg-white/[0.07] rounded" />
        <div className="h-2.5 w-48 bg-white/[0.03] rounded hidden sm:block" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-8 bg-white/[0.03] rounded" />
        <div className="w-5 h-5 bg-white/[0.04] rounded" />
      </div>
    </div>
  );
};

/**
 * Polished skeleton for Detail Pages (Project / Resource).
 */
export const DetailPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-6 w-16 bg-white/[0.04] rounded" />
      </div>
      <div className="p-6 rounded-lg bg-[#1C1C1B] border border-[#3E3E38]/60 space-y-3">
        <div className="h-6 w-56 bg-white/[0.07] rounded" />
        <div className="h-3.5 w-96 max-w-full bg-white/[0.03] rounded" />
        <div className="pt-2 flex items-center gap-3">
          <div className="h-4 w-20 bg-white/[0.04] rounded" />
          <div className="h-4 w-24 bg-white/[0.04] rounded" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-4 w-32 bg-white/[0.05] rounded mb-3" />
        {[...Array(3)].map((_, i) => (
          <ResourceCardSkeleton key={i} viewMode="list" />
        ))}
      </div>
    </div>
  );
};
