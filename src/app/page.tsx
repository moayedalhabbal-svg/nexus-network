import Link from "next/link";
import { ArrowRight, Sparkles, Target, Users, Zap, Search, Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background to-background -z-10" />
          
          <div className="container relative z-10 mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6 mx-auto animate-fade-in">
              <Sparkles className="mr-2 h-3 w-3 text-primary" />
              The Network for Builders
            </Badge>
            
            <h1 className="max-w-4xl mx-auto text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Build what's next.<br />
              <span className="text-muted-foreground">Find the people who should be building it with you.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              An intelligent professional network that connects people through the projects, ideas, research and opportunities they care about.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/25">
                  Join the Network <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/discover">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-24 bg-muted/50 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">A Network Built for Action</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Move beyond static resumes and noisy feeds. NEXUS focuses on what you can build, the skills you have, and the impact you want to make.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-background">
                <CardHeader>
                  <Target className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Have an idea?</CardTitle>
                  <CardDescription>Find the missing pieces of your team based on skill gaps and shared intent.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Have skills?</CardTitle>
                  <CardDescription>Discover projects that need exactly what you know how to do.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Building a startup?</CardTitle>
                  <CardDescription>Find your co-founders and early team members aligned with your vision.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <Search className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Have research?</CardTitle>
                  <CardDescription>Connect with collaborators across institutions and disciplines.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* AI Matching Demo Section */}
        <section className="py-24 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
          
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-6">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  <Bot className="mr-2 h-3 w-3" />
                  AI Matching Engine
                </Badge>
                <h2 className="text-4xl font-bold tracking-tight">Meaningful connections, powered by intent.</h2>
                <p className="text-lg text-muted-foreground">
                  Our matching engine doesn't just look at keywords. It understands complementarity—finding people who fill your gaps, share your interests, and want the same type of collaboration.
                </p>
                
                <ul className="space-y-4 pt-4">
                  <li className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <strong className="font-semibold block">Skill Complementarity</strong>
                      <span className="text-muted-foreground">Matches you with people who have the skills you're missing.</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <strong className="font-semibold block">Intent Alignment</strong>
                      <span className="text-muted-foreground">Ensures both parties are looking for the same type of commitment.</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <strong className="font-semibold block">Transparent Explanations</strong>
                      <span className="text-muted-foreground">Every match comes with a clear explanation of exactly why you were connected.</span>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="flex-1 w-full max-w-md relative">
                {/* Mock Match Card */}
                <div className="relative z-10 bg-card rounded-2xl border shadow-2xl p-6 glass animate-fade-in-up">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                        <img src="/avatars/yuki.jpg" alt="Yuki" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold">Yuki Tanaka</h4>
                        <p className="text-xs text-muted-foreground">Mechatronics Engineer</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                      94% Match
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Why you match this project:</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-primary/5 border-primary/20">✓ Robotics</Badge>
                        <Badge variant="outline" className="bg-primary/5 border-primary/20">✓ Control Systems</Badge>
                        <Badge variant="outline" className="bg-primary/5 border-primary/20">✓ Climate Tech</Badge>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                      <strong className="font-semibold block mb-1">Strong complementarity</strong>
                      <span className="text-muted-foreground">Project needs exactly the hardware capabilities you offer.</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <Button className="w-full">Message</Button>
                    <Button variant="outline" className="w-full">View Profile</Button>
                  </div>
                </div>
                
                {/* Decorative elements behind */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Ready to find your next collaboration?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10">
              Join thousands of founders, researchers, and professionals building the future.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base">
                Create Your Profile
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight">NEXUS</span>
            <span className="text-sm text-muted-foreground">© 2026. All rights reserved.</span>
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
