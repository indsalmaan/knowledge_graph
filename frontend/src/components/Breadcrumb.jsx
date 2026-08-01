export default function Breadcrumb({ trail, onNavigate, onBack }) {
  return (
    <nav className="breadcrumb">
      <button
        className="breadcrumb__back"
        onClick={onBack}
        disabled={trail.length <= 1}
        aria-label="Go back"
      >
        &larr; Back
      </button>
      <ol className="breadcrumb__trail">
        {trail.map((item, index) => (
          <li key={item.id}>
            {index === trail.length - 1 ? (
              <span className="breadcrumb__current">{item.title}</span>
            ) : (
              <button onClick={() => onNavigate(index)}>{item.title}</button>
            )}
            {index < trail.length - 1 && <span className="breadcrumb__sep">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
