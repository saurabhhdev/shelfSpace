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
          <label htmlFor={inputId} className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-zinc-400 dark:text-zinc-500 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-9 rounded-lg px-3 text-sm bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100',
              'border border-zinc-200 dark:border-zinc-800 transition-all duration-150',
              'placeholder:text-zinc-400 dark:placeholder:text-zinc-600',
              'focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-white/15 focus:border-zinc-400 dark:focus:border-zinc-600',
              'disabled:bg-zinc-50 dark:disabled:bg-zinc-900 disabled:opacity-60',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15',
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
