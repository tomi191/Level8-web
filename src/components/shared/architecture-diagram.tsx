import type { DiagramNode, DiagramEdge, DiagramNodeType } from "@/types";

interface ArchitectureDiagramProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

const COLUMN_ORDER: DiagramNodeType[] = [
  "actor",
  "frontend",
  "backend",
  "database",
  "external",
];

const TYPE_STYLES: Record<
  DiagramNodeType,
  { fill: string; stroke: string; text: string; label: string }
> = {
  actor:    { fill: "#1e3a5f", stroke: "#3b82f6", text: "#dbeafe", label: "Actor" },
  frontend: { fill: "#0f2920", stroke: "#39ff14", text: "#d4fcc6", label: "Frontend" },
  backend:  { fill: "#2a1f3d", stroke: "#a78bfa", text: "#e9d5ff", label: "Backend" },
  database: { fill: "#3a2410", stroke: "#f97316", text: "#fed7aa", label: "Database" },
  external: { fill: "#1f2937", stroke: "#94a3b8", text: "#e2e8f0", label: "External" },
};

const NODE_WIDTH = 180;
const NODE_HEIGHT = 54;
const COLUMN_GAP = 80;
const ROW_GAP = 28;
const HORIZONTAL_PADDING = 20;
const VERTICAL_PADDING = 40;

function truncate(label: string, maxChars = 28): string {
  return label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label;
}

export function ArchitectureDiagram({ nodes, edges }: ArchitectureDiagramProps) {
  // Group nodes by type
  const columns = new Map<DiagramNodeType, DiagramNode[]>();
  for (const type of COLUMN_ORDER) columns.set(type, []);
  for (const n of nodes) {
    const list = columns.get(n.type);
    if (list) list.push(n);
  }

  // Filter out empty columns
  const activeColumns = COLUMN_ORDER.filter((t) => (columns.get(t)?.length ?? 0) > 0);
  const maxRows = Math.max(
    1,
    ...activeColumns.map((t) => columns.get(t)?.length ?? 0)
  );

  const totalWidth =
    HORIZONTAL_PADDING * 2 +
    activeColumns.length * NODE_WIDTH +
    (activeColumns.length - 1) * COLUMN_GAP;

  const totalHeight =
    VERTICAL_PADDING * 2 + maxRows * NODE_HEIGHT + (maxRows - 1) * ROW_GAP;

  // Compute position for each node
  const positions = new Map<string, { x: number; y: number; type: DiagramNodeType }>();
  activeColumns.forEach((type, colIdx) => {
    const list = columns.get(type)!;
    const columnHeight = list.length * NODE_HEIGHT + (list.length - 1) * ROW_GAP;
    const startY = (totalHeight - columnHeight) / 2;
    list.forEach((node, rowIdx) => {
      positions.set(node.id, {
        x: HORIZONTAL_PADDING + colIdx * (NODE_WIDTH + COLUMN_GAP),
        y: startY + rowIdx * (NODE_HEIGHT + ROW_GAP),
        type,
      });
    });
  });

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-black/40 p-4 md:p-6">
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto min-w-[640px]"
        role="img"
        aria-label="Архитектурна диаграма"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#39ff14" opacity="0.6" />
          </marker>
        </defs>

        {/* Column headers */}
        {activeColumns.map((type, colIdx) => {
          const x = HORIZONTAL_PADDING + colIdx * (NODE_WIDTH + COLUMN_GAP);
          return (
            <text
              key={`header-${type}`}
              x={x + NODE_WIDTH / 2}
              y={16}
              textAnchor="middle"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              fill="#94a3b8"
              letterSpacing="0.2em"
            >
              {TYPE_STYLES[type].label.toUpperCase()}
            </text>
          );
        })}

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (!from || !to) return null;

          const fromX = from.x + NODE_WIDTH;
          const fromY = from.y + NODE_HEIGHT / 2;
          const toX = to.x;
          const toY = to.y + NODE_HEIGHT / 2;

          // For edges going leftward (reverse flow), adjust anchor points
          const isReverse = toX < fromX;
          const actualFromX = isReverse ? from.x : fromX;
          const actualToX = isReverse ? to.x + NODE_WIDTH : toX;

          // Bezier curve for visual interest
          const midX = (actualFromX + actualToX) / 2;
          const path = `M ${actualFromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${actualToX} ${toY}`;

          const labelX = midX;
          const labelY = (fromY + toY) / 2 - 4;

          return (
            <g key={`edge-${i}`}>
              <path
                d={path}
                stroke="#39ff14"
                strokeWidth="1"
                strokeOpacity="0.35"
                fill="none"
                markerEnd="url(#arrow)"
              />
              {edge.label && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fill="#94a3b8"
                >
                  <tspan
                    dx="0"
                    dy="0"
                    style={{
                      paintOrder: "stroke",
                      stroke: "#0a0a0a",
                      strokeWidth: 3,
                      strokeLinecap: "butt",
                      strokeLinejoin: "miter",
                    }}
                  >
                    {truncate(edge.label, 22)}
                  </tspan>
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const style = TYPE_STYLES[pos.type];
          return (
            <g key={node.id}>
              <rect
                x={pos.x}
                y={pos.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx="8"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth="1"
                strokeOpacity="0.7"
              />
              <text
                x={pos.x + NODE_WIDTH / 2}
                y={pos.y + NODE_HEIGHT / 2 + 4}
                textAnchor="middle"
                fontSize="12"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight="500"
                fill={style.text}
              >
                {truncate(node.label, 24)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
