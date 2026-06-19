import { useLocation } from "react-router";
import { Wrench } from "lucide-react";
import { AccordionPage } from "../components/AccordionPage";
import { slug } from "../lib/utils";

const TOOLS = [
  { name: "Tauri 2", category: "Desktop", score: 9.4, desc: "Rust-backed native apps" },
  { name: "Bun 1.2", category: "Runtime", score: 9.1, desc: "All-in-one JS toolchain" },
  { name: "Turso", category: "Database", score: 8.9, desc: "Edge SQLite at scale" },
  { name: "Zed", category: "Editor", score: 9.0, desc: "GPU-rendered code editor" },
  { name: "Zig 0.14", category: "Language", score: 8.7, desc: "Systems lang for game engines" },
  { name: "Fly.io", category: "Deploy", score: 8.8, desc: "Low-latency edge hosting" },
];

export default function AnalyticsPage() {
  const { hash } = useLocation();
  const defaultOpen = hash.slice(1) || undefined;

  const items = TOOLS.map((t, i) => ({
    id: slug(t.name),
    index: i + 1,
    label: t.name,
    content: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 text-[9px] tracking-widest mb-2">
          <span style={{ color: "var(--primary)" }}>{t.category}</span>
          <span>Score: {t.score}</span>
        </div>
        <p>{t.desc}</p>
      </div>
    ),
  }));

  return <AccordionPage title="ANALYTICS" icon={Wrench} items={items} defaultOpen={defaultOpen} />;
}
