import BountyDetailsClient from "./client";

export const instant = false;

export default async function BountyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <BountyDetailsClient params={Promise.resolve(resolvedParams)} />;
}
