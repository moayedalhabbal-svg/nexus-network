export function isDemoModeEnabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  return !url || url === "demo" || !/^https?:\/\//i.test(url);
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
