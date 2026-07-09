"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import BandScoresContent from "@/components/resources/BandScoresContent";

export default function DashboardBandScoresPage() {
  return (
    <div>
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Resources", href: "/dashboard/resources" },
        { label: "Band Scores" },
      ]} />
      <BandScoresContent />
    </div>
  );
}
