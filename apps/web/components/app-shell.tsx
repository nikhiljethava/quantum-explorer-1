import Link from "next/link";
import { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Hybrid Quantum Workload Navigator</p>
          <Link className="brand" href="/">
            Local-first qualification studio
          </Link>
        </div>
        <nav className="topnav">
          <Link href="/projects">Projects</Link>
          <Link href="/workloads/new">New workload</Link>
          <a href="http://localhost:8000/docs">API docs</a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
