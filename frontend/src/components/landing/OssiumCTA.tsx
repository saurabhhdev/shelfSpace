import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OssiumCTA: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="pt-20 sm:pt-28 pb-10 sm:pb-12 bg-[#1C1C1B]/35 border-t border-[#3E3E38] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Strong Editorial Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF9F5] leading-[1.12] max-w-2xl mx-auto">
          Keep Your Next Project <span className="text-[#D97757]">Within Reach</span>.
        </h2>

        {/* Comfortable Readable Description */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-[#B7B5A9] max-w-xl mx-auto leading-relaxed">
          Save the tools, repositories, components and references you find useful. Keep them organized in one place and come back whenever you need them.
        </p>

        {/* CTA Button - Visually appealing, refined terracotta without excessive shine */}
        <div className="mt-8 flex items-center justify-center">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="group relative inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-b from-[#E07452] to-[#D97757] hover:from-[#EE8360] hover:to-[#DE7250] text-white px-7 h-11 text-sm font-semibold tracking-tight shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.35),0_0_16px_rgba(217,119,87,0.25)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_4px_16px_rgba(217,119,87,0.35)] border border-[#EE8360]/40 transition-all duration-200 active:scale-[0.98]"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4 text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OssiumCTA;
