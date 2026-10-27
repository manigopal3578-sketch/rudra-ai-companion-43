import { useId } from "react";

/**
 * The RUDRA guardian sigil: a stylized electric-blue trishula inside a shield.
 * Used as the summon point on the home screen and as the emblem inside the
 * floating guardian orb.
 */
export function TridentShield({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="RUDRA guardian sigil"
    >
      <defs>
        <linearGradient id={gradientId} x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7DEBFF" />
          <stop offset="0.55" stopColor="#258BFF" />
          <stop offset="1" stopColor="#0755D9" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gradientId})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Shield outline */}
        <path d="M16 2.5L27 6.5v9.2c0 7-4.4 11.3-11 13.8C9.4 27 5 22.7 5 15.7V6.5L16 2.5z" />
        {/* Center prong */}
        <path d="M16 25.5V12" />
        <path d="M16 7.8L14.1 11h3.8L16 7.8z" fill={`url(#${gradientId})`} stroke="none" />
        {/* Side prongs */}
        <path d="M11.4 19.6c-1.3-1.5-1.7-4.2-1.7-7.2" />
        <path d="M9.7 8.9l-1.5 3 2.9-.3-1.4-2.7z" fill={`url(#${gradientId})`} stroke="none" />
        <path d="M20.6 19.6c1.3-1.5 1.7-4.2 1.7-7.2" />
        <path d="M22.3 8.9l1.5 3-2.9-.3-1.4-2.7z" fill={`url(#${gradientId})`} stroke="none" />
        {/* Crossbar */}
        <path d="M11.4 16.6h9.2" />
      </g>
    </svg>
  );
}
