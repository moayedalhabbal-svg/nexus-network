"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, UserPlus, FileText } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

import { getProjectRecommendations, getPeopleRecommendations } from "@/lib/matching-engine";
import { CURRENT_USER } from "@/lib/seed-data";
import { MatchReason } from "@/lib/types";

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "people">("projects");

  const projectMatches = getProjectRecommendations(CURRENT_USER, 10);
  const peopleMatches = getPeopleRecommendations(CURRENT_USER, 10);

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
      case "complementary": return "➕";
      default: return "•";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Your Matches</h1>
              </div>
              <p className="text-muted-foreground">AI-curated recommendations based on your skills, intent, and complementarity.</p>
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
            
            {activeTab === "projects" && projectMatches.map(project => (
              <Card key={project.id} className="flex flex-col overflow-hidden">
                <CardHeader className="pb-4 border-b bg-muted/30">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="capitalize">{project.category.replace('_', ' ')}</Badge>
                    <Badge className={getMatchColor(project.match.score)} variant="outline">
                      {project.match.score}% Match
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="font-medium text-foreground/80 mt-1">{project.pitch}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 py-6 grid gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Why you match</h4>
                    <div className="grid gap-3">
                      {project.match.reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <span className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full h-5 w-5 text-[10px] bg-primary/10 text-primary`}>
                            {getReasonIcon(reason.type)}
                          </span>
                          <span className={`${reason.type === 'complementary' ? 'font-medium' : ''}`}>
                            {reason.type === 'complementary' ? reason.label : reason.label}
                            {reason.type === 'intent' && <span className="text-muted-foreground block text-xs mt-0.5">Project is actively looking for collaborators</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {project.match.gaps.length > 0 && (
                    <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                      <h4 className="text-xs font-semibold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider mb-2">Potential Gaps</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {project.match.gaps.map((gap, idx) => (
                          <li key={idx}>• {gap.label}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-4 border-t flex gap-3 bg-muted/10">
                  <Button className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> View Project
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {activeTab === "people" && peopleMatches.map(person => (
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
                    <Badge className={getMatchColor(person.match.score)} variant="outline">
                      {person.match.score}% Match
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 py-6 grid gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Why you should meet</h4>
                    <div className="grid gap-3">
                      {person.match.reasons.map((reason, idx) => (
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
                
                <CardFooter className="pt-4 border-t flex gap-3 bg-muted/10">
                  <Button className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" /> Connect
                  </Button>
                </CardFooter>
              </Card>
            ))}

          </div>
        </div>
      </main>
    </div>
  );
}
