import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerDuration?: string;
  className?: string;
  to?: string;
  children?: React.ReactNode;
}

/**
 * Shimmer Button (from 21st.dev / Magic UI)
 * Features a dynamic glowing perimeter border and sweeping light reflection.
 */
export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = '#D97757',
      shimmerDuration = '2.5s',
      className,
      to,
      children,
      ...props
    },
    ref
  ) => {
    const content = (
      <>
        {/* Animated Shimmer Light Border */}
        <span
          className="absolute -inset-[1px] rounded-md opacity-70 group-hover:opacity-100 transition-opacity duration-300 blur-[0.5px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: `shimmer-sweep ${shimmerDuration} infinite linear`,
          }}
        />

        {/* Inner Surface */}
        <span className="relative z-10 flex items-center justify-center gap-1.5 h-full w-full rounded-[5px] bg-[#1C1C1B] px-3.5 py-1 text-xs sm:text-sm font-medium text-[#FAF9F5] group-hover:text-white transition-colors">
          {children}
        </span>
      </>
    );

    const baseClasses = cn(
      'group relative inline-flex items-center justify-center h-8 cursor-pointer overflow-hidden rounded-md p-[1px] select-none active:scale-[0.98] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.4)]',
      className
    );

    if (to) {
      return (
        <Link to={to} className={baseClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={baseClasses} {...props}>
        {content}
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';

export default ShimmerButton;
