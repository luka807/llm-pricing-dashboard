"use client";

import { useState } from "react";
import TabNav, { type TabKey } from "@/components/TabNav";
import PricingComparisonTab from "@/components/PricingComparisonTab";
import CostCalculatorTab from "@/components/CostCalculatorTab";
import CostVsCapabilityTab from "@/components/CostVsCapabilityTab";
import PricingHistoryTab from "@/components/PricingHistoryTab";

export default function DashboardApp() {
  const [tab, setTab] = useState<TabKey>("pricing");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pb-4 pt-5 sm:px-8 sm:pt-6">
        <div>
          <h1 className="text-[19px] font-bold tracking-tight text-foreground">LLM Pricing Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Compare pricing, estimate cost, and track changes across LLM providers
          </p>
        </div>
        <div className="h-[30px] w-[30px] shrink-0 rounded-lg" style={{ background: "var(--accent)" }} />
      </div>

      <TabNav active={tab} onChange={setTab} />

      {tab === "pricing" && <PricingComparisonTab />}
      {tab === "calculator" && <CostCalculatorTab />}
      {tab === "capability" && <CostVsCapabilityTab />}
      {tab === "history" && <PricingHistoryTab />}
    </div>
  );
}
