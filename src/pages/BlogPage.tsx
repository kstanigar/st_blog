import { useLocation } from "react-router";
import { BookOpen } from "lucide-react";
import { AccordionPage } from "../components/AccordionPage";
import { slug } from "../lib/utils";

const POSTS = [
  {
    title: "WebGPU Compute Pipelines in Real Games",
    date: "2026-06-10", tag: "GPU", mins: 14,
    content: "Full post content will go here...",
  },
  {
    title: "ECS vs OOP: A 500K Entity Benchmark",
    date: "2026-06-07", tag: "ARCH", mins: 8,
    content: "Full post content will go here...",
  },
  {
    title: "DuckDB for Real-Time Game Analytics",
    date: "2026-06-03", tag: "DATA", mins: 15,
    content: "Full post content will go here...",
  },
  {
    title: "Building a WASM Plugin System in Rust",
    date: "2026-05-28", tag: "WASM", mins: 10,
    content: "Full post content will go here...",
  },
  {
    title: "Procedural Audio with SuperCollider + OSC",
    date: "2026-05-20", tag: "AUDIO", mins: 12,
    content: "Full post content will go here...",
  },
];

export default function BlogPage() {
  const { hash } = useLocation();
  const defaultOpen = hash.slice(1) || undefined;

  const items = POSTS.map((p, i) => ({
    id: slug(p.title),
    index: i + 1,
    label: p.title,
    content: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 text-[9px] tracking-widest mb-2">
          <span>{p.date}</span>
          <span style={{ color: "var(--primary)" }}>{p.tag}</span>
          <span>{p.mins} min read</span>
        </div>
        <p>{p.content}</p>
      </div>
    ),
  }));

  return <AccordionPage title="BLOG" icon={BookOpen} items={items} defaultOpen={defaultOpen} />;
}
