import { GridOverlay } from "../../components/GridOverlay";
import type { TemplateProps } from "./index";

export function MusicTemplate({ label, icon: Icon, children }: TemplateProps) {
  return (
    <div className="bg-background flex flex-col justify-center pl-16 lg:pl-24 h-full w-full">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" style={{ zIndex: 10 }} />
      <GridOverlay />
      <div className="relative z-20">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] text-primary mb-8">
          <Icon size={9} />
          NODE://{label}
        </div>
        <h2
          className="font-display font-black uppercase tracking-tight text-foreground mb-12"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
        >
          {label}
        </h2>
        <div className="space-y-px max-w-lg border-t border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
