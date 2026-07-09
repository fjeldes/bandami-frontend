"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import WritingResources from "@/components/resources/WritingResources";

export default function DashboardWritingResourcesPage() {
  return (
    <div>
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Resources", href: "/dashboard/resources" },
        { label: "Writing Tips" },
      ]} />
      <WritingResources basePath="/dashboard/resources" />
    </div>
  );
}
