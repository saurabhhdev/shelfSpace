import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const OssiumCTA: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-24 sm:py-32 bg-[#1C1C1B]/35 border-t border-[#3E3E38] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Strong Editorial Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF9F5] leading-[1.12] max-w-2xl mx-auto">
          Keep Your Next Project <span className="text-[#D97757]">Within Reach</span>.
        </h2>

        {/* Comfortable Readable Description */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-[#B7B5A9] max-w-xl mx-auto leading-relaxed">
          Save the tools, repositories, components and references you find useful. Keep them organized in one place and come back whenever you need them.
        </p>

        {/* Balanced CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] px-6 h-10 text-xs sm:text-sm font-medium text-[#141413] border border-white/60 hover:border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_0_rgba(0,0,0,0.35)] transition-all duration-150 active:scale-[0.98] active:translate-y-[0.5px]"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-black/10 text-[#141413] text-[11px] font-mono">
              ↗
            </span>
          </Link>

          <Link
            to="/library"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-[#1C1C1B] hover:bg-[#262624] px-6 h-10 text-xs sm:text-sm font-medium text-[#FAF9F5] hover:text-white border border-[#3E3E38] hover:border-[#52514A] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_0_rgba(0,0,0,0.3)] transition-all duration-150 active:scale-[0.98] active:translate-y-[0.5px]"
          >
            Explore Shelfspace
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OssiumCTA;
