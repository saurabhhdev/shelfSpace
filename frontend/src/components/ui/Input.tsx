import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-neutral-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-neutral-500 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-9 rounded-none px-3 text-sm bg-[#0E0F10] text-[#E5E5E5]',
              'border border-white/10 transition-colors duration-150',
              'placeholder:text-neutral-500',
              'focus:outline-none focus:border-[#09AE5B]',
              'disabled:bg-neutral-900 disabled:opacity-50',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-rose-500 focus:border-rose-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-zinc-400 dark:text-zinc-500 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</span>}
        {hint && !error && <span className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
