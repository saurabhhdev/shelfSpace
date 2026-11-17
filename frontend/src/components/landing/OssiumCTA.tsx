import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const OssiumCTA: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 sm:py-28 bg-transparent border-t border-white/[0.06] relative overflow-hidden">
      {/* Radial green glow */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(9, 174, 91, 0.25), transparent 60%)'
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="p-8 sm:p-14 rounded-none border border-dashed border-neutral-800 bg-[#121316] relative shadow-2xl">
          {/* Crosshair corners */}
          <span className="absolute -top-2.5 -left-2.5 text-neutral-600 font-mono text-xs">+</span>
          <span className="absolute -top-2.5 -right-2.5 text-neutral-600 font-mono text-xs">+</span>
          <span className="absolute -bottom-2.5 -left-2.5 text-neutral-600 font-mono text-xs">+</span>
          <span className="absolute -bottom-2.5 -right-2.5 text-neutral-600 font-mono text-xs">+</span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#E5E5E5] leading-tight">
            Give every useful resource a <span className="text-[#09AE5B]">proper home</span>.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#8E8E93] max-w-xl mx-auto leading-relaxed">
            Stop losing links in browser tabs and forgotten text files. Start organizing your personal engineering index today.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 rounded-none bg-[#E5E5E5] pl-6 pr-2 py-2 text-sm font-semibold text-black hover:bg-white transition-colors shadow-lg"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}</span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-none bg-black text-[#E5E5E5] text-xs">
                ↗
              </span>
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-none bg-[#242424] px-6 py-2.5 text-sm font-medium text-[#E5E5E5] hover:bg-[#2e2e2e] transition-colors"
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
