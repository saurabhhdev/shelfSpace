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
      pill = true,
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
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09AE5B]/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

    const roundedStyle = 'rounded-none';

    const variants = {
      primary:
        'bg-[#09AE5B] hover:bg-[#07914b] text-black font-semibold shadow-sm',
      secondary:
        'bg-[#242424] hover:bg-[#2e2e2e] text-[#E5E5E5] shadow-sm',
      outline:
        'bg-transparent hover:bg-white/[0.06] text-[#E5E5E5] border border-white/[0.12] hover:border-white/20',
      ghost:
        'bg-transparent hover:bg-white/[0.06] text-neutral-400 hover:text-white',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-none focus-visible:ring-rose-500',
      subtle:
        'bg-[#09AE5B]/15 hover:bg-[#09AE5B]/25 text-[#09AE5B]',
      gold:
        'bg-[#09AE5B] hover:bg-[#07914b] text-black font-semibold',
      teal:
        'bg-[#09AE5B] hover:bg-[#07914b] text-black font-semibold',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1 gap-1.5 h-7',
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-9',
      lg: 'text-sm px-5 py-2.5 gap-2.5 h-10',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, roundedStyle, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
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
