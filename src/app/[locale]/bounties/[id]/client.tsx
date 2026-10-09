"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useLocale } from "next-intl";
import { fetchBountyByIdAction, applyToBountyAction, submitBountyWorkAction } from "@/app/actions/bounties";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Clock, FileText, CheckCircle, Flame, Plus, Users, Send, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export default function BountyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = useLocale();
  const { user } = useAuth();
  const [bounty, setBounty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [applyMessage, setApplyMessage] = useState("");
  const [applying, setApplying] = useState(false);
  
  const [submissionDesc, setSubmissionDesc] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const p = await params;
      const res = await fetchBountyByIdAction(p.id);
      if (res.success) {
        setBounty(res.bounty);
      }
      setLoading(false);
    }
    load();
  }, [params]);

  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
  }

  if (!bounty) {
    return <div className="min-h-screen bg-[#0A0A0A] text-white flex justify-center items-center">Bounty not found</div>;
  }

  const isOwner = user?.id === bounty.owner_id;
  const myApplication = bounty.applications?.find((a: any) => a.applicant_id === user?.id);
  const mySubmission = bounty.submissions?.find((s: any) => s.contributor_id === user?.id);
  const hasAcceptedApp = myApplication?.status === 'accepted';

  const handleApply = async () => {
    setApplying(true);
    const p = await params;
    const res = await applyToBountyAction(p.id, applyMessage);
    if (res.success) {
      alert("Application submitted!");
      // Reload manually or rely on context
      window.location.reload();
    }
    setApplying(false);
  };

  const handleSubmitWork = async () => {
    setSubmitting(true);
    const p = await params;
    const res = await submitBountyWorkAction(p.id, submissionDesc, submissionUrl ? [submissionUrl] : []);
    if (res.success) {
      alert("Work submitted!");
      window.location.reload();
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-blue-500/10 text-blue-400">{bounty.category}</Badge>
                <Badge variant="outline" className="border-zinc-700">{bounty.status}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{bounty.title}</h1>
              <div className="flex items-center gap-4 text-sm text-zinc-400 border-b border-zinc-800 pb-6">
                <div className="flex items-center gap-2">
                  <Avatar size="sm" alt={bounty.owner?.name} className="h-6 w-6" />
                  <span>Posted by <span className="text-zinc-200">{bounty.owner?.name}</span></span>
                </div>
                <div>•</div>
                <div>Created {new Date(bounty.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{bounty.description}</p>
              </section>
              
              <section>
                <h3 className="text-lg font-semibold mb-3">Deliverables</h3>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{bounty.expected_deliverables}</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">Acceptance Criteria</h3>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{bounty.acceptance_criteria}</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {bounty.skills_required?.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">{skill}</Badge>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle>Bounty Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Reward</div>
                  {bounty.reward_type === 'cash' ? (
                    <div>
                      <div className="text-xl font-bold text-amber-500">{bounty.cash_currency} {bounty.cash_amount_range}</div>
                      <div className="text-xs text-zinc-400 mt-2 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Payment is arranged directly between the project owner and contributor. NEXUS does not process or guarantee payment.</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-semibold text-purple-400">Non-Cash Reward</div>
                      <div className="text-sm text-zinc-300 mt-1">{bounty.reward_details}</div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-zinc-400 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Project</span>
                  <Link href={`/${locale}/projects/${bounty.project_id}`} className="text-blue-400 hover:underline">{bounty.project?.title}</Link>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-zinc-400 flex items-center gap-2"><Clock className="h-4 w-4" /> Effort</span>
                  <span className="text-zinc-200">{bounty.estimated_effort}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-zinc-400 flex items-center gap-2"><Users className="h-4 w-4" /> Needed</span>
                  <span className="text-zinc-200">{bounty.contributors_needed}</span>
                </div>
                
                {/* Apply Section */}
                {!isOwner && bounty.status === 'open' && !myApplication && (
                  <div className="pt-4 space-y-3">
                    <Textarea 
                      placeholder="Why are you a good fit?" 
                      className="bg-zinc-950 border-zinc-800"
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                    />
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleApply} disabled={applying}>
                      {applying ? "Applying..." : "Apply for Bounty"}
                    </Button>
                  </div>
                )}
                
                {!isOwner && myApplication && !hasAcceptedApp && (
                  <div className="pt-4">
                    <Badge className="w-full justify-center bg-zinc-800 text-zinc-300 py-2">
                      Application {myApplication.status}
                    </Badge>
                  </div>
                )}
                
                {!isOwner && hasAcceptedApp && bounty.status === 'in_progress' && (
                  <div className="pt-4 space-y-3">
                    <h4 className="font-semibold text-blue-400">Submit Work</h4>
                    <Textarea 
                      placeholder="Describe what you completed..." 
                      className="bg-zinc-950 border-zinc-800"
                      value={submissionDesc}
                      onChange={(e) => setSubmissionDesc(e.target.value)}
                    />
                    <Input 
                      placeholder="Link to PR, document, etc."
                      className="bg-zinc-950 border-zinc-800"
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                    />
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSubmitWork} disabled={submitting}>
                      <Send className="mr-2 h-4 w-4" /> {submitting ? "Submitting..." : "Submit for Review"}
                    </Button>
                  </div>
                )}
                
                {!isOwner && mySubmission && (
                  <div className="pt-4 space-y-2">
                    <Badge className="w-full justify-center bg-blue-500/10 text-blue-400 py-2">
                      Submission {mySubmission.status}
                    </Badge>
                    {mySubmission.owner_feedback && (
                      <div className="text-sm p-3 bg-zinc-950 rounded border border-zinc-800">
                        <span className="text-zinc-500 block mb-1">Feedback:</span>
                        {mySubmission.owner_feedback}
                      </div>
                    )}
                    {bounty.status === 'completed' && mySubmission.status === 'accepted' && (
                      <div className="pt-2">
                        <Button 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                          onClick={async () => {
                            const { addBountyToPoWAction } = await import('@/app/actions/bounties');
                            const p = await params;
                            const res = await addBountyToPoWAction(p.id);
                            if (res.success) alert('Added to Proof of Work!');
                          }}
                        >
                          Add to Proof of Work
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
        </div>
      </main>
    </div>
  );
}
