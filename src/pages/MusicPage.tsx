import { useLocation } from "react-router";
import { Music2 } from "lucide-react";
import { AccordionPage } from "../components/AccordionPage";
import { slug } from "../lib/utils";

const TOOLS = [
  { name: "FMOD Studio", desc: "Adaptive audio for interactive media", type: "DAW", affiliate: true },
  { name: "RNBO", desc: "Max/MSP patches to embedded targets", type: "DSP", affiliate: false },
  { name: "Tone.js", desc: "Web Audio API synthesis framework", type: "LIB", affiliate: false },
  { name: "SuperCollider", desc: "Algorithmic real-time composition", type: "LANG", affiliate: false },
  { name: "iZotope RX 11", desc: "AI-powered audio repair suite", type: "PLUGIN", affiliate: true },
];

export default function MusicPage() {
  const { hash } = useLocation();
  const defaultOpen = hash.slice(1) || undefined;

  const items = TOOLS.map((t, i) => ({
    id: slug(t.name),
    index: i + 1,
    label: t.name,
    content: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 text-[9px] tracking-widest mb-2">
          <span style={{ color: "var(--primary)" }}>{t.type}</span>
          {t.affiliate && <span className="border border-current px-1.5 py-0.5 text-[8px]">AFF</span>}
        </div>
        <p>{t.desc}</p>
      </div>
    ),
  }));

  return <AccordionPage title="MUSIC" icon={Music2} items={items} defaultOpen={defaultOpen} />;
}
