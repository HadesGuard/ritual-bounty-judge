"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ritualChain } from "@/config/wagmi";

export function WrongNetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected || chainId === ritualChain.id) return null;

  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center justify-center gap-3 border-b border-wax/40 bg-wax-tint px-5 py-2.5 text-[13px] backdrop-blur-md">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wax">
        <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      </svg>
      <span className="font-semibold text-wax">You’re on the wrong network.</span>
      <span className="text-text2">SealedVerdict runs on {ritualChain.name}.</span>
      <button
        onClick={() => switchChain({ chainId: ritualChain.id })}
        className="rounded-full bg-wax px-3.5 py-1.5 font-mono text-[12px] font-semibold text-[#0a0b0d]"
      >
        Switch to {ritualChain.name}
      </button>
    </div>
  );
}
