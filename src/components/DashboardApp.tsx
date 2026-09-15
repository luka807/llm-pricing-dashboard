"use client";

import { useState } from "react";
import Image from "next/image";
import TabNav, { type TabKey } from "@/components/TabNav";
import PricingComparisonTab from "@/components/PricingComparisonTab";
import CostCalculatorTab from "@/components/CostCalculatorTab";
import CostVsCapabilityTab from "@/components/CostVsCapabilityTab";
import PricingHistoryTab from "@/components/PricingHistoryTab";
import Footer from "@/components/Footer";

export default function DashboardApp() {
  const [tab, setTab] = useState<TabKey>("pricing");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header style={{ background: "var(--lnp-navy-deep)", color: "#ffffff" }}>
        <div className="mx-auto max-w-[1240px] px-8 pt-8">
          <div className="flex items-start gap-6 pb-6">
            <Image src="/lnp-logo.png" alt="Leadership Now Project" height={34} width={172} className="mt-0.5 h-[34px] w-auto shrink-0" priority />
            <div className="min-w-0">
              <h1 className="font-display text-[2.125rem] leading-[1.08] font-extrabold tracking-[-0.005em]">
                LLM Pricing Dashboard
              </h1>
              <p className="mt-2 max-w-[62ch] text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
                Compare per-token pricing across providers, estimate cost for your own workload, and see how prices
                have moved over time.
              </p>
            </div>
          </div>
          <TabNav active={tab} onChange={setTab} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-8 py-10">
        {tab === "pricing" && <PricingComparisonTab />}
        {tab === "calculator" && <CostCalculatorTab />}
        {tab === "capability" && <CostVsCapabilityTab />}
        {tab === "history" && <PricingHistoryTab />}
      </main>

      <Footer />
    </div>
  );
}
