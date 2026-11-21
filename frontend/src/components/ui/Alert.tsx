import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Clean, restrained Alert banner for inline notifications and warnings.
 * Uses refined charcoal surfaces with subtle status accents matching the Geist dark aesthetic.
 */
export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  icon,
  className,
  ...props
}) => {
  const variantStyles = {
    info: {
      container: 'bg-[#1C1C1B] border-[#3E3E38] text-neutral-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
      iconBox: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
      defaultIcon: <Info className="w-3.5 h-3.5" />,
      titleColor: 'text-[#FAF9F5]',
    },
    success: {
      container: 'bg-[#1C1C1B] border-[#D97757]/30 text-neutral-300 shadow-[inset_0_1px_0_0_rgba(217,119,87,0.08)]',
      iconBox: 'bg-[#D97757]/15 text-[#D97757] border border-[#D97757]/30',
      defaultIcon: <CheckCircle2 className="w-3.5 h-3.5" />,
      titleColor: 'text-[#FAF9F5]',
    },
    warning: {
      container: 'bg-[#1C1C1B] border-amber-500/25 text-neutral-300 shadow-[inset_0_1px_0_0_rgba(245,158,11,0.06)]',
      iconBox: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      defaultIcon: <AlertTriangle className="w-3.5 h-3.5" />,
      titleColor: 'text-amber-300',
    },
    error: {
      container: 'bg-[#1C1C1B] border-rose-500/25 text-neutral-300 shadow-[inset_0_1px_0_0_rgba(244,63,94,0.06)]',
      iconBox: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      defaultIcon: <AlertCircle className="w-3.5 h-3.5" />,
      titleColor: 'text-rose-300',
    },
  };

  const current = variantStyles[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-2.5 p-3 rounded-lg border text-xs leading-relaxed transition-all duration-150 animate-in fade-in',
        current.container,
        className
      )}
      {...props}
    >
      <div className={cn('w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5', current.iconBox)}>
        {icon || current.defaultIcon}
      </div>

      <div className="flex-1 min-w-0">
        {title && <p className={cn('font-medium mb-0.5', current.titleColor)}>{title}</p>}
        {children && <div className="text-neutral-300 text-xs leading-relaxed">{children}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-neutral-500 hover:text-white p-1 rounded hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
