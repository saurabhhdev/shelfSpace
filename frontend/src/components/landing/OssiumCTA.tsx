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
          Ready to organize your <span className="text-[#D97757]">developer stack</span>?
        </h2>

        {/* Comfortable Readable Description */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-[#B7B5A9] max-w-xl mx-auto leading-relaxed">
          Join developers and designers organizing their favorite tools, UI kits, and repositories in Shelfspace.
        </p>

        {/* CTA Button - Clean, simple, non-3D with smooth hover */}
        <div className="mt-8 flex items-center justify-center">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="group inline-flex items-center justify-center gap-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] text-[#141413] px-6 h-10 text-sm font-semibold tracking-tight shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all duration-150 active:scale-[0.98]"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4 text-[#141413]/80 group-hover:text-[#141413] group-hover:translate-x-1 transition-all duration-150" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OssiumCTA;
