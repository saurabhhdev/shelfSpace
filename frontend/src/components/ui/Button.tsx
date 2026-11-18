import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'contrast' | 'secondary' | 'chrome' | 'outline' | 'ghost' | 'danger' | 'subtle' | 'emerald';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon-xs' | 'icon-sm' | 'icon-md' | 'icon-lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Modern tactile base with keyboard focus ring and click depression
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#262624] disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-md';

    const variants = {
      // Primary: Signature Terracotta with tactile top-bevel highlight & micro-shadow (Uiverse Tactile)
      primary:
        'bg-[#D97757] hover:bg-[#EE8360] text-white font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_1px_3px_0_rgba(0,0,0,0.4)] border border-[#EE8360]/40 hover:border-[#EE8360]/60 active:scale-[0.98] active:translate-y-[0.5px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]',

      // Contrast: Tactile Off-White with Charcoal typography for Landing Hero & Navbar CTAs
      contrast:
        'bg-[#FAF9F5] hover:bg-[#EDE9DE] text-[#141413] font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_2px_0_rgba(0,0,0,0.35)] border border-white/60 hover:border-white active:scale-[0.98] active:translate-y-[0.5px]',

      // Secondary: MX Icons Surface with subtle border & inset top highlight
      secondary:
        'bg-[#1C1C1B] hover:bg-[#262624] text-[#FAF9F5] hover:text-white font-medium border border-[#3E3E38] hover:border-[#52514A] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_0_rgba(0,0,0,0.3)] active:scale-[0.98] active:translate-y-[0.5px]',

      // Chrome: Explicit metallic Charcoal with subtle border
      chrome:
        'bg-[#1C1C1B] hover:bg-[#262624] text-[#FAF9F5] hover:text-white font-medium border border-[#3E3E38] hover:border-[#52514A] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_3px_0_rgba(0,0,0,0.4)] active:scale-[0.98] active:translate-y-[0.5px]',

      // Outline: Matte Charcoal outline with subtle border
      outline:
        'bg-transparent hover:bg-white/[0.04] text-[#B7B5A9] hover:text-[#FAF9F5] border border-[#3E3E38] hover:border-[#52514A] active:scale-[0.98] active:translate-y-[0.5px]',

      // Ghost: Visually quiet text-only button with soft hover
      ghost:
        'bg-transparent hover:bg-white/[0.06] text-[#B7B5A9] hover:text-[#FAF9F5] active:scale-[0.98]',

      // Danger: Charcoal Black with soft Crimson accent
      danger:
        'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 hover:border-rose-500/40 shadow-[inset_0_1px_0_0_rgba(244,63,94,0.1),0_1px_2px_0_rgba(0,0,0,0.3)] active:scale-[0.98] active:translate-y-[0.5px]',

      // Subtle: Charcoal surface with muted text
      subtle:
        'bg-[#1B1B19] hover:bg-[#262624] text-[#B7B5A9] hover:text-[#FAF9F5] border border-[#3E3E38] hover:border-[#52514A] active:scale-[0.98]',

      // Emerald: Alias to Primary Terracotta accent
      emerald:
        'bg-[#D97757] hover:bg-[#EE8360] text-white font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_1px_3px_0_rgba(0,0,0,0.4)] border border-[#EE8360]/40 active:scale-[0.98] active:translate-y-[0.5px]',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1 gap-1.5 h-7',
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-3.5 py-2 gap-2 h-9',
      lg: 'text-sm px-5 py-2.5 gap-2 h-10',
      'icon-xs': 'h-6 w-6 p-0 text-xs',
      'icon-sm': 'h-7 w-7 p-0 text-xs',
      'icon-md': 'h-8 w-8 p-0 text-sm',
      'icon-lg': 'h-9 w-9 p-0 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.primary, sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Standardized Icon Button for Edit, Delete, Favorite, Copy, Close, and Actions
 * Provides consistent touch targets, tactile hover, tooltips, and active states
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'danger' | 'amber';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'default', size = 'sm', icon, isLoading, disabled, title, ...props }, ref) => {
    const sizeMap = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-7 h-7 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-9 h-9 text-base',
    };

    const variantMap = {
      default:
        'bg-[#1C1C1B] hover:bg-[#262624] text-[#B7B5A9] hover:text-[#FAF9F5] border border-[#3E3E38] hover:border-[#52514A] shadow-xs',
      ghost:
        'bg-transparent hover:bg-white/[0.08] text-[#B7B5A9] hover:text-[#FAF9F5]',
      outline:
        'bg-transparent hover:bg-white/[0.04] text-[#B7B5A9] hover:text-[#FAF9F5] border border-[#3E3E38] hover:border-[#52514A]',
      danger:
        'bg-transparent hover:bg-rose-500/15 text-[#B7B5A9] hover:text-rose-400 hover:border-rose-500/30',
      amber:
        'bg-transparent hover:bg-amber-400/10 text-amber-400/80 hover:text-amber-400',
    };

    return (
      <button
        ref={ref}
        title={title}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-all duration-150 ease-out select-none cursor-pointer active:scale-[0.94] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757]/60',
          sizeMap[size],
          variantMap[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

