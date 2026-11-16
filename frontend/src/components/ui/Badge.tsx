import React from 'react';
import { cn } from '../../lib/utils';
import { ResourceType } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'subtle';
  type?: ResourceType;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  type,
  size = 'md',
  children,
  ...props
}) => {
  const typeStyles: Record<ResourceType, string> = {
    design: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
    ui: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    development: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    data: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    learning: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    personal: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
  };

  const defaultStyle = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium leading-none',
    md: 'text-xs px-2.5 py-1 font-medium leading-none',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border tracking-wide uppercase',
        type ? typeStyles[type] : defaultStyle,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
