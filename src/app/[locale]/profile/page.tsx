"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MapPin, Globe, Calendar, Briefcase, GraduationCap, ExternalLink,
  Edit3, Check, X, Zap, Heart, Target, Clock, Link as LinkIcon, ShieldCheck, Flag, Users
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AddProofDialog } from "@/components/profile/add-proof-dialog";

export default function ProfilePage() {
  const { user, isAuthenticated, loginAsDemo, updateProfile } = useAuth();
  const router = useRouter();
  const [editingBio, setEditingBio] = useState(false);
  const [editBioValue, setEditBioValue] = useState("");
  const [editingHeadline, setEditingHeadline] = useState(false);
  const [editHeadlineValue, setEditHeadlineValue] = useState("");

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 text-center shadow-xl">
            <CardHeader>
              <CardTitle>Sign in to view your profile</CardTitle>
              <CardDescription>Create an account or log in to access your NEXUS profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => { loginAsDemo(); router.refresh(); }} className="w-full">
                Try Demo Mode
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const saveBio = () => {
    updateProfile({ bio: editBioValue });
    setEditingBio(false);
  };

  const saveHeadline = () => {
    updateProfile({ headline: editHeadlineValue });
    setEditingHeadline(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar size="xl" alt={user.name} className="h-24 w-24 text-2xl border-4 border-background shadow-xl" />

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>

                  {editingHeadline ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={editHeadlineValue}
                        onChange={e => setEditHeadlineValue(e.target.value)}
                        className="max-w-md"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={saveHeadline}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingHeadline(false)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2">
                      {user.headline}
                      <button
                        onClick={() => { setEditHeadlineValue(user.headline); setEditingHeadline(true); }}
                        className="text-muted-foreground/50 hover:text-primary transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success" className="hidden sm:flex">
                    <span className="h-2 w-2 rounded-full bg-green-500 me-2 animate-pulse" />
                    {user.onlineStatus === "online" ? "Online" : user.onlineStatus}
                  </Badge>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Explicit Verification States */}
              {user.verifications && user.verifications.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {user.verifications.map((v: any) => (
                    <Badge key={v.type} variant="secondary" className="bg-primary/5 text-primary border-primary/20 flex gap-1 items-center font-normal text-xs">
                      <ShieldCheck className="h-3 w-3 text-green-500" />
                      {v.label}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {user.location}</span>
                <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> {user.timezone}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Joined {formatDate(user.joinedAt)}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {user.roles.map(role => (
                  <Badge key={role} variant="secondary" className="capitalize">{role}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">About</CardTitle>
                {!editingBio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditBioValue(user.bio); setEditingBio(true); }}
                  >
                    <Edit3 className="h-3.5 w-3.5 me-2" /> Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {editingBio ? (
                  <div className="space-y-3">
                    <textarea
                      value={editBioValue}
                      onChange={e => setEditBioValue(e.target.value)}
                      className="w-full h-32 p-3 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveBio}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingBio(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.experience.map((exp, idx) => (
                  <div key={exp.id} className={`flex gap-4 ${idx !== user.experience.length - 1 ? "pb-6 border-b" : ""}`}>
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{exp.title}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company} · {exp.location}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(exp.startDate)} – {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}
                        {exp.current && <Badge variant="success" className="ms-2 text-[10px]">Current</Badge>}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.education.map((edu, idx) => (
                  <div key={edu.id} className={`flex gap-4 ${idx !== user.education.length - 1 ? "pb-6 border-b" : ""}`}>
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{edu.institution}</h4>
                      <p className="text-sm text-muted-foreground">{edu.degree} in {edu.field}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(edu.startDate)} – {edu.current ? "Present" : edu.endDate ? formatDate(edu.endDate) : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Proof of Work */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" /> Proof of Work
                </CardTitle>
                <AddProofDialog />
              </CardHeader>
              <CardContent className="space-y-4">
                {user.proofOfWork && user.proofOfWork.length > 0 ? (
                  user.proofOfWork.map(pow => (
                    <div key={pow.id} className="flex gap-4 pb-6 border-b last:border-0 last:pb-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ExternalLink className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm flex items-center justify-between">
                          {pow.title}
                          <Badge variant="outline" className="text-[10px] capitalize bg-muted text-muted-foreground">
                            {pow.source || pow.type}
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{pow.description}</p>
                        
                        {pow.skills && pow.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {pow.skills.map((s: string) => (
                              <Badge key={s} variant="secondary" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {pow.url && pow.url !== '#' && (
                          <a href={pow.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                            <ExternalLink className="h-3 w-3" /> View Evidence
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p className="text-sm mb-2">Build your Proof of Work</p>
                    <p className="text-xs mb-4">Connect GitHub, add projects, or link research to back up your skills.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Profile Completion</span>
                  <span className="text-sm font-bold text-primary">{user.completionPercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${user.completionPercentage}%` }} />
                </div>
              </CardContent>
            </Card>

            {/* Trust & Collaboration */}
            {user.trustSummary ? (
              <Card className="border-border">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Trust & Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    {user.trustSummary.completedProjects > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">{user.trustSummary.completedProjects} Completed {user.trustSummary.completedProjects === 1 ? 'Project' : 'Projects'}</span>
                      </div>
                    )}
                    {user.trustSummary.verifiedCollaborations > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">{user.trustSummary.verifiedCollaborations} Verified {user.trustSummary.verifiedCollaborations === 1 ? 'Collaboration' : 'Collaborations'}</span>
                      </div>
                    )}
                    {user.trustSummary.reliabilityStatus && (
                      <div className="flex items-center gap-2 text-sm">
                        {user.trustSummary.reliabilityStatus === 'Reliable Collaborator' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-yellow-500" /></div>
                        )}
                        <span className="text-muted-foreground">{user.trustSummary.reliabilityStatus}</span>
                      </div>
                    )}
                  </div>

                  {user.trustSummary.responseRate > 0 && (
                    <div className="pt-4 border-t border-border/50 space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response Pattern</p>
                      <div className="text-sm text-muted-foreground">
                        {user.trustSummary.averageResponseTimeHours <= 24 ? 
                          'Usually responds within 24 hours' : 
                         user.trustSummary.averageResponseTimeHours <= 48 ? 
                          'Usually responds within 1–2 days' : 
                          'Response pattern varies'
                        }
                      </div>
                    </div>
                  )}

                  {user.trustSummary.feedbackCount > 0 && (
                    <div className="pt-4 border-t border-border/50 space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Collaborator Feedback</p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Reliability</span>
                        <span className={user.trustSummary.reliabilityScore > 80 ? "text-primary font-medium" : "font-medium"}>
                          {user.trustSummary.reliabilityScore > 80 ? 'Strong' : 'Average'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Communication</span>
                        <span className={user.trustSummary.communicationScore > 80 ? "text-primary font-medium" : "font-medium"}>
                          {user.trustSummary.communicationScore > 80 ? 'Strong' : 'Average'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Contribution</span>
                        <span className={user.trustSummary.contributionScore > 80 ? "text-primary font-medium" : "font-medium"}>
                          {user.trustSummary.contributionScore > 80 ? 'Strong' : 'Average'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Teamwork</span>
                        <span className={user.trustSummary.teamworkScore > 80 ? "text-primary font-medium" : "font-medium"}>
                          {user.trustSummary.teamworkScore > 80 ? 'Strong' : 'Average'}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Trust & Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">New to NEXUS</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">Limited collaboration history</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {user.skills.map(skill => {
                    const evidenceCount = user.proofOfWork?.filter(pow => pow.skills?.includes(skill.name)).length || 0;
                    return (
                      <div key={skill.id} className="border-b last:border-0 pb-3 last:pb-0">
                        <span className="font-medium text-sm">{skill.name}</span>
                        {evidenceCount > 0 ? (
                          <div className="text-xs text-primary flex items-center gap-1 mt-1">
                            <Check className="h-3 w-3" /> Evidence found · {evidenceCount}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" /> Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map(interest => (
                    <Badge key={interest.id} className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent text-xs">
                      {interest.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Collaboration Preferences */}
            <Card>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" /> Collaboration Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                
                {/* Commitment */}
                <div>
                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Commitment
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {user.commitmentHours ? (
                      <Badge variant="outline" className="text-xs bg-muted/50">{user.commitmentHours} hrs/week</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-muted/50 capitalize">{user.availability.replace(/_/g, " ")}</Badge>
                    )}
                  </div>
                </div>

                {/* Work Style */}
                {user.workStyles && user.workStyles.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Work Style
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {user.workStyles.map(ws => (
                        <Badge key={ws} variant="outline" className="text-xs bg-muted/50 capitalize">{ws.replace(/_/g, " ")}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collaboration Type */}
                {(user.collaborationTypes && user.collaborationTypes.length > 0) ? (
                  <div>
                    <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Collaboration Type
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {user.collaborationTypes.map(ct => (
                        <Badge key={ct} variant="secondary" className="text-xs bg-blue-500/10 text-blue-500 capitalize">{ct.replace(/_/g, " ")}</Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Looking For
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {user.intents.map(intent => (
                        <Badge key={intent} variant="secondary" className="text-xs bg-blue-500/10 text-blue-500 capitalize">{intent.replace(/_/g, " ")}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expectation */}
                {user.collaborationExpectations && user.collaborationExpectations.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Expectation
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {user.collaborationExpectations.map(exp => (
                        <Badge key={exp} variant="outline" className="text-xs bg-muted/50 capitalize">{exp.replace(/_/g, " ")}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
              </CardContent>
            </Card>

            {/* Verifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Verifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.verifications.map((v: any) => (
                  <div key={v.type} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="capitalize text-muted-foreground">{v.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
