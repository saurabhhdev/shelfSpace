import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'lg',
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

  const widths = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div
        className={cn(
          'relative w-full h-full bg-[#fbfbfa] dark:bg-[#131316] border-l border-[#ececeb] dark:border-[#222227] shadow-2xl flex flex-col z-10',
          'animate-in slide-in-from-right duration-200',
          widths[width]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ececeb] dark:border-[#222227] bg-white dark:bg-[#18181c]">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-[#2b2a28] dark:text-[#f4f4f5]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white p-1.5 rounded-lg hover:bg-[#f2f2ef] dark:hover:bg-[#202026] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
