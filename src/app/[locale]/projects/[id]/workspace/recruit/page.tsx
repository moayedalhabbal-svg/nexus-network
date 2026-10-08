/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Users, Loader2, Send, CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  createRecruitingRequestAction, 
  retrieveCandidatesAction, 
  draftOutreachAction, 
  sendInvitationAction 
} from "@/app/actions/recruiting";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";

export default function RecruitPage({ params }: { params: { id: string, locale: string } }) {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const handleRecruit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCandidates([]);
    
    // 1. Create request & extract requirements
    const reqRes = await createRecruitingRequestAction(params.id, roleTitle, description);
    
    if (reqRes.success) {
      setActiveRequest(reqRes.request || { id: reqRes.requestId });
      
      // 2. Fetch candidates
      const candRes = await retrieveCandidatesAction(reqRes.request?.id || reqRes.requestId, params.id);
      if (candRes.success && candRes.candidates) {
        setCandidates(candRes.candidates);
      }
    } else {
      alert("Error creating request: " + reqRes.error);
    }
    
    setLoading(false);
  };

  const openInviteModal = async (candidate: any) => {
    setSelectedCandidate(candidate);
    setDraftMessage("Drafting message...");
    setInviteModalOpen(true);
    
    const draftRes = await draftOutreachAction(params.id, candidate.id, roleTitle);
    if (draftRes.success && draftRes.draft) {
      setDraftMessage(draftRes.draft);
    }
  };

  const handleSendInvite = async () => {
    setSendingInvite(true);
    const res = await sendInvitationAction(params.id, selectedCandidate.id, draftMessage);
    setSendingInvite(false);
    
    if (res.success) {
      setInviteModalOpen(false);
      setCandidates(candidates.map(c => 
        c.id === selectedCandidate.id ? { ...c, status: 'invited' } : c
      ));
    } else {
      alert("Error sending invitation: " + res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Active Recruiting</h1>
          <p className="text-muted-foreground">Find the right collaborators based on skills, evidence, and compatibility.</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Describe Your Need
          </CardTitle>
          <CardDescription>
            Tell NEXUS what kind of collaborator you need. The AI will extract requirements and find the best matches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecruit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role Title</label>
              <Input 
                required 
                placeholder="e.g. Machine Learning Engineer" 
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Detailed Request</label>
              <textarea 
                required 
                className="w-full h-24 p-3 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. I need someone strong in Python and computer vision, around 5 hours a week, async, for a long-term research project."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Find Collaborators
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Extracting requirements and searching network...</p>
        </div>
      )}

      {!loading && candidates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recommended Candidates ({candidates.length})</h2>
          
          <div className="grid gap-4">
            {candidates.map((candidate, idx) => (
              <Card key={candidate.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 md:w-1/3 border-r bg-muted/10 flex flex-col items-center justify-center text-center">
                      <Avatar src={candidate.avatar_url || ''} alt={candidate.full_name} className="h-20 w-20 mb-4 border-2 border-primary/20" />
                      <h3 className="font-semibold text-lg">{candidate.full_name}</h3>
                      <p className="text-sm text-muted-foreground">@{candidate.username}</p>
                      
                      <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 font-medium text-sm border border-green-500/20">
                        <Sparkles className="h-4 w-4" /> {candidate.match_score}% Match
                      </div>
                    </div>
                    
                    <div className="p-6 md:w-2/3 flex flex-col">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Why this person?</h4>
                        <p className="text-sm leading-relaxed">{candidate.explanation}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Badge variant="secondary" className="bg-primary/5 gap-1"><CheckCircle2 className="h-3 w-3" /> Relevant Proof of Work</Badge>
                          <Badge variant="secondary" className="bg-primary/5 gap-1"><CheckCircle2 className="h-3 w-3" /> High Reliability</Badge>
                          <Badge variant="secondary" className="bg-primary/5 gap-1"><CheckCircle2 className="h-3 w-3" /> Async preference</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                        <Button variant="outline" asChild>
                          <Link href={`/${params.locale}/profile`} target="_blank">View Profile</Link>
                        </Button>
                        
                        {candidate.status === 'invited' ? (
                          <Button variant="secondary" disabled className="gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Invited
                          </Button>
                        ) : (
                          <Button onClick={() => openInviteModal(candidate)} className="gap-2">
                            <Send className="h-4 w-4" /> Invite to Project
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-semibold">Invite {selectedCandidate.full_name}</h2>
                <p className="text-sm text-muted-foreground mt-1">Review and edit the AI-drafted outreach message.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setInviteModalOpen(false)}>&times;</Button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea 
                  className="w-full h-40 p-3 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  value={draftMessage}
                  onChange={e => setDraftMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Drafted based on requirements and candidate profile
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t bg-muted/30 shrink-0 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSendInvite} disabled={sendingInvite}>
                {sendingInvite ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
