# Task Group 4: Color Skin System (FloatingPalette)
> Standing Tiger Blog — Color Customization UI
> Created: 2026-06-16 | Status: Planning — UI first, wire to auth in Session 4C

---

## Overview

Fixed bottom-right `[COLOR]` button opens a modal. Users can switch between named color skins,
use a full hue slider, or enable rainbow cycle mode. A master toggle reverts to default cyan without
losing the chosen skin. Auth gating (locked/paid) is wired in Session 4C after Stripe integration.

---

## Monetization Tiers

| Product | Price | `product_id` | Gating |
|---|---|---|---|
| Skin: NEON GHOST | $2.99 | `skin_neon_ghost` | locked until purchased |
| Skin: TOXIC | $2.99 | `skin_toxic` | locked until purchased |
| Skin: SOLAR FLARE | $2.99 | `skin_solar_flare` | locked until purchased |
| Skin: IVORY STATIC | $2.99 | `skin_ivory_static` | locked until purchased |
| Skin: BLOOD CODE | $2.99 | `skin_blood_code` | locked until purchased |
| Skin: EMBER | $2.99 | `skin_ember` | locked until purchased |
| Color Wheel (hue slider) | $7.99 | `color_wheel` | locked until purchased |
| Rainbow Cycle + speed control | $9.99 | `rainbow_cycle` | locked until purchased |

Default CYAN skin is always free.

---

## SKINS Config Array

```ts
// hue = oklch hue angle (0–360). oklch keeps perceived brightness consistent across hues.
const SKINS = [
  { id: "cyan",         label: "CYAN",         hue: 200, free: true  }, // default
  { id: "neon_ghost",   label: "NEON GHOST",   hue: 290, free: false },
  { id: "toxic",        label: "TOXIC",        hue: 140, free: false },
  { id: "solar_flare",  label: "SOLAR FLARE",  hue: 50,  free: false },
  { id: "ivory_static", label: "IVORY STATIC", hue: 60,  free: false },
  { id: "blood_code",   label: "BLOOD CODE",   hue: 15,  free: false },
  { id: "ember",        label: "EMBER",        hue: 30,  free: false },
];
```

---

## applyHue Function

```ts
// Writes chosen hue to --primary on :root.
// color-mix vars in theme.css cascade automatically — no other changes needed.
function applyHue(hue: number) {
  document.documentElement.style.setProperty(
    '--primary',
    `oklch(0.7 0.22 ${hue})`  // 0.7 lightness + 0.22 chroma matches original cyan energy
  );
}
```

---

## FloatingPalette Component — Full Code Outline

```tsx
// src/app/FloatingPalette.tsx
// Fixed bottom-right color skin selector.
// Free tier: cyan only. Paid tier: full palette + hue slider (gating not yet wired — Session 4C).
// Reads/writes localStorage key 'st_skin' — chosen color persists across sessions.

import { useState, useEffect } from "react";

const SKINS = [ /* see above */ ];

function applyHue(hue: number) {
  document.documentElement.style.setProperty('--primary', `oklch(0.7 0.22 ${hue})`);
}

export function FloatingPalette({ onColorChange }: { onColorChange?: (hue: number) => void }) {
  const [open, setOpen] = useState(false);
  const [activeSkin, setActiveSkin] = useState("cyan");
  const [hue, setHue] = useState(200);
  const [enabled, setEnabled] = useState(true); // master toggle

  // Restore saved skin on first load
  useEffect(() => {
    const saved = localStorage.getItem('st_skin');
    const skin = SKINS.find(s => s.id === saved) ?? SKINS[0];
    setActiveSkin(skin.id);
    setHue(skin.hue);
    applyHue(skin.hue);
    onColorChange?.(skin.hue);
  }, []);

  function selectSkin(skin: typeof SKINS[0]) {
    if (!skin.free) return; // TODO Session 4C: check purchases, open buy flow if locked
    setActiveSkin(skin.id);
    setHue(skin.hue);
    applyHue(skin.hue);
    onColorChange?.(skin.hue);
    localStorage.setItem('st_skin', skin.id);
  }

  function onSlider(e: React.ChangeEvent<HTMLInputElement>) {
    // TODO Session 4C: check color_wheel purchase before allowing
    const h = Number(e.target.value);
    setHue(h);
    applyHue(h);
    onColorChange?.(h);
    setActiveSkin(""); // slider choice clears named skin selection
  }

  function toggleMaster() {
    setEnabled(on => {
      if (on) {
        applyHue(200); // revert to default cyan
        onColorChange?.(200);
      } else {
        applyHue(hue); // restore chosen skin
        onColorChange?.(hue);
      }
      return !on;
    });
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 30 }}>
      {/* Collapsed toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="font-mono text-[9px] tracking-widest border px-2 py-1"
        style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
      >
        [COLOR]
      </button>

      {open && (
        <div
          className="absolute bottom-8 right-0 border p-4 flex flex-col gap-4"
          style={{ background: "var(--background)", borderColor: "var(--primary-glow-sm)", minWidth: 200 }}
        >
          {/* Master toggle */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-widest text-muted-foreground">COLOR SYSTEM</span>
            <button
              onClick={toggleMaster}
              className="font-mono text-[9px] tracking-widest border px-2 py-0.5"
              style={{ borderColor: enabled ? "var(--primary)" : "var(--border)", color: enabled ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {enabled ? "ON" : "OFF"}
            </button>
          </div>

          {/* Named skin swatches */}
          <div className="flex flex-wrap gap-2">
            {SKINS.map(skin => (
              <button
                key={skin.id}
                onClick={() => selectSkin(skin)}
                className="flex flex-col items-center gap-1"
                title={skin.free ? skin.label : `${skin.label} — $2.99`}
              >
                <div style={{
                  width: 18, height: 18,
                  background: `oklch(0.7 0.22 ${skin.hue})`,
                  opacity: skin.free ? 1 : 0.4,
                  outline: activeSkin === skin.id ? "1px solid var(--primary)" : "none",
                  outlineOffset: 2,
                }} />
                <span className="font-mono text-[8px]" style={{ color: "var(--muted-foreground)" }}>
                  {skin.free ? skin.label : "LOCKED"}
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
              type="range" min={0} max={360} value={hue}
              onChange={onSlider}
              disabled // TODO Session 4C: enable if color_wheel purchased
              style={{ accentColor: "var(--primary)", width: "100%", opacity: 0.4 }}
            />
            <span className="font-mono text-[8px]" style={{ color: "var(--muted-foreground)" }}>
              HUE {hue}°
            </span>
          </div>

          {/* Rainbow cycle — locked until rainbow_cycle purchased */}
          <div className="flex items-center justify-between opacity-40">
            <span className="font-mono text-[8px] tracking-widest text-muted-foreground">
              RAINBOW — $9.99
            </span>
            <span className="font-mono text-[8px]" style={{ color: "var(--primary)" }}>[LOCKED]</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## MatrixBackground Canvas Sync (~5 line change to App.tsx)

```tsx
// MatrixBackground accepts optional primaryColor so canvas re-reads correct hex
// when user switches skins. Without this, matrix stays cyan after color change —
// canvas can't read CSS vars during the 60fps draw loop.
function MatrixBackground({ primaryColor = "#00d4ff" }: { primaryColor?: string }) {
  // Replace hardcoded "#00d4ff" and rgba(0,212,255,...) in canvas draw loop with primaryColor
}
```

Wire in App:
```tsx
const [primaryColor, setPrimaryColor] = useState("#00d4ff");

<MatrixBackground primaryColor={primaryColor} />
<FloatingPalette
  onColorChange={(hue) => {
    // Convert oklch hue to hex for canvas — use a temp element to resolve the CSS value
    const tmp = document.createElement("div");
    tmp.style.color = `oklch(0.7 0.22 ${hue})`;
    document.body.appendChild(tmp);
    const resolved = getComputedStyle(tmp).color;
    document.body.removeChild(tmp);
    setPrimaryColor(resolved);
  }}
/>
```

---

## localStorage Persistence

- Key: `st_skin` (skin ID string, e.g. `"toxic"`)
- Read on mount → restore skin
- Write on selection → persists across sessions
- Works before auth (free cyan skin + any purchased skins stored by ID)

---

## Files Affected

- `src/app/FloatingPalette.tsx` — new file, ~100 lines
- `src/app/App.tsx` — wire FloatingPalette + update MatrixBackground signature (~15 lines)

---

## Task List

- [ ] Create `src/app/FloatingPalette.tsx` — full component with SKINS config, applyHue, master toggle
- [ ] Edit `src/app/App.tsx` — update MatrixBackground to accept `primaryColor` prop
- [ ] Edit `src/app/App.tsx` — add `primaryColor` state + `onColorChange` handler
- [ ] Edit `src/app/App.tsx` — render `<FloatingPalette>` after `<CircuitOverlay />`
- [ ] Session 4C: wire `usePurchases()` into FloatingPalette to unlock skins + color wheel + rainbow

---

## Decisions

- `oklch(0.7 0.22 ${hue})` — perceptually uniform color cycling; HSL creates visible brightness dips at yellow/cyan
- `localStorage` key `st_skin` stores skin ID, not raw hue — allows migrating hue values if we adjust the skin palette later
- Canvas sync via `onColorChange` callback — canvas can't read CSS vars mid-loop; resolving via temp DOM element is the standard pattern
- Master toggle reverts `--primary` to `#00d4ff` (hardcoded default) without clearing chosen skin — lets users preview the change and toggle back

---

*Last updated: 2026-06-16*
