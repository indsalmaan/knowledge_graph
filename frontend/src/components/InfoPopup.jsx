export default function InfoPopup({ topic, onClose, onExpand }) {
  if (!topic) return null;

  return (
    <aside className="info-panel">
      <button className="info-panel__close" onClick={onClose} aria-label="Close">
        &times;
      </button>
      <h2>{topic.title}</h2>
      <p className="info-panel__description">{topic.description}</p>
      {topic.metadata && Object.keys(topic.metadata).length > 0 && (
        <dl className="info-panel__metadata">
          {Object.entries(topic.metadata).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
      <button className="info-panel__expand" onClick={() => onExpand(topic)}>
        Explore subtopics &rarr;
      </button>
    </aside>
  );
}
