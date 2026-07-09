"use client";

import { Navbar } from "@/components/landing/Navbar";
import BandScoresContent from "@/components/resources/BandScoresContent";
import { DashboardBackLink } from "@/components/ui/DashboardBackLink";

export default function BandScoresPage() {
  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <DashboardBackLink />
        <BandScoresContent />
      </div>
    </div>
  );
}
