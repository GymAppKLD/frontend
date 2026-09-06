import { useEffect } from "react";

/** Strict hex color, e.g. "#060607". */
export type StatusBarColor = string;

/**
 * Dynamically updates the Android system status bar color at runtime.
 *
 * - Finds the active `<meta name="theme-color">` (the one whose `media`
 *   matches the current `prefers-color-scheme`) and rewrites its `content`,
 *   or falls back to creating/appending a plain meta tag.
 * - Restores the previous color on unmount, so route-level overrides
 *   (modals, per-page themes) revert cleanly.
 *
 * @param color   Hex color (must include `#`), or `null` to skip.
 * @param enabled Set to `false` to keep the static/manifest color untouched.
 */
export function useStatusBarColor(color: StatusBarColor | null, enabled = true): void {
  useEffect(() => {
    if (!enabled || !color) return;
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      console.warn(`[useStatusBarColor] Invalid color "${color}" — expected #RRGGBB`);
      return;
    }

    const previous = readActiveThemeColor();
    applyThemeColor(color);

    return () => {
      // Restore the color that was active before this hook ran.
      applyThemeColor(previous ?? "");
    };
  }, [color, enabled]);
}

/** Returns the content of the currently-active theme-color meta, if any. */
function readActiveThemeColor(): string | null {
  const meta = getActiveThemeColorMeta();
  return meta?.content ?? null;
}

/**
 * The active meta is the one whose `media` matches current system scheme
 * (Chrome applies these like CSS media queries). Prefer it over an
 * unconditional tag; fall back to any `theme-color` meta present.
 */
function getActiveThemeColorMeta(): HTMLMetaElement | null {
  const all = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
  if (all.length === 0) return null;

  const matchesPrefers = all.find((m) => {
    const media = m.getAttribute("media");
    return media && window.matchMedia(media).matches;
  });

  return matchesPrefers ?? all[0];
}

function applyThemeColor(color: string): void {
  const active = getActiveThemeColorMeta();
  if (active) {
    if (color === "") {
      // If we have nothing to restore (e.g. no previous meta), let the
      // prefers-color-scheme meta win again by removing the override.
      active.removeAttribute("content");
      return;
    }
    active.setAttribute("content", color);
    return;
  }

  // No meta exists at all — create one.
  if (color === "") return;
  const meta = document.createElement("meta");
  meta.name = "theme-color";
  meta.content = color;
  document.head.appendChild(meta);
}