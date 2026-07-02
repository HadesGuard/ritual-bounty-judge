"use client";

import { useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import type { TxState } from "@/hooks/useWriteTx";

/* ------------------------------------------------ Card = bordered box */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-2 border-edge bg-surface hard-lg ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  index,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  index?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 pt-2">
      <div className="flex min-w-0 items-baseline gap-3">
        {index ? (
          <span className="font-mono text-[13px] font-bold text-emerald-bright">
            {index}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="font-serif text-[24px] font-extrabold leading-none tracking-[-0.02em] text-fg">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 text-[14px] text-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`pb-8 pt-4 ${className}`}>{children}</div>;
}

/* ------------------------------------------- Panel = action container */

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-2 border-edge bg-surface hard p-5 ${className}`}>
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-serif text-[17px] font-bold uppercase tracking-[0.01em] text-fg">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-[14px] leading-snug text-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block border-2 border-edge bg-mint px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-[#0b2b20]">
      {children}
    </span>
  );
}

/* -------------------------------------------------------- Stamp badge */

type Tone = "green" | "amber" | "indigo" | "zinc" | "red";

const STAMP: Record<Tone, string> = {
  green: "bg-mint text-[#0b2b20] border-edge",
  amber: "bg-gilt text-[#3a2a05] border-edge",
  red: "bg-seal text-on-accent border-edge",
  zinc: "bg-surface text-fg border-edge",
  indigo: "bg-fg text-bg border-edge",
};

export function Badge({
  children,
  tone = "zinc",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border-2 px-2 py-[3px] font-mono text-[11px] font-bold uppercase tracking-[0.05em] ${STAMP[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- Button */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-serif text-[14px] font-bold uppercase tracking-[0.03em] transition-transform disabled:cursor-not-allowed disabled:opacity-50";
  const styles: Record<string, string> = {
    primary:
      "border-2 border-edge bg-emerald text-on-accent px-4 py-2.5 hard press",
    secondary:
      "border-2 border-edge bg-surface text-fg px-4 py-2.5 hard press",
    ghost:
      "text-emerald-bright underline decoration-2 decoration-emerald-bright/50 underline-offset-4 hover:decoration-emerald-bright",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/* --------------------------------------------------------- Form parts */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-fg">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-[12px] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  "w-full border-2 border-edge bg-bg px-3 py-2.5 text-[15px] text-fg placeholder:text-faint focus:outline-none focus:[box-shadow:3px_3px_0_var(--color-edge)]";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`${inputBase} resize-y ${props.className ?? ""}`}
    />
  );
}

/* ------------------------------------------------------- Tx status UI */

const TX_LABEL: Record<TxState, string> = {
  idle: "",
  wallet: "AWAITING SIGNATURE",
  pending: "PENDING",
  confirmed: "CONFIRMED",
  failed: "FAILED",
};

const TX_TONE: Record<TxState, Tone> = {
  idle: "zinc",
  wallet: "amber",
  pending: "indigo",
  confirmed: "green",
  failed: "red",
};

export function TxStatus({
  state,
  error,
  hash,
  explorerBase,
}: {
  state: TxState;
  error?: string | null;
  hash?: `0x${string}`;
  explorerBase?: string;
}) {
  if (state === "idle" && !error) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
      <Badge tone={TX_TONE[state]}>
        {(state === "wallet" || state === "pending") && <Spinner />}
        {TX_LABEL[state]}
      </Badge>
      {state === "failed" && error ? (
        <span className="break-words font-mono text-seal">{error}</span>
      ) : null}
      {hash && explorerBase ? (
        <a
          href={`${explorerBase}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-bold uppercase text-emerald-bright underline decoration-2 underline-offset-4"
        >
          VIEW TX ↗
        </a>
      ) : null}
    </div>
  );
}

export function Spinner() {
  return (
    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

export function Notice({
  tone = "zinc",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  const styles: Record<Tone, string> = {
    green: "bg-mint text-[#0b2b20]",
    amber: "bg-gilt text-[#3a2a05]",
    red: "bg-seal text-on-accent",
    zinc: "bg-surface text-fg",
    indigo: "bg-fg text-bg",
  };
  return (
    <div
      className={`border-2 border-edge px-3 py-2.5 text-[13px] font-medium leading-relaxed ${styles[tone]}`}
    >
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-[15px] font-medium text-fg">
        {value}
      </div>
    </div>
  );
}

/* --------------------------------------------------- Copyable value */

export function CopyText({
  value,
  display,
  className = "",
}: {
  value: string;
  display?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          },
          () => {},
        );
      }}
      className={`font-mono underline decoration-dotted decoration-faint underline-offset-4 transition-colors hover:decoration-fg ${className}`}
      title="Copy"
    >
      {copied ? "COPIED" : (display ?? value)}
    </button>
  );
}

export function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block animate-pulse border-2 border-edge/20 bg-edge/[0.06] ${className}`} />
  );
}
