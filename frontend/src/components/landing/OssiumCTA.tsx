import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const OssiumCTA: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 sm:py-24 bg-transparent border-t border-[#3E3E38] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#3E3E38] bg-[#1C1C1B] p-10 sm:p-14 lg:p-16 text-center relative shadow-sm">
          {/* Subtle Tag / Pill */}
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#D97757] tracking-wider bg-[#D97757]/10 px-2.5 py-1 rounded border border-[#D97757]/20 mb-5">
            <span>GET STARTED</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF9F5] leading-tight max-w-2xl mx-auto">
            Keep Your Next Project <span className="text-[#D97757]">Within Reach</span>.
          </h2>

          {/* Description */}
          <p className="mt-4 text-sm sm:text-base text-[#B7B5A9] max-w-xl mx-auto leading-relaxed">
            Save the tools, repositories, components and references you find useful. Keep them organized in one place and come back whenever you need them.
          </p>

          {/* Symmetrical CTA Cluster */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] px-6 h-10 text-xs sm:text-sm font-medium text-[#141413] border border-white/40 shadow-sm transition-all duration-150 active:scale-[0.99]"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-black/10 text-[#141413] text-[11px] font-mono">
                ↗
              </span>
            </Link>

            <Link
              to="/library"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-[#1C1C1B] hover:bg-[#1A1915] px-6 h-10 text-xs sm:text-sm font-medium text-[#FAF9F5] hover:text-white border border-[#3E3E38] hover:border-[#52514A] shadow-sm transition-all duration-150 active:scale-[0.99]"
            >
              Explore Shelfspace
            </Link>
          </div>

          {/* Restrained Subtext */}
          <div className="mt-6 text-xs text-[#83827D] font-mono">
            Free forever for personal use • No credit card required
          </div>
        </div>
      </div>
    </section>
  );
};

export default OssiumCTA;
