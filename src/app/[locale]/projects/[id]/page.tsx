import ProjectClient from "./client";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ProjectClient projectId={resolvedParams.id} />;
}
