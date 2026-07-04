"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BountyRegistry, type RegistryFilter } from "@/components/BountyRegistry";
import { isContractConfigured } from "@/config/contract";
import { Notice } from "@/components/ui";

const STEPS = [
  "You put up a prize and lock it in escrow.",
  "People send answers. Each one is sealed.",
  "After the deadline, they unseal their answers.",
  "An AI scores them and suggests a winner.",
  "You pick the winner. The contract pays them.",
];

const FEATURES = [
  { title: "Nobody can peek", body: "Every answer is a hash on-chain. No one can read it, not even you, until it’s unsealed after the deadline." },
  { title: "The AI only suggests", body: "The AI scores each answer against your rubric and suggests a winner. You make the call, and you can ignore it." },
  { title: "The prize is locked", body: "The prize is locked the moment you post. The contract pays the winner once you choose. If no one unseals, you get it back." },
];

const FILTERS: { key: RegistryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Sealing" },
  { key: "reveal", label: "Reveal" },
  { key: "finalized", label: "Settled" },
];

export default function Home() {
  const router = useRouter();
  const [filter, setFilter] = useState<RegistryFilter>("all");

  return (
    <main className="mx-auto max-w-[1180px] px-6 pb-[120px]">
      {/* HERO */}
      <section className="grid grid-cols-1 items-center gap-10 pb-14 pt-16 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-green">
            <span className="h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_8px_rgba(53,208,127,0.8)]" />
            Sealed contests · paid on-chain
          </div>
          <h1 className="m-0 text-[48px] font-bold leading-[1.02] tracking-[-0.025em] sm:text-[62px]">
            Post a bounty.
            <br />
            Get sealed entries.
            <br />
            <span className="text-green">Pay the best one.</span>
          </h1>
          <p className="mb-8 mt-5 max-w-[46ch] text-[16.5px] leading-[1.6] text-text2">
            Put up a cash prize and lock it in escrow. People send answers that stay hidden until
            the deadline, so no one can copy. An AI scores every entry, you pick the winner, and the
            contract pays them.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/create"
              className="rounded-full bg-green px-6 py-3.5 text-[15px] font-semibold text-on-accent shadow-[0_0_28px_rgba(53,208,127,0.3)] transition hover:brightness-[1.08]"
            >
              Post a bounty →
            </Link>
            <a
              href="#registry"
              className="rounded-full border border-line bg-surface px-6 py-3.5 text-[15px] font-semibold text-ink backdrop-blur-md transition hover:bg-white/[0.08]"
            >
              Browse bounties
            </a>
          </div>
        </div>

        <div className="rounded-[20px] border border-line bg-surface p-7 backdrop-blur-md">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-green">How it works</div>
          <div className="my-4 flex flex-col">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex gap-3.5 py-3 ${i < STEPS.length - 1 ? "border-b border-line" : ""}`}
              >
                <span className="w-5 font-mono text-[12px] text-green">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[13.5px] text-text2">{s}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-3.5 text-[15px] italic text-muted">
            “The AI helps. You decide.”
          </div>
        </div>
      </section>

      {!isContractConfigured && (
        <div className="mb-6">
          <Notice tone="amber">No contract configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS to load bounties.</Notice>
        </div>
      )}

      {/* REGISTRY */}
      <div id="registry" className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                filter === f.key
                  ? "bg-green text-on-accent shadow-[0_0_18px_rgba(53,208,127,0.28)]"
                  : "border border-line bg-surface text-text2 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Link
          href="/create"
          className="rounded-full border border-green/50 bg-green-tint px-4 py-2 text-[13px] font-semibold text-green-bright"
        >
          + Post a bounty
        </Link>
      </div>

      <BountyRegistry filter={filter} onOpen={(id) => router.push(`/bounty/${id.toString()}`)} />

      {/* FEATURES */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-[16px] border border-line bg-surface p-6 backdrop-blur-md">
            <div className="mb-2 text-[19px] font-semibold">{f.title}</div>
            <p className="m-0 text-[13.5px] leading-[1.55] text-text2">{f.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
