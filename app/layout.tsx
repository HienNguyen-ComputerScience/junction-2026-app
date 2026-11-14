import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LogoMark, SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for headlines and big figures only; body copy stays in Geist.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "FirstLine",
  description: "Where early cancer care breaks down, county by county in Finland.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <footer className="mt-12 border-t border-border/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <LogoMark className="size-5" />
              <span className="font-display">FirstLine</span>
            </div>
            <p className="type-caption text-muted-foreground">
              Decision support for service planning. Not medical advice. No patient
              data.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
