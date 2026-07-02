"use client";

import { useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import type { TxState } from "@/hooks/useWriteTx";

/* ------------------------------------------------------ Card / sections */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-edge bg-surface ${className}`}
    >
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
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-baseline gap-3">
        {index ? (
          <span className="font-mono text-[13px] text-faint">{index}</span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-[19px] font-medium leading-snug text-fg">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-[14px] leading-normal text-muted">
              {subtitle}
            </p>
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
  return <div className={`pt-4 ${className}`}>{children}</div>;
}

/* -------------------------------------------------- Panel = action card */

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-edge bg-surface p-5 ${className}`}>
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
        <h3 className="text-[16px] font-medium leading-snug text-fg">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-[14px] leading-normal text-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <span className="text-[13px] font-medium text-muted">{children}</span>
  );
}

/* ------------------------------------------------------------- Badge */

type Tone = "green" | "amber" | "indigo" | "zinc" | "red";

const BADGE: Record<Tone, string> = {
  green: "bg-mint/15 text-mint",
  amber: "bg-gilt/15 text-gilt",
  red: "bg-seal/15 text-seal",
  zinc: "bg-surface-1 text-muted",
  indigo: "bg-brand/15 text-brand", // Claude / AI accent
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-medium ${BADGE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------ Button */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "brand";
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const styles: Record<string, string> = {
    primary: "h-9 px-4 bg-emerald text-on-accent hover:opacity-90",
    brand: "h-9 px-4 bg-brand text-on-brand hover:opacity-90",
    secondary:
      "h-9 px-4 border border-edge-strong text-fg hover:bg-surface-1",
    ghost: "text-emerald-bright hover:underline underline-offset-4",
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
      <span className="mb-1.5 block text-[13px] font-medium text-fg">
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
  "w-full rounded-lg border border-edge bg-surface-1 px-3 py-2 text-[15px] text-fg placeholder:text-faint transition-shadow focus:outline-none focus:border-emerald focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-emerald)_22%,transparent)]";

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
  wallet: "Awaiting signature",
  pending: "Pending",
  confirmed: "Confirmed",
  failed: "Failed",
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
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
      <Badge tone={TX_TONE[state]}>
        {(state === "wallet" || state === "pending") && <Spinner />}
        {TX_LABEL[state]}
      </Badge>
      {state === "failed" && error ? (
        <span className="break-words text-seal">{error}</span>
      ) : null}
      {hash && explorerBase ? (
        <a
          href={`${explorerBase}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-bright hover:underline underline-offset-4"
        >
          View transaction ↗
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
    green: "bg-mint/10 text-fg",
    amber: "bg-gilt/10 text-fg",
    red: "bg-seal/10 text-fg",
    zinc: "bg-surface-1 text-muted",
    indigo: "bg-brand/10 text-fg",
  };
  const bar: Record<Tone, string> = {
    green: "border-l-mint",
    amber: "border-l-gilt",
    red: "border-l-seal",
    zinc: "border-l-edge-strong",
    indigo: "border-l-brand",
  };
  return (
    <div
      className={`rounded-lg border-l-2 px-3 py-2.5 text-[13px] leading-relaxed ${styles[tone]} ${bar[tone]}`}
    >
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[12px] text-muted">{label}</div>
      <div className="mt-1 break-words text-[15px] font-medium text-fg">
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
      {copied ? "Copied" : (display ?? value)}
    </button>
  );
}

export function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block animate-pulse rounded bg-edge/60 ${className}`} />
  );
}
