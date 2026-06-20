import * as Accordion from "@radix-ui/react-accordion";
import { usePostHog } from "@posthog/react";

export type AccordionItemData = {
  id: string;
  index: number;
  label: string;
  content: React.ReactNode;
};

export function SiteAccordion({
  items,
  defaultOpen,
  page,
  onItemOpen,
}: {
  items: AccordionItemData[];
  defaultOpen?: string;
  page?: string;
  onItemOpen?: (itemId: string) => void;
}) {
  const posthog = usePostHog();

  const handleValueChange = (value: string) => {
    if (value) {
      const item = items.find((it) => it.id === value);
      posthog?.capture("accordion expanded", {
        item_id: value,
        item_label: item?.label,
        page,
      });
      onItemOpen?.(value);
    }
  };

  return (
    <Accordion.Root
      type="single"
      collapsible
      defaultValue={defaultOpen}
      onValueChange={handleValueChange}
      className="w-full max-w-3xl"
    >
      {items.map((item) => (
        <Accordion.Item key={item.id} value={item.id} className="border-t border-border">
          <Accordion.Trigger className="w-full flex items-center gap-4 py-5 font-mono text-xs text-left group hover:text-primary transition-colors">
            <span className="text-muted-foreground/50 tabular-nums w-6 shrink-0">
              {String(item.index).padStart(2, "0")}
            </span>
            <span className="flex-1 font-display font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-wide">
              {item.label}
            </span>
            <span
              className="font-mono text-[9px] tracking-widest shrink-0"
              style={{ color: "var(--primary)" }}
            >
              <span className="group-data-[state=closed]:inline hidden">[+]</span>
              <span className="group-data-[state=open]:inline hidden">[−]</span>
            </span>
          </Accordion.Trigger>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="pb-8 pl-10 pr-4 font-mono text-xs text-muted-foreground leading-relaxed">
              {item.content}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
      <div className="border-t border-border" />
    </Accordion.Root>
  );
}
