"use client";

import { Navbar } from "@/components/landing/Navbar";
import BandScoresContent from "@/components/resources/BandScoresContent";

export default function BandScoresPage() {
  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <BandScoresContent />
      </div>
    </div>
  );
}
