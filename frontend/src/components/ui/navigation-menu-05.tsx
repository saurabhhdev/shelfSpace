import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface NavigationMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

export interface NavigationMenu05Props {
  items: NavigationMenuItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  underlineColor?: string;
}

/**
 * Underlined Navigation Menu (navigation-menu-05 from 21st.dev / shadcnui-blocks)
 * - Horizontal menu with icons and labels
 * - Animated sliding underline indicator on active and hover states
 * - Smooth motion transitions with accessible keyboard navigation
 */
export const NavigationMenu05: React.FC<NavigationMenu05Props> = ({
  items,
  activeId,
  onSelect,
  className,
  underlineColor = "bg-[#10b981]",
}) => {
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Determine current active item from prop or current path/hash
  const currentActiveId =
    activeId ||
    items.find((item) => {
      if (item.href === "/" && location.pathname === "/") return true;
      if (item.href.startsWith("#") && location.hash === item.href) return true;
      if (item.href !== "/" && !item.href.startsWith("#") && location.pathname.startsWith(item.href))
        return true;
      return false;
    })?.id ||
    items[0]?.id;

  const highlightedId = hoveredId || currentActiveId;

  return (
    <nav
      className={cn(
        "relative flex items-center gap-1 sm:gap-2 px-1 py-1 rounded-full bg-black/40 dark:bg-black/40 light:bg-white/60 border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200/80 backdrop-blur-md",
        className
      )}
      onMouseLeave={() => setHoveredId(null)}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isCurrentActive = currentActiveId === item.id;
        const isHighlighted = highlightedId === item.id;

        const content = (
          <span
            className={cn(
              "relative flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium tracking-tight transition-colors duration-200 select-none cursor-pointer rounded-full",
              isCurrentActive
                ? "text-white dark:text-white light:text-zinc-900"
                : "text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-900"
            )}
          >
            {/* Animated sliding background pill on hover/active */}
            {isHighlighted && (
              <motion.span
                layoutId="nav-item-highlight"
                className="absolute inset-0 rounded-full bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-zinc-200/60 -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {Icon && (
              <Icon
                className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                  isCurrentActive ? "text-[#10b981]" : "text-zinc-400 group-hover:text-zinc-200"
                )}
                strokeWidth={1.8}
              />
            )}
            <span>{item.label}</span>

            {/* Underline Indicator */}
            {isCurrentActive && (
              <motion.span
                layoutId="nav-menu-underline"
                className={cn("absolute bottom-0 inset-x-3 h-[2px] rounded-full", underlineColor)}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </span>
        );

        if (item.href.startsWith("/") && !item.onClick) {
          return (
            <Link
              key={item.id}
              to={item.href}
              onMouseEnter={() => setHoveredId(item.id)}
              onClick={() => onSelect?.(item.id)}
              className="outline-none"
            >
              {content}
            </Link>
          );
        }

        return (
          <a
            key={item.id}
            href={item.href}
            onMouseEnter={() => setHoveredId(item.id)}
            onClick={(e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
              onSelect?.(item.id);
            }}
            className="outline-none"
          >
            {content}
          </a>
        );
      })}
    </nav>
  );
};

export default NavigationMenu05;
