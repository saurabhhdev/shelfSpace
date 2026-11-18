import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'chrome' | 'outline' | 'ghost' | 'danger' | 'subtle' | 'emerald';
  size?: 'xs' | 'sm' | 'md' | 'lg';
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
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-md';

    const variants = {
      // Primary: Tactile Off-White with Charcoal typography & crisp micro-shadow (MX Icons)
      primary:
        'bg-[#FAF9F5] hover:bg-[#EDE9DE] text-[#141413] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.7)] border border-white/40 hover:border-white active:scale-[0.99]',

      // Secondary: MX Icons Surface with subtle border
      secondary:
        'bg-[#1C1C1B] hover:bg-[#1A1915] text-[#FAF9F5] hover:text-white font-medium border border-[#3E3E38] hover:border-neutral-500 shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] active:scale-[0.99]',

      // Chrome: Explicit metallic Charcoal with subtle border
      chrome:
        'bg-[#1C1C1B] hover:bg-[#1A1915] text-[#FAF9F5] hover:text-white font-medium border border-[#3E3E38] hover:border-neutral-500 shadow-[0_1px_2px_rgba(0,0,0,0.4)] active:scale-[0.99]',

      // Outline: Matte Charcoal outline with subtle border
      outline:
        'bg-transparent hover:bg-white/[0.04] text-[#B7B5A9] hover:text-[#FAF9F5] border border-[#3E3E38] hover:border-neutral-500 active:scale-[0.99]',

      // Ghost: Visually quiet text-only button with soft hover
      ghost:
        'bg-transparent hover:bg-white/[0.05] text-[#B7B5A9] hover:text-[#FAF9F5]',

      // Danger: Charcoal Black with soft Crimson accent
      danger:
        'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 hover:border-rose-500/35 active:scale-[0.99]',

      // Subtle: Charcoal surface with muted text
      subtle:
        'bg-[#1B1B19] hover:bg-[#1A1915] text-[#B7B5A9] hover:text-[#FAF9F5] border border-[#3E3E38] active:scale-[0.99]',

      // Emerald / Accent: MX Icons signature terracotta accent
      emerald:
        'bg-[#D97757] hover:bg-[#EE8360] text-white font-medium shadow-xs border border-[#D97757]/40 active:scale-[0.99]',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1 gap-1.5 h-7',
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-3.5 py-2 gap-2 h-9',
      lg: 'text-sm px-4.5 py-2.5 gap-2 h-10',
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
