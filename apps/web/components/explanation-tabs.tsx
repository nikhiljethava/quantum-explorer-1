"use client";

import { useState } from "react";

type ExplanationTabsProps = {
  explanations: {
    exec: string;
    architect: string;
    scientist: string;
  };
};

const tabLabels = ["exec", "architect", "scientist"] as const;

export function ExplanationTabs({ explanations }: ExplanationTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabLabels)[number]>("exec");

  return (
    <div className="tabs-card">
      <div className="tab-row">
        {tabLabels.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <p className="tab-copy">{explanations[activeTab]}</p>
    </div>
  );
}
