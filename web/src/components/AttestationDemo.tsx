"use client";

import { useMemo, useState } from "react";
import { recoverMessageAddress, type Address, type Hex } from "viem";
import {
  batchDigest,
  demoEnclave,
  winnerMessage,
  DEMO_BOUNTY_ID,
  DEMO_CHAIN_ID,
  DEMO_CONTRACT,
  DEMO_PROMPT,
  DEMO_SUBMISSIONS,
} from "@/lib/advancedTee";
import { shortenAddress } from "@/lib/format";

/**
 * Runs RitualHiddenBounty's attestation check live in the browser: an in-page
 * keypair stands in for the enclave, signs a winner index over the batch digest,
 * and the same ECDSA recovery the contract does verifies it. Swapping the claimed
 * winner breaks the signature, exactly as submitAttestedWinner would revert.
 */
export function AttestationDemo() {
  const digest = useMemo(
    () => batchDigest(DEMO_CHAIN_ID, DEMO_CONTRACT, DEMO_BOUNTY_ID, DEMO_SUBMISSIONS),
    [],
  );

  const [attested, setAttested] = useState<number | null>(null);
  const [signature, setSignature] = useState<Hex | null>(null);
  const [claimed, setClaimed] = useState<number>(0);
  const [recovered, setRecovered] = useState<Address | null>(null);
  const [busy, setBusy] = useState(false);

  async function signAs(index: number) {
    setBusy(true);
    const message = winnerMessage(digest, BigInt(index));
    const sig = await demoEnclave.signMessage({ message: { raw: message } });
    const rec = await recoverMessageAddress({ message: { raw: message }, signature: sig });
    setAttested(index);
    setClaimed(index);
    setSignature(sig);
    setRecovered(rec);
    setBusy(false);
  }

  async function chooseClaim(index: number) {
    setClaimed(index);
    if (!signature) return;
    const message = winnerMessage(digest, BigInt(index));
    const rec = await recoverMessageAddress({ message: { raw: message }, signature });
    setRecovered(rec);
  }

  const enclave = demoEnclave.address;
  const valid = recovered !== null && recovered.toLowerCase() === enclave.toLowerCase();

  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-surface backdrop-blur-md">
      <div className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-indigo-soft">
          Attestation · simulated enclave
        </div>
        <div className="mt-1 text-[19px] font-semibold">Sign a winner, verify it on the spot</div>
        <p className="mt-1.5 text-[13px] leading-[1.55] text-text2">
          A keypair in this page stands in for the TEE. It signs the winning entry over the batch
          digest; the same recovery the contract runs checks it. No chain, no deployment, real
          cryptography.
        </p>
      </div>

      <div className="px-6 py-5">
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] text-muted">
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1">Sample bounty</span>
          <span className="text-text2">{DEMO_PROMPT}</span>
        </div>

        <div className="flex flex-col gap-2">
          {DEMO_SUBMISSIONS.map((s, i) => {
            const isAttested = attested === i;
            return (
              <div
                key={s.submitter}
                className={`rounded-[12px] border px-4 py-3 transition ${isAttested ? "border-green bg-green-tint" : "border-line bg-white/[0.02]"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12px] font-semibold">Entry #{i}</span>
                      <span className="font-mono text-[10.5px] text-muted">
                        {shortenAddress(s.submitter)}
                      </span>
                      {isAttested ? (
                        <span className="rounded-full bg-green px-2 py-[2px] font-mono text-[8px] uppercase tracking-[0.1em] text-on-accent">
                          enclave signed
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-[13px] leading-[1.5] text-ink">“{s.answer}”</div>
                  </div>
                  <button
                    onClick={() => signAs(i)}
                    disabled={busy}
                    className="shrink-0 whitespace-nowrap rounded-full border border-line bg-white/[0.05] px-3.5 py-1.5 font-mono text-[11px] font-semibold text-ink hover:bg-white/[0.1] disabled:opacity-50"
                  >
                    Enclave attests this
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {signature ? (
        <div className="border-t border-line px-6 py-5">
          <Field label="batch digest" value={shorten(digest)} />
          <Field label="enclave signature" value={shorten(signature)} />
          <Field label="pinned enclave key" value={shortenAddress(enclave)} />

          <div className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            A relayer submits winner
          </div>
          <div className="flex gap-2">
            {DEMO_SUBMISSIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => chooseClaim(i)}
                className={`rounded-full px-4 py-1.5 font-mono text-[12px] font-semibold transition ${claimed === i ? "bg-white/[0.12] text-ink" : "text-muted hover:text-ink"}`}
              >
                #{i}
              </button>
            ))}
          </div>

          <div
            className={`mt-4 rounded-[12px] border px-4 py-3.5 text-[13px] leading-[1.5] ${valid ? "border-green/40 bg-green-tint text-ink" : "border-wax/40 bg-wax-tint text-ink"}`}
          >
            {valid ? (
              <>
                <b className="text-green-bright">submitAttestedWinner accepts.</b> Recovered signer{" "}
                <span className="font-mono">{shortenAddress(recovered!)}</span> equals the pinned
                enclave key, so the contract pays entry #{claimed}.
              </>
            ) : (
              <>
                <b className="text-wax">InvalidAttestation.</b> Recovered signer{" "}
                <span className="font-mono">{recovered ? shortenAddress(recovered) : "0x0"}</span>{" "}
                does not match the pinned enclave. The signature is bound to entry #{attested}; a
                relayer cannot swap in #{claimed}.
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2 last:border-b-0">
      <span className="font-mono text-[11px] text-muted">{label}</span>
      <span className="font-mono text-[12px] text-text2">{value}</span>
    </div>
  );
}

function shorten(hex: string): string {
  return hex.length > 20 ? `${hex.slice(0, 12)}…${hex.slice(-8)}` : hex;
}
