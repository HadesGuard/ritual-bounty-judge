"use client";

import { useSyncExternalStore } from "react";

const KEY = "sv-theme";

function subscribe(cb: () => void): () => void {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => mo.disconnect();
}

function getSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function getServerSnapshot(): "light" | "dark" {
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("light", next === "light");
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="text-[12px] text-muted underline decoration-dotted decoration-faint underline-offset-4 transition-colors hover:text-fg hover:decoration-fg"
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
