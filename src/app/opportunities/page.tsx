"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Search, FlaskConical, Compass, DollarSign, Handshake, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SEED_USERS } from "@/lib/seed-data";

type OppType = "research" | "mentor" | "funding";

const OPPORTUNITIES = [
  {
    id: "opp-1",
    type: "research",
    title: "Post-Doc Researcher: AI in Materials Science",
    institution: "MIT CSAIL",
    description: "Looking for a post-doc to lead a new initiative applying graph neural networks to discover novel battery materials.",
    tags: ["AI/ML", "Materials Science", "GNNs"],
    stipend: "$80k - $100k",
    postedBy: "user-1",
  },
  {
    id: "opp-2",
    type: "mentor",
    title: "Go-To-Market Strategy Mentorship",
    institution: "NEXUS Mentors",
    description: "Offering 1-on-1 mentorship for early-stage founders struggling with B2B sales and enterprise pilots.",
    tags: ["B2B Sales", "GTM", "Startups"],
    stipend: "Pro-bono",
    postedBy: "user-6",
  },
  {
    id: "opp-3",
    type: "funding",
    title: "Climate Tech Pre-Seed Syndicate",
    institution: "Green Future VC",
    description: "We are syndicating pre-seed rounds ($250k - $500k) for hardware founders building renewable energy infrastructure.",
    tags: ["Pre-Seed", "Hardware", "Climate Tech"],
    stipend: "Up to $500k",
    postedBy: "user-2",
  },
  {
    id: "opp-4",
    type: "research",
    title: "Undergrad Research Assistant: HCI Lab",
    institution: "Stanford HCI",
    description: "Assist with running user studies on new spatial computing interfaces. Must have experience with React and Unity.",
    tags: ["HCI", "AR/VR", "React"],
    stipend: "Paid hourly",
    postedBy: "user-4",
  }
];

export default function OpportunitiesPage() {
  const [filter, setFilter] = useState<"all" | OppType>("all");
  const [search, setSearch] = useState("");

  const filtered = OPPORTUNITIES.filter(o => {
    if (filter !== "all" && o.type !== filter) return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'research': return <FlaskConical className="h-5 w-5 text-purple-500" />;
      case 'mentor': return <Compass className="h-5 w-5 text-blue-500" />;
      case 'funding': return <DollarSign className="h-5 w-5 text-green-500" />;
      default: return <Handshake className="h-5 w-5" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'research': return "bg-purple-500/10 text-purple-500 border-purple-200/20";
      case 'mentor': return "bg-blue-500/10 text-blue-500 border-blue-200/20";
      case 'funding': return "bg-green-500/10 text-green-500 border-green-200/20";
      default: return "bg-muted text-foreground";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Specialized Networks</h1>
          <p className="text-muted-foreground">Find research positions, mentorship, and early-stage funding.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search opportunities..." 
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'research' ? 'default' : 'outline'} onClick={() => setFilter('research')} className="gap-2">
              <FlaskConical className="h-4 w-4" /> Research
            </Button>
            <Button variant={filter === 'mentor' ? 'default' : 'outline'} onClick={() => setFilter('mentor')} className="gap-2">
              <Compass className="h-4 w-4" /> Mentorship
            </Button>
            <Button variant={filter === 'funding' ? 'default' : 'outline'} onClick={() => setFilter('funding')} className="gap-2">
              <DollarSign className="h-4 w-4" /> Funding
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(opp => {
            const author = SEED_USERS.find(u => u.id === opp.postedBy);
            return (
              <Card key={opp.id} className="hover:border-primary/50 transition-all flex flex-col group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={getBadgeColor(opp.type)}>
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold">
                        {getIcon(opp.type)} {opp.type}
                      </span>
                    </Badge>
                    <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-md">{opp.stipend}</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{opp.title}</CardTitle>
                  <CardDescription className="font-medium text-foreground">{opp.institution}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">{opp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {opp.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 bg-muted/10 flex justify-between items-center">
                  {author && (
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" alt={author.name} />
                      <div>
                        <p className="text-xs font-medium">{author.name}</p>
                        <p className="text-[10px] text-muted-foreground">Posted 2d ago</p>
                      </div>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="gap-2">
                    Apply <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Handshake className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search filters.</p>
          </div>
        )}

      </main>
    </div>
  );
}
