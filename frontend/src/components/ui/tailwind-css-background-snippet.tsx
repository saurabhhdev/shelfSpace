import React from "react";
import { cn } from "../../lib/utils";
import { useTheme } from "../../context/ThemeContext";

export interface TailwindCssBackgroundSnippetProps
  extends React.HTMLAttributes<HTMLDivElement> {
  fixed?: boolean;
  className?: string;
  gridSize?: number;
  children?: React.ReactNode;
}

/**
 * Tailwind CSS Background Snippet
 * Based on @ibelick/components/tailwind-css-background-snippet on 21st.dev
 * Features subtle precision grid lines with an elliptical radial-gradient mask
 * and delicate ambient radial glow, tuned for both Dark Mode and Light Mode.
 */
export function TailwindCssBackgroundSnippet({
  className,
  fixed = true,
  gridSize = 28,
  children,
  ...props
}: TailwindCssBackgroundSnippetProps) {
  let isDark = true;
  try {
    const themeCtx = useTheme();
    isDark = themeCtx.resolvedTheme === "dark";
  } catch {
    if (typeof document !== "undefined") {
      isDark = document.documentElement.classList.contains("dark");
    }
  }

  const gridLineColor = isDark ? "rgba(255, 255, 255, 0.09)" : "rgba(0, 0, 0, 0.06)";
  const bgColor = isDark ? "#000000" : "#f9fafb";

  return (
    <div
      aria-hidden="true"
      className={cn(
        fixed ? "fixed inset-0 pointer-events-none" : "absolute inset-0 pointer-events-none",
        "-z-10 h-full w-full overflow-hidden transition-colors duration-300",
        isDark ? "bg-[#000000]" : "bg-[#f9fafb]",
        className
      )}
      style={{ backgroundColor: bgColor }}
      {...props}
    >
      {/* Ambient Top Glow (Julien Thibeaut / @ibelick spotlight) */}
      <div
        className="absolute inset-0 h-full w-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle 600px at 50% 180px, rgba(16, 185, 129, 0.07), transparent)"
            : "radial-gradient(circle 600px at 50% 180px, rgba(5, 150, 105, 0.04), transparent)",
        }}
      />

      {/* Grid Pattern with Radial Gradient Fade Mask */}
      <div
        className="absolute inset-0 h-full w-full pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridLineColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridLineColor} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: "0 0, 0 0",
          maskImage: "radial-gradient(ellipse 75% 65% at 50% 15%, #000 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 15%, #000 50%, transparent 100%)",
        }}
      />
      {children}
    </div>
  );
}

export default TailwindCssBackgroundSnippet;
