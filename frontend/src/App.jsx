import { useCallback, useEffect, useState } from "react";
import Graph3D from "./components/Graph3D";
import InfoPopup from "./components/InfoPopup";
import Breadcrumb from "./components/Breadcrumb";
import { getGraphView } from "./api/topicsApi";
import "./App.css";

const ROOT_TOPIC_ID = import.meta.env.VITE_ROOT_TOPIC_ID || "root";

function toGraphData(view) {
  return {
    nodes: [view.node, ...view.children],
    links: view.children.map((child) => ({ source: view.node.id, target: child.id })),
  };
}

export default function App() {
  const [focusId, setFocusId] = useState(ROOT_TOPIC_ID);
  const [trail, setTrail] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getGraphView(focusId)
      .then((view) => {
        if (cancelled) return;
        if (!view) {
          setError(`Topic "${focusId}" was not found. Have you run the seed script?`);
          return;
        }
        setGraphData(toGraphData(view));
        setTrail((prev) => {
          const existingIndex = prev.findIndex((item) => item.id === view.node.id);
          if (existingIndex !== -1) return prev.slice(0, existingIndex + 1);
          return [...prev, { id: view.node.id, title: view.node.title }];
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [focusId]);

  const handleSingleClick = useCallback((node) => {
    setSelectedTopic(node);
  }, []);

  const handleDoubleClick = useCallback((node) => {
    setSelectedTopic(null);
    setFocusId(node.id);
  }, []);

  const handleExpandFromPopup = useCallback((topic) => {
    setSelectedTopic(null);
    setFocusId(topic.id);
  }, []);

  const handleBreadcrumbNavigate = useCallback(
    (index) => {
      setTrail((prev) => prev.slice(0, index + 1));
      setFocusId(trail[index].id);
    },
    [trail]
  );

  const handleBack = useCallback(() => {
    if (trail.length <= 1) return;
    handleBreadcrumbNavigate(trail.length - 2);
  }, [trail, handleBreadcrumbNavigate]);

  return (
    <div className="app">
      <Breadcrumb trail={trail} onNavigate={handleBreadcrumbNavigate} onBack={handleBack} />

      <div className="canvas-wrap">
        {loading && <div className="status-banner">Loading knowledge graph&hellip;</div>}
        {error && <div className="status-banner status-banner--error">{error}</div>}
        {!loading && !error && (
          <Graph3D
            graphData={graphData}
            focusId={focusId}
            onNodeSingleClick={handleSingleClick}
            onNodeDoubleClick={handleDoubleClick}
          />
        )}
      </div>

      <InfoPopup
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        onExpand={handleExpandFromPopup}
      />
    </div>
  );
}
