
interface ResourceCardProps {
  title: string;
  count: number;
  description: string;
  badge?: string;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ResourceCard = ({
  title,
  count,
  description,
  badge,
  isFavourite,
  onToggleFavourite,
  onEdit,
  onDelete,
}: ResourceCardProps) => {
  return (
    <article className="resource-card">
      <div className="resource-card-top">
        <div className="resource-icon">
          {title.charAt(0).toUpperCase()}
        </div>

        <button
          className={`favorite-button ${isFavourite ? "active" : ""}`}
          type="button"
          onClick={onToggleFavourite}
          aria-label="Toggle favorite"
          aria-pressed={isFavourite}
        >
          {isFavourite ? "★" : "☆"}
        </button>
      </div>

      <div className="resource-card-content">
        <div className="resource-title-row">
          <h3>{title}</h3>
          {badge && <span className="resource-badge">{badge}</span>}
        </div>

        <p>{description}</p>
      </div>

      <div className="resource-card-bottom">
        <div className="resource-count">
          <strong>{count}</strong>
          <span>Items saved</span>
        </div>

        <div className="resource-actions">
          <button type="button" onClick={onEdit}>
            Edit
          </button>

          <button
            type="button"
            className="delete-action"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

export default ResourceCard;
