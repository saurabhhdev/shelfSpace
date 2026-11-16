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
          <label htmlFor={inputId} className="text-xs font-medium text-[#45403a] dark:text-[#aba499]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#8a8277] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-9 rounded-lg px-3 text-sm bg-white dark:bg-[#191816] text-[#191715] dark:text-[#f5f2ec]',
              'border border-[#ded8cb] dark:border-[#2f2c27] transition-all',
              'placeholder:text-[#8a8277] dark:placeholder:text-[#787268]',
              'focus:outline-none focus:ring-2 focus:ring-[#1e3a2f]/20 focus:border-[#1e3a2f] dark:focus:border-[#4ade80]',
              'disabled:bg-[#f5f2eb] dark:disabled:bg-[#22201d] disabled:opacity-60',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#8a8277] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</span>}
        {hint && !error && <span className="text-xs text-[#8a8277]">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
