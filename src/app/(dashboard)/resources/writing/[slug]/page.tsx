import { getTipBySlug } from "@/data/tips";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import WritingTipDetail from "@/components/resources/WritingTipDetail";

export default async function DashboardWritingTipPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tip = getTipBySlug("writing", slug);

  return (
    <div>
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Resources", href: "/dashboard/resources" },
        { label: "Writing Tips", href: "/dashboard/resources/writing" },
        { label: tip?.title || "Tip" },
      ]} />
      <WritingTipDetail slug={slug} basePath="/dashboard/resources" />
    </div>
  );
}
