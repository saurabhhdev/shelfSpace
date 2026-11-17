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
    'bg-[#09AE5B]/10 text-[#09AE5B] border border-[#09AE5B]/25 rounded-none';

  const sizes = {
    sm: 'text-[10px] font-mono px-2 py-0.5 font-medium leading-none',
    md: 'text-xs font-mono px-2.5 py-1 font-medium leading-none',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-sans transition-colors',
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
