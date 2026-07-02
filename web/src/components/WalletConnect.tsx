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
import { Button } from "@/components/ui";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the connector menu on any outside click.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const wrongChain = isConnected && chainId !== ritualChain.id;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {wrongChain ? (
          <Button
            variant="secondary"
            onClick={() => switchChain({ chainId: ritualChain.id })}
          >
            Switch to {ritualChain.name} →
          </Button>
        ) : (
          <span className="hidden text-[12px] text-muted sm:block">
            {ritualChain.name} · {ritualChain.id}
          </span>
        )}
        <Button variant="secondary" onClick={() => disconnect()}>
          {shortenAddress(address)}
        </Button>
      </div>
    );
  }

  // Dedupe connectors by name (injected + metaMask can overlap).
  const seen = new Set<string>();
  const list = connectors.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });

  return (
    <div className="relative" ref={ref}>
      <Button onClick={() => setOpen((v) => !v)} disabled={isPending}>
        {isPending ? "Connecting" : "Connect wallet"}
      </Button>
      {open && (
        <div className="shadow-pop absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-edge bg-surface p-1">
          {list.length === 0 && (
            <div className="px-3 py-2 text-[13px] text-faint">
              No wallet connectors found.
            </div>
          )}
          {list.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector });
                setOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-[14px] text-fg transition-colors hover:bg-surface-1"
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
