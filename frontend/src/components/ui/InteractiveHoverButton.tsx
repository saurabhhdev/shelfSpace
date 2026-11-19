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
 * Clean, flat, high-contrast action button matching the website's warm amber theme (#D4A373 -> #DEB285).
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
      <span className="inline-flex items-center gap-1.5 font-semibold tracking-tight text-[#141413]">
        <span>{label}</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#141413]/70 group-hover:text-[#141413] group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
      </span>
    );

    const baseClasses = cn(
      'group inline-flex items-center justify-center h-8 cursor-pointer rounded-md bg-[#D4A373] hover:bg-[#DEB285] px-3.5 text-xs sm:text-sm font-semibold text-[#141413] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all duration-150 select-none active:scale-[0.98]',
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
