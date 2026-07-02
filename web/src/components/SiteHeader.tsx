"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Seal } from "@/components/Seal";
import { ritualChain } from "@/config/wagmi";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-edge bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="inline-block transition-transform duration-300 group-hover:-rotate-6">
            <Seal size={28} />
          </span>
          <span className="text-[20px] font-semibold leading-none tracking-tight">
            SealedVerdict
          </span>
        </Link>
        <span className="hidden text-[13px] text-muted lg:block">
          {ritualChain.name} · chain {ritualChain.id}
        </span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
