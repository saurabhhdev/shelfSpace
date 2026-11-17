import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const OssiumCTA: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 sm:py-28 bg-transparent border-t border-white/[0.06] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="p-8 sm:p-14 rounded-none border border-dashed border-neutral-800 bg-[#121316] relative shadow-2xl">
          {/* Crosshair corners */}
          <span className="absolute -top-2.5 -left-2.5 text-neutral-600 font-mono text-xs">+</span>
          <span className="absolute -top-2.5 -right-2.5 text-neutral-600 font-mono text-xs">+</span>
          <span className="absolute -bottom-2.5 -left-2.5 text-neutral-600 font-mono text-xs">+</span>
          <span className="absolute -bottom-2.5 -right-2.5 text-neutral-600 font-mono text-xs">+</span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            <span>Give every useful resource a</span>{' '}
            <span className="block sm:inline text-transparent [-webkit-text-stroke:1px_#ffffff] sm:[-webkit-text-stroke:1.5px_#ffffff]">
              proper home.
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#8E8E93] max-w-xl mx-auto leading-relaxed">
            Stop losing links in browser tabs and forgotten text files. Start organizing your personal engineering index today.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 rounded-md bg-[#EDEDED] hover:bg-white pl-6 pr-2.5 py-2 text-sm font-medium text-[#0E0F10] border border-white/40 hover:border-white shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.7)] transition-all duration-150 active:scale-[0.99]"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}</span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-black/10 text-[#0E0F10] text-xs font-mono">
                ↗
              </span>
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md bg-[#18191d] hover:bg-[#202127] px-6 py-2 text-sm font-medium text-[#EDEDED] hover:text-white border border-white/[0.12] hover:border-white/[0.22] shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-150 active:scale-[0.99]"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="mt-6 text-xs text-neutral-500 font-mono">
            Free forever for personal use • No credit card required
          </div>
        </div>
      </div>
    </section>
  );
};
