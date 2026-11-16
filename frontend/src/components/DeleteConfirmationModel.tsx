
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({
  isOpen,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-icon">!</div>

        <h2>Delete resource?</h2>

        <p>
          This resource will be permanently deleted.
          This action cannot be undone.
        </p>

        <div className="modal-footer">
          <button
            type="button"
            className="button-secondary"
            onClick={onCancel}
          >
            Keep Resource
          </button>

          <button
            type="button"
            className="button-danger"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
