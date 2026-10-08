"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "next-intl";

import { semanticSearch } from "@/lib/matching-engine";
import { SEED_PROJECTS, SEED_USERS } from "@/lib/seed-data";

export default function DiscoverPage() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"projects" | "people">("projects");
  const [query, setQuery] = useState("");
  
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [dbProfiles, setDbProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDbData = async () => {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey(full_name, location),
          project_needs(id, role_title)
        `)
        .order('created_at', { ascending: false });
        
      if (projectsData) {
        setDbProjects(projectsData.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          stage: p.stage,
          pitch: p.pitch,
          description: p.description || '',
          ownerName: p.profiles?.full_name || 'Unknown',
          location: p.profiles?.location || 'Remote',
          needs: p.project_needs?.map((n: any) => ({ id: n.id, role: n.role_title })) || []
        })));
      }

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('search_visibility', true);
        
      if (profilesData) {
        setDbProfiles(profilesData.map((p: any) => ({
          id: p.id,
          name: p.full_name,
          headline: p.headline || '',
          bio: p.bio || '',
          avatar: p.avatar_url,
          location: p.location || 'Remote',
          availability: 'flexible',
          skills: [], // Add skills when user_skills table is joined
          intents: ['collaboration']
        })));
      }
      
      setLoading(false);
    };
    
    fetchDbData();
  }, []);

  // Simple client-side search if DB data is used
  const baseProjects = dbProjects.length > 0 ? dbProjects : SEED_PROJECTS;
  const baseProfiles = dbProfiles.length > 0 ? dbProfiles : SEED_USERS;

  let displayProjects = baseProjects;
  let displayPeople = baseProfiles;
  
  if (query.trim() !== "") {
    const q = query.toLowerCase();
    displayProjects = baseProjects.filter(p => 
      p.title?.toLowerCase().includes(q) || 
      p.pitch?.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
    displayPeople = baseProfiles.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.headline?.toLowerCase().includes(q) || 
      p.bio?.toLowerCase().includes(q)
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-muted/20 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Discovering opportunities...</p>
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
              <h1 className="text-3xl font-bold tracking-tight mb-2">Discover</h1>
              <p className="text-muted-foreground">Find the people, projects, and opportunities you're looking for.</p>
            </div>
            
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Semantic search (e.g. climate tech founder)" 
                  className="pl-9 h-10 w-full"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto pb-4 mb-6 border-b">
            <div className="flex gap-6">
              {[
                { id: "projects", label: "Projects" },
                { id: "people", label: "People" },
                { id: "research", label: "Research" },
                { id: "startups", label: "Startups" },
                { id: "opportunities", label: "Opportunities" },
                { id: "mentors", label: "Mentors" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {activeTab === "projects" && displayProjects.map(project => (
              <Link key={project.id} href={`/${locale}/projects/${project.id}`}>
                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="capitalize">{project.category.replace('_', ' ')}</Badge>
                    <Badge className={
                      project.stage === 'mvp' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 
                      project.stage === 'prototype' ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20' : 
                      'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    } variant="secondary">
                      {project.stage.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 font-medium text-foreground/80">{project.pitch}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description}</p>
                  
                  <div className="space-y-3 mt-auto">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Looking for:</div>
                    <div className="flex flex-wrap gap-2">
                      {project.needs.map(need => (
                        <Badge key={need.id} variant="secondary" className="text-xs font-normal">
                          {need.role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm" alt={project.ownerName} />
                    <span className="text-xs text-muted-foreground">{project.ownerName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{project.location}</span>
                </CardFooter>
              </Card>
              </Link>
            ))}

            {activeTab === "people" && displayPeople.map(person => (
              <Card key={person.id} className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-4 flex flex-row items-start gap-4">
                  <Avatar size="lg" alt={person.name} />
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{person.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{person.headline}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{person.bio}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {person.skills.slice(0, 4).map(skill => (
                          <Badge key={skill.id} variant="outline" className="text-xs font-normal">
                            {skill.name}
                          </Badge>
                        ))}
                        {person.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs font-normal border-dashed">
                            +{person.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Intent</div>
                      <div className="flex flex-wrap gap-1.5">
                        {person.intents.map(intent => (
                          <Badge key={intent} className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent text-xs font-normal capitalize">
                            {intent.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{person.location}</span>
                  <span className="text-xs text-muted-foreground capitalize">{person.availability.replace('_', ' ')}</span>
                </CardFooter>
              </Card>
            ))}

            {/* Empty States for other tabs */}
            {(activeTab !== "projects" && activeTab !== "people") && (
              <div className="col-span-full py-20 text-center">
                <h3 className="text-lg font-medium text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">This section of the directory is currently being populated.</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
