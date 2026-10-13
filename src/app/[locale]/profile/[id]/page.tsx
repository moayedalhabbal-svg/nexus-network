/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navbar } from "@/components/layout/navbar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEED_USERS, SEED_PROJECTS } from "@/lib/seed-data";
import { ArrowLeft, MapPin, Globe, GitBranch, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";

export function generateStaticParams() {
  return SEED_USERS.map((user) => ({
    id: user.id,
  }));
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  
  // Try to find seed user first
  const seedUser = SEED_USERS.find((u) => u.id === id);

  let profile: any = seedUser;

  // If not found in seed, attempt Supabase lookup
  if (!profile && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "demo") {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        profile = {
          id: data.id,
          name: data.full_name || "NEXUS Member",
          email: "",
          headline: data.headline || "Builder & Researcher",
          bio: data.bio || "",
          avatar: data.avatar_url || `https://i.pravatar.cc/150?u=${data.id}`,
          location: data.location || "Remote",
          website: data.website || "",
          skills: [],
          interests: [],
        };
      }
    } catch {
      // Ignore database error, fallback below
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="max-w-md w-full border-zinc-800 bg-zinc-900/60 p-6 text-center">
            <h2 className="text-xl font-bold mb-2">User Not Found</h2>
            <p className="text-sm text-zinc-400 mb-6">This user profile does not exist or has been removed.</p>
            <Link href={`/${locale}/feed`}>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white">Back to Feed</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  // Find projects this user is part of
  const userProjects = SEED_PROJECTS.filter((p) => p.ownerId === profile.id);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col selection:bg-primary/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Link
          href={`/${locale}/feed`}
          className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-200 transition-colors gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Link>

        {/* Hero Card */}
        <Card className="border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="h-32 bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-purple-900/50" />
          <CardContent className="p-6 relative pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-4">
              <Avatar
                src={profile.avatar}
                alt={profile.name}
                className="h-28 w-28 ring-4 ring-[#0A0A0A] shadow-2xl"
              />
              <div className="flex gap-2">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-full">
                  Connect
                </Button>
                <Link href={`/${locale}/messages`}>
                  <Button variant="outline" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 text-sm rounded-full">
                    <MessageSquare className="h-4 w-4 me-1.5" /> Message
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-zinc-100">{profile.name}</h1>
              <p className="text-sm font-medium text-zinc-300">{profile.headline}</p>
              
              <div className="flex flex-wrap gap-4 text-xs text-zinc-400 pt-2">
                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-zinc-500" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 pt-6 border-t border-zinc-800/60">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">About</h3>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills & Interests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-3 border-b border-zinc-800/50">
              <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" /> Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill: any, idx: number) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-zinc-700 bg-zinc-800/60 text-zinc-200 text-xs py-1"
                    >
                      {skill.name || skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">No skills listed yet.</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-3 border-b border-zinc-800/50">
              <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-indigo-400" /> Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {userProjects.length > 0 ? (
                userProjects.map((proj) => (
                  <Link
                    key={proj.id}
                    href={`/${locale}/projects/${proj.id}`}
                    className="block p-3 rounded-xl border border-zinc-800/60 bg-zinc-950/40 hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="font-semibold text-sm text-zinc-200">{proj.title}</div>
                    <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{proj.pitch}</div>
                  </Link>
                ))
              ) : (
                <span className="text-xs text-zinc-500">No public projects yet.</span>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
