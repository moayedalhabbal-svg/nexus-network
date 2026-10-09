"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBountyAction } from "@/app/actions/bounties";
import { ArrowLeft, Loader2, DollarSign, Gift } from "lucide-react";
import Link from "next/link";

export default function CreateBountyPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = useLocale();
  const router = useRouter();
  
  const [projectId, setProjectId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills_required: "",
    category: "",
    expected_deliverables: "",
    acceptance_criteria: "",
    estimated_effort: "",
    deadline: "",
    reward_type: "non_cash",
    reward_details: "",
    cash_currency: "USD",
    cash_amount_range: "",
  });

  useEffect(() => {
    params.then(p => setProjectId(p.id));
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const skills = formData.skills_required.split(",").map(s => s.trim()).filter(Boolean);

    const payload = {
      project_id: projectId,
      title: formData.title,
      description: formData.description,
      skills_required: skills,
      category: formData.category || "General",
      expected_deliverables: formData.expected_deliverables,
      acceptance_criteria: formData.acceptance_criteria,
      estimated_effort: formData.estimated_effort,
      deadline: formData.deadline || undefined,
      contributors_needed: 1,
      reward_type: formData.reward_type,
      reward_details: formData.reward_details,
      cash_currency: formData.reward_type === 'cash' ? formData.cash_currency : undefined,
      cash_amount_range: formData.reward_type === 'cash' ? formData.cash_amount_range : undefined,
    };

    const res = await createBountyAction(payload);
    
    if (res.success) {
      router.push(`/${locale}/projects/${projectId}/workspace/bounties`);
    } else {
      setError(res.error || "Failed to create bounty");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/projects/${projectId}/workspace/bounties`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create New Bounty</h2>
          <p className="text-zinc-400">Define a discrete task for contributors.</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-md text-sm">{error}</div>}

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-100 border-b border-zinc-800 pb-2">Basic Info</h3>
              
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Bounty Title</label>
                <Input required placeholder="e.g. Implement OAuth2 Login" className="bg-zinc-950 border-zinc-800" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Description</label>
                <Textarea required placeholder="Describe what needs to be done..." className="bg-zinc-950 border-zinc-800 min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Category</label>
                  <Input required placeholder="e.g. Frontend Development" className="bg-zinc-950 border-zinc-800" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Skills Required (comma separated)</label>
                  <Input placeholder="React, Node.js, Typescript" className="bg-zinc-950 border-zinc-800" value={formData.skills_required} onChange={e => setFormData({...formData, skills_required: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-100 border-b border-zinc-800 pb-2">Task Details</h3>
              
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Expected Deliverables</label>
                <Textarea required placeholder="What should the contributor submit?" className="bg-zinc-950 border-zinc-800" value={formData.expected_deliverables} onChange={e => setFormData({...formData, expected_deliverables: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Acceptance Criteria</label>
                <Textarea required placeholder="How will you know the work is complete?" className="bg-zinc-950 border-zinc-800" value={formData.acceptance_criteria} onChange={e => setFormData({...formData, acceptance_criteria: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Estimated Effort</label>
                  <Input required placeholder="e.g. 5-10 hours" className="bg-zinc-950 border-zinc-800" value={formData.estimated_effort} onChange={e => setFormData({...formData, estimated_effort: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Deadline (Optional)</label>
                  <Input type="date" className="bg-zinc-950 border-zinc-800 text-zinc-300" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-100 border-b border-zinc-800 pb-2">Reward</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.reward_type === 'non_cash' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'}`}
                  onClick={() => setFormData({...formData, reward_type: 'non_cash'})}
                >
                  <Gift className={`h-6 w-6 mb-2 ${formData.reward_type === 'non_cash' ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <div className="font-semibold text-sm">Non-Cash Reward</div>
                  <div className="text-xs text-zinc-500 mt-1">Portfolio credit, recognition, equity, etc.</div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.reward_type === 'cash' ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'}`}
                  onClick={() => setFormData({...formData, reward_type: 'cash'})}
                >
                  <DollarSign className={`h-6 w-6 mb-2 ${formData.reward_type === 'cash' ? 'text-amber-500' : 'text-zinc-500'}`} />
                  <div className="font-semibold text-sm">Cash Reward</div>
                  <div className="text-xs text-zinc-500 mt-1">Fixed or negotiable payment.</div>
                </div>
              </div>

              {formData.reward_type === 'cash' ? (
                <div className="space-y-4 mt-4 p-4 border border-amber-500/20 bg-amber-500/5 rounded-lg">
                  <div className="text-xs text-amber-500 font-medium mb-2">
                    Payment is arranged directly between the project owner and contributor. NEXUS does not process or guarantee payment.
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Currency</label>
                      <Input placeholder="USD, EUR, USDC..." className="bg-zinc-950 border-zinc-800" value={formData.cash_currency} onChange={e => setFormData({...formData, cash_currency: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Amount / Range</label>
                      <Input required placeholder="e.g. 500, or 200-400" className="bg-zinc-950 border-zinc-800" value={formData.cash_amount_range} onChange={e => setFormData({...formData, cash_amount_range: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Payment Terms</label>
                    <Input placeholder="e.g. Paid upon successful PR merge via PayPal" className="bg-zinc-950 border-zinc-800" value={formData.reward_details} onChange={e => setFormData({...formData, reward_details: e.target.value})} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 mt-4">
                  <label className="text-sm text-zinc-400">Describe the Non-Cash Reward</label>
                  <Textarea required placeholder="e.g. Public recognition on our contributors page, experience certificate, etc." className="bg-zinc-950 border-zinc-800" value={formData.reward_details} onChange={e => setFormData({...formData, reward_details: e.target.value})} />
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
              <Link href={`/${locale}/projects/${projectId}/workspace/bounties`}>
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Bounty
              </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
