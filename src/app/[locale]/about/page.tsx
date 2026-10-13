import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users, Target, Rocket } from "lucide-react";
import Link from "next/link";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> About NEXUS
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Connecting builders to create what&apos;s next.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            NEXUS is an intelligent professional collaboration platform that connects founders, researchers, and engineers around real projects, shared mission, and complementary skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-100">Project-First Network</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Skip vanity metrics and resumes. NEXUS unites teams through real work, shared repositories, and verifiable skills.
            </p>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-100">AI Match Engine</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Find partners with complementary capabilities, aligned working commitments, and shared domain passion.
            </p>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Rocket className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-100">Collaborative Workspaces</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Integrated task boards, role matching, bounties, and team coordination to launch faster.
            </p>
          </Card>
        </div>

        <div className="text-center pt-8">
          <Link
            href={`/${locale}/discover`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors"
          >
            Explore Public Projects
          </Link>
        </div>
      </main>
    </div>
  );
}
