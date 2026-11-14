"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * "Print or save as PDF": opens the browser's print dialog, where "Save as PDF" is a
 * destination. Hidden on paper. Closed sections are opened for the print (PrintExpand).
 */
export function PrintButton({
  label = "Print or save as PDF",
  variant = "outline",
  size = "default",
  className,
}: {
  label?: string;
  variant?: "default" | "outline";
  size?: "default" | "lg";
  className?: string;
}) {
  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={() => window.print()} data-print="hide">
      <Printer aria-hidden strokeWidth={1.75} data-icon="inline-start" />
      {label}
    </Button>
  );
}
