import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <FileText className="h-3.5 w-3.5" /> Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-zinc-400">Last updated: October 2026</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-100">1. Acceptance of Terms</h2>
            <p>
              By accessing or using NEXUS, you agree to comply with and be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-100">2. Acceptable Use</h2>
            <p>
              You agree to use the platform solely for legitimate professional collaboration, project development, research, and networking in good faith.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-100">3. Intellectual Property</h2>
            <p>
              All projects, source code, and assets posted by creators remain their intellectual property unless explicitly licensed otherwise within project agreements.
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
}
