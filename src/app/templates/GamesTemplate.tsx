import type { TemplateProps } from "./index";

export function GamesTemplate({ label, icon: Icon, children }: TemplateProps) {
  return (
    <div className="flex flex-col justify-center pl-16 lg:pl-24 h-full w-full">
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
        <div className="grid grid-cols-2 gap-3 max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
