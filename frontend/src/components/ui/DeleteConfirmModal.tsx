import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  isPermanent?: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Delete Resource?',
  message = 'Are you sure you want to move this resource to trash? It will be kept for 30 days before permanent deletion.',
  confirmText = 'Move to Trash',
  isLoading = false,
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onCancel} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mb-3">
          <AlertTriangle className="w-4 h-4" />
        </div>

        <h3 className="text-sm font-semibold text-[#2b2a28] dark:text-[#f4f4f5] mb-1">
          {title}
        </h3>

        <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mb-5 leading-relaxed">
          {message}
        </p>

        <div className="w-full flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-xs"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            className="flex-1 text-xs"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
