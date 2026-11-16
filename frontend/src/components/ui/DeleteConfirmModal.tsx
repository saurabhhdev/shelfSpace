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
        <div className="w-11 h-11 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 flex items-center justify-center mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <h3 className="text-base font-semibold text-[#191715] dark:text-[#f5f2ec] mb-1">
          {title}
        </h3>

        <p className="text-xs text-[#57524b] dark:text-[#aba499] mb-5 leading-relaxed">
          {message}
        </p>

        <div className="w-full flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            className="flex-1"
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
