"use client";

import { useEffect } from "react";

/**
 * Opens every closed <details> while the page is being printed (or saved as PDF) and closes
 * them again afterwards, so paper always carries the full content. Mounted once in the layout.
 * The print stylesheet does the same in CSS where the browser allows; this covers the rest.
 */
export function PrintExpand() {
  useEffect(() => {
    const MARK = "data-print-opened";
    const open = () => {
      for (const el of document.querySelectorAll<HTMLDetailsElement>("details:not([open])")) {
        el.setAttribute(MARK, "");
        el.open = true;
      }
    };
    const close = () => {
      for (const el of document.querySelectorAll<HTMLDetailsElement>(`details[${MARK}]`)) {
        el.removeAttribute(MARK);
        el.open = false;
      }
    };
    window.addEventListener("beforeprint", open);
    window.addEventListener("afterprint", close);
    return () => {
      window.removeEventListener("beforeprint", open);
      window.removeEventListener("afterprint", close);
    };
  }, []);
  return null;
}
