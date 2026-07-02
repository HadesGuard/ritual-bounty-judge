"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Seal } from "@/components/Seal";
import { ritualChain } from "@/config/wagmi";

export function SiteHeader() {
  return (
    <header className="border-b-2 border-edge bg-bg">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="inline-block transition-transform duration-300 group-hover:-rotate-12">
            <Seal size={30} />
          </span>
          <span className="font-serif text-[22px] font-extrabold uppercase leading-none tracking-[-0.02em]">
            SealedVerdict
          </span>
        </Link>
        <span className="hidden font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted lg:block">
          {ritualChain.name} · ID {ritualChain.id}
        </span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
