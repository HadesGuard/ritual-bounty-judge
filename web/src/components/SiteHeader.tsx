"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Seal } from "@/components/Seal";
import { ritualChain } from "@/config/wagmi";

export function SiteHeader() {
  return (
    <header className="bg-bg">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <Seal size={26} className="transition-transform duration-300 group-hover:-rotate-6" />
          <span className="font-serif text-[21px] font-medium leading-none">
            SealedVerdict
          </span>
        </Link>
        <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-muted lg:block">
          {ritualChain.name} · ID {ritualChain.id} · Commit-Reveal Adjudication
        </span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletConnect />
        </div>
      </div>
      <div className="rule-double" />
    </header>
  );
}
