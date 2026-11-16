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
  isPermanent = false,
  isLoading = false,
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onCancel} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          {title}
        </h3>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
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
