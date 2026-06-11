import { useEffect, useRef } from 'react';

/**
 * Focus management for inline panels and modal dialogs.
 *
 * When `open` flips true:
 *   • The first focusable inside the panel receives focus (so a screen
 *     reader user hears the heading + first field immediately, and a
 *     keyboard user can start typing without an extra Tab press).
 *   • If `trapFocus` is true (full modal), Tab/Shift+Tab cycle inside.
 *   • Escape calls `onClose`.
 *
 * When `open` flips back to false:
 *   • Focus returns to whatever element triggered the open. The element
 *     is captured the first time the hook sees `open === true` so the
 *     caller doesn't have to thread a triggerRef through.
 *
 * Returns a ref to attach to the panel container so the hook knows
 * which DOM subtree to focus inside / trap focus inside.
 *
 * Usage:
 *   const ref = useDialog<HTMLDivElement>({
 *     open: isOpen,
 *     onClose: () => setOpen(false),
 *     trapFocus: false, // inline panel; true for true modal
 *   });
 *   return open ? <div ref={ref} role="dialog" aria-modal="true">…</div> : null;
 */
export function useDialog<T extends HTMLElement>(opts: {
  open:        boolean;
  onClose:     () => void;
  /** Default false — inline panels just move focus, they don't trap it.
   *  Full overlay modals should pass true. */
  trapFocus?:  boolean;
  /** Default true — disables Escape-to-close when false. */
  closeOnEscape?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const {
    open,
    onClose,
    trapFocus = false,
    closeOnEscape = true,
  } = opts;

  // === Focus into the panel on open, return focus to trigger on close ===
  useEffect(() => {
    if (open) {
      // Remember whoever had focus right before the panel opened — we'll
      // restore to them on close. Skip if focus is on body (no real trigger).
      const active = document.activeElement as HTMLElement | null;
      if (active && active !== document.body) {
        triggerRef.current = active;
      }
      const node = ref.current;
      if (!node) return;
      // Wait a tick so the panel has actually painted before focusing.
      const t = window.setTimeout(() => {
        const focusable = findFocusable(node);
        focusable[0]?.focus();
      }, 0);
      return () => window.clearTimeout(t);
    } else {
      // Return focus to trigger (only if the panel previously had focus
      // — don't steal focus from wherever the user has moved to).
      const trigger = triggerRef.current;
      if (trigger && document.body.contains(trigger)) {
        trigger.focus();
      }
      triggerRef.current = null;
    }
  }, [open]);

  // === Escape to close, optional focus trap ===
  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    if (!node) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        onClose();
        return;
      }
      if (!trapFocus || e.key !== 'Tab') return;
      const items = findFocusable(node);
      if (items.length === 0) return;
      const first = items[0];
      const last  = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, trapFocus, closeOnEscape]);

  return ref;
}

function findFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    ),
  ).filter((el) => !el.hasAttribute('inert') && el.offsetParent !== null);
}
