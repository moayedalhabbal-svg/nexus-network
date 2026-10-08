"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, FolderKanban, Sparkles, Plus, X, Globe, MapPin, Check } from "lucide-react";
import { generateId } from "@/lib/utils";
import type { ProjectCategory, ProjectStage, FundingStatus, CollaborationType, AvailabilityStatus } from "@/lib/types";

const CATEGORIES: { id: ProjectCategory; label: string }[] = [
  { id: "ai", label: "Artificial Intelligence" },
  { id: "climate", label: "Climate Tech" },
  { id: "healthcare", label: "Healthcare" },
  { id: "education", label: "Education" },
  { id: "fintech", label: "Fintech" },
  { id: "robotics", label: "Robotics" },
  { id: "saas", label: "SaaS" },
  { id: "social_impact", label: "Social Impact" },
];

const STAGES: { id: ProjectStage; label: string }[] = [
  { id: "idea", label: "Idea Phase" },
  { id: "validation", label: "Validating" },
  { id: "prototype", label: "Prototyping" },
  { id: "mvp", label: "Building MVP" },
  { id: "early_traction", label: "Early Traction" },
];

export default function NewProjectPage() {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Form State
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("ai");
  const [stage, setStage] = useState<ProjectStage>("idea");
  
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  
  const [remote, setRemote] = useState(true);
  const [location, setLocation] = useState("");
  
  const [needs, setNeeds] = useState<{ role: string; count: number; commitment: string }[]>([]);
  const [needInput, setNeedInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 text-center shadow-xl">
            <CardHeader>
              <CardTitle>Sign in to create a project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => loginAsDemo()} className="w-full">Try Demo Mode</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const addTech = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && techInput.trim()) {
      e.preventDefault();
      if (!technologies.includes(techInput.trim())) {
        setTechnologies([...technologies, techInput.trim()]);
      }
      setTechInput("");
    }
  };

  const addNeed = () => {
    if (needInput.trim()) {
      setNeeds([...needs, { role: needInput.trim(), count: 1, commitment: "10hrs_week" }]);
      setNeedInput("");
    }
  };

  const removeNeed = (idx: number) => {
    setNeeds(needs.filter((_, i) => i !== idx));
  };

  const canProceed = () => {
    if (step === 1) return title.length >= 3 && pitch.length >= 10;
    if (step === 2) return description.length >= 20;
    if (step === 3) return true; // Needs are optional
    if (step === 4) return remote || location.length > 2;
    return true;
  };


  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("pitch", pitch);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("stage", stage);
      formData.append("is_private", "false");

      // We'd dynamically import the action to avoid client/server issues
      // but for this demo context we can just simulate it or call it if it's imported
      // Actually we need to import it at the top level
      
      const { createProjectAction } = await import('@/app/actions/projects');
      const result = await createProjectAction(formData);
      
      if (result.success) {
        router.push("/projects");
      } else {
        alert("Failed to create project: " + result.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <FolderKanban className="h-8 w-8 text-primary" />
              Create a New Project
            </h1>
            <p className="text-muted-foreground">Start building your team and bringing your idea to life.</p>
          </div>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${
                i === step ? "bg-primary" : i < step ? "bg-primary/40" : "bg-muted"
              }`} />
            ))}
          </div>

          <Card className="shadow-lg border-border/50">
            <CardContent className="p-8">
              
              {/* Step 1: Basics */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Project Title</label>
                    <Input 
                      placeholder="e.g. Project Apollo" 
                      value={title} onChange={e => setTitle(e.target.value)}
                      className="h-12 text-lg" autoFocus 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Elevator Pitch (1 line)</label>
                    <Input 
                      placeholder="What are you building?" 
                      value={pitch} onChange={e => setPitch(e.target.value)}
                      className="h-12" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                      <select 
                        value={category} onChange={e => setCategory(e.target.value as ProjectCategory)}
                        className="w-full h-12 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Current Stage</label>
                      <select 
                        value={stage} onChange={e => setStage(e.target.value as ProjectStage)}
                        className="w-full h-12 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detailed Description</label>
                    <textarea 
                      placeholder="Describe the problem, the solution, and why it matters..."
                      value={description} onChange={e => setDescription(e.target.value)}
                      className="w-full h-40 p-4 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Technologies & Stack</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {technologies.map(tech => (
                        <Badge key={tech} variant="secondary" className="pr-1 py-1 text-sm">
                          {tech} <button onClick={() => setTechnologies(t => t.filter(x => x !== tech))} className="ml-2 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                    <Input 
                      placeholder="Type a technology and press Enter..." 
                      value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={addTech}
                      className="h-12"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Needs */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">Who do you need?</h3>
                    <p className="text-muted-foreground text-sm">List the roles and skills required to build this project.</p>
                  </div>

                  <div className="space-y-4">
                    {needs.map((need, idx) => (
                      <div key={idx} className="flex gap-3 items-center p-3 rounded-lg border bg-accent/50">
                        <Input 
                          value={need.role} 
                          onChange={e => {
                            const newNeeds = [...needs];
                            newNeeds[idx].role = e.target.value;
                            setNeeds(newNeeds);
                          }}
                          className="flex-1"
                        />
                        <select 
                          value={need.commitment}
                          onChange={e => {
                            const newNeeds = [...needs];
                            newNeeds[idx].commitment = e.target.value;
                            setNeeds(newNeeds);
                          }}
                          className="w-40 h-10 px-3 rounded-md border bg-background text-sm focus:outline-none"
                        >
                          <option value="5hrs_week">5 hrs/week</option>
                          <option value="10hrs_week">10 hrs/week</option>
                          <option value="20hrs_week">20 hrs/week</option>
                          <option value="full_time">Full Time</option>
                        </select>
                        <Button variant="ghost" size="icon" onClick={() => removeNeed(idx)} className="text-destructive"><Trash2Icon className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 items-center pt-2">
                    <Input 
                      placeholder="e.g. Frontend Engineer, Product Marketer" 
                      value={needInput} onChange={e => setNeedInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addNeed()}
                      className="h-11"
                    />
                    <Button onClick={addNeed} variant="secondary" className="h-11"><Plus className="h-4 w-4 mr-2" /> Add Role</Button>
                  </div>
                </div>
              )}

              {/* Step 4: Finalize */}
              {step === 4 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center mb-6">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Almost ready!</h3>
                    <p className="text-muted-foreground mt-2">Just a few final details before publishing.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setRemote(true)}
                      className={`p-6 rounded-xl border-2 text-center transition-all ${
                        remote ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Globe className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                      <div className="font-semibold">Remote</div>
                      <div className="text-xs text-muted-foreground mt-1">Open to anyone worldwide</div>
                    </button>
                    <button
                      onClick={() => setRemote(false)}
                      className={`p-6 rounded-xl border-2 text-center transition-all ${
                        !remote ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <MapPin className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                      <div className="font-semibold">Location Specific</div>
                      <div className="text-xs text-muted-foreground mt-1">Requires local presence</div>
                    </button>
                  </div>

                  {!remote && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">City / Region</label>
                      <Input 
                        placeholder="e.g. San Francisco, CA" 
                        value={location} onChange={e => setLocation(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-10 pt-6 border-t">
                <Button variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                
                {step < 4 ? (
                  <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                    Continue <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={!canProceed()} className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-2" /> Publish Project
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Temporary icon component since we forgot to import Trash2 in this file initially
function Trash2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
