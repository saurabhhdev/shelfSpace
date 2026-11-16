
import { useState } from "react";
import type { FormEvent } from "react";
import type { Resource, NewResource } from "../types/resource";

interface EditResourceModalProps {
  resource: Resource;
  onClose: () => void;
  onSave: (id: string, updatedData: NewResource) => void;
}


const EditResourceModal = ({
  resource,
  onClose,
  onSave,
}: EditResourceModalProps) => {
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description);
  const [count, setCount] = useState(String(resource.count));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) return;

    const numericCount = Number(count);

    if (!Number.isFinite(numericCount) || numericCount < 0) return;

    onSave(resource.id, {
      title: title.trim(),
      description: description.trim(),
      count: numericCount,
      badge: resource.badge,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">UPDATE COLLECTION</span>
            <h2>Edit Resource</h2>
            <p>Make changes to your resource collection.</p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-title">Resource title</label>
            <input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-count">Items saved</label>
            <input
              id="edit-count"
              type="number"
              min="0"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="button-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditResourceModal;
