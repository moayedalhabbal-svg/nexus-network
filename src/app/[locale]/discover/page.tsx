// @ts-nocheck
"use client";
/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Loader2, Sparkles, User, Briefcase, BookOpen, Handshake, Target, Rocket } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useLocale } from "next-intl";

import { semanticSearch, UnifiedSearchResult } from "@/lib/matching-engine";
import { SEED_PROJECTS, SEED_USERS } from "@/lib/seed-data";

export default function DiscoverPage() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"all" | "people" | "projects" | "research" | "startups" | "opportunities" | "mentors">("all");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Perform hybrid AI Search whenever query or tab changes
  useEffect(() => {
    setIsSearching(true);
    
    // Simulate slight network delay for realism of "AI" search
    const timer = setTimeout(() => {
      const searchResults = semanticSearch(query, activeTab);
      setResults(searchResults);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const renderResultCard = (result: UnifiedSearchResult) => {
    const { type, data, score, reason } = result;

    if (type === "projects" || type === "startups") {
      return (
        <Link key={`${type}-${data.id}`} href={`/${locale}/projects/${data.id}`}>
          <Card className="h-full flex flex-col hover:border-primary/50 transition-colors cursor-pointer group shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="capitalize">{data.category?.replace('_', ' ') || 'Technology'}</Badge>
                {query.length > 2 && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 flex gap-1 items-center">
                    <Sparkles className="h-3 w-3" /> Match
                  </Badge>
                )}
              </div>
              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{data.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2 font-medium text-foreground/80">{data.pitch || data.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              {query.length > 2 && (
                <div className="mb-4 p-2 bg-muted/50 rounded text-xs text-muted-foreground border border-border/50">
                  <span className="font-semibold text-foreground">Why this matched:</span> {reason}
                </div>
              )}
              
              <div className="space-y-3 mt-auto">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Looking for:</div>
                <div className="flex flex-wrap gap-2">
                  {data.needs?.map((need: any) => (
                    <Badge key={need.id || need.role} variant="secondary" className="text-xs font-normal">
                      {need.role}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar size="sm" alt="Owner" />
                <span className="text-xs text-muted-foreground">Team</span>
              </div>
              <span className="text-xs text-muted-foreground">{data.location || 'Remote'}</span>
            </CardFooter>
          </Card>
        </Link>
      );
    }

    if (type === "people") {
      return (
        <Card key={`${type}-${data.id}`} className="h-full flex flex-col hover:border-primary/50 transition-colors cursor-pointer group shadow-sm">
          <CardHeader className="pb-4 flex flex-row items-start gap-4">
            <Avatar size="lg" src={data.avatar} alt={data.name} />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">{data.name}</CardTitle>
                {query.length > 2 && <Sparkles className="h-4 w-4 text-primary shrink-0" />}
              </div>
              <CardDescription className="line-clamp-1">{data.headline}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            {query.length > 2 && (
              <div className="mb-4 p-2 bg-muted/50 rounded text-xs text-muted-foreground border border-border/50">
                <span className="font-semibold text-foreground">Why this matched:</span> {reason}
              </div>
            )}
            
            <div className="space-y-4 mt-auto">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills?.slice(0, 4).map((skill: any) => (
                    <Badge key={skill.id || skill.name} variant="outline" className="text-xs font-normal">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{data.location}</span>
            <span className="text-xs text-muted-foreground capitalize">{(data.availability || 'flexible').replace('_', ' ')}</span>
          </CardFooter>
        </Card>
      );
    }

    // Generic fallback for Research, Mentors, Opportunities
    return (
      <Card key={`${type}-${data.id}`} className="h-full flex flex-col hover:border-primary/50 transition-colors shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="capitalize">{type}</Badge>
            {query.length > 2 && <Sparkles className="h-4 w-4 text-primary shrink-0" />}
          </div>
          <CardTitle className="line-clamp-2">{data.title || data.userId || 'Opportunity'}</CardTitle>
          <CardDescription className="line-clamp-2 mt-2">{data.abstract || data.bio || data.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          {query.length > 2 && (
            <div className="mb-4 p-2 bg-muted/50 rounded text-xs text-muted-foreground border border-border/50">
              <span className="font-semibold text-foreground">Why this matched:</span> {reason}
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
             {(data.fields || data.tags || data.expertise || []).slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">{tag}</Badge>
             ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Unified Discovery</h1>
              <p className="text-muted-foreground">Search naturally across all people, projects, and opportunities.</p>
            </div>
            
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-96 shadow-sm">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  placeholder="e.g. 'Find climate tech startups looking for engineers'" 
                  className="pl-9 pr-4 h-11 w-full border-primary/20 focus-visible:ring-primary"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto pb-4 mb-6 border-b no-scrollbar">
            <div className="flex gap-2">
              {[
                { id: "all", label: "All Results", icon: Search },
                { id: "people", label: "People", icon: User },
                { id: "projects", label: "Projects", icon: Rocket },
                { id: "startups", label: "Startups", icon: Briefcase },
                { id: "research", label: "Research", icon: BookOpen },
                { id: "mentors", label: "Mentors", icon: Handshake },
                { id: "opportunities", label: "Opportunities", icon: Target },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition-colors ${
                    activeTab === tab.id
                      ? "bg-foreground text-background"
                      : "bg-background border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {isSearching ? (
             <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">Analyzing intent and searching...</p>
             </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(renderResultCard)}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-bold mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-sm">
                We couldn't find any {activeTab === 'all' ? 'matches' : activeTab} for "{query}". Try adjusting your keywords.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
