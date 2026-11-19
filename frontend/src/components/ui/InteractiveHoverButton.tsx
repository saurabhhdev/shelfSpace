import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  to?: string;
  className?: string;
}

/**
 * Shelfspace Theme Action Button
 * Clean, flat, non-3D primary button matching the website's terracotta orange theme (#D97757 -> #EE8360).
 */
export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(
  (
    {
      text = 'Login / Signup',
      to,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const label = children || text;

    const content = (
      <span className="inline-flex items-center gap-1.5 font-medium tracking-tight text-white">
        <span>{label}</span>
        <ArrowRight className="w-3.5 h-3.5 text-white/90 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
      </span>
    );

    const baseClasses = cn(
      'group inline-flex items-center justify-center h-8 cursor-pointer rounded-md bg-[#D97757] hover:bg-[#EE8360] px-3.5 text-xs sm:text-sm font-medium text-white transition-colors duration-150 select-none active:scale-[0.98]',
      className
    );

    if (to) {
      return (
        <Link
          to={to}
          onClick={onClick as any}
          className={baseClasses}
          title={typeof label === 'string' ? label : 'Action'}
        >
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} onClick={onClick} className={baseClasses} {...props}>
        {content}
      </button>
    );
  }
);

InteractiveHoverButton.displayName = 'InteractiveHoverButton';

export default InteractiveHoverButton;
