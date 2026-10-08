"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SEED_USERS } from "@/lib/seed-data";
import { getPeopleRecommendations } from "@/lib/matching-engine";
import { Search, UserPlus, Check, MessageSquare, Filter, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NetworkPage() {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"suggested" | "all" | "connections">("suggested");
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const recommendations = user ? getPeopleRecommendations(user, 20) : [];
  const allPeople = SEED_USERS.filter(u => u.id !== user?.id);

  const filteredPeople = query.trim()
    ? allPeople.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.headline.toLowerCase().includes(query.toLowerCase()) ||
        p.skills.some(s => s.name.toLowerCase().includes(query.toLowerCase()))
      )
    : activeTab === "suggested" ? recommendations : allPeople;

  const handleConnect = (userId: string) => {
    setPendingIds(prev => [...prev, userId]);
    setTimeout(() => {
      setPendingIds(prev => prev.filter(id => id !== userId));
      setConnectedIds(prev => [...prev, userId]);
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 text-center shadow-xl">
            <CardHeader>
              <CardTitle>Join NEXUS to build your network</CardTitle>
              <CardDescription>Connect with builders, researchers, and founders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => { loginAsDemo(); }} className="w-full">Try Demo Mode</Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/onboarding")}>Create Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Your Network</h1>
              <p className="text-muted-foreground">Build meaningful professional connections.</p>
            </div>
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search people by name, skill, or role..."
                  className="pl-9"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b mb-6">
            {[
              { id: "suggested", label: "Suggested for You", icon: Sparkles },
              { id: "all", label: "Browse All", icon: Filter },
              { id: "connections", label: `Connections (${connectedIds.length})`, icon: Check },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Connections tab */}
          {activeTab === "connections" && connectedIds.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">No connections yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Start connecting with people from the suggested tab.</p>
              <Button onClick={() => setActiveTab("suggested")}>View Suggestions</Button>
            </div>
          )}

          {/* People Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === "connections"
              ? allPeople.filter(p => connectedIds.includes(p.id))
              : filteredPeople
            ).map((person: any) => {
              const isConnected = connectedIds.includes(person.id);
              const isPending = pendingIds.includes(person.id);
              const matchScore = person.match?.score;

              return (
                <Card key={person.id} className="flex flex-col hover:border-primary/50 transition-all group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar size="lg" alt={person.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">{person.name}</CardTitle>
                            <CardDescription className="line-clamp-1 mt-0.5">{person.headline}</CardDescription>
                          </div>
                          {matchScore && (
                            <Badge className={`shrink-0 ${
                              matchScore >= 80 ? "bg-green-500/10 text-green-500" :
                              matchScore >= 60 ? "bg-blue-500/10 text-blue-500" :
                              "bg-yellow-500/10 text-yellow-600"
                            }`} variant="outline">
                              {matchScore}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{person.bio}</p>

                    {/* Match reasons */}
                    {person.match?.reasons?.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {person.match.reasons.slice(0, 3).map((reason: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-primary/5 border-primary/20 text-xs">
                              {reason.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {person.skills.slice(0, 4).map((skill: any) => (
                        <Badge key={skill.id} variant="secondary" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                      {person.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs border-dashed">
                          +{person.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  <div className="px-6 pb-6 pt-2 flex gap-2">
                    {isConnected ? (
                      <>
                        <Button variant="outline" className="w-full text-green-600" disabled>
                          <Check className="h-4 w-4 mr-2" /> Connected
                        </Button>
                        <Button variant="outline" size="icon">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </>
                    ) : isPending ? (
                      <Button variant="outline" className="w-full" disabled>
                        <div className="h-4 w-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Pending...
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => handleConnect(person.id)}>
                        <UserPlus className="h-4 w-4 mr-2" /> Connect
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
