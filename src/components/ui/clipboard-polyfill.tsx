"use client";
import {useEffect} from 'react';

// A small runtime shim that wraps navigator.clipboard.writeText to
// gracefully fallback when the Permissions Policy blocks clipboard access
// (NotAllowedError). This prevents uncaught errors in environments where
// clipboard-write is disallowed (iframes, strict policies, some browsers).
export default function ClipboardPolyfill(): null {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nav = (window as any).navigator;
    if (!nav || !nav.clipboard) return;

    const original = nav.clipboard.writeText?.bind(nav.clipboard);
    if (!original) return;

    async function safeWriteText(text: string) {
      try {
        return await original(text);
      } catch (err: any) {
        // If clipboard is blocked by a permissions policy, try a DOM
        // fallback to copy the text into a hidden textarea and execCommand.
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'absolute';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(ta);
          if (!successful) throw new Error('execCommand copy failed');
          return Promise.resolve();
        } catch (err2) {
          // Last resort: rethrow the original error so callers can handle it
          throw err;
        }
      }
    }

    try {
      // overwrite with the safe wrapper
      nav.clipboard.writeText = safeWriteText;
    } catch (_) {
      // some environments disallow replacing clipboard methods; ignore
    }

    return () => {
      try {
        if (original) nav.clipboard.writeText = original;
      } catch (_) {
        // ignore
      }
    };
  }, []);

  return null;
}
