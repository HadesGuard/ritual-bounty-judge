"use client";

/** Shown while the batch judgeAll request is in flight. */
export function JudgingOverlay({ count, tee }: { count: number; tee?: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5 [animation:sv-fade_.25s_ease_both]">
      <div className="absolute inset-0 bg-[rgba(4,7,6,0.78)] backdrop-blur-sm" />
      <div className="relative w-[min(460px,94vw)] rounded-[18px] border border-line bg-[#14161a] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-green font-mono text-[13px] font-semibold text-on-accent">
            AI
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-green">
              Ritual · batch judging
            </div>
            <div className="mt-0.5 text-[18px] font-semibold">Scoring all answers together</div>
          </div>
        </div>
        <p className="mb-5 text-[13px] leading-[1.55] text-text2">
          All {count} unsealed answer{count === 1 ? "" : "s"} go to the model in{" "}
          <b className="text-ink">one request</b> — never one call per answer — so they’re ranked
          against each other on the same rubric.
        </p>
        {tee ? (
          <div className="mb-4 flex items-center gap-2.5 rounded-[10px] bg-white/[0.04] px-3.5 py-2.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b88f2" strokeWidth="2">
              <rect x="4" y="10" width="16" height="11" rx="1.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <span className="text-[12px] text-indigo-soft">
              Decrypted and judged inside the TEE — plaintext never touches the public chain.
            </span>
          </div>
        ) : null}
        <div className="mb-2.5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full w-1/3 rounded-full bg-green shadow-[0_0_12px_rgba(53,208,127,0.6)] [animation:sv-sweep_1.2s_ease-in-out_infinite]" />
        </div>
        <div className="flex items-center justify-between font-mono text-[11px] text-muted">
          <span>reading · scoring · ranking</span>
          <span className="text-ink">on-chain</span>
        </div>
      </div>
    </div>
  );
}
