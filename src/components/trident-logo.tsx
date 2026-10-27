import { useId } from "react";

/**
 * The RUDRA trident emblem: a stylized electric-blue trishula drawn as a
 * single reusable SVG so every surface carries the same identity.
 */
export function TridentLogo({
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
      aria-label="RUDRA emblem"
    >
      <defs>
        <linearGradient id={gradientId} x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7DEBFF" />
          <stop offset="0.55" stopColor="#258BFF" />
          <stop offset="1" stopColor="#0755D9" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Center prong */}
        <path d="M16 30V9" />
        <path d="M16 2L13.4 6.4h5.2L16 2z" fill={`url(#${gradientId})`} stroke="none" />
        {/* Side prongs */}
        <path d="M9.5 20.5C7.5 18.5 7 13 7 8.5" />
        <path d="M7 3.5L5.2 7.4l3.6-.4L7 3.5z" fill={`url(#${gradientId})`} stroke="none" />
        <path d="M22.5 20.5c2-2 2.5-7.5 2.5-12" />
        <path d="M25 3.5l1.8 3.9-3.6-.4L25 3.5z" fill={`url(#${gradientId})`} stroke="none" />
        {/* Crossbar */}
        <path d="M9 15h14" />
      </g>
    </svg>
  );
}
