import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface OssiumHeroProps {
  onExploreClick?: () => void;
}

export const OssiumHero: React.FC<OssiumHeroProps> = ({ onExploreClick }) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Main Headline - Controlled width for balanced line wrapping */}
        <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF9F5] leading-[1.12] max-w-3xl mx-auto">
          Your central hub for <span className="text-[#D97757]">everything you build with</span>.
        </h1>

        {/* Subtitle - Moderate width to prevent long, stretched lines */}
        <p className="mt-4 sm:mt-5 text-balance max-w-xl mx-auto text-sm sm:text-base text-[#B7B5A9] font-normal leading-relaxed">
          Bring all your essential developer tools, GitHub repositories, UI components, code snippets and useful references together. Organize the resources you discover, keep them within reach and easily find what you need for your next idea or project.
        </p>

        {/* Dual CTA Button Cluster - Clean, flat, non-3D with smooth hover */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] px-5 py-2 text-xs sm:text-sm font-medium text-[#141413] transition-colors duration-150 active:scale-[0.98]"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Collecting'}</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-black/10 text-[#141413] text-[11px] font-mono">
              ↗
            </span>
          </Link>

          {onExploreClick ? (
            <button
              type="button"
              onClick={onExploreClick}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-[#1C1C1B] hover:bg-[#262624] px-5 py-2 text-xs sm:text-sm font-medium text-[#FAF9F5] hover:text-white border border-[#3E3E38] hover:border-[#52514A] transition-colors duration-150 active:scale-[0.98] cursor-pointer"
            >
              View Live Preview
            </button>
          ) : (
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-[#1C1C1B] hover:bg-[#262624] px-5 py-2 text-xs sm:text-sm font-medium text-[#FAF9F5] hover:text-white border border-[#3E3E38] hover:border-[#52514A] transition-colors duration-150 active:scale-[0.98]"
            >
              View Live Preview
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
