import "./globals.css";
import type { Metadata, Viewport } from "next";
import SwRegister from "@/components/SwRegister";

export const metadata: Metadata = {
  title: "FieldSync",
  description: "Offline-first field data collector",
  manifest: "/manifest.json",
};

export const viewport: Viewport = { themeColor: "#2563eb" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
