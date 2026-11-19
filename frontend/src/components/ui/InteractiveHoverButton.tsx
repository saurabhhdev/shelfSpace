import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  to?: string;
  className?: string;
  dotColor?: string;
  hoverBgColor?: string;
  textColor?: string;
  hoverTextColor?: string;
}

/**
 * Interactive Hover Button (from 21st.dev / Magic UI)
 * Features a glowing accent indicator that smoothly expands on hover,
 * seamlessly transitioning the text and revealing an animated arrow.
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
      dotColor = 'bg-[#D97757]',
      hoverBgColor = 'group-hover:bg-[#D97757]',
      textColor = 'text-[#FAF9F5]',
      hoverTextColor = 'text-white',
      ...props
    },
    ref
  ) => {
    const label = children || text;

    const content = (
      <>
        {/* Resting Content with glowing terracotta indicator */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-all duration-300 ease-out group-hover:scale-[65]',
              dotColor,
              hoverBgColor,
              'shadow-[0_0_8px_rgba(217,119,87,0.8)] shrink-0'
            )}
          />
          <span
            className={cn(
              'inline-flex items-center gap-1 font-medium tracking-tight transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0',
              textColor
            )}
          >
            {label}
          </span>
        </div>

        {/* Hover Content (slides in from left to center as terracotta expands) */}
        <div
          className={cn(
            'absolute inset-0 z-10 flex h-full w-full translate-x-10 items-center justify-center gap-1.5 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 font-semibold tracking-tight',
            hoverTextColor
          )}
        >
          <span>{label}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 shrink-0" />
        </div>
      </>
    );

    const baseClasses = cn(
      'group relative inline-flex items-center justify-center h-8 cursor-pointer overflow-hidden rounded-md border border-[#3E3E38] hover:border-[#D97757]/80 bg-[#1C1C1B] px-3.5 text-xs sm:text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_0_rgba(0,0,0,0.35)] hover:shadow-[0_0_15px_rgba(217,119,87,0.25)] transition-all duration-300 select-none active:scale-[0.98]',
      className
    );

    if (to) {
      return (
        <Link
          to={to}
          onClick={props.onClick as any}
          className={baseClasses}
          title={typeof label === 'string' ? label : 'Action'}
        >
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

InteractiveHoverButton.displayName = 'InteractiveHoverButton';

export default InteractiveHoverButton;
