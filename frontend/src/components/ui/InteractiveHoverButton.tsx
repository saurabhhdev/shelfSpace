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
 * 21st.dev Refined Dark Button
 * Clean, minimal, non-flashy dark CTA with subtle border highlight,
 * micro-nudge arrow animation, and soft surface sheen.
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
      <>
        {/* Subtle top edge specular highlight (21st.dev signature bevel) */}
        <span
          className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Subtle hover surface illumination */}
        <span
          className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          aria-hidden="true"
        />

        {/* Button Content: Text + Warm Terracotta Micro-nudge Arrow */}
        <span className="relative z-10 inline-flex items-center gap-1.5 font-medium tracking-tight text-[#FAF9F5] group-hover:text-white transition-colors">
          <span>{label}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D97757] group-hover:text-[#EE8360] group-hover:translate-x-1 transition-all duration-200 shrink-0" />
        </span>
      </>
    );

    const baseClasses = cn(
      'group relative inline-flex items-center justify-center h-8 cursor-pointer overflow-hidden rounded-md border border-[#3E3E38] hover:border-[#D97757]/60 bg-gradient-to-b from-[#262624] to-[#1C1C1B] hover:from-[#2F2F2C] hover:to-[#222220] px-3.5 text-xs sm:text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_3px_0_rgba(0,0,0,0.35)] hover:shadow-[0_2px_8px_rgba(217,119,87,0.18)] transition-all duration-200 select-none active:scale-[0.98]',
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
