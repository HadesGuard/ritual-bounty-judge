"use client";

/**
 * A hand-authored wax seal. The rim is a rippled, deliberately irregular blob
 * (no perfect circle), pressed with a serif "SV" intaglio and a wax drip. This
 * is the product's signature object: a commitment is a sealed answer, and the
 * reveal literally cracks the seal. Drawn, not generated.
 */

// Rippled wax rim: alternating out/in radii with hand-picked jitter so no two
// bumps match. Even indices bulge out, odd pull in.
const JITTER = [0, 0.5, -0.4, 0.3, -0.6, 0.2, 0.4, -0.3, 0.6, -0.2, 0.1, -0.5];
function rim(cx: number, cy: number, r: number, bumps: number, amp: number): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < bumps; i++) {
    const a = (i / bumps) * Math.PI * 2 - Math.PI / 2;
    const bulge = (i % 2 === 0 ? amp : -amp * 0.55) + JITTER[i % JITTER.length];
    const rr = r + bulge;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  // Closed Catmull-Rom spline -> cubic beziers (smooth, organic edge).
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
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
  const outer = rim(50, 50, 38, 22, 2.4);
  const inner = rim(50, 50, 29, 16, 1.4);

  return (
    <svg
      viewBox="0 0 100 108"
      width={size}
      height={(size * 108) / 100}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}

      {/* dripped wax below the seal */}
      <path
        d="M58 82 C60 92 58 99 54 99 C50 99 49 93 51 85 Z"
        fill="var(--seal)"
        opacity="0.9"
      />

      {/* wax body */}
      <path d={outer} fill="var(--seal)" />
      {/* rim shadow — raised wax edge */}
      <path d={outer} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="1.4" />
      {/* top-left highlight — light catching the wax */}
      <path
        d={inner}
        fill="none"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="1.2"
      />

      {/* pressed monogram */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontFamily="var(--font-serif), Georgia, serif"
        fontSize="34"
        fontStyle="italic"
        fill="rgba(0,0,0,0.24)"
      >
        SV
      </text>
      <text
        x="49.2"
        y="61.2"
        textAnchor="middle"
        fontFamily="var(--font-serif), Georgia, serif"
        fontSize="34"
        fontStyle="italic"
        fill="rgba(255,255,255,0.10)"
      >
        SV
      </text>

      {/* the crack, when the seal is broken */}
      {broken && (
        <path
          d="M50 11 L45 30 L55 46 L44 63 L54 80 L49 97"
          fill="none"
          stroke="var(--bg)"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
