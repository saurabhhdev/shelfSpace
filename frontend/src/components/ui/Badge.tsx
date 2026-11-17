import React from 'react';
import { cn } from '../../lib/utils';
import type { ResourceType } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'subtle';
  type?: ResourceType;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant: _variant = 'default',
  type: _type,
  size = 'md',
  children,
  ...props
}) => {
  const baseStyle =
    'bg-white/[0.05] text-neutral-300 border border-white/[0.08] rounded-md';

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium leading-none',
    md: 'text-xs px-2.5 py-1 font-medium leading-none',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-sans transition-colors',
        baseStyle,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
