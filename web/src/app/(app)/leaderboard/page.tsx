"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import sealedVerdictAbi from "@/abi/SealedVerdict";
import { contractAddress } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import { formatReward, shortenAddress } from "@/lib/format";

type Row = { address: string; total: bigint; count: number };

function rank(map: Map<string, { total: bigint; count: number }>): Row[] {
  return [...map.entries()]
    .map(([address, v]) => ({ address, ...v }))
    .sort((a, b) => (a.total > b.total ? -1 : a.total < b.total ? 1 : 0))
    .slice(0, 10);
}

export default function LeaderboardPage() {
  const publicClient = usePublicClient({ chainId: ritualChain.id });
  const [winners, setWinners] = useState<Row[]>([]);
  const [organizers, setOrganizers] = useState<Row[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!publicClient || !contractAddress) {
        setState("error");
        return;
      }
      try {
        // Public RPCs cap the getLogs block range, so scan a recent window.
        // Full history would need an indexer/subgraph.
        const latest = await publicClient.getBlockNumber();
        const fromBlock = latest > 9000n ? latest - 9000n : 0n;
        const [won, created] = await Promise.all([
          publicClient.getContractEvents({
            address: contractAddress,
            abi: sealedVerdictAbi,
            eventName: "WinnerFinalized",
            fromBlock,
            toBlock: "latest",
          }),
          publicClient.getContractEvents({
            address: contractAddress,
            abi: sealedVerdictAbi,
            eventName: "BountyCreated",
            fromBlock,
            toBlock: "latest",
          }),
        ]);
        const w = new Map<string, { total: bigint; count: number }>();
        for (const log of won) {
          const a = log.args.winner as string | undefined;
          const r = (log.args.reward as bigint | undefined) ?? 0n;
          if (!a) continue;
          const cur = w.get(a) ?? { total: 0n, count: 0 };
          w.set(a, { total: cur.total + r, count: cur.count + 1 });
        }
        const o = new Map<string, { total: bigint; count: number }>();
        for (const log of created) {
          const a = log.args.owner as string | undefined;
          const r = (log.args.reward as bigint | undefined) ?? 0n;
          if (!a) continue;
          const cur = o.get(a) ?? { total: 0n, count: 0 };
          o.set(a, { total: cur.total + r, count: cur.count + 1 });
        }
        if (!alive) return;
        setWinners(rank(w));
        setOrganizers(rank(o));
        setState("ready");
      } catch {
        if (alive) setState("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [publicClient]);

  return (
    <main className="mx-auto max-w-[1180px] px-6 pb-[120px] pt-14">
      <h1 className="m-0 text-[34px] font-bold tracking-[-0.02em]">Leaderboard</h1>
      <p className="mb-8 mt-2 text-[15px] text-text2">
        Who’s winning the sealed contests, and who’s funding them.
      </p>

      {state === "error" ? (
        <div className="rounded-[16px] border border-line bg-surface px-6 py-12 text-center backdrop-blur-md text-[14px] text-muted">
          Couldn’t load on-chain history right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Board
            title="Top winners"
            subtitle="Total RITUAL won"
            rows={winners}
            loading={state === "loading"}
            emptyText="No winners paid out yet."
          />
          <Board
            title="Top organizers"
            subtitle="Total RITUAL put up"
            rows={organizers}
            loading={state === "loading"}
            emptyText="No bounties posted yet."
          />
        </div>
      )}
    </main>
  );
}

function Board({
  title,
  subtitle,
  rows,
  loading,
  emptyText,
}: {
  title: string;
  subtitle: string;
  rows: Row[];
  loading: boolean;
  emptyText: string;
}) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-surface backdrop-blur-md">
      <div className="flex items-baseline justify-between border-b border-line px-6 py-4">
        <span className="text-[17px] font-semibold">{title}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{subtitle}</span>
      </div>
      {loading ? (
        <div className="px-6 py-10 text-center font-mono text-[12px] text-muted">loading…</div>
      ) : rows.length === 0 ? (
        <div className="px-6 py-12 text-center text-[13px] text-muted">{emptyText}</div>
      ) : (
        rows.map((r, i) => (
          <div
            key={r.address}
            className="flex items-center justify-between gap-4 border-b border-line px-6 py-3.5 last:border-b-0"
          >
            <div className="flex items-center gap-3.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[12px] font-semibold ${i === 0 ? "bg-green text-on-accent" : "bg-white/[0.06] text-muted"}`}
              >
                {i + 1}
              </span>
              <span className="font-mono text-[14px]">{shortenAddress(r.address)}</span>
            </div>
            <div className="text-right">
              <div className="font-mono text-[15px] font-semibold text-green">{formatReward(r.total)}</div>
              <div className="font-mono text-[10px] text-muted">
                {r.count} bount{r.count === 1 ? "y" : "ies"}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
