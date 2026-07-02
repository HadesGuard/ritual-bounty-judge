"use client";

/**
 * The wax seal, as a flat bold sticker: a scalloped wax rim, a thick outline,
 * a pressed "SV" monogram, a drip. The product's signature object — a
 * commitment is sealed, the reveal cracks it. Colors come from theme tokens so
 * it flips with light/dark.
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
  // Stroke scales up at small sizes so the outline stays punchy.
  const sw = size < 40 ? 3.4 : 2.6;
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
        d="M60 82 C63 95 60 104 54 104 C49 104 48 96 51 86 Z"
        fill="var(--seal)"
        stroke="var(--edge)"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d={scallop(50, 50, 47, 41, 22)}
        fill="var(--seal)"
        stroke="var(--edge)"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="33" fill="none" stroke="var(--edge)" strokeWidth={sw * 0.7} />
      {size >= 40 && (
        <text
          x="50"
          y="63"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
          fontWeight="700"
          fontSize="34"
          fill="var(--edge)"
        >
          SV
        </text>
      )}
      {broken && (
        <path
          d="M50 8 L45 30 L56 47 L44 64 L55 82 L49 100"
          fill="none"
          stroke="var(--bg)"
          strokeWidth={sw * 1.6}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
