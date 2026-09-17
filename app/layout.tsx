import React from "react";
import type { Metadata } from "next";
import "@/app/globals.css"; // Ensure CSS is imported here
import ColorSwitcherFAB from "@/components/buttons/ColorSwitcherFAB";

export const metadata: Metadata = {
  title: "ConstructERP",
  description: "Internal Operations Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <ColorSwitcherFAB />
      </body>
    </html>
  );
}
