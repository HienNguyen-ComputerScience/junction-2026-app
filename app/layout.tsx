import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { PrintExpand } from "@/components/motion/print-expand";
import { LogoMark, SiteHeader } from "@/components/site-header";

// One sans and one serif. Inter carries body copy, labels and every figure (300, 400, 600).
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

// The display serif, for headings and statements. Weight 300 only: it is never set bold.
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "300",
});

export const metadata: Metadata = {
  title: "FirstLine",
  description: "Where early cancer care breaks down, county by county in Finland.",
};

// Matches --background (Cream Paper), so the browser chrome and form controls are light too.
export const viewport: Viewport = {
  themeColor: "#fffefc",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PrintExpand />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <footer className="mt-16 border-t border-frame-border print:hidden">
          <div className="page-container flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <LogoMark className="size-5" />
              <span className="font-display text-xl leading-none font-light text-forest-ink">
                FirstLine
              </span>
            </div>
            <p className="text-base text-muted-foreground">
              Decision support for service planning. Not medical advice. No patient
              data.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
