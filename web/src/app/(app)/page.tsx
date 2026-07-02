"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreateBountyForm } from "@/components/CreateBountyForm";
import { LoadBountyPanel } from "@/components/LoadBountyPanel";
import { useRecentBounties } from "@/hooks/useRecentBounties";
import { isContractConfigured } from "@/config/contract";
import { Kicker, Notice } from "@/components/ui";
import { Seal } from "@/components/Seal";

const PROCEDURE = [
  {
    step: "01",
    name: "Commit",
    line: "Submit a hash, not an answer.",
    detail: "keccak256(answer, salt, sender, id)",
  },
  {
    step: "02",
    name: "Reveal",
    line: "Open the seal after the deadline.",
    detail: "window = deadline + 86,400s",
  },
  {
    step: "03",
    name: "Judge",
    line: "The model reads every revealed answer.",
    detail: "on-chain LLM precompile",
  },
  {
    step: "04",
    name: "Settle",
    line: "The owner enters judgment.",
    detail: "reward released by the contract",
  },
];

export default function Home() {
  const router = useRouter();
  const { ids, add } = useRecentBounties();

  const openBounty = useCallback(
    (id: bigint) => {
      add(id);
      router.push(`/bounty/${id.toString()}`);
    },
    [add, router],
  );

  return (
    <main className="mx-auto max-w-[1120px] px-5 sm:px-10">
      {/* Opening statement */}
      <section className="grid grid-cols-1 items-start gap-10 pb-16 pt-16 lg:grid-cols-[1fr_auto]">
        <div className="max-w-[640px]">
          <Kicker>Sealed-bid bounties, judged on chain</Kicker>
          <h1 className="mt-3 font-sans text-[44px] font-medium leading-[1.06]">
            Answers under seal. Verdicts on the record.
          </h1>
          <p className="mt-5 max-w-[62ch] text-[16px] leading-[1.65] text-muted">
            Post a bounty, a rubric, and a reward held in escrow. Everyone locks
            a sealed hash of their answer before the deadline, so nobody can read
            the room and copy the best idea. After the deadline the seals come
            off, a model on Ritual reads the whole batch, and you hand down the
            verdict. The winner is paid by the contract, not by your good word.
          </p>
          <div className="mt-7 flex items-center gap-5">
            <a
              href="#file"
              className="inline-flex h-10 items-center rounded-lg bg-emerald px-5 text-[15px] font-medium text-on-accent transition-opacity hover:opacity-90"
            >
              File a bounty
            </a>
            <a
              href="#procedure"
              className="text-[15px] text-emerald-bright hover:underline underline-offset-4"
            >
              Read the procedure →
            </a>
          </div>
        </div>
        {/* The signature: an oversized wax seal, tilted like a real impression */}
        <div className="hidden shrink-0 pt-2 lg:block">
          <Seal size={176} className="-rotate-[8deg]" title="SealedVerdict wax seal" />
        </div>
      </section>

      {/* 01 Procedure */}
      <section id="procedure" className="border-t border-line pt-6">
        <div className="flex gap-4">
          <span className="text-[12px] text-muted">
            01
          </span>
          <h2 className="font-sans text-[21px] font-medium">Procedure</h2>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {PROCEDURE.map((p, i) => (
            <div
              key={p.name}
              className={`border-t border-line py-4 sm:py-5 lg:border-t-0 ${
                i > 0 ? "lg:border-l lg:border-line lg:pl-5" : ""
              }`}
            >
              <div className="text-[12px] text-muted">
                {p.step} · {p.name}
              </div>
              <p className="mt-2 font-sans text-[18px] leading-snug text-fg">
                {p.line}
              </p>
              <p className="mt-2 font-mono text-[12px] text-muted">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {!isContractConfigured && (
        <div className="mt-6">
          <Notice tone="amber">
            Contract not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS to file and
            retrieve bounties.
          </Notice>
        </div>
      )}

      {/* 02 File a bounty */}
      <div id="file" className="mt-14 border-t border-line pt-8">
        <CreateBountyForm onCreated={openBounty} />
      </div>

      {/* 03 Docket */}
      <div className="mt-14 border-t border-line pt-8">
        <LoadBountyPanel onOpen={openBounty} recentIds={ids} />
      </div>
    </main>
  );
}
