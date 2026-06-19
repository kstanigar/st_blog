import { useLocation } from "react-router";
import { Gamepad2 } from "lucide-react";
import { AccordionPage } from "../components/AccordionPage";
import { slug } from "../lib/utils";

const ARTICLES = [
  { title: "Unity DOTS & ECS in Production", tag: "ARCHITECTURE", reads: "6.2K", mins: 14, content: "Full article content will go here..." },
  { title: "WebGPU Compute Shaders", tag: "GRAPHICS", reads: "4.8K", mins: 11, content: "Full article content will go here..." },
  { title: "Godot 4 GDExtension Deep Dive", tag: "ENGINE", reads: "3.9K", mins: 9, content: "Full article content will go here..." },
  { title: "Unreal PCG Framework", tag: "TOOLS", reads: "5.1K", mins: 12, content: "Full article content will go here..." },
];

export default function GamesPage() {
  const { hash } = useLocation();
  const defaultOpen = hash.slice(1) || undefined;

  const items = ARTICLES.map((a, i) => ({
    id: slug(a.title),
    index: i + 1,
    label: a.title,
    content: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 text-[9px] tracking-widest mb-2">
          <span style={{ color: "var(--primary)" }}>{a.tag}</span>
          <span>{a.reads} reads</span>
          <span>{a.mins} min read</span>
        </div>
        <p>{a.content}</p>
      </div>
    ),
  }));

  return <AccordionPage title="GAMES" icon={Gamepad2} items={items} defaultOpen={defaultOpen} />;
}
