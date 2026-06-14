import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipBridge",
  description: "Instant encrypted clipboard between machines",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
