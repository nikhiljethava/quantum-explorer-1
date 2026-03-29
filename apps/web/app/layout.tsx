import "./globals.css";

import type { Metadata } from "next";
import { ReactNode } from "react";

import { AppShell } from "../components/app-shell";

export const metadata: Metadata = {
  title: "Hybrid Quantum Workload Navigator",
  description: "Local-first qualification and prototype workflow for hybrid classical and quantum workloads."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
