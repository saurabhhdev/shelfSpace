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
        className="fixed inset-0 bg-[#121110]/60 dark:bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div
        className={cn(
          'relative w-full h-full bg-[#faf8f5] dark:bg-[#191816] border-l border-[#ded8cb] dark:border-[#2f2c27] shadow-2xl flex flex-col z-10',
          'animate-in slide-in-from-right duration-200',
          widths[width]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ded8cb] dark:border-[#2f2c27] bg-white dark:bg-[#191816]">
          <div>
            {title && <h2 className="text-base font-semibold text-[#191715] dark:text-[#f5f2ec]">{title}</h2>}
            {description && (
              <p className="text-xs text-[#57524b] dark:text-[#aba499] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] p-1.5 rounded-lg hover:bg-[#f5f2eb] dark:hover:bg-[#22201d] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
