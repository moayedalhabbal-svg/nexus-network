import ProjectClient from "./client";
import { SEED_PROJECTS } from "@/lib/seed-data";

export function generateStaticParams() {
  return SEED_PROJECTS.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ProjectClient projectId={resolvedParams.id} />;
}
