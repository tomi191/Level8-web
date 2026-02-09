"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "motion/react";

// ─── Data Model ───────────────────────────────────────────────────────────────

interface Node {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  activation: number;
}

interface Trace {
  from: number;
  to: number;
  midX: number;
  midY: number;
  seg1Len: number;
  seg2Len: number;
  totalLen: number;
}

interface Signal {
  traceIndex: number;
  progress: number;
  speed: number;
  brightness: number;
  active: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STRIP_HEIGHT = 60;
const ROW_Y = [20, 40]; // two horizontal bus lanes
const SIGNAL_POOL_SIZE = 15;
const TRAIL_STEPS = 5;
const TRAIL_LENGTH = 0.12;

const NODE_ALPHA_MIN = 0.08;
const NODE_ALPHA_MAX = 0.15;
const NODE_RADIUS_MIN = 1;
const NODE_RADIUS_MAX = 2.5;

const TRACE_BASE_ALPHA = 0.04;
const TRACE_ACTIVE_BOOST = 0.08;
const ACTIVATION_DECAY = 0.93;
const AMBIENT_FIRE_CHANCE = 0.003;
const CASCADE_PROB = 0.35;

const GLOW_SIZE = 8;
const SIGNAL_GLOW_SIZE = 6;

// ─── Node Layout ──────────────────────────────────────────────────────────────

function createNodes(width: number): Node[] {
  const isMobile = width < 768;
  const nodeCount = isMobile ? 7 : 12; // per row
  const nodes: Node[] = [];

  for (let row = 0; row < 2; row++) {
    const y = ROW_Y[row];
    const spacing = width / (nodeCount + 1);

    for (let i = 0; i < nodeCount; i++) {
      const baseX = spacing * (i + 1);
      const jitterX = (Math.random() - 0.5) * spacing * 0.35;
      const jitterY = (Math.random() - 0.5) * 8;

      nodes.push({
        x: baseX + jitterX,
        y: y + jitterY,
        radius: NODE_RADIUS_MIN + Math.random() * (NODE_RADIUS_MAX - NODE_RADIUS_MIN),
        baseAlpha: NODE_ALPHA_MIN + Math.random() * (NODE_ALPHA_MAX - NODE_ALPHA_MIN),
        activation: 0,
      });
    }
  }

  return nodes;
}

// ─── Trace Creation ───────────────────────────────────────────────────────────

function createTraces(nodes: Node[], nodesPerRow: number): Trace[] {
  const traces: Trace[] = [];
  const total = nodes.length;

  // Horizontal connections within each row
  for (let row = 0; row < 2; row++) {
    const offset = row * nodesPerRow;
    for (let i = 0; i < nodesPerRow - 1; i++) {
      const from = offset + i;
      const to = offset + i + 1;
      if (from < total && to < total) {
        addTrace(from, to);
      }
    }
  }

  // Vertical jog connections between rows (some, not all)
  for (let i = 0; i < nodesPerRow; i++) {
    const top = i;
    const bottom = nodesPerRow + i;
    if (top < total && bottom < total && Math.random() < 0.4) {
      addTrace(top, bottom);
    }
    // Diagonal-ish connections
    if (i < nodesPerRow - 1) {
      const bottomRight = nodesPerRow + i + 1;
      if (top < total && bottomRight < total && Math.random() < 0.2) {
        addTrace(top, bottomRight);
      }
    }
  }

  function addTrace(fromIdx: number, toIdx: number) {
    const a = nodes[fromIdx];
    const b = nodes[toIdx];

    // L-shaped routing: horizontal first, then vertical
    const hFirst = Math.random() < 0.6;
    const midX = hFirst ? b.x : a.x;
    const midY = hFirst ? a.y : b.y;
    const seg1Len = hFirst ? Math.abs(b.x - a.x) : Math.abs(b.y - a.y);
    const seg2Len = hFirst ? Math.abs(b.y - a.y) : Math.abs(b.x - a.x);

    // Ensure left-to-right direction for signals
    const [f, t] = a.x <= b.x ? [fromIdx, toIdx] : [toIdx, fromIdx];

    traces.push({
      from: f,
      to: t,
      midX,
      midY,
      seg1Len,
      seg2Len,
      totalLen: seg1Len + seg2Len,
    });
  }

  return traces;
}

// ─── Outgoing Lookup ──────────────────────────────────────────────────────────

function buildOutgoing(traces: Trace[], nodeCount: number): Map<number, number[]> {
  const map = new Map<number, number[]>();
  for (let i = 0; i < nodeCount; i++) map.set(i, []);
  for (let ti = 0; ti < traces.length; ti++) {
    map.get(traces[ti].from)!.push(ti);
  }
  return map;
}

// ─── Signal Pool ──────────────────────────────────────────────────────────────

function createSignalPool(): Signal[] {
  const pool: Signal[] = [];
  for (let i = 0; i < SIGNAL_POOL_SIZE; i++) {
    pool.push({
      traceIndex: 0,
      progress: 0,
      speed: 0,
      brightness: 0,
      active: false,
    });
  }
  return pool;
}

function spawnSignal(signals: Signal[], traceIndex: number): void {
  for (const s of signals) {
    if (!s.active) {
      s.traceIndex = traceIndex;
      s.progress = 0;
      s.speed = 0.008 + Math.random() * 0.01;
      s.brightness = 0.6 + Math.random() * 0.4;
      s.active = true;
      return;
    }
  }
}

// ─── Glow Textures ────────────────────────────────────────────────────────────

function createGlowTexture(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = GLOW_SIZE * 2;
  c.height = GLOW_SIZE * 2;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(GLOW_SIZE, GLOW_SIZE, 0, GLOW_SIZE, GLOW_SIZE, GLOW_SIZE);
  g.addColorStop(0, "rgba(57,255,20,0.5)");
  g.addColorStop(0.4, "rgba(57,255,20,0.1)");
  g.addColorStop(1, "rgba(57,255,20,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, GLOW_SIZE * 2, GLOW_SIZE * 2);
  return c;
}

function createSignalGlowTexture(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SIGNAL_GLOW_SIZE * 2;
  c.height = SIGNAL_GLOW_SIZE * 2;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(
    SIGNAL_GLOW_SIZE, SIGNAL_GLOW_SIZE, 0,
    SIGNAL_GLOW_SIZE, SIGNAL_GLOW_SIZE, SIGNAL_GLOW_SIZE,
  );
  g.addColorStop(0, "rgba(57,255,20,0.8)");
  g.addColorStop(0.3, "rgba(57,255,20,0.2)");
  g.addColorStop(1, "rgba(57,255,20,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIGNAL_GLOW_SIZE * 2, SIGNAL_GLOW_SIZE * 2);
  return c;
}

// ─── Trace Position ───────────────────────────────────────────────────────────

function getTracePosition(
  tr: Trace,
  nodes: Node[],
  progress: number,
): { x: number; y: number } {
  const a = nodes[tr.from];
  const b = nodes[tr.to];
  if (tr.totalLen === 0) return { x: a.x, y: a.y };

  const p = Math.max(0, Math.min(1, progress));
  const dist = p * tr.totalLen;

  if (dist <= tr.seg1Len) {
    const t = tr.seg1Len > 0 ? dist / tr.seg1Len : 0;
    return {
      x: a.x + (tr.midX - a.x) * t,
      y: a.y + (tr.midY - a.y) * t,
    };
  }
  const t = tr.seg2Len > 0 ? (dist - tr.seg1Len) / tr.seg2Len : 0;
  return {
    x: tr.midX + (b.x - tr.midX) * Math.min(t, 1),
    y: tr.midY + (b.y - tr.midY) * Math.min(t, 1),
  };
}

// ─── Static Frame (reduced motion) ───────────────────────────────────────────

function drawStaticFrame(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  traces: Trace[],
  width: number,
  glowTex: HTMLCanvasElement,
): void {
  ctx.clearRect(0, 0, width, STRIP_HEIGHT);

  ctx.lineWidth = 0.5;
  for (const tr of traces) {
    const a = nodes[tr.from];
    const b = nodes[tr.to];
    ctx.strokeStyle = `rgba(57,255,20,${TRACE_BASE_ALPHA})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(tr.midX, tr.midY);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  for (const n of nodes) {
    ctx.globalAlpha = n.baseAlpha;
    ctx.drawImage(
      glowTex,
      n.x - GLOW_SIZE,
      n.y - GLOW_SIZE,
      GLOW_SIZE * 2,
      GLOW_SIZE * 2,
    );
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#39ff14";
  for (const n of nodes) {
    ctx.globalAlpha = n.baseAlpha;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Animated Frame ───────────────────────────────────────────────────────────

function drawFrame(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  traces: Trace[],
  signals: Signal[],
  outgoing: Map<number, number[]>,
  width: number,
  glowTex: HTMLCanvasElement,
  sigGlowTex: HTMLCanvasElement,
): void {
  ctx.clearRect(0, 0, width, STRIP_HEIGHT);

  // 1. Decay activations
  for (const n of nodes) {
    n.activation *= ACTIVATION_DECAY;
    if (n.activation < 0.01) n.activation = 0;
  }

  // 2. Ambient firing — only from left-edge nodes
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].x < width * 0.15 && Math.random() < AMBIENT_FIRE_CHANCE) {
      nodes[i].activation = 1.0;
      const outs = outgoing.get(i);
      if (outs) {
        for (const ti of outs) {
          spawnSignal(signals, ti);
        }
      }
    }
  }

  // 3. Update signals
  for (const s of signals) {
    if (!s.active) continue;
    s.progress += s.speed;

    if (s.progress >= 1.0) {
      s.active = false;
      const tr = traces[s.traceIndex];
      const dest = nodes[tr.to];
      dest.activation = 1.0;

      // Cascade forward
      const outs = outgoing.get(tr.to);
      if (outs) {
        for (const ti of outs) {
          if (Math.random() < CASCADE_PROB) {
            spawnSignal(signals, ti);
          }
        }
      }
    }
  }

  // 4. Draw traces
  ctx.lineWidth = 0.5;
  for (const tr of traces) {
    const a = nodes[tr.from];
    const b = nodes[tr.to];
    const boost = Math.max(a.activation, b.activation) * TRACE_ACTIVE_BOOST;
    const alpha = TRACE_BASE_ALPHA + boost;
    ctx.strokeStyle = `rgba(57,255,20,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(tr.midX, tr.midY);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // 5. Draw signal trails + heads
  ctx.fillStyle = "#39ff14";
  for (const s of signals) {
    if (!s.active) continue;
    const tr = traces[s.traceIndex];

    // Trail dots
    for (let step = TRAIL_STEPS; step >= 1; step--) {
      const t = s.progress - (step / TRAIL_STEPS) * TRAIL_LENGTH;
      if (t < 0) continue;
      const pos = getTracePosition(tr, nodes, t);
      ctx.globalAlpha = (1 - step / TRAIL_STEPS) * s.brightness * 0.35;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head glow
    const head = getTracePosition(tr, nodes, s.progress);
    ctx.globalAlpha = s.brightness * 0.4;
    ctx.drawImage(
      sigGlowTex,
      head.x - SIGNAL_GLOW_SIZE,
      head.y - SIGNAL_GLOW_SIZE,
      SIGNAL_GLOW_SIZE * 2,
      SIGNAL_GLOW_SIZE * 2,
    );

    // Head core
    ctx.globalAlpha = s.brightness;
    ctx.beginPath();
    ctx.arc(head.x, head.y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 6. Node glows
  for (const n of nodes) {
    const scale = 1 + n.activation * 0.8;
    ctx.globalAlpha = Math.min(n.baseAlpha + n.activation * 0.3, 1);
    ctx.drawImage(
      glowTex,
      n.x - GLOW_SIZE * scale,
      n.y - GLOW_SIZE * scale,
      GLOW_SIZE * 2 * scale,
      GLOW_SIZE * 2 * scale,
    );
  }
  ctx.globalAlpha = 1;

  // 7. Node cores
  ctx.fillStyle = "#39ff14";
  for (const n of nodes) {
    ctx.globalAlpha = Math.min(n.baseAlpha + n.activation * 0.3, 1);
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius + n.activation * 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CircuitDividerProps {
  className?: string;
}

export function CircuitDivider({ className }: CircuitDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const animFrameRef = useRef<number>(0);
  const isVisibleRef = useRef(false);

  const nodesRef = useRef<Node[]>([]);
  const tracesRef = useRef<Trace[]>([]);
  const signalsRef = useRef<Signal[]>([]);
  const outgoingRef = useRef<Map<number, number[]>>(new Map());
  const glowTexRef = useRef<HTMLCanvasElement | null>(null);
  const sigGlowTexRef = useRef<HTMLCanvasElement | null>(null);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    canvas.width = w * dpr;
    canvas.height = STRIP_HEIGHT * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${STRIP_HEIGHT}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    return { width: w, ctx };
  }, []);

  const initCircuit = useCallback((w: number) => {
    const isMobile = w < 768;
    const nodesPerRow = isMobile ? 7 : 12;
    nodesRef.current = createNodes(w);
    tracesRef.current = createTraces(nodesRef.current, nodesPerRow);
    outgoingRef.current = buildOutgoing(tracesRef.current, nodesRef.current.length);
    signalsRef.current = createSignalPool();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const result = setupCanvas();
    if (!result || !result.ctx) return;
    let { width, ctx } = result;

    glowTexRef.current = createGlowTexture();
    sigGlowTexRef.current = createSignalGlowTexture();
    initCircuit(width);

    if (prefersReducedMotion) {
      drawStaticFrame(ctx, nodesRef.current, tracesRef.current, width, glowTexRef.current);
      return;
    }

    // IntersectionObserver — pause animation when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          // Restart loop when coming into view
          animFrameRef.current = requestAnimationFrame(loop);
        }
      },
      { threshold: 0 },
    );
    observer.observe(container);

    const loop = () => {
      if (!isVisibleRef.current) return; // stop RAF when hidden

      drawFrame(
        ctx!,
        nodesRef.current,
        tracesRef.current,
        signalsRef.current,
        outgoingRef.current,
        width,
        glowTexRef.current!,
        sigGlowTexRef.current!,
      );
      animFrameRef.current = requestAnimationFrame(loop);
    };

    // Start if visible
    isVisibleRef.current = true;
    animFrameRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        const r = setupCanvas();
        if (!r || !r.ctx) return;
        width = r.width;
        ctx = r.ctx;
        initCircuit(width);
      }, 250);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(resizeTimeoutRef.current);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [prefersReducedMotion, setupCanvas, initCircuit]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`relative w-full pointer-events-none ${className ?? ""}`}
      style={{
        height: `${STRIP_HEIGHT}px`,
        maskImage: "linear-gradient(transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage: "linear-gradient(transparent, black 15%, black 85%, transparent)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
    </div>
  );
}
