import { ReactNode } from "react";
import WorkspaceLayoutClient from "./layout-client";

export const instant = false;

export default async function WorkspaceLayout({ 
  children,
  params 
}: { 
  children: ReactNode,
  params: Promise<{ id: string, locale: string }>
}) {
  const resolvedParams = await params;
  return (
    <WorkspaceLayoutClient projectId={resolvedParams.id} locale={resolvedParams.locale}>
      {children}
    </WorkspaceLayoutClient>
  );
}
