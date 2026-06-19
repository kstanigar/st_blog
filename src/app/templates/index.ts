import type React from "react";
import { BlogTemplate } from "./BlogTemplate";
import { GamesTemplate } from "./GamesTemplate";
import { AnalyticsTemplate } from "./AnalyticsTemplate";
import { MusicTemplate } from "./MusicTemplate";
import { ShopTemplate } from "./ShopTemplate";
import { BlankTemplate } from "./BlankTemplate";

export type TemplateProps = {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  onNavigate?: (i: number) => void;
  children: React.ReactNode;
};

export const PAGE_TEMPLATES: Record<number, React.ComponentType<TemplateProps>> = {
  0: BlogTemplate,
  1: GamesTemplate,
  2: AnalyticsTemplate,
  3: MusicTemplate,
  4: ShopTemplate,
  5: BlankTemplate,
};
