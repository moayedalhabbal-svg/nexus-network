"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchBountyByIdAction, updateApplicationStatusAction, reviewBountySubmissionAction } from "@/app/actions/bounties";
import { ArrowLeft, Loader2, CheckCircle, XCircle, FileText, Send, User } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

export default function WorkspaceBountyDetailsPage({ params }: { params: Promise<{ id: string, bountyId: string }> }) {
  const locale = useLocale();
  const [projectId, setProjectId] = useState<string>("");
  const [bountyId, setBountyId] = useState<string>("");
  const [bounty, setBounty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // states for reviewing submission
  const [feedback, setFeedback] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const p = await params;
      setProjectId(p.id);
      setBountyId(p.bountyId);
      
      const res = await fetchBountyByIdAction(p.bountyId);
      if (res.success && res.bounty) {
        setBounty(res.bounty);
      }
      setLoading(false);
    }
    load();
  }, [params]);

  const handleAppStatus = async (appId: string, status: string) => {
    const res = await updateApplicationStatusAction(appId, status, bountyId);
    if (res.success) {
      window.location.reload();
    }
  };

  const handleReviewSubmission = async (submissionId: string, status: string) => {
    if (!feedback) {
      alert("Please provide feedback.");
      return;
    }
    setReviewingId(submissionId);
    const res = await reviewBountySubmissionAction(submissionId, status, feedback, bountyId);
    if (res.success) {
      window.location.reload();
    }
    setReviewingId(null);
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full" /></div>;
  if (!bounty) return <div className="p-8 text-center text-zinc-400">Bounty not found</div>;

  const pendingApps = bounty.applications?.filter((a: any) => a.status === 'pending') || [];
  const acceptedApps = bounty.applications?.filter((a: any) => a.status === 'accepted') || [];
  const submissions = bounty.submissions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/projects/${projectId}/workspace/bounties`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Bounty</h2>
          <p className="text-zinc-400">{bounty.title}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">{bounty.status.toUpperCase()}</Badge>
        {bounty.reward_type === 'cash' ? (
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20">{bounty.cash_currency} {bounty.cash_amount_range}</Badge>
        ) : (
          <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20">Non-Cash</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Applications ({pendingApps.length} pending)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApps.length === 0 && <p className="text-sm text-zinc-500">No pending applications.</p>}
              {pendingApps.map((app: any) => (
                <div key={app.id} className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm" className="h-8 w-8 bg-zinc-800"><User className="h-4 w-4 text-zinc-400" /></Avatar>
                    <span className="font-semibold text-sm">Applicant {app.applicant_id.substring(0,6)}...</span>
                  </div>
                  <div className="text-sm text-zinc-300 italic border-l-2 border-zinc-700 pl-3">&quot;{app.message}&quot;</div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" className="border-zinc-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50" onClick={() => handleAppStatus(app.id, 'rejected')}>
                      <XCircle className="h-4 w-4 mr-1" /> Decline
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleAppStatus(app.id, 'accepted')}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Accept
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Accepted Contributors ({acceptedApps.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {acceptedApps.length === 0 && <p className="text-sm text-zinc-500">No contributors accepted yet.</p>}
              <div className="space-y-2">
                {acceptedApps.map((app: any) => (
                  <div key={app.id} className="flex items-center gap-2 p-2 bg-zinc-950 rounded border border-zinc-800">
                    <Avatar size="sm" className="h-8 w-8 bg-zinc-800"><User className="h-4 w-4 text-zinc-400" /></Avatar>
                    <span className="font-semibold text-sm">Contributor {app.applicant_id.substring(0,6)}...</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {submissions.length === 0 && <p className="text-sm text-zinc-500">No work submitted yet.</p>}
              
              {submissions.map((sub: any) => (
                <div key={sub.id} className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-blue-500/10 text-blue-400 mb-2">{sub.status}</Badge>
                      <p className="text-sm font-medium text-zinc-200">From Contributor {sub.contributor_id.substring(0,6)}...</p>
                    </div>
                    <span className="text-xs text-zinc-500">{new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="text-sm text-zinc-300">
                    <div className="font-semibold text-xs text-zinc-500 uppercase mb-1">Description</div>
                    {sub.description}
                  </div>
                  
                  {sub.urls && sub.urls.length > 0 && (
                    <div className="text-sm text-zinc-300">
                      <div className="font-semibold text-xs text-zinc-500 uppercase mb-1">Links</div>
                      <ul className="list-disc list-inside">
                        {sub.urls.map((url: string, i: number) => (
                          <li key={i}><a href={url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{url}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sub.status === 'submitted' && (
                    <div className="pt-4 border-t border-zinc-800 space-y-3">
                      <Textarea 
                        placeholder="Provide feedback..." 
                        className="bg-zinc-900 border-zinc-800"
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" className="border-zinc-700 hover:bg-amber-500/10 hover:text-amber-500" disabled={reviewingId === sub.id} onClick={() => handleReviewSubmission(sub.id, 'revision_requested')}>
                          Request Revision
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={reviewingId === sub.id} onClick={() => handleReviewSubmission(sub.id, 'accepted')}>
                          Accept & Complete
                        </Button>
                      </div>
                    </div>
                  )}

                  {sub.owner_feedback && sub.status !== 'submitted' && (
                    <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-sm">
                      <span className="text-zinc-500 block mb-1">Your Feedback:</span>
                      {sub.owner_feedback}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
