import { useEffect, useRef, useState } from "react";
import {
  Zap,
  ChevronRight,
  Gamepad2,
  Music2,
  Wrench,
  BookOpen,
  ShoppingBag,
  ArrowRight,
  Cpu,
  Terminal,
} from "lucide-react";
import { useNavigate } from "react-router";
import { slug } from "../lib/utils";
import { GridOverlay } from "../components/GridOverlay";
import { PAGE_TEMPLATES } from "./templates";

// ─── Page config ───────────────────────────────────────────────────────────
type PageConfig = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  component: React.ComponentType<{ onNavigate?: (i: number) => void; onCardClick?: (path: string) => void }>;
  template: number | null;
};

const PAGE_CONFIG: PageConfig[] = [
  { id: "home",      label: "HOME",      icon: Cpu,         component: HomeSection,  template: null },
  { id: "blog",      label: "BLOG",      icon: BookOpen,    component: BlogSection,  template: 0 },
  { id: "games",     label: "GAMES",     icon: Gamepad2,    component: GamesSection, template: 1 },
  { id: "analytics", label: "ANALYTICS", icon: Wrench,      component: ToolsSection, template: 2 },
  { id: "music",     label: "MUSIC",     icon: Music2,      component: MusicSection, template: 3 },
  { id: "shop",      label: "SHOP",      icon: ShoppingBag, component: ShopSection,  template: 4 },
];

// ─── Circuit path waypoints ────────────────────────────────────────────────
// Number of horizontal-scroll sections — drives circuit width and resistor spacing
const NUM_SECTIONS = PAGE_CONFIG.length;

// Original waypoints were hand-tuned for a 6000px canvas (6 sections × ~1000px).
// Scaling only the x-axis keeps the vertical zigzag rhythm intact at any width.
function buildWaypoints(totalWidth: number): [number, number][] {
  const scale = totalWidth / (NUM_SECTIONS * 1000);
  const raw: [number, number][] = [
    [0, 720], [120, 720], [120, 640], [300, 640], [300, 760], [480, 760], [480, 680],
    [800, 680], [800, 580], [1000, 580], [1000, 720], [1200, 720], [1200, 640],
    [1520, 640], [1520, 760], [1720, 760], [1720, 620], [1940, 620], [1940, 700],
    [2140, 700], [2140, 560], [2360, 560], [2360, 680], [2580, 680], [2580, 760],
    [2780, 760], [2780, 620], [3000, 620], [3000, 700], [3200, 700], [3200, 560],
    [3440, 560], [3440, 720], [3680, 720], [3680, 640], [3900, 640], [3900, 760],
    [4120, 760], [4120, 600], [4340, 600], [4340, 720], [4580, 720], [4580, 640],
    [4820, 640], [4820, 760], [5040, 760], [5040, 620], [5280, 620], [5280, 700],
    [5520, 700], [5520, 640], [5720, 640], [5720, 760], [5900, 760], [5900, 680],
    [6000, 680],
  ];
  return raw.map(([x, y]) => [Math.round(x * scale), y]);
}

// Builds the SVG path string ("M x y H x V y ...") from a waypoint list
function buildCircuitPath(waypoints: [number, number][]): string {
  return waypoints.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px] = waypoints[i - 1];
    if (x !== px) return `${acc} H ${x}`;
    return `${acc} V ${y}`;
  }, "");
}

// ─── Matrix rain background ────────────────────────────────────────────────
function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas can't read CSS vars mid-loop — pull --primary once on mount.
    // Task Group 4 (FloatingPalette) will upgrade this to re-read on skin change.
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim() || "#00d4ff";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const CELL = 18;
    const chars = "01アイウエオ∑∂∇∈∉⊂⊃≈≠≤≥±√∞λαβγδ";
    const cols = Math.ceil(canvas.width / CELL);
    const drops: number[] = Array.from({ length: cols }, () =>
      Math.floor(Math.random() * -40)
    );

    let raf: number;
    const draw = () => {
      ctx.fillStyle = "rgba(7, 9, 14, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `11px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * CELL;
        const char = chars[Math.floor(Math.random() * chars.length)];
        const bright = drops[i] < 2;
        // Bright head chars use full primary; dim trailing chars fade to near-transparent
        ctx.fillStyle = bright
          ? primary
          : `rgba(0, 212, 255, ${Math.random() * 0.18 + 0.04})`;
        ctx.fillText(char, i * CELL, y);

        if (y > canvas.height && Math.random() > 0.97) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ─── Circuit SVG animation ─────────────────────────────────────────────────
function CircuitOverlay({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const dotGlowRef = useRef<SVGCircleElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pathLenRef = useRef(0);

  // Total circuit width must match the actual scroll width (viewport × section count),
  // not a fixed 6000px — otherwise the circuit runs out before the last section on wide screens.
  const [totalWidth, setTotalWidth] = useState(() => window.innerWidth * NUM_SECTIONS);

  useEffect(() => {
    const onResize = () => setTotalWidth(window.innerWidth * NUM_SECTIONS);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const waypoints = buildWaypoints(totalWidth);
  const circuitPath = buildCircuitPath(waypoints);
  const junctions = waypoints.slice(1, -1);
  // Resistors evenly spaced through the circuit at 1/12, 3/12, 5/12, 7/12, 9/12, 11/12
  const resistorPositions = [1, 3, 5, 7, 9, 11].map((n) => Math.round((n / 12) * totalWidth));

  useEffect(() => {
    if (pathRef.current) {
      pathLenRef.current = pathRef.current.getTotalLength();
      if (trailRef.current) {
        trailRef.current.style.strokeDasharray = `0 ${pathLenRef.current}`;
      }
    }
  }, [totalWidth]); // re-measure path length whenever circuit width changes

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const progress = maxScroll > 0 ? Math.min(el.scrollLeft / maxScroll, 1) : 0;
      const len = progress * pathLenRef.current;

      if (wrapRef.current) {
        wrapRef.current.style.transform = `translateX(-${el.scrollLeft}px)`;
      }
      if (trailRef.current) {
        trailRef.current.style.strokeDasharray = `${len} ${pathLenRef.current}`;
      }
      if (pathRef.current && dotRef.current && dotGlowRef.current) {
        const pt = pathRef.current.getPointAtLength(len);
        dotRef.current.setAttribute("cx", String(pt.x));
        dotRef.current.setAttribute("cy", String(pt.y));
        dotGlowRef.current.setAttribute("cx", String(pt.x));
        dotGlowRef.current.setAttribute("cy", String(pt.y));
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: totalWidth,
        height: "100vh",
        zIndex: 11,
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      <svg
        width={totalWidth}
        height="100%"
        viewBox={`0 0 ${totalWidth} 900`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dim base trace — barely visible ghost of the full path */}
        <path
          d={circuitPath}
          fill="none"
          stroke="var(--primary-glow-xs)"
          strokeWidth="1.5"
        />

        {/* Glowing lit trail — fills in as user scrolls */}
        <path
          ref={trailRef}
          d={circuitPath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.5"
          filter="url(#glow)"
        />

        {/* Hidden reference path for length/point calculations */}
        <path ref={pathRef} d={circuitPath} fill="none" stroke="none" />

        {/* Junction pads */}
        {junctions.map(([x, y], i) => (
          <rect
            key={i}
            x={x - 4}
            y={y - 4}
            width={8}
            height={8}
            fill="var(--background)"
            stroke="var(--primary-glow-sm)"
            strokeWidth="1.5"
          />
        ))}

        {/* Component symbols — resistors evenly spaced across the full circuit width */}
        {resistorPositions.map((cx) => (
          <g key={cx} transform={`translate(${cx}, 700)`}>
            <line x1="-18" y1="0" x2="-10" y2="0" stroke="var(--primary-glow-sm)" strokeWidth="1.5" />
            <rect x="-10" y="-5" width="20" height="10" fill="var(--background)" stroke="var(--primary-glow-sm)" strokeWidth="1.5" />
            <line x1="10" y1="0" x2="18" y2="0" stroke="var(--primary-glow-sm)" strokeWidth="1.5" />
          </g>
        ))}

        {/* Signal dot glow halo */}
        <circle
          ref={dotGlowRef}
          cx={waypoints[0][0]}
          cy={waypoints[0][1]}
          r={12}
          fill="var(--primary-glow-sm)"
          filter="url(#dot-glow)"
        />

        {/* Signal dot */}
        <circle
          ref={dotRef}
          cx={waypoints[0][0]}
          cy={waypoints[0][1]}
          r={4}
          fill="var(--primary)"
          filter="url(#glow)"
        />
      </svg>
    </div>
  );
}

// ─── Shared section wrapper ────────────────────────────────────────────────
function SectionShell({ children, index, total }: { children: React.ReactNode; index: number; total: number }) {
  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{ width: "100vw", height: "100vh", scrollSnapAlign: "start" }}
    >
      {children}
      <div
        className="absolute top-1/2 right-8 -translate-y-1/2 font-mono text-[9px] text-muted-foreground/40 tracking-widest"
        style={{ writingMode: "vertical-rl" }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
}

// ─── HOME ──────────────────────────────────────────────────────────────────
function HomeSection({ onNavigate, onCardClick: _onCardClick }: { onNavigate: (i: number) => void; onCardClick?: (path: string) => void }) {
  const navItems = ["BLOG", "GAMES", "ANALYTICS", "MUSIC", "SHOP"];

  return (
    <div className="bg-background flex flex-col justify-center pl-16 lg:pl-24 h-full w-full">
      <GridOverlay opacity={0.04} />
      <div className="absolute inset-0 bg-background/80" style={{ zIndex: 10 }} />

      <div className="relative z-20">
        {/* Signal label */}
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] text-primary mb-10">
          <Zap size={9} style={{ filter: "drop-shadow(0 0 4px var(--primary))" }} />
          STANDING TIGER://SIGNAL/INIT
        </div>

        {/* Logotype */}
        <h1
          className="font-display font-black uppercase leading-none tracking-tight text-foreground mb-2"
          style={{ fontSize: "clamp(4rem, 12vw, 9rem)" }}
        >
          DEV
        </h1>
        <h1
          className="font-display font-black uppercase leading-none tracking-tight mb-6"
          style={{
            fontSize: "clamp(4rem, 12vw, 9rem)",
            color: "var(--primary)",
            textShadow: "0 0 60px var(--primary-glow-md), 0 0 120px var(--primary-glow-xs)",
          }}
        >
          NODE
        </h1>

        {/* Hairline */}
        <div
          className="w-20 h-px mb-6"
          style={{
            background: "var(--primary)",
            boxShadow: "0 0 8px var(--primary-glow-lg)",
          }}
        />

        <p className="font-mono text-xs text-muted-foreground max-w-sm leading-loose tracking-wide mb-12">
          Game engineering, data systems &amp; dev tooling —<br />
          curated insight from the stack to the screen.
        </p>

        {/* Page links */}
        <div className="flex flex-col gap-2">
          {navItems.map((label, i) => (
            <button
              key={label}
              onClick={() => onNavigate(i + 1)}
              className="group flex items-center gap-3 w-fit font-mono text-[10px] tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
            >
              <span
                className="block h-px bg-current transition-all duration-300"
                style={{ width: 16 }}
              />
              {label}
              <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-10 right-10 flex items-center gap-2 font-mono text-[9px] tracking-widest text-muted-foreground">
        <span className="animate-pulse">SCROLL</span>
        <ChevronRight size={11} className="text-primary" />
      </div>
    </div>
  );
}

// ─── GAMES (transparent — shows matrix through) ────────────────────────────
function GamesSection({ onCardClick, onNavigate: _onNavigate }: { onCardClick: (path: string) => void; onNavigate?: (i: number) => void }) {
  const articles = [
    { title: "Unity DOTS & ECS in Production", tag: "ARCHITECTURE", reads: "6.2K", mins: 14 },
    { title: "WebGPU Compute Shaders", tag: "GRAPHICS", reads: "4.8K", mins: 11 },
    { title: "Godot 4 GDExtension Deep Dive", tag: "ENGINE", reads: "3.9K", mins: 9 },
    { title: "Unreal PCG Framework", tag: "TOOLS", reads: "5.1K", mins: 12 },
  ];

  return (
    <>
      {articles.map((a) => (
        <div
          key={a.title}
          className="border border-primary/15 bg-background/40 backdrop-blur-md p-5 cursor-pointer group hover:border-primary/50 hover:bg-background/60 transition-all"
          onClick={() => onCardClick('/games#' + slug(a.title))}
        >
          <div className="font-mono text-[9px] tracking-widest text-primary mb-3">{a.tag}</div>
          <div className="font-display text-xs font-bold text-foreground leading-snug mb-4">
            {a.title}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-mono text-[9px] text-muted-foreground">{a.reads} reads</div>
            <div className="font-mono text-[9px] text-muted-foreground">{a.mins} min</div>
          </div>
          <div className="mt-3 h-px bg-border">
            <div
              className="h-full bg-primary transition-all duration-500 group-hover:w-full"
              style={{ width: "0%", boxShadow: "0 0 4px var(--primary-glow-md)" }}
            />
          </div>
        </div>
      ))}
    </>
  );
}

// ─── MUSIC ────────────────────────────────────────────────────────────────
function MusicSection({ onCardClick, onNavigate: _onNavigate }: { onCardClick: (path: string) => void; onNavigate?: (i: number) => void }) {
  const tools = [
    { name: "FMOD Studio", desc: "Adaptive audio for interactive media", type: "DAW", affiliate: true },
    { name: "RNBO", desc: "Max/MSP patches to embedded targets", type: "DSP", affiliate: false },
    { name: "Tone.js", desc: "Web Audio API synthesis framework", type: "LIB", affiliate: false },
    { name: "SuperCollider", desc: "Algorithmic real-time composition", type: "LANG", affiliate: false },
    { name: "iZotope RX 11", desc: "AI-powered audio repair suite", type: "PLUGIN", affiliate: true },
  ];

  return (
    <>
      {tools.map((t, i) => (
        <div
          key={t.name}
          className="flex items-center gap-5 py-4 border-b border-border bg-background/60 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 cursor-pointer group transition-all px-1"
          onClick={() => onCardClick('/music#' + slug(t.name))}
        >
          <div className="font-mono text-[9px] text-muted-foreground/60 w-6 shrink-0 tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              {t.name}
            </div>
            <div className="font-mono text-[9px] text-muted-foreground mt-0.5 truncate">{t.desc}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {t.affiliate && (
              <span className="font-mono text-[8px] text-accent border border-accent/30 px-1.5 py-0.5 tracking-widest">
                AFF
              </span>
            )}
            <span className="font-mono text-[9px] text-primary border border-primary/20 px-2 py-0.5">
              {t.type}
            </span>
          </div>
          <ArrowRight size={10} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
        </div>
      ))}
    </>
  );
}

// ─── TOOLS ────────────────────────────────────────────────────────────────
function ToolsSection({ onCardClick, onNavigate: _onNavigate }: { onCardClick: (path: string) => void; onNavigate?: (i: number) => void }) {
  const tools = [
    { name: "Tauri 2", category: "Desktop", score: 9.4, desc: "Rust-backed native apps" },
    { name: "Bun 1.2", category: "Runtime", score: 9.1, desc: "All-in-one JS toolchain" },
    { name: "Turso", category: "Database", score: 8.9, desc: "Edge SQLite at scale" },
    { name: "Zed", category: "Editor", score: 9.0, desc: "GPU-rendered code editor" },
    { name: "Zig 0.14", category: "Language", score: 8.7, desc: "Systems lang for game engines" },
    { name: "Fly.io", category: "Deploy", score: 8.8, desc: "Low-latency edge hosting" },
  ];

  return (
    <>
      {tools.map((t) => (
        <div
          key={t.name}
          className="p-5 border-r border-b border-border bg-card hover:bg-primary/5 cursor-pointer group transition-colors"
          onClick={() => onCardClick('/analytics#' + slug(t.name))}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-display text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                {t.name}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground mt-0.5">{t.desc}</div>
            </div>
            <div
              className="font-mono text-sm font-bold tabular-nums"
              style={{ color: "var(--primary)", textShadow: "0 0 8px var(--primary-glow-sm)" }}
            >
              {t.score}
            </div>
          </div>
          <div className="h-px bg-border mt-4">
            <div
              className="h-full transition-all duration-700 group-hover:opacity-100"
              style={{
                width: `${(t.score / 10) * 100}%`,
                background: "var(--primary)",
                boxShadow: "0 0 6px var(--primary-glow-md)",
                opacity: 0.6,
              }}
            />
          </div>
          <div className="font-mono text-[8px] text-muted-foreground/50 mt-2 tracking-widest">{t.category}</div>
        </div>
      ))}
    </>
  );
}

// ─── BLOG ─────────────────────────────────────────────────────────────────
function BlogSection({ onCardClick, onNavigate: _onNavigate }: { onCardClick: (path: string) => void; onNavigate?: (i: number) => void }) {
  const posts = [
    { date: "2026-06-10", title: "WebGPU Compute Pipelines in Real Games", tag: "GPU", mins: 14 },
    { date: "2026-06-07", title: "ECS vs OOP: A 500K Entity Benchmark", tag: "ARCH", mins: 8 },
    { date: "2026-06-03", title: "DuckDB for Real-Time Game Analytics", tag: "DATA", mins: 15 },
    { date: "2026-05-28", title: "Building a WASM Plugin System in Rust", tag: "WASM", mins: 10 },
    { date: "2026-05-20", title: "Procedural Audio with SuperCollider + OSC", tag: "AUDIO", mins: 12 },
  ];

  return (
    <>
      {posts.map((p) => (
        <div
          key={p.title}
          className="flex gap-5 items-start py-5 border-b border-border bg-background/20 backdrop-blur-xl hover:border-primary/30 cursor-pointer group transition-colors"
          onClick={() => onCardClick('/blog#' + slug(p.title))}
        >
          <div className="font-mono text-[9px] text-muted-foreground/50 pt-px w-20 shrink-0 tabular-nums">
            {p.date}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
              {p.title}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[8px] text-primary border border-primary/25 px-1.5 py-0.5 tracking-widest">
                {p.tag}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/50">{p.mins} min read</span>
            </div>
          </div>
          <ArrowRight
            size={10}
            className="text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0 mt-px"
          />
        </div>
      ))}
    </>
  );
}

// ─── SHOP ─────────────────────────────────────────────────────────────────
function ShopSection({ onCardClick, onNavigate: _onNavigate }: { onCardClick: (path: string) => void; onNavigate?: (i: number) => void }) {
  const products = [
    {
      name: "GPU Compute Bundle",
      price: "$49",
      desc: "Shaders, compute pipelines, and WGSL from first principles.",
      tag: "HOT",
    },
    {
      name: "ECS Game Systems Kit",
      price: "$89",
      desc: "Templates, benchmarks, and architecture guides for entity-component-system.",
      tag: "NEW",
    },
    {
      name: "Data Dev Starter Pack",
      price: "$39",
      desc: "DuckDB + Parquet + Arrow for game telemetry and analytics.",
      tag: null,
    },
    {
      name: "Audio Engine Blueprints",
      price: "$59",
      desc: "FMOD + SuperCollider integration guides and starter sessions.",
      tag: null,
    },
  ];

  return (
    <>
      {products.map((p) => (
        <div
          key={p.name}
          className="border border-border bg-card p-5 w-44 flex flex-col hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
          onClick={() => onCardClick('/shop#' + slug(p.name))}
          style={{ minWidth: 176 }}
        >
          <div className="h-5 mb-3">
            {p.tag && (
              <span className="font-mono text-[8px] tracking-widest text-accent border border-accent/30 px-1.5 py-0.5">
                [{p.tag}]
              </span>
            )}
          </div>
          <div className="font-display text-xs font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
            {p.name}
          </div>
          <div className="font-mono text-[9px] text-muted-foreground leading-relaxed mb-5 flex-1">
            {p.desc}
          </div>
          <div className="flex items-center justify-between mt-auto">
            <div
              className="font-display text-lg font-black"
              style={{ color: "var(--primary)" }}
            >
              {p.price}
            </div>
            <ArrowRight size={10} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      setActive(Math.round(el.scrollLeft / window.innerWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const navigateTo = (i: number) => {
    containerRef.current?.scrollTo({
      left: i * window.innerWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Matrix rain always behind everything */}
      <MatrixBackground />

      {/* Circuit SVG animation */}
      <CircuitOverlay containerRef={containerRef} />

      {/* Fixed navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          borderBottom: "1px solid var(--primary-glow-border)",
          background: "var(--bg-nav)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => navigateTo(0)}
          className="flex items-center gap-2 font-display text-[10px] tracking-[0.35em] font-bold"
          style={{ color: "var(--primary)", textShadow: "0 0 12px var(--primary-glow-md)" }}
        >
          <Zap size={11} style={{ filter: "drop-shadow(0 0 4px var(--primary))" }} />
          STANDING TIGER
        </button>

        <div className="flex items-center gap-7">
          {PAGE_CONFIG.map((page, i) => (
            <button
              key={page.id}
              onClick={() => navigateTo(i)}
              className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest transition-colors"
              style={{ color: active === i ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {active === i && (
                <span style={{ color: "var(--primary)", fontSize: 8 }}>▸</span>
              )}
              {page.label}
            </button>
          ))}
        </div>

        <div className="font-mono text-[9px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>
          <span style={{ color: "var(--primary)" }}>{String(active + 1).padStart(2, "0")}</span>
          {` / ${String(PAGE_CONFIG.length).padStart(2, "0")}`}
        </div>
      </nav>

      {/* Horizontal scroll container */}
      <div
        ref={containerRef}
        className="w-full h-full flex overflow-x-scroll overflow-y-hidden"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {PAGE_CONFIG.map((page, i) => {
          const Template = page.template !== null ? PAGE_TEMPLATES[page.template] : null;
          return (
            <SectionShell key={page.id} index={i} total={PAGE_CONFIG.length}>
              {Template
                ? <Template label={page.label} icon={page.icon} onNavigate={navigateTo}>
                    <page.component onNavigate={navigateTo} onCardClick={navigate} />
                  </Template>
                : <page.component onNavigate={navigateTo} onCardClick={navigate} />
              }
            </SectionShell>
          );
        })}
      </div>

      {/* Hide WebKit scrollbar */}
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
