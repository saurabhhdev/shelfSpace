import React from 'react';
import { cn } from '../../lib/utils';

export interface ShelfspaceLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shelfColor?: string;
  bookColor?: string;
  accentBookColor?: string;
}

/**
 * Shelfspace Official Branding (Logo Concept #6: Books on Shelf)
 * Features three books (two upright, one leaning) on a warm terracotta/orange horizontal shelf line
 * matching the Shelfspace web theme (#D97757 / #EE8360).
 */
export const ShelfspaceLogoIcon: React.FC<{
  className?: string;
  size?: number | string;
  shelfColor?: string;
  bookColor?: string;
  accentBookColor?: string;
}> = ({
  className,
  size = 24,
  shelfColor = '#D97757',
  bookColor = '#D97757',
  accentBookColor = '#EE8360',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none', className)}
      aria-hidden="true"
    >
      {/* 1. Left Book (medium height, upright in warm terracotta) */}
      <rect
        x="5"
        y="12"
        width="4"
        height="13"
        rx="0.75"
        fill={bookColor}
      />

      {/* 2. Middle Book (tallest, upright in warm terracotta) */}
      <rect
        x="10.8"
        y="6"
        width="4"
        height="19"
        rx="0.75"
        fill={bookColor}
      />

      {/* 3. Right Book (leaning book with warm orange highlight #EE8360) */}
      <rect
        x="16.5"
        y="7"
        width="4"
        height="18"
        rx="0.75"
        fill={accentBookColor || bookColor}
        transform="rotate(22 17.5 24.5)"
      />

      {/* 4. Bottom Horizontal Shelf Line (signature terracotta accent) */}
      <line
        x1="3"
        y1="26"
        x2="29"
        y2="26"
        stroke={shelfColor}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ShelfspaceLogo: React.FC<ShelfspaceLogoProps> = ({
  className,
  iconClassName,
  textClassName,
  iconOnly = false,
  size = 'md',
  shelfColor = '#D97757',
  bookColor = '#D97757',
  accentBookColor = '#EE8360',
}) => {
  const sizeMap = {
    sm: { icon: 18, text: 'text-sm' },
    md: { icon: 22, text: 'text-base sm:text-lg' },
    lg: { icon: 28, text: 'text-xl sm:text-2xl' },
    xl: { icon: 36, text: 'text-2xl sm:text-3xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <ShelfspaceLogoIcon
        size={currentSize.icon}
        className={iconClassName}
        shelfColor={shelfColor}
        bookColor={bookColor}
        accentBookColor={accentBookColor}
      />

      {!iconOnly && (
        <span
          className={cn(
            'font-sans font-semibold tracking-tight text-[#FAF9F5] leading-none',
            currentSize.text,
            textClassName
          )}
        >
          Shelfspace
        </span>
      )}
    </div>
  );
};

export default ShelfspaceLogo;
