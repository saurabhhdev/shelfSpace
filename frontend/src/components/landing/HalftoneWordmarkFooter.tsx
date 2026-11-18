import React from 'react';
import { Link } from 'react-router-dom';

const TerracottaFlowerIcon = ({ className = 'w-9 h-9' }: { className?: string }) => (
  <svg
    viewBox="0 0 40 40"
    fill="currentColor"
    className={`${className} text-[#D97757]`}
    aria-hidden="true"
  >
    {/* 5 rounded petals radiating at 72° angles matching MX Icons symbol */}
    <ellipse cx="20" cy="11.5" rx="3.8" ry="6.2" />
    <ellipse cx="20" cy="11.5" rx="3.8" ry="6.2" transform="rotate(72 20 20)" />
    <ellipse cx="20" cy="11.5" rx="3.8" ry="6.2" transform="rotate(144 20 20)" />
    <ellipse cx="20" cy="11.5" rx="3.8" ry="6.2" transform="rotate(216 20 20)" />
    <ellipse cx="20" cy="11.5" rx="3.8" ry="6.2" transform="rotate(288 20 20)" />
    <circle cx="20" cy="20" r="3.2" />
  </svg>
);

export interface FooterProps {
  className?: string;
}

export const HalftoneWordmarkFooter: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`relative w-full bg-[#1C1C1B] border-t border-[#3E3E38]/50 pt-16 pb-20 sm:pt-20 sm:pb-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* 1. Terracotta Flower Logo Icon */}
      <div className="flex items-center justify-center mb-3">
        <TerracottaFlowerIcon className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-300 hover:rotate-45" />
      </div>

      {/* 2. Brand Name */}
      <Link
        to="/"
        className="font-mono text-base sm:text-lg font-semibold tracking-tight text-[#FAF9F5] hover:text-white transition-colors"
      >
        shelfspace
      </Link>

      {/* 3. Subtitle / Tagline */}
      <p className="font-mono text-xs sm:text-sm text-[#B7B5A9] mt-4 max-w-md px-4 leading-relaxed">
        Open source, curated resource workspace for developers.
      </p>

      {/* 4. Navigation Links Row */}
      <nav
        aria-label="Footer Navigation"
        className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-9 gap-y-3 mt-7 sm:mt-8 font-mono text-xs sm:text-sm text-[#FAF9F5]"
      >
        <a
          href="#"
          className="text-[#FAF9F5] hover:text-[#D97757] transition-colors"
        >
          Home
        </a>
        <a
          href="#features"
          className="text-[#FAF9F5] hover:text-[#D97757] transition-colors"
        >
          Features
        </a>
        <a
          href="#faq"
          className="text-[#FAF9F5] hover:text-[#D97757] transition-colors"
        >
          FAQ
        </a>
        <a
          href="https://github.com/saurabhhdev/shelfSpace"
          target="_blank"
          rel="noreferrer noopener"
          className="text-[#FAF9F5] hover:text-[#D97757] transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://saurabhhdev.vercel.app/"
          target="_blank"
          rel="noreferrer noopener"
          className="text-[#FAF9F5] hover:text-[#D97757] transition-colors underline underline-offset-4 decoration-[#B7B5A9]/40 hover:decoration-[#D97757]"
        >
          Made by Saurabh
        </a>
      </nav>

      {/* 5. Copyright Line */}
      <div className="mt-10 sm:mt-12 font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#8E8D85]">
        © 2026 SHELFSPACE · RELEASED UNDER THE MIT LICENSE
      </div>
    </footer>
  );
};

export default HalftoneWordmarkFooter;
