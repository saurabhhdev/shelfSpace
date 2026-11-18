import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog Card - Clean Minimal Modal with Viewport Clamping & Scroll */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full max-h-[90vh] flex flex-col bg-[#1C1C1B] border border-[#3E3E38] rounded-lg shadow-2xl z-10 text-[#FAF9F5] overflow-hidden',
          'animate-in zoom-in-95 duration-150',
          maxWidths[maxWidth]
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer z-20"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {title && (
          <div className="p-6 pb-3 shrink-0 border-b border-[#3E3E38]">
            <h3 className="text-base font-semibold text-[#FAF9F5] pr-8">{title}</h3>
            {description && (
              <p className="text-xs text-neutral-400 mt-0.5 pr-8">{description}</p>
            )}
          </div>
        )}

        <div className={cn('overflow-y-auto flex-1', title ? 'px-6 py-4' : 'p-6')}>
          {children}
        </div>
      </div>
    </div>
  );
};

