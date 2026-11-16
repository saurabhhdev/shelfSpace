
import { useState } from "react";
import type { FormEvent } from "react";
import type { NewResource } from "../types/resource";

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (resource: NewResource) => void;
}

const AddResourceModal = ({
  isOpen,
  onClose,
  onAddResource,
}: AddResourceModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) return;

    onAddResource({
      title: title.trim(),
      description: description.trim(),
      count: 0,
    });

    setTitle("");
    setDescription("");
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
            <span className="modal-eyebrow">NEW COLLECTION</span>
            <h2>Add Resource</h2>
            <p>Create a new space to organize your resources.</p>
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
            <label htmlFor="resource-title">Resource title</label>
            <input
              id="resource-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Inspiration"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="resource-description">Description</label>
            <textarea
              id="resource-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you save here?"
              rows={3}
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
              Create Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResourceModal;
