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
 * Clean & Simple Minimalist Button
 * Flat, modern, non-3D design with zero gradients and a smooth, clean hover effect.
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
      <span className="inline-flex items-center gap-1.5 font-medium tracking-tight text-[#FAF9F5] group-hover:text-white transition-colors duration-150">
        <span>{label}</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#B7B5A9] group-hover:text-[#D97757] group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
      </span>
    );

    const baseClasses = cn(
      'group inline-flex items-center justify-center h-8 cursor-pointer rounded-md border border-[#3E3E38] hover:border-[#D97757] bg-[#1C1C1B] hover:bg-[#262624] px-3.5 text-xs sm:text-sm transition-all duration-150 select-none active:scale-[0.98]',
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
