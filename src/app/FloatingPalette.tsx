import { useState, useEffect } from "react";

const DEV_PALETTE = import.meta.env.VITE_DEV_PALETTE === "true";

const SKINS = [
  { id: "cyan",         label: "COOL",         hue: 200, free: true  },
  { id: "neon_ghost",   label: "NEON GHOST",   hue: 290, free: false },
  { id: "toxic",        label: "TOXIC",        hue: 140, free: false },
  { id: "solar_flare",  label: "SOLAR FLARE",  hue: 342, free: false },
  { id: "ivory_static", label: "IVORY STATIC", hue: 106, free: false },
  { id: "blood_code",   label: "BLOOD CODE",   hue: 15,  free: false },
  { id: "ember",        label: "EMBER",        hue: 57,  free: false },
];

function applyHue(hue: number) {
  document.documentElement.style.setProperty("--primary", `oklch(0.7 0.22 ${hue})`);
}

export function FloatingPalette({ onColorChange }: { onColorChange?: (hue: number) => void }) {
  const [open, setOpen] = useState(false);
  const [activeSkin, setActiveSkin] = useState("cyan");
  const [hue, setHue] = useState(200);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("st_skin");
    const skin = SKINS.find((s) => s.id === saved) ?? SKINS[0];
    setActiveSkin(skin.id);
    setHue(skin.hue);
    applyHue(skin.hue);
    onColorChange?.(skin.hue);
  }, []);

  function selectSkin(skin: (typeof SKINS)[0]) {
    if (!skin.free && !DEV_PALETTE) return; // TODO Session 4C: check purchases, open buy flow if locked
    setActiveSkin(skin.id);
    setHue(skin.hue);
    applyHue(skin.hue);
    onColorChange?.(skin.hue);
    localStorage.setItem("st_skin", skin.id);
  }

  function onSlider(e: React.ChangeEvent<HTMLInputElement>) {
    // TODO Session 4C: check color_wheel purchase before allowing (DEV_PALETTE bypasses)
    const h = Number(e.target.value);
    setHue(h);
    applyHue(h);
    onColorChange?.(h);
    setActiveSkin("");
  }

  function toggleMaster() {
    setEnabled((on) => {
      if (on) {
        applyHue(200);
        onColorChange?.(200);
      } else {
        applyHue(hue);
        onColorChange?.(hue);
      }
      return !on;
    });
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6" style={{ zIndex: 30 }}>
      {/* Trigger button — py-2.5 ensures 44px touch target */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="font-mono text-[9px] tracking-widest border px-3 py-2.5"
        style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
      >
        [COLOR]
      </button>

      {open && (
        <div
          className="absolute bottom-10 right-0 border p-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto max-w-[calc(100vw-2rem)]"
          style={{
            background: "var(--background)",
            borderColor: "var(--primary-glow-sm)",
            minWidth: 200,
          }}
        >
          {/* Master toggle */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-widest text-muted-foreground">
              COLOR SYSTEM
            </span>
            <button
              onClick={toggleMaster}
              className="font-mono text-[9px] tracking-widest border px-2 py-0.5"
              style={{
                borderColor: enabled ? "var(--primary)" : "var(--border)",
                color: enabled ? "var(--primary)" : "var(--muted-foreground)",
              }}
            >
              {enabled ? "ON" : "OFF"}
            </button>
          </div>

          {/* Named skin swatches — min-w/h-[44px] for 44px touch targets */}
          <div className="flex flex-wrap gap-1">
            {SKINS.map((skin) => (
              <button
                key={skin.id}
                onClick={() => selectSkin(skin)}
                className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px]"
                title={skin.free ? skin.label : `${skin.label} — $2.99`}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    background: `oklch(0.7 0.22 ${skin.hue})`,
                    opacity: skin.free || DEV_PALETTE ? 1 : 0.4,
                    outline: activeSkin === skin.id ? "1px solid var(--primary)" : "none",
                    outlineOffset: 2,
                  }}
                />
                <span
                  className="font-mono text-[8px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {skin.free || DEV_PALETTE ? skin.label : "LOCKED"}
                </span>
              </button>
            ))}
          </div>

          {/* Hue slider — locked until color_wheel purchased */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[8px] tracking-widest text-muted-foreground/50">
              COLOR WHEEL — $7.99
            </span>
            <input
              type="range"
              min={0}
              max={360}
              value={hue}
              onChange={onSlider}
              disabled={!DEV_PALETTE}
              style={{ accentColor: "var(--primary)", width: "100%", opacity: DEV_PALETTE ? 1 : 0.4 }}
            />
            <span className="font-mono text-[8px]" style={{ color: "var(--muted-foreground)" }}>
              HUE {hue}°
            </span>
          </div>

          {/* Rainbow cycle — locked until rainbow_cycle purchased */}
          <div className={`flex items-center justify-between ${DEV_PALETTE ? "" : "opacity-40"}`}>
            <span className="font-mono text-[8px] tracking-widest text-muted-foreground">
              RAINBOW — $9.99
            </span>
            <span className="font-mono text-[8px]" style={{ color: "var(--primary)" }}>
              {DEV_PALETTE ? "[DEV]" : "[LOCKED]"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
