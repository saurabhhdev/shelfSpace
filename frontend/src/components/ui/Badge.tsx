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
  type,
  size = 'md',
  children,
  ...props
}) => {
  const typeStyles: Record<ResourceType, string> = {
    design: 'bg-[#faf0eb] dark:bg-[#2b1f1a] text-[#9c4221] dark:text-[#f09a7d] border-[#f0ded5] dark:border-[#422c24]',
    ui: 'bg-[#edf4f0] dark:bg-[#1a2b22] text-[#1e3a2f] dark:text-[#86efac] border-[#cce1d6] dark:border-[#2d4d3c]',
    development: 'bg-[#edf2f7] dark:bg-[#1d242e] text-[#2d3748] dark:text-[#90cdf4] border-[#d8e2ed] dark:border-[#2b394b]',
    data: 'bg-[#fef7ee] dark:bg-[#2e2316] text-[#b45309] dark:text-[#fcd34d] border-[#fbe4c7] dark:border-[#4a361e]',
    learning: 'bg-[#eff6ff] dark:bg-[#17253d] text-[#1d4ed8] dark:text-[#93c5fd] border-[#d4e4fc] dark:border-[#253959]',
    personal: 'bg-[#f5f2eb] dark:bg-[#24221f] text-[#57524b] dark:text-[#d1cbc2] border-[#e2dcd0] dark:border-[#38342e]',
  };

  const defaultStyle = 'bg-[#f5f2eb] dark:bg-[#22201d] text-[#57524b] dark:text-[#aba499] border-[#e2dcd0] dark:border-[#2f2c27]';

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium leading-none',
    md: 'text-xs px-2.5 py-1 font-medium leading-none',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border tracking-wider uppercase font-mono',
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
