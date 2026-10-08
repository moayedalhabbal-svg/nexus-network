import Link from "next/link";
import { ArrowRight, Sparkles, Target, Users, Zap, Search, Bot, Briefcase, Network, FlaskConical, Handshake, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { SEED_PROJECTS, SEED_USERS } from "@/lib/seed-data";
import { Avatar } from "@/components/ui/avatar";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { setRequestLocale } = await import('next-intl/server');
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  // Sample data for the landing page
  const featuredProjects = SEED_PROJECTS.slice(0, 3);
  const featuredUsers = SEED_USERS.slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 flex flex-col lg:flex-row items-center container mx-auto px-4 gap-12">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,white,transparent)] -z-10" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10 opacity-50" />
          
          {/* Hero Content */}
          <div className="flex-1 text-center lg:text-left z-10 w-full">
            <Badge variant="secondary" className="mb-6 mx-auto lg:mx-0 animate-fade-in bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Sparkles className="mr-2 h-3 w-3" />
              Not just another social network
            </Badge>
            
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 animate-fade-in-up">
              Build what's <span className="text-primary">next.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Find the people, projects, and opportunities to build what comes next. NEXUS is where ideas find teams, and builders find their mission.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-12 px-8 text-base shadow-lg shadow-primary/25">
                  Join the Network <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>
              <Link href="/discover" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-12 px-8 text-base">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Interactive/Visual Element */}
          <div className="flex-1 w-full max-w-xl mx-auto relative animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="relative z-10 bg-card rounded-2xl border shadow-2xl p-6 glass flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-lg">AI Energy Optimization</h3>
                  <p className="text-sm text-muted-foreground">Looking for: ML Engineer, Energy Expert</p>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Project</Badge>
              </div>
              
              <div className="flex flex-col gap-3 relative">
                {/* Connection line */}
                <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-border z-0"></div>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center shrink-0">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm flex-1 border border-border/50">
                    <span className="font-semibold text-primary block">AI Match Engine</span>
                    Analyzing skills, intent, and availability...
                  </div>
                </div>

                <div className="flex items-center gap-4 relative z-10 ml-8 transition-transform hover:-translate-y-1">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm" src={SEED_USERS[2].avatar} alt="User" />
                  <div className="flex-1 bg-background rounded-lg p-3 text-sm border shadow-sm flex justify-between items-center">
                    <div>
                      <span className="font-semibold block">{SEED_USERS[2].name}</span>
                      <span className="text-xs text-muted-foreground">ML Engineer</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 shadow-none hover:bg-green-500/20">94% Match</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 relative z-10 ml-8 transition-transform hover:-translate-y-1">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm" src={SEED_USERS[3].avatar} alt="User" />
                  <div className="flex-1 bg-background rounded-lg p-3 text-sm border shadow-sm flex justify-between items-center">
                    <div>
                      <span className="font-semibold block">{SEED_USERS[3].name}</span>
                      <span className="text-xs text-muted-foreground">Energy Systems</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 shadow-none hover:bg-green-500/20">88% Match</Badge>
                  </div>
                </div>
              </div>
              
            </div>
            {/* Glows */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
          </div>
        </section>

        {/* 2. HOW NEXUS WORKS */}
        <section className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How NEXUS Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-16">
              A streamlined flow designed specifically for builders, founders, and researchers.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border z-0" />
              
              <div className="relative z-10 bg-background border p-8 rounded-2xl shadow-sm flex flex-col items-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-background">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Discover</h3>
                <p className="text-muted-foreground text-sm">Find projects that need your exact skills, or discover people who can build your vision.</p>
              </div>

              <div className="relative z-10 bg-background border p-8 rounded-2xl shadow-sm flex flex-col items-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-background">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. Match</h3>
                <p className="text-muted-foreground text-sm">Our AI ensures you connect with people who share your intent, availability, and complementary skills.</p>
              </div>

              <div className="relative z-10 bg-background border p-8 rounded-2xl shadow-sm flex flex-col items-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-background">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Build</h3>
                <p className="text-muted-foreground text-sm">Jump straight into a dedicated project workspace with your new team and start shipping.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. AI MATCHING */}
        <section className="py-24 container mx-auto px-4 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Bot className="mr-2 h-3 w-3" />
                Intelligence Layer
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight">Connections powered by deep context.</h2>
              <p className="text-lg text-muted-foreground">
                NEXUS doesn't rely on keyword searching. It understands exactly who you are, what you care about, and how you want to collaborate.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex gap-3 items-start">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <strong className="font-semibold block">Skill Complementarity</strong>
                    <span className="text-sm text-muted-foreground">It pairs front-end engineers with back-end engineers, hardware with software.</span>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <strong className="font-semibold block">Intent & Availability Alignment</strong>
                    <span className="text-sm text-muted-foreground">Ensures part-time open-source contributors aren't matched with full-time VC-backed startups.</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 w-full relative">
              <Card className="bg-card shadow-xl border-primary/20 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-lg flex justify-between items-center">
                    Why you match this project
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 shadow-none">92% Match</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Target className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Exact Skill Needs Met</p>
                      <p className="text-xs text-muted-foreground mt-1">They need React and TypeScript. You have 4 years of production experience in both.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Search className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Interest Overlap</p>
                      <p className="text-xs text-muted-foreground mt-1">Both you and the founders are deeply interested in Climate Tech and sustainability.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 4. PROJECTS */}
        <section className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Live Projects</h2>
                <p className="text-muted-foreground">Teams actively looking for collaborators.</p>
              </div>
              <Link href="/discover">
                <Button variant="ghost" className="hidden md:flex gap-2">View all <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map(proj => (
                <Card key={proj.id} className="flex flex-col hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{proj.category}</Badge>
                    <CardTitle className="text-xl line-clamp-1">{proj.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{proj.pitch}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm font-medium mb-2">Looking for:</p>
                    <div className="flex flex-wrap gap-2">
                      {proj.needs?.slice(0, 3).map((need: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{need.role}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Link href="/discover" className="md:hidden mt-8 block">
              <Button variant="outline" className="w-full gap-2">View all projects <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </section>

        {/* 5. PEOPLE */}
        <section className="py-24 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Incredible Builders</h2>
            <p className="text-muted-foreground">Connect with talented individuals ready to team up.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredUsers.map(u => (
              <Card key={u.id} className="text-center hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <Avatar src={u.avatar} alt={u.name} className="h-20 w-20 mx-auto mb-4 border-2 border-muted" />
                  <h3 className="font-bold text-lg line-clamp-1">{u.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{u.headline}</p>
                  <div className="flex flex-wrap justify-center gap-1 mt-4">
                    {u.skills?.slice(0, 2).map((skill: any) => (
                      <Badge key={skill.id || skill.name || skill} variant="secondary" className="text-[10px]">{skill.name || skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 6 & 7. OPPORTUNITIES & RESEARCH */}
        <section className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FlaskConical className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold">Research Collaboration</h3>
                <p className="text-muted-foreground">
                  Connect across academic and industry boundaries. Find post-docs, lab assistants, or co-authors for your next paper or experiment.
                </p>
                <Link href="/opportunities">
                  <Button variant="link" className="p-0 text-purple-500 hover:text-purple-400">Explore Research <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </Link>
              </div>

              <div className="space-y-6">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Handshake className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold">Funding & Mentorship</h3>
                <p className="text-muted-foreground">
                  Early-stage syndicates, grants, and experienced operators offering 1-on-1 mentorship to help you scale your idea.
                </p>
                <Link href="/opportunities">
                  <Button variant="link" className="p-0 text-blue-500 hover:text-blue-400">View Opportunities <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 8. BUILT FOR... */}
        <section className="py-24 overflow-hidden relative">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-12">Built for people who build.</h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {['Engineers', 'Founders', 'Designers', 'Researchers', 'Product Managers', 'Students', 'Data Scientists', 'Mentors', 'Investors'].map((role) => (
                <div key={role} className="px-6 py-3 rounded-full border bg-muted/20 font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-default">
                  {role}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FINAL CTA */}
        <section className="py-24 border-t relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Build what's next.</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              The world needs your ideas. We'll help you find the team to make them real.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/onboarding">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/25">
                  Join the Network
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-extrabold text-sm text-primary-foreground">N</span>
            </div>
            <span className="font-bold tracking-tight">NEXUS</span>
            <span className="text-sm text-muted-foreground ml-2">© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
