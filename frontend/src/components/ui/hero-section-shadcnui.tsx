import React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ParticleButton } from "./particle-button";

export interface HeroSectionProps {
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  children?: React.ReactNode;
}

/**
 * Typography-Focused Hero Section
 * Strictly text-centric without screenshots, mockups, or floating cards.
 * Uses centered composition with high-contrast metallic typography and neon emerald highlights.
 */
export function HeroSection({
  primaryCtaLabel = "Get Started Free",
  primaryCtaHref = "/register",
  secondaryCtaLabel = "View Live Preview",
  secondaryCtaHref = "#features",
  children,
}: HeroSectionProps) {
  return (
    <div className="relative w-full pt-16 pb-14 sm:pt-24 sm:pb-20 px-4 sm:px-6 text-center select-none">
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center">
        {/* Editorial Pill/Box Badge */}
        <a
          href="#features"
          className="inline-flex items-center gap-2 px-3.5 py-1 mb-8 border border-[#242432] dark:border-[#242432] light:border-[#d4d4dc] bg-[#0c0c12]/70 dark:bg-[#0c0c12]/70 light:bg-white/80 backdrop-blur-sm text-[11px] font-mono tracking-wider text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b] hover:border-[#10b981] dark:hover:border-[#10b981] light:hover:border-[#059669] transition-all cursor-pointer rounded-none"
        >
          <span className="w-1.5 h-1.5 bg-[#10b981] dark:bg-[#10b981] light:bg-[#059669] shrink-0" />
          <span className="font-mono uppercase tracking-wider text-[11px]">
            SHELFSPACE PLATFORM
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#a1a1aa] dark:text-[#a1a1aa] light:text-[#64748b] shrink-0" />
        </a>

        {/* Headline: Exact 3-line typography-focused layout */}
        <h1 className="mb-6 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b] leading-[1.15] sm:leading-[1.08] text-balance">
          <span>Save </span>
          <span className="text-[#10b981] dark:text-[#10b981] light:text-[#059669]">anything useful</span>
          <span className="text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b]">.</span>
          <br />
          <span>Organize it </span>
          <span className="text-[#10b981] dark:text-[#10b981] light:text-[#059669]">your way</span>
          <span className="text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b]">.</span>
          <br />
          <span>Find it </span>
          <span className="text-[#10b981] dark:text-[#10b981] light:text-[#059669]">whenever you need it</span>
          <span className="text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b]">.</span>
        </h1>

        {/* Supporting description */}
        <p className="mb-8 max-w-2xl text-xs sm:text-base md:text-lg text-[#a1a1aa] dark:text-[#a1a1aa] light:text-[#475569] mx-auto text-balance leading-relaxed">
          Your personal space to collect, organize and rediscover the digital resources that matter.
        </p>

        {/* Primary & Secondary Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <ParticleButton
            href={primaryCtaHref}
            variant="primary"
            className="h-10 px-8 text-xs font-mono uppercase tracking-wider cursor-pointer"
          >
            <span>{primaryCtaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </ParticleButton>

          {secondaryCtaLabel && (
            <ParticleButton
              href={secondaryCtaHref}
              variant="outline"
              className="h-10 px-8 text-xs font-mono uppercase tracking-wider cursor-pointer"
            >
              <span>{secondaryCtaLabel}</span>
            </ParticleButton>
          )}
        </div>

        {/* Optional Embedded Children */}
        {children && <div className="w-full mt-4">{children}</div>}
      </div>
    </div>
  );
}

export default HeroSection;
