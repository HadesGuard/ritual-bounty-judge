"use client";

/**
 * The wax seal — the product's signature mark. A commitment is a sealed answer;
 * the reveal cracks it. Clean red wax with a pressed "SV" monogram; a `broken`
 * variant for revealed submissions. Colors come from theme tokens.
 */

function scallop(cx: number, cy: number, rOut: number, rIn: number, teeth: number) {
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * 2 * Math.PI;
    const a1 = ((i + 0.5) / teeth) * 2 * Math.PI;
    const a2 = ((i + 1) / teeth) * 2 * Math.PI;
    const p0 = [cx + Math.cos(a0) * rIn, cy + Math.sin(a0) * rIn];
    const pk = [cx + Math.cos(a1) * rOut, cy + Math.sin(a1) * rOut];
    const p2 = [cx + Math.cos(a2) * rIn, cy + Math.sin(a2) * rIn];
    if (i === 0) d += `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}`;
    d += `Q${pk[0].toFixed(1)} ${pk[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

export function Seal({
  size = 40,
  broken = false,
  className = "",
  title,
}: {
  size?: number;
  broken?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 112"
      width={size}
      height={(size * 112) / 100}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M59 82 C62 94 59 102 54 102 C50 102 49 95 51 86 Z"
        fill="var(--seal)"
      />
      <path d={scallop(50, 50, 46, 41, 22)} fill="var(--seal)" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" />
      {size >= 34 && (
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="30"
          fill="rgba(255,255,255,0.92)"
        >
          SV
        </text>
      )}
      {broken && (
        <path
          d="M50 9 L46 30 L55 47 L45 64 L54 82 L49 99"
          fill="none"
          stroke="var(--bg)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
