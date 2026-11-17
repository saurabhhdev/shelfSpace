import React from 'react';
import { cn } from '../../lib/utils';

export interface FlipLinkProps {
  children: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  active?: boolean;
}

/**
 * FlipLink Component
 * Pure CSS letter-staggered vertical flip animation on hover,
 * inspired by @vaib215 on 21st.dev
 */
export const FlipLink: React.FC<FlipLinkProps> = ({
  children,
  href,
  onClick,
  className,
  active = false,
}) => {
  const letters = children.split('');

  const content = (
    <span
      className={cn(
        'relative inline-block overflow-hidden whitespace-nowrap leading-none group/flip py-1 cursor-pointer select-none text-xs sm:text-[13px] font-normal tracking-tight',
        active ? 'text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b]' : 'text-[#a1a1aa] dark:text-[#a1a1aa] light:text-[#64748b] hover:text-[#f4f4f7] dark:hover:text-[#f4f4f7] light:hover:text-[#09090b]',
        className
      )}
      onClick={onClick}
    >
      {/* Top Text (Moves Up on Hover) */}
      <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/flip:-translate-y-full">
        {letters.map((char, index) => (
          <span
            key={`top-${index}`}
            className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{ transitionDelay: `${index * 18}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>

      {/* Bottom Text (Moves from Below to Center on Hover) */}
      <span className="absolute inset-0 inline-block translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/flip:translate-y-0 text-[#10b981] dark:text-[#10b981] light:text-[#059669]">
        {letters.map((char, index) => (
          <span
            key={`bottom-${index}`}
            className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{ transitionDelay: `${index * 18}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className="inline-flex items-center">
        {content}
      </a>
    );
  }

  return content;
};

export default FlipLink;
