"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// removed Avatar
import { SKILLS_DATABASE, INTERESTS_DATABASE } from "@/lib/seed-data";
import { trackEvent } from "@/lib/analytics";
import {
  ArrowRight, ArrowLeft, Check, User, Target, Zap, MapPin,
  Briefcase, GraduationCap, Heart, Clock, Sparkles, Rocket
} from "lucide-react";
import { useLocale } from "next-intl";

type OnboardingData = {
  name: string;
  email: string;
  headline: string;
  bio: string;
  location: string;
  timezone: string;
  roles: string[];
  skills: { id: string; name: string; category: string }[];
  interests: { id: string; name: string; category: string }[];
  intents: string[];
  availability: string;
  commitmentHours: string;
  workStyles: string[];
  collaborationTypes: string[];
  collaborationExpectations: string[];
  collaborationPreferences: string[];
  preferredTeamSize: string;
  experience: { title: string; company: string; current: boolean }[];
  proofOfWorkUrl: string;
};

const STEPS = [
  { id: 1, title: "Let's start with you", icon: User, desc: "Your identity on NEXUS" },
  { id: 2, title: "Your story", icon: Heart, desc: "Tell the world what you do" },
  { id: 3, title: "Where you are", icon: MapPin, desc: "Location & timezone" },
  { id: 4, title: "What you do", icon: Briefcase, desc: "Your roles & experience" },
  { id: 5, title: "Your skills", icon: Zap, desc: "What you bring to the table" },
  { id: 6, title: "Your interests", icon: Heart, desc: "What excites you" },
  { id: 7, title: "Your intent", icon: Target, desc: "What are you here for?" },
  { id: 8, title: "Collaboration", icon: Clock, desc: "How do you like to collaborate?" },
  { id: 9, title: "Proof of work", icon: GraduationCap, desc: "Show what you've built" },
  { id: 10, title: "Welcome to NEXUS", icon: Sparkles, desc: "You're all set!" },
];

const ROLE_OPTIONS = [
  { id: "student", label: "Student", emoji: "🎓" },
  { id: "graduate", label: "Graduate", emoji: "📜" },
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "researcher", label: "Researcher", emoji: "🔬" },
  { id: "founder", label: "Founder", emoji: "🚀" },
  { id: "mentor", label: "Mentor", emoji: "🧭" },
  { id: "investor", label: "Investor", emoji: "💰" },
];

const INTENT_OPTIONS = [
  { id: "project", label: "Join interesting projects", emoji: "📁" },
  { id: "cofounder", label: "Find a co-founder", emoji: "🤝" },
  { id: "collaborator", label: "Find collaborators", emoji: "👥" },
  { id: "research", label: "Research collaboration", emoji: "🔬" },
  { id: "mentor", label: "Mentor someone", emoji: "🧭" },
  { id: "mentee", label: "Find a mentor", emoji: "🙋" },
  { id: "startup_job", label: "Join a startup team", emoji: "🚀" },
  { id: "freelance", label: "Freelance opportunities", emoji: "💻" },
  { id: "investment", label: "Find investment", emoji: "💰" },
  { id: "team", label: "Build a team", emoji: "🏗️" },
];

const AVAILABILITY_OPTIONS = [
  { id: "5hrs_week", label: "5 hours/week", desc: "Light involvement" },
  { id: "10hrs_week", label: "10 hours/week", desc: "Part-time commitment" },
  { id: "20hrs_week", label: "20 hours/week", desc: "Significant time" },
  { id: "weekends", label: "Weekends only", desc: "Weekend warrior" },
  { id: "flexible", label: "Flexible", desc: "Depends on the project" },
  { id: "full_time", label: "Full-time", desc: "All in" },
  { id: "open_now", label: "Available immediately", desc: "Ready to start" },
];

const COLLAB_OPTIONS = [
  { id: "remote", label: "Remote", icon: "🌐" },
  { id: "hybrid", label: "Hybrid", icon: "🏢" },
  { id: "in-person", label: "In-person", icon: "📍" },
];

const TEAM_SIZE_OPTIONS = [
  { id: "2-3", label: "2-3 people" },
  { id: "3-8", label: "3-8 people" },
  { id: "8-20", label: "8-20 people" },
  { id: "20+", label: "20+ people" },
  { id: "any", label: "Any size" },
];

const COMMITMENT_HOURS = [
  { id: "2", label: "2 hrs/week" },
  { id: "5", label: "5 hrs/week" },
  { id: "10", label: "10 hrs/week" },
  { id: "20", label: "20 hrs/week" },
  { id: "40", label: "Full-time" },
];

const WORK_STYLES = [
  { id: "async", label: "Async" },
  { id: "evenings", label: "Evenings" },
  { id: "weekends", label: "Weekends" },
  { id: "flexible", label: "Flexible" },
  { id: "fixed_schedule", label: "Fixed Schedule" },
];

const COLLAB_TYPES = [
  { id: "paid", label: "Paid" },
  { id: "equity", label: "Equity" },
  { id: "sweat_equity", label: "Sweat Equity" },
  { id: "research", label: "Research" },
  { id: "academic_credit", label: "Academic Credit" },
  { id: "open_source", label: "Open Source" },
  { id: "volunteer", label: "Volunteer" },
  { id: "cofounder", label: "Cofounder" },
  { id: "mentorship", label: "Mentorship" },
];

const EXPECTATIONS = [
  { id: "short_term", label: "Short-term" },
  { id: "long_term", label: "Long-term" },
  { id: "one_off", label: "One-off Contribution" },
  { id: "ongoing", label: "Ongoing Collaboration" },
];

export default function OnboardingPage() {
  const locale = useLocale();
  const { loginAsDemo } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: "", email: "", headline: "", bio: "",
    location: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    roles: [], skills: [], interests: [], intents: [],
    availability: "10hrs_week", commitmentHours: "10", workStyles: [], 
    collaborationTypes: [], collaborationExpectations: [],
    collaborationPreferences: [], preferredTeamSize: "3-8",
    experience: [], proofOfWorkUrl: "",
  });
  const [skillSearch, setSkillSearch] = useState("");
  const [interestSearch, setInterestSearch] = useState("");

  const update = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayItem = useCallback((key: 'roles' | 'intents' | 'collaborationPreferences' | 'workStyles' | 'collaborationTypes' | 'collaborationExpectations', item: string) => {
    setData(prev => ({
      ...prev,
      [key]: prev[key].includes(item) ? prev[key].filter(i => i !== item) : [...prev[key], item],
    }));
  }, []);

  const toggleSkill = useCallback((skill: { id: string; name: string; category: string }) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.find(s => s.id === skill.id)
        ? prev.skills.filter(s => s.id !== skill.id)
        : [...prev.skills, skill],
    }));
  }, []);

  const toggleInterest = useCallback((interest: { id: string; name: string; category: string }) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.find(i => i.id === interest.id)
        ? prev.interests.filter(i => i.id !== interest.id)
        : [...prev.interests, interest],
    }));
  }, []);

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return data.name.length >= 2 && data.email.includes("@");
      case 2: return data.headline.length >= 5;
      case 3: return data.location.length >= 2;
      case 4: return data.roles.length > 0;
      case 5: return data.skills.length >= 2;
      case 6: return data.interests.length >= 1;
      case 7: return data.intents.length >= 1;
      case 8: return data.availability !== "";
      case 9: return true;
      case 10: return true;
      default: return false;
    }
  };

  const handleFinish = async () => {
    trackEvent('onboarding_completed', { role: data.roles?.[0] || 'unknown', goals: data.intents?.length || 0 });
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'demo') {
      try {
        const { completeOnboardingAction } = await import("@/app/actions/profile");
        await completeOnboardingAction(data);
      } catch (e) {
        console.error("Failed to save onboarding data:", e);
      }
    } else {
      loginAsDemo("user-1");
    }
    
    router.push(`/${locale}/feed`);
  };

  const progress = (step / STEPS.length) * 100;

  const filteredSkills = SKILLS_DATABASE.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const filteredInterests = INTERESTS_DATABASE.filter(i =>
    i.name.toLowerCase().includes(interestSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-extrabold text-sm text-primary-foreground">N</span>
          </div>
          <span className="font-bold text-lg tracking-tight">NEXUS</span>
        </Link>
        <span className="text-sm text-muted-foreground">Step {step} of {STEPS.length}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map(s => (
              <div
                key={s.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s.id === step ? "w-8 bg-primary" : s.id < step ? "w-2 bg-primary/40" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          <Card className="shadow-2xl border-border/50 overflow-hidden">
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                {(() => {
                  const StepIcon = STEPS[step - 1].icon;
                  return <StepIcon className="h-7 w-7 text-primary" />;
                })()}
              </div>
              <CardTitle className="text-2xl">{STEPS[step - 1].title}</CardTitle>
              <CardDescription className="text-base">{STEPS[step - 1].desc}</CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8 pt-6">
              {/* Step 1: Name & Email */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      placeholder="Elena Vasquez"
                      value={data.name}
                      onChange={e => update("name", e.target.value)}
                      className="h-12 text-base"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="elena@example.com"
                      value={data.email}
                      onChange={e => update("email", e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Headline & Bio */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Professional Headline</label>
                    <Input
                      placeholder="e.g. Robotics Engineer & Climate Tech Founder"
                      value={data.headline}
                      onChange={e => update("headline", e.target.value)}
                      className="h-12 text-base"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">This appears below your name everywhere on NEXUS</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio <span className="text-muted-foreground">(optional)</span></label>
                    <textarea
                      placeholder="Tell potential collaborators about yourself, your experience, and what drives you..."
                      value={data.bio}
                      onChange={e => update("bio", e.target.value)}
                      className="w-full h-32 p-3 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="e.g. San Francisco, CA"
                      value={data.location}
                      onChange={e => update("location", e.target.value)}
                      className="h-12 text-base"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timezone</label>
                    <Input
                      value={data.timezone}
                      onChange={e => update("timezone", e.target.value)}
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-muted-foreground">Auto-detected from your browser</p>
                  </div>
                </div>
              )}

              {/* Step 4: Roles */}
              {step === 4 && (
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">Select all that apply to you</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ROLE_OPTIONS.map(role => (
                      <button
                        key={role.id}
                        onClick={() => toggleArrayItem("roles", role.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-start transition-all ${
                          data.roles.includes(role.id)
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/30 hover:bg-accent"
                        }`}
                      >
                        <span className="text-2xl">{role.emoji}</span>
                        <span className="font-medium text-sm">{role.label}</span>
                        {data.roles.includes(role.id) && (
                          <Check className="h-4 w-4 text-primary ms-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Skills */}
              {step === 5 && (
                <div className="space-y-5">
                  {data.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map(skill => (
                        <Badge
                          key={skill.id}
                          className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer pe-1 py-1.5 text-sm"
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill.name}
                          <span className="ms-2 text-xs opacity-60">✕</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Input
                    placeholder="Search skills (e.g. Python, UX Design, Marketing)..."
                    value={skillSearch}
                    onChange={e => setSkillSearch(e.target.value)}
                    className="h-12 text-base"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pe-2">
                    {filteredSkills.slice(0, 30).map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => toggleSkill(skill)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-start text-sm transition-all ${
                          data.skills.find(s => s.id === skill.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30 hover:bg-accent"
                        }`}
                      >
                        <span className="flex-1">{skill.name}</span>
                        {data.skills.find(s => s.id === skill.id) && <Check className="h-3 w-3 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.skills.length} skill{data.skills.length !== 1 ? 's' : ''} selected (min 2)
                  </p>
                </div>
              )}

              {/* Step 6: Interests */}
              {step === 6 && (
                <div className="space-y-5">
                  {data.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {data.interests.map(interest => (
                        <Badge
                          key={interest.id}
                          className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer pe-1 py-1.5 text-sm"
                          onClick={() => toggleInterest(interest)}
                        >
                          {interest.name}
                          <span className="ms-2 text-xs opacity-60">✕</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Input
                    placeholder="Search interests (e.g. Climate Change, AI, Startups)..."
                    value={interestSearch}
                    onChange={e => setInterestSearch(e.target.value)}
                    className="h-12 text-base"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pe-2">
                    {filteredInterests.map(interest => (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-start text-sm transition-all ${
                          data.interests.find(i => i.id === interest.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30 hover:bg-accent"
                        }`}
                      >
                        <span className="flex-1">{interest.name}</span>
                        {data.interests.find(i => i.id === interest.id) && <Check className="h-3 w-3 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 7: Intents */}
              {step === 7 && (
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">Select all that apply. This helps our matching engine find the right connections for you.</p>
                  <div className="grid gap-3">
                    {INTENT_OPTIONS.map(intent => (
                      <button
                        key={intent.id}
                        onClick={() => toggleArrayItem("intents", intent.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 text-start transition-all ${
                          data.intents.includes(intent.id)
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/30 hover:bg-accent"
                        }`}
                      >
                        <span className="text-2xl">{intent.emoji}</span>
                        <span className="font-medium text-sm flex-1">{intent.label}</span>
                        {data.intents.includes(intent.id) && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 8: Collaboration Preferences */}
              {step === 8 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">How much time can you commit?</p>
                    <div className="flex flex-wrap gap-2">
                      {COMMITMENT_HOURS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            update("commitmentHours", opt.id);
                            // Set legacy availability mapping for backward compatibility
                            const legacyMap: Record<string, string> = { "2": "5hrs_week", "5": "5hrs_week", "10": "10hrs_week", "20": "20hrs_week", "40": "full_time" };
                            update("availability", legacyMap[opt.id] || "flexible");
                          }}
                          className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                            data.commitmentHours === opt.id
                              ? "border-primary bg-primary/5 font-medium text-primary"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Work style (select all that apply)</p>
                    <div className="flex flex-wrap gap-2">
                      {WORK_STYLES.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => toggleArrayItem("workStyles", opt.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm transition-all ${
                            data.workStyles.includes(opt.id)
                              ? "border-primary bg-primary/5 font-medium text-primary"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          {opt.label} {data.workStyles.includes(opt.id) && <Check className="h-3 w-3" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Collaboration types</p>
                    <div className="flex flex-wrap gap-2">
                      {COLLAB_TYPES.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => toggleArrayItem("collaborationTypes", opt.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm transition-all ${
                            data.collaborationTypes.includes(opt.id)
                              ? "border-primary bg-primary/5 font-medium text-primary"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          {opt.label} {data.collaborationTypes.includes(opt.id) && <Check className="h-3 w-3" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Expectations</p>
                    <div className="flex flex-wrap gap-2">
                      {EXPECTATIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => toggleArrayItem("collaborationExpectations", opt.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm transition-all ${
                            data.collaborationExpectations.includes(opt.id)
                              ? "border-primary bg-primary/5 font-medium text-primary"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          {opt.label} {data.collaborationExpectations.includes(opt.id) && <Check className="h-3 w-3" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Collaboration preference</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {COLLAB_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => toggleArrayItem("collaborationPreferences", opt.id)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            data.collaborationPreferences.includes(opt.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <span className="text-2xl">{opt.icon}</span>
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Preferred team size</p>
                    <div className="flex flex-wrap gap-2">
                      {TEAM_SIZE_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => update("preferredTeamSize", opt.id)}
                          className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                            data.preferredTeamSize === opt.id
                              ? "border-primary bg-primary/5 font-medium"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 9: Proof of Work */}
              {step === 9 && (
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    Link to your portfolio, GitHub, or any work that shows what you can do. This is optional but strongly recommended.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Portfolio / GitHub / Personal Site</label>
                    <Input
                      placeholder="https://github.com/yourname"
                      value={data.proofOfWorkUrl}
                      onChange={e => update("proofOfWorkUrl", e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Add experience <span className="text-muted-foreground">(optional)</span></label>
                    <div className="grid gap-3">
                      {data.experience.map((exp, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder="Title"
                            value={exp.title}
                            onChange={e => {
                              const exps = [...data.experience];
                              exps[idx] = { ...exps[idx], title: e.target.value };
                              update("experience", exps);
                            }}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Company"
                            value={exp.company}
                            onChange={e => {
                              const exps = [...data.experience];
                              exps[idx] = { ...exps[idx], company: e.target.value };
                              update("experience", exps);
                            }}
                            className="flex-1"
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => update("experience", [...data.experience, { title: "", company: "", current: false }])}
                      >
                        + Add experience
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 10: Welcome */}
              {step === 10 && (
                <div className="text-center space-y-8 py-4">
                  <div className="mx-auto h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-12 w-12 text-green-500" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold">Welcome to NEXUS, {data.name || "Builder"}!</h3>
                    <p className="text-muted-foreground">
                      Your profile is ready. Our AI matching engine is already finding projects and people
                      that align with your skills and intent.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left py-4">
                    <Card className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-5">
                        <Rocket className="h-5 w-5 text-primary mb-2" />
                        <h4 className="font-semibold mb-1 text-sm">Create a Project</h4>
                        <p className="text-xs text-muted-foreground mb-3">Start your own initiative and recruit collaborators.</p>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href={`/${locale}/projects/new`} onClick={() => loginAsDemo("user-1")}>Start Building</Link>
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-5">
                        <Target className="h-5 w-5 text-primary mb-2" />
                        <h4 className="font-semibold mb-1 text-sm">Find Collaborators</h4>
                        <p className="text-xs text-muted-foreground mb-3">Discover people who match your exact skills.</p>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href={`/${locale}/discover?tab=people`} onClick={() => loginAsDemo("user-1")}>Explore Network</Link>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors sm:col-span-2 lg:col-span-1">
                      <CardContent className="p-5">
                        <User className="h-5 w-5 text-primary mb-2" />
                        <h4 className="font-semibold mb-1 text-sm">Complete Profile</h4>
                        <p className="text-xs text-muted-foreground mb-3">Add Proof of Work to stand out.</p>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href={`/${locale}/profile`} onClick={() => loginAsDemo("user-1")}>View Profile</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            
            {step < 10 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="gap-2 shadow-lg"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="gap-2 shadow-lg bg-green-600 hover:bg-green-700">
                <Sparkles className="h-4 w-4" /> Start Exploring
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
