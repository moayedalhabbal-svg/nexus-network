"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, UserPlus, FileText, Check, X, Bot, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

import { explainMatchAction, saveMatchFeedbackAction } from "@/app/actions/matching";
import { computeMatchesAction } from "@/app/actions/compute-matches";
import { MatchReason } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "people">("projects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectMatches, setProjectMatches] = useState<any[]>([]);
  const [peopleMatches, setPeopleMatches] = useState<any[]>([]);
  const [explanationText, setExplanationText] = useState("");
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [explaining, setExplaining] = useState(false);
  
  const { user } = useAuth();
  const locale = useLocale();

  useEffect(() => {
    async function loadMatches() {
      const res = await computeMatchesAction(user?.id);
      if (res.success) {
        setProjectMatches(res.projectMatches || []);
        setPeopleMatches(res.peopleMatches || []);
      } else {
        setError(res.error || "Failed to load matches");
      }
      setLoading(false);
    }
    if (user) loadMatches();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setLoading(false);
  }, [user]);

  const handleExplain = async (match: any, targetName: string) => {
    setExplaining(true);
    setIsExplainOpen(true);
    const res = await explainMatchAction(user?.id || '', targetName, match.reasons, match.gaps);
    if (res.success) {
      setExplanationText(res.explanation!);
    } else {
      setExplanationText("Explanation unavailable.");
    }
    setExplaining(false);
  };

  const handleFeedback = async (matchId: string, status: 'relevant' | 'not_relevant', type: 'project' | 'people') => {
    await saveMatchFeedbackAction(matchId, status);
    if (status === 'not_relevant') {
      if (type === 'project') {
        setProjectMatches(prev => prev.filter(p => p.match.id !== matchId));
      } else {
        setPeopleMatches(prev => prev.filter(p => p.match.id !== matchId));
      }
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (score >= 75) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  };

  const getReasonIcon = (type: MatchReason["type"]) => {
    switch (type) {
      case "skill": return "✓";
      case "interest": return "♥";
      case "intent": return "🎯";
      case "availability": return "⌚";
      case "complementary": return "➕";
      default: return "•";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-muted/20 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Running AI Hybrid Matching Engine...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-muted/20 flex flex-col items-center justify-center text-center p-4">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg max-w-md border border-destructive/20">
            <h2 className="font-bold mb-2">Notice</h2>
            <p className="text-sm">{error}</p>
          </div>
        </main>
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
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Your AI Matches</h1>
              </div>
              <p className="text-muted-foreground">V2.0 Hybrid Recommendations based on skills, intent, and semantic alignment.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto pb-4 mb-6 border-b">
            <div className="flex gap-6">
              {[
                { id: "projects", label: "Projects for you", count: projectMatches.length },
                { id: "people", label: "People you should meet", count: peopleMatches.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {activeTab === "projects" && projectMatches.map(({ project, match }) => (
              <Card key={project.id} className="flex flex-col overflow-hidden">
                <CardHeader className="pb-4 border-b bg-muted/30">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="capitalize">{project.categories?.[0]?.replace('_', ' ')}</Badge>
                    <Badge className={getMatchColor(match.score)} variant="outline">
                      {match.score}% Match
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="font-medium text-foreground/80 mt-1">{project.pitch}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 py-6 grid gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Why you match</h4>
                    <div className="grid gap-3">
                      {match.reasons.map((reason: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <span className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full h-5 w-5 text-[10px] bg-primary/10 text-primary`}>
                            {getReasonIcon(reason.type)}
                          </span>
                          <span className={`${reason.type === 'complementary' ? 'font-medium' : ''}`}>
                            {reason.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {match.gaps.length > 0 && (
                    <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                      <h4 className="text-xs font-semibold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider mb-2">Potential Gaps</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {match.gaps.map((gap: any, idx: number) => (
                          <li key={idx}>• {gap.label}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-4 border-t flex flex-col gap-3 bg-muted/10">
                  <div className="flex w-full gap-2 justify-between">
                    <Button variant="ghost" size="sm" onClick={() => handleFeedback(match.id, 'not_relevant', 'project')}>
                      <X className="me-2 h-4 w-4" /> Not Relevant
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExplain(match, project.title)}>
                      <Bot className="me-2 h-4 w-4" /> Explain Match
                    </Button>
                  </div>
                  <Link href={`/${locale}/projects/${project.id}`} className="w-full">
                    <Button className="w-full">
                      <FileText className="me-2 h-4 w-4" /> View Project
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}

            {activeTab === "people" && peopleMatches.map(({ user: person, match }) => (
              <Card key={person.id} className="flex flex-col overflow-hidden">
                <CardHeader className="pb-4 border-b bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <Avatar size="lg" alt={person.name} />
                      <div>
                        <CardTitle className="text-lg">{person.name}</CardTitle>
                        <CardDescription className="line-clamp-1 mt-1">{person.headline}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getMatchColor(match.score)} variant="outline">
                      {match.score}% Match
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 py-6 grid gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Why you should meet</h4>
                    <div className="grid gap-3">
                      {match.reasons.map((reason: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <span className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full h-5 w-5 text-[10px] bg-primary/10 text-primary`}>
                            {getReasonIcon(reason.type)}
                          </span>
                          <span className={`${reason.type === 'complementary' ? 'font-medium' : ''}`}>
                            {reason.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4 border-t flex flex-col gap-3 bg-muted/10">
                  <div className="flex w-full gap-2 justify-between">
                    <Button variant="ghost" size="sm" onClick={() => handleFeedback(match.id, 'not_relevant', 'people')}>
                      <X className="me-2 h-4 w-4" /> Not Relevant
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExplain(match, person.name)}>
                      <Bot className="me-2 h-4 w-4" /> Explain Match
                    </Button>
                  </div>
                  <Button className="w-full">
                    <UserPlus className="me-2 h-4 w-4" /> Connect
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {((activeTab === 'projects' && projectMatches.length === 0) || (activeTab === 'people' && peopleMatches.length === 0)) && (
               <div className="col-span-full py-20 text-center text-muted-foreground">
                 No matches found.
               </div>
            )}

          </div>
        </div>
      </main>
      
      {/* Explain Match Modal */}
      {isExplainOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background w-full max-w-md rounded-xl p-6 shadow-xl border">
            <h2 className="text-xl font-bold mb-2">AI Match Explanation</h2>
            <p className="text-muted-foreground text-sm mb-4">Understanding why the engine recommended this for you.</p>
            
            <div className="py-4 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {explaining ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="animate-spin h-5 w-5" /> 
                  Generating semantic explanation...
                </div>
              ) : (
                <div className="text-sm">
                  {explanationText}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsExplainOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
