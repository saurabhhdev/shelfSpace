import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { NavigationMenu05, type NavigationMenuItem } from "./navigation-menu-05";
import {
  Home,
  Compass,
  Info,
  Menu,
  X,
  Moon,
  Sun,
  Laptop,
  ChevronDown,
  LayoutDashboard,
  Layers,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar05: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  const cycleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  const menuItems: NavigationMenuItem[] = [
    {
      id: "home",
      label: "Home",
      href: "#",
      icon: Home,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setMobileMenuOpen(false);
      },
    },
    {
      id: "explore",
      label: "Explore",
      href: isAuthenticated ? "/library" : "#explore",
      icon: Compass,
      onClick: () => {
        if (!isAuthenticated) {
          const el = document.getElementById("explore") || document.getElementById("features");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/library");
        }
        setMobileMenuOpen(false);
      },
    },
    {
      id: "about",
      label: "About",
      href: "#about",
      icon: Info,
      onClick: () => {
        const el = document.getElementById("about") || document.getElementById("intro");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        setMobileMenuOpen(false);
      },
    },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out flex justify-center px-4 sm:px-6 pointer-events-none",
        scrolled ? "pt-3 sm:pt-4" : "pt-4 sm:pt-6"
      )}
    >
      <div
        className={cn(
          "w-full max-w-5xl transition-all duration-300 pointer-events-auto rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between border backdrop-blur-xl shadow-lg shadow-black/20",
          scrolled
            ? "bg-black/80 dark:bg-black/80 light:bg-white/80 border-zinc-800/90 dark:border-zinc-800/90 light:border-zinc-200/90"
            : "bg-black/60 dark:bg-black/60 light:bg-white/60 border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200/60"
        )}
      >
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center group cursor-pointer select-none">
          <span className="font-bold text-base sm:text-lg tracking-tight text-white dark:text-white light:text-zinc-900 group-hover:opacity-90 transition-opacity">
            shelfspace<span className="text-[#10b981]">.</span>
          </span>
        </Link>

        {/* Center: Underlined Navigation Menu (Desktop) */}
        <div className="hidden md:flex items-center justify-center">
          <NavigationMenu05 items={menuItems} />
        </div>

        {/* Right: Auth Actions & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 py-1 pl-1 pr-2.5 rounded-full border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-white/80 hover:border-[#10b981] transition-all cursor-pointer select-none"
                aria-expanded={profileMenuOpen}
                aria-label="User account menu"
              >
                <div className="w-6 h-6 rounded-full bg-[#10b981] text-black font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="text-xs font-medium text-zinc-200 dark:text-zinc-200 light:text-zinc-800 max-w-[80px] truncate hidden sm:inline">
                  {user?.name ? user.name.split(" ")[0] : "Account"}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3 h-3 text-zinc-400 transition-transform duration-200",
                    profileMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-none bg-zinc-950 dark:bg-zinc-950 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 py-1.5 z-50 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200/80">
                    <div className="text-xs font-semibold text-white dark:text-white light:text-zinc-900 truncate">
                      {user?.name || "Developer"}
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-400 light:text-zinc-500 font-mono truncate">
                      {user?.email || "Logged in"}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-[#10b981] hover:bg-zinc-900 dark:hover:bg-zinc-900 light:hover:bg-zinc-100 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/library"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-[#10b981] hover:bg-zinc-900 dark:hover:bg-zinc-900 light:hover:bg-zinc-100 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>All Resources</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-[#10b981] hover:bg-zinc-900 dark:hover:bg-zinc-900 light:hover:bg-zinc-100 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200/80">
                    <button
                      type="button"
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await logout();
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#10b981] hover:bg-[#059669] text-black font-semibold transition-all shadow-sm shadow-[#10b981]/20 hover:scale-[1.02]"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={cycleTheme}
            className="w-8 h-8 rounded-full border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-[#10b981] dark:hover:text-[#10b981] light:hover:text-[#059669] hover:border-[#10b981] transition-all cursor-pointer"
            title={`Current theme: ${theme} (Click to toggle)`}
            aria-label="Toggle color theme"
          >
            {theme === "system" ? (
              <Laptop className="w-3.5 h-3.5 text-[#10b981]" strokeWidth={1.8} />
            ) : resolvedTheme === "dark" ? (
              <Moon className="w-3.5 h-3.5 text-zinc-200" strokeWidth={1.8} />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.8} />
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#10b981]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 inset-x-4 max-w-sm mx-auto p-4 rounded-none bg-zinc-950/95 border border-zinc-800 backdrop-blur-2xl shadow-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-200 z-50">
          <div className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    item.onClick?.();
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                >
                  {Icon && <Icon className="w-4 h-4 text-[#10b981]" />}
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-800/80 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-semibold rounded-none bg-[#10b981] text-black"
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="py-2 text-center text-xs font-medium rounded-none border border-rose-900 text-rose-400"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-none border border-zinc-800 text-zinc-300 hover:text-white"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-none bg-[#10b981] text-black"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar05;
