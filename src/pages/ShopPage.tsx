import { useLocation } from "react-router";
import { ShoppingBag } from "lucide-react";
import { AccordionPage } from "../components/AccordionPage";
import { slug } from "../lib/utils";
import { usePostHog } from "@posthog/react";

const PRODUCTS = [
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

export default function ShopPage() {
  const { hash } = useLocation();
  const defaultOpen = hash.slice(1) || undefined;
  const posthog = usePostHog();

  const handleProductViewed = (productId: string) => {
    const product = PRODUCTS.find((p) => slug(p.name) === productId);
    if (product) {
      posthog?.capture("product viewed", {
        product_id: productId,
        product_name: product.name,
        product_price: product.price,
        product_tag: product.tag,
      });
    }
  };

  const items = PRODUCTS.map((p, i) => ({
    id: slug(p.name),
    index: i + 1,
    label: p.name,
    content: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 text-[9px] tracking-widest mb-2">
          <span className="font-display text-lg font-black" style={{ color: "var(--primary)" }}>{p.price}</span>
          {p.tag && <span className="border border-current px-1.5 py-0.5 text-[8px]">[{p.tag}]</span>}
        </div>
        <p>{p.desc}</p>
      </div>
    ),
  }));

  return (
    <AccordionPage
      title="SHOP"
      icon={ShoppingBag}
      items={items}
      defaultOpen={defaultOpen}
      page="shop"
      onItemOpen={handleProductViewed}
    />
  );
}
