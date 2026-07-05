"use client";

import { useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import sealedVerdictAbi from "@/abi/SealedVerdict";
import { contractAddress, executorAddress } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import { revealDeadline, type Bounty } from "@/lib/bounty";
import { useNow } from "@/hooks/useNow";
import { buildJudgeAllLlmInput, type JudgeSubmission } from "@/lib/ritualLlm";
import { useWriteTx } from "@/hooks/useWriteTx";
import { useRitualWalletStatus } from "@/hooks/useRitualWalletStatus";
import { RitualWalletPanel } from "@/components/RitualWalletPanel";
import { JudgingOverlay } from "@/components/JudgingOverlay";
import { TxStatus, Spinner } from "@/components/ui";

const explorerBase = ritualChain.blockExplorers?.default.url;

export function JudgeAll({
  bountyId,
  bounty,
  isOwner,
  revealedCount,
  onJudged,
}: {
  bountyId: bigint;
  bounty: Bounty;
  isOwner: boolean;
  revealedCount: number | undefined;
  onJudged: () => void;
}) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: ritualChain.id });
  const [gathering, setGathering] = useState(false);
  const [gatherError, setGatherError] = useState<string | null>(null);
  const tx = useWriteTx(() => onJudged());
  const walletStatus = useRitualWalletStatus(address);

  const now = useNow();
  // Only revealed answers are judged, so gate and count on that, not on the
  // total submission count (a commit without a reveal must not unlock judging).
  const count = revealedCount ?? 0;
  const revealOver = now / 1000 >= Number(revealDeadline(bounty));

  if (bounty.judged || bounty.finalized || count === 0 || !revealOver) return null;

  async function handleJudge() {
    if (!publicClient || !contractAddress || !walletStatus.ready) return;
    setGatherError(null);
    setGathering(true);
    try {
      const [indexes, submitters, answers] = await publicClient.readContract({
        address: contractAddress,
        abi: sealedVerdictAbi,
        functionName: "getRevealedAnswers",
        args: [bountyId],
      });
      if (indexes.length === 0) throw new Error("No revealed answers to judge.");
      const submissions: JudgeSubmission[] = indexes.map((idx, j) => ({
        index: Number(idx),
        submitter: submitters[j],
        answer: answers[j],
      }));
      const llmInput = buildJudgeAllLlmInput({
        executorAddress,
        title: bounty.title,
        rubric: bounty.rubric,
        submissions,
      });
      setGathering(false);
      await tx.run({
        address: contractAddress,
        abi: sealedVerdictAbi,
        functionName: "judgeAll",
        args: [bountyId, llmInput],
        chainId: ritualChain.id,
        // Automatic gas estimation against this async precompile call is
        // unreliable: measured live, an underfunded/oversized request either
        // throws an opaque "execution reverted" during estimation, or -- even
        // more confusingly -- gets accepted (returns a hash) and then never
        // lands in a block or stays pending, with no error at all. A fixed
        // gas limit skips estimation and lets the real broadcast surface the
        // actual RPC-level error (e.g. the real "insufficient wallet balance"
        // message) instead.
        gas: 2_000_000n,
      });
    } catch (e) {
      setGathering(false);
      setGatherError(
        (e as { shortMessage?: string; message?: string }).shortMessage ||
          (e as Error).message ||
          "Failed to gather submissions.",
      );
    }
  }

  const busy = gathering || tx.isBusy;
  const fundingReady = walletStatus.ready === true;

  return (
    <div className="rounded-[14px] bg-panel px-[30px] py-[30px] text-on-panel-soft">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-indigo-soft">
        Reveal window closed · ready to score
      </div>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-[52ch]">
          <div className="mb-2 text-[26px] font-medium leading-[1.15]">
            The answers are unsealed and ready to score.
          </div>
          <div className="text-[13px] leading-[1.55] text-muted">
            The AI reads all of them, scores each against your rubric, and suggests a winner. You
            make the final call.
          </div>
        </div>
        {isOwner ? (
          <button
            onClick={handleJudge}
            disabled={busy || !fundingReady}
            className="whitespace-nowrap rounded-[12px] bg-green px-7 py-4 text-[14px] font-semibold text-on-accent shadow-[0_0_28px_rgba(53,208,127,0.3)] disabled:opacity-50"
          >
            {gathering ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Gathering…
              </span>
            ) : tx.isBusy ? (
              "Scoring…"
            ) : !fundingReady ? (
              "Fund RitualWallet"
            ) : (
              "Run AI scoring →"
            )}
          </button>
        ) : (
          <div className="border-[1.5px] border-dashed border-panel-line px-[22px] py-[15px] font-mono text-[12px] text-indigo-soft">
            ⌛ Waiting for the organizer to
            <br />
            start scoring…
          </div>
        )}
      </div>
      {isOwner && !fundingReady && (
        <div className="mt-5">
          <RitualWalletPanel status={walletStatus} onDeposited={walletStatus.refetch} />
        </div>
      )}
      {gatherError && <div className="mt-3 text-[12.5px] text-red-soft">{gatherError}</div>}
      <TxStatus state={tx.state} error={tx.error} hash={tx.hash} explorerBase={explorerBase} />
      {busy && (tx.state === "pending" || tx.state === "wallet" || gathering) ? (
        <JudgingOverlay count={count} />
      ) : null}
    </div>
  );
}
