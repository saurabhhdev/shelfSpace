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
      // Primary: Tactile Chalk White with Charcoal Black typography & crisp micro-shadow
      primary:
        'bg-[#EDEDED] hover:bg-white text-[#0E0F10] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.7)] border border-white/40 hover:border-white active:scale-[0.99]',

      // Secondary: Chrome Grey with Charcoal depth & Chalk White typography
      secondary:
        'bg-[#18191d] hover:bg-[#202127] text-[#EDEDED] hover:text-white font-medium border border-white/[0.12] hover:border-white/[0.22] shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] active:scale-[0.99]',

      // Chrome: Explicit metallic Chrome Grey with gradient bevel
      chrome:
        'bg-gradient-to-b from-[#25272e] to-[#18191d] hover:from-[#2c2e36] hover:to-[#1f2126] text-[#EDEDED] hover:text-white font-medium border border-white/[0.16] hover:border-white/[0.28] shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-[0.99]',

      // Outline: Matte Charcoal outline with subtle chrome border
      outline:
        'bg-transparent hover:bg-white/[0.04] text-[#A1A1AA] hover:text-[#EDEDED] border border-white/[0.08] hover:border-white/[0.18] active:scale-[0.99]',

      // Ghost: Visually quiet text-only button with soft charcoal hover
      ghost:
        'bg-transparent hover:bg-white/[0.05] text-[#8E8E93] hover:text-[#EDEDED]',

      // Danger: Charcoal Black with soft Crimson accent
      danger:
        'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 hover:border-rose-500/35 active:scale-[0.99]',

      // Subtle: Charcoal surface with muted chrome text
      subtle:
        'bg-[#141518] hover:bg-[#1a1b20] text-[#A1A1AA] hover:text-[#EDEDED] border border-white/[0.06] hover:border-white/[0.12] active:scale-[0.99]',

      // Emerald: Preserved for specific green actions if requested
      emerald:
        'bg-[#09AE5B] hover:bg-[#089E52] text-white font-medium shadow-xs border border-emerald-400/30 active:scale-[0.99]',
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
