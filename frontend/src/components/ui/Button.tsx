import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

    const variants = {
      primary: 'bg-[#1e3a2f] hover:bg-[#152b22] text-[#f5f2ec] dark:bg-[#2d5d45] dark:hover:bg-[#387356] border border-[#142820] dark:border-[#3d7d5d]/40 shadow-xs focus-visible:ring-[#1e3a2f]',
      secondary: 'bg-[#f5f2eb] hover:bg-[#eae5dc] text-[#191715] dark:bg-[#22201d] dark:hover:bg-[#2a2723] dark:text-[#f5f2ec] border border-[#e2dcd0] dark:border-[#2f2c27] shadow-xs',
      outline: 'bg-transparent hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] text-[#191715] dark:text-[#f5f2ec] border border-[#ded8cb] dark:border-[#2f2c27]',
      ghost: 'bg-transparent hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] text-[#57524b] dark:text-[#aba499] hover:text-[#191715] dark:hover:text-[#f5f2ec]',
      danger: 'bg-red-700 hover:bg-red-800 text-white shadow-xs focus-visible:ring-red-500 border border-red-800',
      subtle: 'bg-[#edf4f0] hover:bg-[#e2ece6] text-[#1e3a2f] dark:bg-[#1e3a2f]/30 dark:hover:bg-[#1e3a2f]/45 dark:text-[#6ee7b7] border border-[#c4dad0] dark:border-[#2e6349]/50',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1 gap-1.5 h-7',
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-9',
      lg: 'text-base px-5 py-2.5 gap-2.5 h-10.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
      </button>
    );
  }
);

Button.displayName = 'Button';
