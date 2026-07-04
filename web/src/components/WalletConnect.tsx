"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { ritualChain } from "@/config/wagmi";
import { shortenAddress } from "@/lib/format";

export function WalletChip() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const wrongNet = isConnected && chainId !== ritualChain.id;

  if (isConnected && address) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 backdrop-blur-md"
        >
          <span className={`h-[7px] w-[7px] rounded-full ${wrongNet ? "bg-wax" : "bg-green shadow-[0_0_8px_rgba(53,208,127,0.8)]"}`} />
          <span className="font-mono text-[12.5px] font-medium">{shortenAddress(address)}</span>
        </button>
        {open && (
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-[14px] border border-line bg-[#14161a] p-1 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              {wrongNet ? "Wrong network" : ritualChain.name}
            </div>
            {wrongNet && (
              <button
                onClick={() => {
                  switchChain({ chainId: ritualChain.id });
                  setOpen(false);
                }}
                className="block w-full rounded-[10px] px-3 py-2 text-left text-[13px] font-semibold text-green hover:bg-white/[0.06]"
              >
                Switch to {ritualChain.name}
              </button>
            )}
            <button
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="block w-full rounded-[10px] px-3 py-2 text-left font-mono text-[11px] text-muted hover:bg-white/[0.06]"
            >
              disconnect wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  const seen = new Set<string>();
  const list = connectors.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0a0b0d] transition hover:brightness-95"
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-[16px] border border-line bg-[#14161a] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Wallet</div>
          <div className="flex flex-col gap-2.5">
            {list.length === 0 && (
              <div className="font-mono text-[11px] text-muted">No connectors found.</div>
            )}
            {list.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector });
                  setOpen(false);
                }}
                className="flex items-center justify-between rounded-[12px] border border-line bg-white/[0.03] px-4 py-3.5 hover:bg-white/[0.07]"
              >
                <span className="text-[14px] font-semibold">{connector.name}</span>
                <span className="font-mono text-[11px] text-green">connect →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
