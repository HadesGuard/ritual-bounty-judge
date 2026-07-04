"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import sealedVerdictAbi from "@/abi/SealedVerdict";
import { contractAddress } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import type { Bounty } from "@/lib/bounty";
import { decodeAiReview } from "@/lib/aiReview";
import { formatReward, shortenAddress } from "@/lib/format";
import { useWriteTx } from "@/hooks/useWriteTx";
import { TxStatus } from "@/components/ui";

const explorerBase = ritualChain.blockExplorers?.default.url;

export function FinalizeWinner({
  bountyId,
  bounty,
  isOwner,
  onFinalized,
}: {
  bountyId: bigint;
  bounty: Bounty;
  isOwner: boolean;
  onFinalized: () => void;
}) {
  const judge = decodeAiReview(bounty.aiReview)?.parsed ?? null;
  const recommended = judge?.winnerIndex;

  const { data: revealed } = useReadContract({
    address: contractAddress,
    abi: sealedVerdictAbi,
    functionName: "getRevealedAnswers",
    args: [bountyId],
    chainId: ritualChain.id,
    query: { enabled: !!contractAddress && isOwner && bounty.judged && !bounty.finalized },
  });

  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<number | null>(recommended ?? null);
  const tx = useWriteTx(() => onFinalized());

  if (!isOwner || !bounty.judged || bounty.finalized) return null;

  const candidates =
    revealed && revealed[0]
      ? revealed[0].map((idx, j) => {
          const index = Number(idx);
          return {
            index,
            submitter: revealed[1][j],
            score: judge?.ranking?.find((r) => r.index === index)?.score,
          };
        })
      : [];

  const pick = chosen ?? recommended ?? candidates[0]?.index ?? null;
  const overriding = recommended !== undefined && pick !== recommended;

  async function confirm() {
    if (pick === null || !contractAddress) return;
    setOpen(false);
    try {
      await tx.run({
        address: contractAddress,
        abi: sealedVerdictAbi,
        functionName: "finalizeWinner",
        args: [bountyId, BigInt(pick)],
        chainId: ritualChain.id,
      });
    } catch {
      /* surfaced via tx.state */
    }
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-green">
            Finalize · you have the gavel
          </div>
          <div className="text-[18px] font-semibold">Choose the winner</div>
          <div className="mt-1 text-[13px] text-text2">
            {recommended !== undefined ? (
              <>The AI recommends entry <b>#{recommended}</b>. You can accept or override.</>
            ) : (
              <>Pick the winning entry. The contract pays whoever you finalize.</>
            )}
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          disabled={tx.isBusy || candidates.length === 0}
          className="rounded-full bg-green px-6 py-3.5 text-[14px] font-semibold text-on-accent shadow-[0_0_24px_rgba(53,208,127,0.28)] disabled:opacity-50"
        >
          {tx.isBusy ? "Paying…" : "Pick winner & pay"}
        </button>
      </div>
      <div className="px-6 pb-4">
        <TxStatus state={tx.state} error={tx.error} hash={tx.hash} explorerBase={explorerBase} />
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-5 [animation:sv-fade_.2s_ease_both]"
        >
          <div className="absolute inset-0 bg-[rgba(4,7,6,0.75)] backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(480px,94vw)] overflow-hidden rounded-[18px] border border-line bg-[#14161a] shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
          >
            <div className="px-6 pb-4 pt-6">
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-green">
                Finalize · you have the gavel
              </div>
              <div className="text-[22px] font-semibold">Choose the winner</div>
              <div className="mt-1.5 text-[13px] leading-[1.5] text-text2">
                {recommended !== undefined ? (
                  <>The AI recommends entry #{recommended}. You can accept it or override. The
                  contract pays whoever you finalize.</>
                ) : (
                  <>The contract pays whoever you finalize.</>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 px-6 pb-2">
              {candidates.map((c) => {
                const sel = pick === c.index;
                const top = c.index === recommended;
                return (
                  <button
                    key={c.index}
                    onClick={() => setChosen(c.index)}
                    className={`flex items-center justify-between rounded-[12px] border px-4 py-3 text-left transition ${sel ? "border-green bg-green-tint" : "border-line bg-white/[0.02] hover:bg-white/[0.05]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${sel ? "border-green" : "border-muted"}`}
                      >
                        {sel ? <span className="h-2 w-2 rounded-full bg-green" /> : null}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-semibold">Entry #{c.index}</span>
                          {top ? (
                            <span className="rounded-full bg-green-tint px-2 py-[2px] font-mono text-[8px] uppercase tracking-[0.1em] text-green-bright">
                              AI pick
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 font-mono text-[10.5px] text-muted">
                          {shortenAddress(c.submitter)}
                        </div>
                      </div>
                    </div>
                    {c.score !== undefined ? (
                      <div className="font-mono text-[16px] font-semibold text-green">{c.score}</div>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {overriding ? (
              <div className="mx-6 mt-1.5 rounded-[10px] border border-amber/40 bg-amber-tint px-3.5 py-2.5 text-[12px] leading-[1.45] text-amber-text2">
                You’re overriding the AI’s recommendation. That’s allowed, just make sure it fits
                your rubric.
              </div>
            ) : null}
            <div className="mt-3 flex gap-2.5 border-t border-line px-6 py-4">
              <button
                onClick={confirm}
                className="flex-1 rounded-full bg-green py-3.5 text-center text-[14px] font-semibold text-on-accent shadow-[0_0_24px_rgba(53,208,127,0.28)]"
              >
                Pay entry #{pick} · {formatReward(bounty.reward)}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-line bg-surface px-6 py-3.5 text-[14px] font-semibold text-ink hover:bg-white/[0.08]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
