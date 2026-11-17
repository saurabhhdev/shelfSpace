import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { FlipLink } from "./flip-link";

export interface NavItem {
  name: string;
  link: string;
  onClick?: () => void;
}

export interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Editorial Transparent Navbar with 21st.dev FlipLinks & Reference Frame System
 * - Transparent backdrop with precision dotted-line frame system & anchor handles.
 * - Top diagonal striped bar.
 * - Staggered letter-roll FlipLink interactions.
 * - Theme toggle with moon/sun icon.
 * - Vertical dotted line separator and cross-hatched wireframe block at right edge.
 */
export function Navbar({ children, className }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out flex justify-center px-4 sm:px-6 pointer-events-none",
        scrolled ? "pt-2.5 sm:pt-3" : "pt-4 sm:pt-5",
        className
      )}
    >
      <div className="w-full flex justify-center pointer-events-auto">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, { scrolled });
          }
          return child;
        })}
      </div>
    </header>
  );
}

export interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  scrolled?: boolean;
}

export function NavBody({ children, className, scrolled = false }: NavBodyProps) {
  return (
    <div
      className={cn(
        "hidden sm:block relative w-full transition-all duration-300 ease-out rounded-none select-none",
        scrolled ? "max-w-3xl" : "max-w-4xl",
        className
      )}
    >
      {/* Precision Dotted Outer Frame with 8 Anchor Handles (Exact Reference Anatomy) */}
      <div className="relative border border-dotted border-[#2e2e40] dark:border-[#2e2e40] light:border-[#cbd5e1] rounded-none overflow-visible backdrop-blur-md bg-[#000000]/80 dark:bg-[#000000]/80 light:bg-white/80">
        {/* 8 Anchor Handles */}
        <span className="absolute -top-1 -left-1 w-2 h-2 border border-[#454558] dark:border-[#454558] light:border-[#94a3b8] bg-[#000000] dark:bg-[#000000] light:bg-[#f9f9fb] z-20 pointer-events-none" />
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 border border-[#454558] dark:border-[#454558] light:border-[#94a3b8] bg-[#000000] dark:bg-[#000000] light:bg-[#f9f9fb] z-20 pointer-events-none" />
        <span className="absolute -top-1 -right-1 w-2 h-2 border border-[#454558] dark:border-[#454558] light:border-[#94a3b8] bg-[#000000] dark:bg-[#000000] light:bg-[#f9f9fb] z-20 pointer-events-none" />
        <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 border border-[#454558] dark:border-[#454558] light:border-[#94a3b8] bg-[#000000] dark:bg-[#000000] light:bg-[#f9f9fb] z-20 pointer-events-none" />
        <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 border border-[#454558] dark:border-[#454558] light:border-[#94a3b8] bg-[#000000] dark:bg-[#000000] light:bg-[#f9f9fb] z-20 pointer-events-none" />
        <span className="absolute -bottom-1 -left-1 w-2 h-2 border border-[#454558] dark:border-[#454558] light:border-[#94a3b8] bg-[#000000] dark:bg-[#000000] light:bg-[#f9f9fb] z-20 pointer-events-none" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 border border-[#454558] dark:border-[#454558] light:border-[#94a3b8] bg-[#000000] dark:bg-[#000000] light:bg-[#f9f9fb] z-20 pointer-events-none" />
        <span className="absolute -bottom-1 -right-1 w-2 h-2 border border-[#454558] dark:border-[#454558] light:border-[#94a3b8] bg-[#000000] dark:bg-[#000000] light:bg-[#f9f9fb] z-20 pointer-events-none" />

        {/* Top Diagonal Hatched Bar (from reference screenshot) */}
        <div className="h-4 w-full border-b border-dotted border-[#2e2e40] dark:border-[#2e2e40] light:border-[#cbd5e1] bg-[repeating-linear-gradient(-45deg,#000000,#000000_6px,#181822_6px,#181822_12px)] dark:bg-[repeating-linear-gradient(-45deg,#000000,#000000_6px,#181822_6px,#181822_12px)] light:bg-[repeating-linear-gradient(-45deg,#ffffff,#ffffff_6px,#e4e7eb_6px,#e4e7eb_12px)] opacity-90" />

        {/* Main Nav Content Bar */}
        <div className="flex items-center justify-between px-5 py-2.5">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface NavbarLogoProps {
  href?: string;
  title?: string;
  className?: string;
}

export function NavbarLogo({
  href = "/",
  title = "shelfspace.",
  className,
}: NavbarLogoProps) {
  return (
    <Link to={href} className={cn("flex items-center group cursor-pointer select-none", className)}>
      <span className="font-bold text-base sm:text-lg tracking-tight text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b] group-hover:text-white dark:group-hover:text-white light:group-hover:text-black transition-colors">
        shelfspace<span className="text-[#10b981] dark:text-[#10b981] light:text-[#059669]">.</span>
      </span>
    </Link>
  );
}

export interface NavItemsProps {
  items: NavItem[];
  className?: string;
}

export function NavItems({ items, className }: NavItemsProps) {
  return (
    <nav className={cn("flex items-center gap-5 sm:gap-6 text-xs sm:text-[13px] font-normal lowercase tracking-tight", className)}>
      {items.map((item) => {
        if (item.link.startsWith("/") && !item.onClick) {
          return (
            <Link key={item.name} to={item.link} className="py-1">
              <FlipLink>{item.name.toLowerCase()}</FlipLink>
            </Link>
          );
        }

        return (
          <FlipLink
            key={item.name}
            href={item.link}
            onClick={(e) => {
              if (item.onClick) {
                e?.preventDefault();
                item.onClick();
              }
            }}
          >
            {item.name.toLowerCase()}
          </FlipLink>
        );
      })}
    </nav>
  );
}

// ----------------- MOBILE NAVIGATION -----------------

export interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  scrolled?: boolean;
}

export function MobileNav({ children, className, scrolled: _scrolled = false }: MobileNavProps) {
  return (
    <div
      className={cn(
        "sm:hidden relative w-full transition-all duration-300 ease-out rounded-none select-none",
        className
      )}
    >
      <div className="relative border border-dotted border-[#2e2e40] dark:border-[#2e2e40] light:border-[#cbd5e1] rounded-none overflow-hidden backdrop-blur-md bg-[#000000]/85 dark:bg-[#000000]/85 light:bg-white/85">
        {/* Top Hatched Accent Bar */}
        <div className="h-3 w-full border-b border-dotted border-[#2e2e40] dark:border-[#2e2e40] light:border-[#cbd5e1] bg-[repeating-linear-gradient(-45deg,#000000,#000000_5px,#181822_5px,#181822_10px)] dark:bg-[repeating-linear-gradient(-45deg,#000000,#000000_5px,#181822_5px,#181822_10px)] light:bg-[repeating-linear-gradient(-45deg,#ffffff,#ffffff_5px,#e4e7eb_5px,#e4e7eb_10px)] opacity-90" />
        <div className="px-4 py-2.5">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileNavHeader({ children, className }: MobileNavHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {children}
    </div>
  );
}

export interface MobileNavToggleProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function MobileNavToggle({ isOpen, onClick, className }: MobileNavToggleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-none text-[#a1a1aa] hover:text-[#10b981] hover:bg-[#12121a] transition-colors cursor-pointer",
        className
      )}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X className="w-4 h-4 text-[#10b981]" /> : <Menu className="w-4 h-4" />}
    </button>
  );
}

export interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function MobileNavMenu({ isOpen, onClose: _onClose, children, className }: MobileNavMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "pt-3 mt-2 border-t border-dotted border-[#2e2e40] dark:border-[#2e2e40] light:border-[#cbd5e1] flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Navbar;
