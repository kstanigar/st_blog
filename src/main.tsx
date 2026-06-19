import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./app/App.tsx";
import BlogPage from "./pages/BlogPage.tsx";
import GamesPage from "./pages/GamesPage.tsx";
import AnalyticsPage from "./pages/AnalyticsPage.tsx";
import MusicPage from "./pages/MusicPage.tsx";
import ShopPage from "./pages/ShopPage.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
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
);
