import { useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";

const DOUBLE_CLICK_WINDOW_MS = 300;

const FOCUS_COLOR = "#c084fc";
const CHILD_COLOR = "#5eead4";

export default function Graph3D({ graphData, focusId, onNodeSingleClick, onNodeDoubleClick }) {
  const fgRef = useRef();
  const lastClickRef = useRef({ id: null, time: 0 });
  const pendingTimeoutRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fgRef.current?.zoomToFit(600, 90);
    }, 500);
    return () => clearTimeout(timer);
  }, [graphData]);

  useEffect(() => {
    return () => {
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    };
  }, []);

  const handleNodeClick = (node) => {
    const now = Date.now();
    const { id: lastId, time: lastTime } = lastClickRef.current;

    if (lastId === node.id && now - lastTime < DOUBLE_CLICK_WINDOW_MS) {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
        pendingTimeoutRef.current = null;
      }
      lastClickRef.current = { id: null, time: 0 };
      onNodeDoubleClick(node);
      return;
    }

    lastClickRef.current = { id: node.id, time: now };
    pendingTimeoutRef.current = setTimeout(() => {
      onNodeSingleClick(node);
      pendingTimeoutRef.current = null;
    }, DOUBLE_CLICK_WINDOW_MS);
  };

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={graphData}
      backgroundColor="#0a0a12"
      nodeId="id"
      nodeLabel={(node) => node.title}
      nodeColor={(node) => (node.id === focusId ? FOCUS_COLOR : CHILD_COLOR)}
      nodeVal={(node) => (node.id === focusId ? 12 : 5)}
      nodeOpacity={0.95}
      linkColor={() => "rgba(255, 255, 255, 0.25)"}
      linkWidth={1}
      linkDirectionalParticles={1}
      linkDirectionalParticleWidth={1.5}
      linkDirectionalParticleColor={() => "rgba(192, 132, 252, 0.8)"}
      onNodeClick={handleNodeClick}
    />
  );
}
