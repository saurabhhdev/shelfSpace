import React from 'react';
import { Link } from 'react-router-dom';
import { ShelfspaceLogoIcon } from '../ui/ShelfspaceLogo';
import { VscGithubAlt } from 'react-icons/vsc';
import { FiLinkedin } from 'react-icons/fi';
import { RiTwitterXLine } from 'react-icons/ri';

export interface FooterProps {
  className?: string;
}

export const HalftoneWordmarkFooter: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`relative w-full bg-[#1C1C1B] border-t border-[#3E3E38]/50 pt-16 pb-20 sm:pt-20 sm:pb-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* 1. Shelfspace Brand Mark & Wordmark (Concept #6: Books on Shelf) */}
      <Link to="/" className="flex items-center gap-3 justify-center mb-1 group" title="Shelfspace">
        <ShelfspaceLogoIcon size={32} className="group-hover:scale-105 transition-transform" />
        <span className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#FAF9F5] group-hover:text-white transition-colors">
          Shelfspace
        </span>
      </Link>

      {/* 3. Shelfspace Tagline / Description */}
      <p className="font-mono text-xs sm:text-sm text-[#B7B5A9] mt-3.5 max-w-xl px-4 leading-relaxed">
        The hub for useful digital resources. Save, organize, and find tools, repositories, and components in one place.
      </p>

      {/* 4. Horizontal Links Row (with User's Icons & Links) */}
      <nav
        aria-label="Footer Navigation"
        className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3 mt-7 sm:mt-8 font-mono text-xs sm:text-sm text-[#FAF9F5]"
      >
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
          className="inline-flex items-center gap-1.5 text-[#FAF9F5] hover:text-[#D97757] transition-colors"
        >
          <VscGithubAlt className="text-sm shrink-0" />
          <span>GitHub</span>
        </a>
        <a
          href="https://linkedin.com/in/saurabhhdev"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-[#FAF9F5] hover:text-[#D97757] transition-colors"
        >
          <FiLinkedin className="text-xs shrink-0" />
          <span>LinkedIn</span>
        </a>
        <a
          href="https://x.com/saurabhhdev"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-[#FAF9F5] hover:text-[#D97757] transition-colors"
        >
          <RiTwitterXLine className="text-xs shrink-0" />
          <span>X</span>
        </a>
        <span className="text-[#B7B5A9]">
          Made by{' '}
          <a
            href="https://saurabhhdev.vercel.app/"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[#FAF9F5] hover:text-[#D97757] transition-colors underline underline-offset-4 decoration-[#B7B5A9]/40 hover:decoration-[#D97757]"
          >
            Saurabh
          </a>
        </span>
      </nav>

      {/* 5. Copyright Line */}
      <div className="mt-10 sm:mt-12 font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#8E8D85]">
        © 2026 SHELFSPACE · RELEASED UNDER THE MIT LICENSE
      </div>
    </footer>
  );
};

export default HalftoneWordmarkFooter;
