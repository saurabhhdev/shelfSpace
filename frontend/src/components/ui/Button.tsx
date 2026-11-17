import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle' | 'gold' | 'teal';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pill?: boolean;
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
      pill: _pill = false,
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
      'inline-flex items-center justify-center font-medium transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09AE5B]/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const roundedStyle = 'rounded-md';

    const variants = {
      primary:
        'bg-[#09AE5B] hover:bg-[#07914b] text-black font-semibold shadow-xs',
      secondary:
        'bg-[#1e2024] hover:bg-[#282a30] text-[#E5E5E5] border border-white/[0.08]',
      outline:
        'bg-transparent hover:bg-white/[0.05] text-[#E5E5E5] border border-white/[0.12] hover:border-white/20',
      ghost:
        'bg-transparent hover:bg-white/[0.05] text-neutral-400 hover:text-white',
      danger:
        'bg-rose-600/90 hover:bg-rose-600 text-white shadow-none focus-visible:ring-rose-500/40',
      subtle:
        'bg-white/[0.05] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.06]',
      gold:
        'bg-[#09AE5B] hover:bg-[#07914b] text-black font-semibold',
      teal:
        'bg-[#09AE5B] hover:bg-[#07914b] text-black font-semibold',
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
        className={cn(baseStyles, roundedStyle, variants[variant], sizes[size], className)}
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
