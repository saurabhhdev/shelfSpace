import React from "react";
import { ChevronRight, ArrowRight } from "lucide-react";

export interface Hero1Props {
  title?: React.ReactNode;
  subtitle?: string;
  eyebrow?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  onSecondaryCtaClick?: () => void;
  children?: React.ReactNode;
}

export function Hero1({
  title = "Everything useful. Never lost again.",
  subtitle = "Collect the tools, palettes, repositories, and inspirations behind everything you build. Streamline your workflow with high-speed recall.",
  eyebrow = "Next-Gen Developer Workspace",
  primaryCtaLabel = "Get Started Free",
  primaryCtaHref = "/register",
  secondaryCtaLabel,
  onSecondaryCtaClick,
  children,
}: Hero1Props) {
  return (
    <section
      id="hero"
      className="relative mx-auto w-full pt-20 pb-28 sm:pt-28 sm:pb-36 px-6 text-center md:px-8 min-h-[calc(88vh)] overflow-hidden bg-[linear-gradient(to_bottom,#fff,#ffffff_50%,#e8e8e8_88%)] dark:bg-[linear-gradient(to_bottom,#000,#0000_30%,#898e8e_78%,#ffffff_99%_50%)] rounded-b-2xl border-b border-[#e5e5e5] dark:border-[#222226]"
    >
      {/* Grid Pattern Overlay */}
      <div
        className="absolute -z-10 inset-0 opacity-80 h-[650px] w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:6rem_5rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"
      />

      {/* Planetary Horizon Glow Dome */}
      <div
        className="absolute left-1/2 top-[calc(100%-110px)] lg:top-[calc(100%-160px)] h-[500px] w-[700px] md:h-[550px] md:w-[1100px] lg:h-[750px] lg:w-[140%] -translate-x-1/2 rounded-[100%] border-[#B48CDE] bg-white dark:bg-black bg-[radial-gradient(closest-side,#fff_82%,#000000)] dark:bg-[radial-gradient(closest-side,#000_82%,#ffffff)] animate-fade-up pointer-events-none opacity-85"
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Eyebrow Badge */}
        {eyebrow && (
          <div className="group inline-block animate-fade-in">
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium mx-auto px-4 py-1.5 bg-gradient-to-tr from-zinc-300/10 via-gray-400/10 to-transparent border border-gray-300/30 dark:border-white/10 rounded-full w-fit tracking-tight uppercase flex items-center justify-center gap-2 shadow-2xs hover:border-gray-400/50 dark:hover:border-white/20 transition-all cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] animate-pulse" />
              <span>{eyebrow}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform duration-300" />
            </span>
          </div>
        )}

        {/* Main Title */}
        <h1 className="animate-fade-in text-balance bg-gradient-to-br from-black from-30% to-black/50 bg-clip-text py-2 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tighter text-transparent dark:from-white dark:to-white/40 max-w-4xl mx-auto">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in text-balance text-base sm:text-lg md:text-xl tracking-tight text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {primaryCtaLabel && (
            <a
              href={primaryCtaHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all shadow-md hover:shadow-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 h-11 px-7 tracking-tight text-sm"
            >
              <span>{primaryCtaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
          {secondaryCtaLabel && (
            <button
              onClick={onSecondaryCtaClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 text-sm font-medium rounded-full border border-gray-300/40 dark:border-white/10 hover:border-gray-400/60 dark:hover:border-white/20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs text-gray-800 dark:text-gray-200 transition-all cursor-pointer shadow-2xs"
            >
              <span>{secondaryCtaLabel}</span>
            </button>
          )}
        </div>

        {/* Custom Child / Preview slot */}
        {children && <div className="pt-8">{children}</div>}
      </div>

      {/* Perspective Bottom Fade Element */}
      <div className="animate-fade-up relative mt-20 opacity-0 [perspective:2000px] after:absolute after:inset-0 after:z-50 after:[background:linear-gradient(to_top,var(--workspace-bg)_10%,transparent)]" />
    </section>
  );
}
