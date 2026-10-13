import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default async function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" /> Privacy Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-zinc-400">Last updated: October 2026</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-100">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when creating an account, editing your profile, listing projects, submitting feedback, or messaging members.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-100">2. How We Use Information</h2>
            <p>
              We use information to provide, maintain, and improve our platform, including powering the AI matching engine to suggest collaborators and relevant projects.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-100">3. Data Protection & Security</h2>
            <p>
              Your personal data and private project repositories are safeguarded using industry-standard encryption, Row-Level Security policies, and secure authentication flows.
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
}
