import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const OssiumHero: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-transparent">
      {/* Celestial Ambient Glow at the top */}
      <div 
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[480px] opacity-35 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(9, 174, 91, 0.22), rgba(14, 15, 16, 0) 70%)'
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center relative z-10">
        {/* Main Headline - Controlled width for balanced line wrapping */}
        <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#E5E5E5] leading-[1.12] max-w-3xl mx-auto">
          Your central hub for <span className="text-[#09AE5B]">everything you build with</span>.
        </h1>

        {/* Subtitle - Moderate width to prevent long, stretched lines */}
        <p className="mt-4 sm:mt-5 text-balance max-w-xl mx-auto text-sm sm:text-base text-[#8E8E93] font-normal leading-relaxed">
          Bring all your essential developer tools, GitHub repositories, UI components, code snippets and useful references together. Organize the resources you discover, keep them within reach and easily find what you need for your next idea or project.
        </p>

        {/* Dual CTA Button Cluster - Symmetrical, evenly spaced, side-by-side with mobile stacking */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-md bg-[#EDEDED] hover:bg-white px-5 py-2 sm:py-2 text-xs sm:text-sm font-medium text-[#0E0F10] border border-white/40 hover:border-white shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.7)] transition-all duration-150 active:scale-[0.99]"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Collecting'}</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-black/10 text-[#0E0F10] text-[11px] font-mono">
              ↗
            </span>
          </Link>

          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-[#18191d] hover:bg-[#202127] px-5 py-2 sm:py-2 text-xs sm:text-sm font-medium text-[#EDEDED] hover:text-white border border-white/[0.12] hover:border-white/[0.22] shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-150 active:scale-[0.99]"
          >
            Explore Shelfspace
          </a>
        </div>
      </div>
    </section>
  );
};
