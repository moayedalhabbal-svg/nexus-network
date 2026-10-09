"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, Clock, FileText, CheckCircle, Flame } from "lucide-react";
import Link from "next/link";
import { fetchBountiesAction } from "@/app/actions/bounties";

export default function WorkspaceBountiesPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = useLocale();
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    async function load() {
      const p = await params;
      setProjectId(p.id);
      const res = await fetchBountiesAction({ project_id: p.id });
      if (res.success && res.bounties) {
        setBounties(res.bounties);
      }
      setLoading(false);
    }
    load();
  }, [params]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Micro-Bounties</h2>
          <p className="text-zinc-400">Manage and create small tasks to attract contributors.</p>
        </div>
        <Link href={`/${locale}/projects/${projectId}/workspace/bounties/new`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Create Bounty
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full" /></div>
        ) : bounties.length > 0 ? (
          bounties.map((bounty) => (
            <Card key={bounty.id} className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {bounty.status === 'open' && <Badge className="bg-emerald-500/10 text-emerald-400">Open</Badge>}
                    {bounty.status === 'in_progress' && <Badge className="bg-blue-500/10 text-blue-400">In Progress</Badge>}
                    {bounty.status === 'completed' && <Badge className="bg-zinc-800 text-zinc-400">Completed</Badge>}
                    <span className="font-semibold text-lg text-zinc-100">{bounty.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {bounty.estimated_effort}</span>
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {bounty.applications?.length || 0} Applicants</span>
                    {bounty.reward_type === 'cash' ? (
                      <span className="text-amber-500 font-medium">{bounty.cash_currency} {bounty.cash_amount_range}</span>
                    ) : (
                      <span className="text-purple-400 font-medium">Non-Cash</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/${locale}/projects/${projectId}/workspace/bounties/${bounty.id}`}>
                    <Button variant="outline" className="border-zinc-700">Manage</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
            <Trophy className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-300">No bounties yet</h3>
            <p className="text-zinc-500 mt-1 mb-4">Break down your project into bite-sized tasks and offer rewards.</p>
            <Link href={`/${locale}/projects/${projectId}/workspace/bounties/new`}>
              <Button variant="outline" className="border-zinc-700">Create your first bounty</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
