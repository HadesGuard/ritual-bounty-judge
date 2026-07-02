"use client";

import { decodeAiReview } from "@/lib/aiReview";
import { Notice } from "@/components/ui";

export function AIReviewDisplay({ aiReview }: { aiReview: `0x${string}` }) {
  const decoded = decodeAiReview(aiReview);
  if (!decoded) return null;

  const { raw, parsed } = decoded;

  if (!parsed) {
    return (
      <div className="space-y-3">
        <Notice tone="amber">
          The model&rsquo;s output could not be parsed as JSON. Raw text follows.
        </Notice>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-edge bg-surface-1 p-3 font-mono text-[12px] text-muted">
          {raw}
        </pre>
      </div>
    );
  }

  const ranked = [...parsed.ranking].sort((a, b) => b.score - a.score);

  return (
    <div>
      {parsed.summary && (
        <blockquote className="border-y border-line py-4">
          <p className="font-serif text-[18px] italic leading-relaxed text-fg">
            {parsed.summary}
          </p>
        </blockquote>
      )}

      {ranked.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-[3rem_3rem_1fr] gap-4 border-b border-line pb-2 text-[12px] uppercase tracking-[0.08em] text-muted">
            <span>Rank</span>
            <span>Exh.</span>
            <span>Reason</span>
          </div>
          {ranked.map((r, pos) => (
            <div
              key={r.index}
              className={`grid grid-cols-[3rem_3rem_1fr] items-start gap-4 border-t border-line py-2.5 ${
                r.index === parsed.winnerIndex ? "bg-emerald/[0.08]" : ""
              }`}
            >
              <span className="font-mono text-[13px] text-muted">
                {String(pos + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[13px] text-fg">
                {String(r.index).padStart(2, "0")}
                {r.index === parsed.winnerIndex ? (
                  <span className="ml-1 text-emerald-bright">·</span>
                ) : null}
              </span>
              <span className="text-[13px] leading-snug text-muted">
                <span className="mr-2 font-mono text-[12px] text-emerald-bright">
                  {r.score}
                </span>
                {r.reason}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
