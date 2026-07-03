"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import sealedVerdictAbi from "@/abi/SealedVerdict";
import { contractAddress } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import {
  parseBounty,
  getBountyStatus,
  revealDeadline,
  type BountyStatus,
} from "@/lib/bounty";
import { formatReward, formatRelative, shortenAddress } from "@/lib/format";
import { useNow } from "@/hooks/useNow";

const PHASE: Record<BountyStatus, { label: string; cls: string }> = {
  open: { label: "Sealing", cls: "bg-indigo text-indigo-tint" },
  reveal: { label: "Reveal", cls: "bg-green text-green-tint" },
  ready: { label: "Judging", cls: "bg-amber-tint text-amber-text border border-amber" },
  judged: { label: "Judging", cls: "bg-amber-tint text-amber-text border border-amber" },
  finalized: { label: "Settled", cls: "bg-line text-text2" },
};

export function BountyRegistry({ onOpen }: { onOpen: (id: bigint) => void }) {
  const [query, setQuery] = useState("");

  const { data: nextId } = useReadContract({
    address: contractAddress,
    abi: sealedVerdictAbi,
    functionName: "nextBountyId",
    chainId: ritualChain.id,
    query: { enabled: !!contractAddress },
  });

  const next = nextId ? Number(nextId) : 1;
  const ids: number[] = [];
  for (let i = next - 1; i >= 1 && ids.length < 12; i--) ids.push(i);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const t = query.trim();
    if (!t) return;
    try {
      const id = BigInt(t);
      if (id >= 0n) onOpen(id);
    } catch {
      /* ignore non-numeric */
    }
  }

  return (
    <>
      <div className="mb-5 mt-[48px] flex items-baseline justify-between">
        <h2 className="m-0 text-[28px] font-medium tracking-[-0.01em]">Open bounties</h2>
        <form
          onSubmit={submitSearch}
          className="flex items-center rounded-[14px] border border-line bg-surface"
        >
          <span className="flex items-center px-3 py-2 text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by bounty ID…"
            className="w-[240px] max-w-[46vw] bg-transparent py-2 pr-3.5 font-mono text-[12px] text-ink outline-none placeholder:text-muted"
          />
        </form>
      </div>

      {ids.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-surface px-[22px] py-[52px] text-center">
          <div className="text-[18px] font-semibold">No bounties yet</div>
          <p className="mx-auto mt-1.5 max-w-[40ch] text-[13px] text-muted">
            Post the first one. Every entry stays sealed until the deadline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ids.map((id) => (
            <BountyCard key={id} id={BigInt(id)} onOpen={onOpen} />
          ))}
        </div>
      )}
    </>
  );
}

function BountyCard({ id, onOpen }: { id: bigint; onOpen: (id: bigint) => void }) {
  const now = useNow();
  const { data } = useReadContract({
    address: contractAddress,
    abi: sealedVerdictAbi,
    functionName: "getBounty",
    args: [id],
    chainId: ritualChain.id,
    query: { enabled: !!contractAddress },
  });

  if (!data) {
    return (
      <div className="rounded-[14px] border border-line bg-surface p-5">
        <span className="block h-4 w-24 animate-pulse rounded bg-line" />
        <span className="mt-4 block h-6 w-3/4 animate-pulse rounded bg-line" />
        <span className="mt-6 block h-8 w-1/3 animate-pulse rounded bg-line" />
      </div>
    );
  }

  const b = parseBounty(data as never);
  if (/^0x0+$/.test(b.owner)) return null;

  const status = getBountyStatus(b, now / 1000);
  const ph = PHASE[status];
  const closes =
    status === "open"
      ? `Closes in ${formatRelative(b.deadline)}`
      : status === "reveal"
        ? `Reveal in ${formatRelative(revealDeadline(b))}`
        : status === "finalized"
          ? "Settled"
          : "Awaiting judgment";

  return (
    <button
      onClick={() => onOpen(id)}
      className="group flex flex-col rounded-[14px] border border-line bg-surface p-[22px] text-left transition hover:border-indigo-soft hover:shadow-[0_10px_28px_rgba(16,24,40,0.08)]"
    >
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.06em] text-muted">
          Case №{id.toString()}
        </span>
        <span className={`px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] ${ph.cls}`}>
          ● {ph.label}
        </span>
      </div>

      <div className="mb-1 line-clamp-2 min-h-[52px] text-[21px] font-medium leading-[1.15]">
        {b.title || "Untitled"}
      </div>
      <div className="mb-5 font-mono text-[10.5px] text-muted">by {shortenAddress(b.owner)}</div>

      <div className="mt-auto flex items-end justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">Reward</div>
          <div className="mt-1 font-mono text-[26px] font-semibold leading-none text-green">
            {formatReward(b.reward)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">Entries</div>
          <div className="mt-1 font-mono text-[26px] font-semibold leading-none">
            {b.submissionCount.toString()}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5">
        <span className="font-mono text-[11.5px] text-text2">{closes}</span>
        <span className="font-mono text-[12px] font-medium text-indigo transition group-hover:translate-x-0.5">
          Open →
        </span>
      </div>
    </button>
  );
}
