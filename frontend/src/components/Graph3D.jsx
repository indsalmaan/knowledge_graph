import { useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

const DOUBLE_CLICK_WINDOW_MS = 300;

const FOCUS_COLOR = "#c084fc";
const CHILD_COLOR = "#5eead4";

// Must match the default `nodeRelSize` used by the underlying force-graph renderer,
// so we can compute each sphere's actual radius and float the label a fixed gap above it.
const NODE_REL_SIZE = 4;
const LABEL_GAP = 6;

function nodeVal(node, focusId) {
  return node.id === focusId ? 12 : 5;
}

function sphereRadius(node, focusId) {
  return Math.cbrt(nodeVal(node, focusId)) * NODE_REL_SIZE;
}

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
      nodeVal={(node) => nodeVal(node, focusId)}
      nodeOpacity={0.95}
      nodeResolution={32}
      nodeThreeObjectExtend={true}
      nodeThreeObject={(node) => {
        const isFocus = node.id === focusId;
        const textHeight = isFocus ? 4.5 : 3;
        const sprite = new SpriteText(node.title);
        sprite.fontSize = 300;
        sprite.color = isFocus ? "#f5e1ff" : "#e4e4e7";
        sprite.textHeight = textHeight;
        sprite.backgroundColor = "rgba(10, 10, 18, 0.6)";
        sprite.padding = 2;
        sprite.borderRadius = 4;
        // Offset so the label's bottom edge sits LABEL_GAP above the sphere's surface, not its center.
        sprite.position.set(0, sphereRadius(node, focusId) + LABEL_GAP + textHeight / 2, 0);
        return sprite;
      }}
      linkColor={() => "rgba(255, 255, 255, 0.25)"}
      linkWidth={1}
      linkResolution={16}
      linkDirectionalParticles={1}
      linkDirectionalParticleWidth={1.5}
      linkDirectionalParticleColor={() => "rgba(192, 132, 252, 0.8)"}
      rendererConfig={{ antialias: true, alpha: true }}
      onNodeClick={handleNodeClick}
    />
  );
}
