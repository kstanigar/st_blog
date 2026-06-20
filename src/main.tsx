import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./app/App.tsx";
import BlogPage from "./pages/BlogPage.tsx";
import GamesPage from "./pages/GamesPage.tsx";
import AnalyticsPage from "./pages/AnalyticsPage.tsx";
import MusicPage from "./pages/MusicPage.tsx";
import ShopPage from "./pages/ShopPage.tsx";
import "./styles/index.css";

import posthog from "posthog-js";
import { PostHogErrorBoundary, PostHogProvider } from "@posthog/react";

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: "2026-01-30",
});

createRoot(document.getElementById("root")!).render(
  <PostHogProvider client={posthog}>
    <PostHogErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/shop" element={<ShopPage />} />
        </Routes>
      </BrowserRouter>
    </PostHogErrorBoundary>
  </PostHogProvider>
);
