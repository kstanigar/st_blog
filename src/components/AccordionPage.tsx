import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { SiteAccordion, type AccordionItemData } from "./SiteAccordion";

type AccordionPageProps = {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  items: AccordionItemData[];
  defaultOpen?: string;
};

export function AccordionPage({ title, icon: Icon, items, defaultOpen }: AccordionPageProps) {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(var(--primary-glow-md) 1px, transparent 1px), linear-gradient(90deg, var(--primary-glow-md) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.03,
        }}
      />

      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: "1px solid var(--primary-glow-border)", background: "var(--bg-nav)", backdropFilter: "blur(12px)" }}
      >
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={10} />
          STANDING TIGER
        </button>

        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em]" style={{ color: "var(--primary)" }}>
          <Icon size={9} />
          NODE://{title}
        </div>

        <div className="font-mono text-[9px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>
          {String(items.length).padStart(2, "0")} ITEMS
        </div>
      </nav>

      <div className="px-16 lg:px-24 pt-16 pb-12">
        <h1
          className="font-display font-black uppercase tracking-tight text-foreground"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
        >
          {title}
        </h1>
      </div>

      <div className="px-16 lg:px-24 pb-24">
        <SiteAccordion items={items} defaultOpen={defaultOpen} />
      </div>
    </div>
  );
}
