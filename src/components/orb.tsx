import { TridentLogo } from "@/components/trident-logo";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";
export type OrbSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<OrbSize, string> = {
  sm: "90px",
  md: "150px",
  lg: "220px",
  xl: "min(62vw, 280px)",
};

/**
 * The luminous RUDRA AI core: layered glass surfaces, controlled electric-blue
 * illumination, orbiting particles and energy ribbons. Animation intensity and
 * reduced motion are handled globally through [data-intensity] and
 * [data-motion] attributes set by the Settings provider.
 */
export function Orb({
  size = "lg",
  state = "idle",
  level = 0,
  showEmblem = true,
  className,
}: {
  size?: OrbSize;
  state?: OrbState;
  level?: number;
  showEmblem?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`orb orb--${state} ${className ?? ""}`}
      style={{ ["--orb-size" as string]: SIZES[size] }}
      role="img"
      aria-label={`RUDRA assistant core, ${state}`}
    >
      <div className="orb__aura" />
      <div className="orb__ribbon" />
      <div className="orb__ribbon orb__ribbon--b" />
      <div className="orb__orbit">
        {Array.from({ length: 7 }, (_, i) => (
          <span
            key={i}
            className={`orb__particle${i % 3 === 0 ? " orb__particle--violet" : ""}`}
            style={{ ["--particle-angle" as string]: `${(360 / 7) * i}deg` }}
          />
        ))}
      </div>
      <div
        className="orb__core"
        style={state === "listening" && level > 0 ? { transform: `scale(${1 + Math.min(0.35, level * 0.35)})` } : undefined}
      />
      <div className="orb__ring" />
      <div className="orb__sheen" />
      {showEmblem && (
        <div className="orb__emblem">
          <TridentLogo size={parseInt(SIZES[size], 10) * 0.2 || 18} />
        </div>
      )}
    </div>
  );
}
