import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hybrid Quantum Workload Navigator",
  description: "Assess, decompose, and prototype hybrid quantum workloads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
