"use client";

import { useEffect, useState } from "react";

/**
 * The signature reveal moment: an "SV" seal cracks apart with shards, then the
 * revealed answer rises into view. Shown after a reveal transaction confirms.
 */
export function RevealOverlay({
  answer,
  onDone,
}: {
  answer: string;
  onDone: () => void;
}) {
  // 0 = seal idle, 1 = cracking, 2 = document risen
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 140);
    const t2 = setTimeout(() => setStage(2), 1050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(4,7,6,0.9)] p-5 backdrop-blur-sm [animation:sv-fade_.3s_ease_both]">
      <div className="relative w-[min(560px,92vw)] text-center">
        <div className="mb-9 font-mono text-[11px] uppercase tracking-[0.24em] text-green">
          Unsealing
        </div>

        {stage < 2 && (
          <div className="relative mb-2 flex h-[170px] items-center justify-center">
            {/* shards */}
            <span
              className="absolute h-4 w-4 rounded-[3px] bg-green"
              style={{ animation: stage >= 1 ? "sv-shard-l .9s ease-out forwards" : "none", opacity: 0 }}
            />
            <span
              className="absolute h-4 w-4 rounded-[3px] bg-green"
              style={{ animation: stage >= 1 ? "sv-shard-r .9s ease-out forwards" : "none", opacity: 0 }}
            />
            {/* seal */}
            <div
              className="flex h-[104px] w-[104px] items-center justify-center rounded-[26px] bg-green text-on-accent shadow-[0_0_50px_rgba(53,208,127,0.55)]"
              style={{ animation: stage >= 1 ? "sv-seal-crack .9s ease-in forwards" : "none" }}
            >
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2l3 3-3 3-3-3 3-3zM12 16l3 3-3 3-3-3 3-3zM4 9l3 3-3 3-3-3 3-3zM20 9l3 3-3 3-3-3 3-3z" />
              </svg>
            </div>
          </div>
        )}

        {stage >= 2 && (
          <div
            className="rounded-[18px] border border-line bg-[#14161a] p-7 text-left shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
            style={{ animation: "sv-doc-rise .55s cubic-bezier(.2,.7,.2,1) both" }}
          >
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-green">
              Revealed
            </div>
            <div className="mb-3.5 font-mono text-[10px] text-muted">
              ✓ matches your original submission
            </div>
            <div className="text-[16.5px] leading-[1.6] text-ink">“{answer}”</div>
            <button
              onClick={onDone}
              className="mt-5 w-full rounded-full bg-green py-3.5 text-[14px] font-semibold text-on-accent shadow-[0_0_28px_rgba(53,208,127,0.3)]"
            >
              Done — your answer is public →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
