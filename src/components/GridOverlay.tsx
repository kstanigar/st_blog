export function GridOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity,
        backgroundImage:
          "linear-gradient(var(--primary-glow-md) 1px, transparent 1px), linear-gradient(90deg, var(--primary-glow-md) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }}
    />
  );
}
