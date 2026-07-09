"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import ResourcesHome from "@/components/resources/ResourcesHome";

export default function DashboardResourcesPage() {
  return (
    <div>
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Resources" },
      ]} />
      <ResourcesHome basePath="/dashboard/resources" />
    </div>
  );
}
