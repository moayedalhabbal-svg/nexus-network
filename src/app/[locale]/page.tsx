import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { HomeClient } from "./home-client";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { setRequestLocale } = await import('next-intl/server');
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      
      <HomeClient />

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-extrabold text-sm text-primary-foreground">N</span>
            </div>
            <span className="font-bold tracking-tight">NEXUS</span>
            <span className="text-sm text-muted-foreground ml-2">© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
