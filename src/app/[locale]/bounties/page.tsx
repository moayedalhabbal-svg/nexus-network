"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useLocale } from "next-intl";
import { fetchBountiesAction } from "@/app/actions/bounties";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Clock, FileText, Search, Trophy, CheckCircle, Flame, Plus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

export default function BountiesPage() {
  const locale = useLocale();
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'open', 'completed'
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadBounties() {
      setLoading(true);
      const res = await fetchBountiesAction();
      if (res.success && res.bounties) {
        setBounties(res.bounties);
      }
      setLoading(false);
    }
    loadBounties();
  }, []);

  const filteredBounties = bounties.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ? true : b.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 tracking-tight">
              <Trophy className="h-8 w-8 text-blue-500" /> 
              Micro-Bounties
            </h1>
            <p className="text-zinc-400 mt-2 max-w-2xl">
              Discover bite-sized tasks, contribute to exciting projects, earn rewards, and build your verified Proof of Work on NEXUS.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/projects`}>
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                <Plus className="mr-2 h-4 w-4" /> Create Bounty
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="Search bounties..." 
                    className="pl-9 bg-zinc-950 border-zinc-800"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-zinc-300">Status</h3>
                  <div className="space-y-2">
                    <Button 
                      variant={filter === "all" ? "default" : "ghost"} 
                      className={`w-full justify-start ${filter === "all" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                      onClick={() => setFilter("all")}
                    >
                      All Bounties
                    </Button>
                    <Button 
                      variant={filter === "open" ? "default" : "ghost"} 
                      className={`w-full justify-start ${filter === "open" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                      onClick={() => setFilter("open")}
                    >
                      <Flame className="mr-2 h-4 w-4" /> Open
                    </Button>
                    <Button 
                      variant={filter === "completed" ? "default" : "ghost"} 
                      className={`w-full justify-start ${filter === "completed" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                      onClick={() => setFilter("completed")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Completed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bounties List */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredBounties.length > 0 ? (
              filteredBounties.map(bounty => (
                <Link key={bounty.id} href={`/${locale}/bounties/${bounty.id}`}>
                  <Card className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors group cursor-pointer shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {bounty.status === 'open' && <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Open</Badge>}
                            {bounty.status === 'completed' && <Badge className="bg-zinc-800 text-zinc-400">Completed</Badge>}
                            <Badge variant="outline" className="border-zinc-700 text-zinc-300">{bounty.category}</Badge>
                            {bounty.reward_type === 'cash' ? (
                              <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20">
                                {bounty.cash_currency} {bounty.cash_amount_range}
                              </Badge>
                            ) : (
                              <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20">
                                Non-Cash Reward
                              </Badge>
                            )}
                          </div>
                          
                          <h2 className="text-xl font-bold text-zinc-100 group-hover:text-blue-400 transition-colors">
                            {bounty.title}
                          </h2>
                          
                          <p className="text-zinc-400 line-clamp-2 text-sm leading-relaxed">
                            {bounty.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-2">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" /> {bounty.project?.title || "Unknown Project"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" /> {bounty.estimated_effort}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" /> {bounty.applications?.length || 0} applicants
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-48 shrink-0 flex flex-col justify-between items-start md:items-end gap-4 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Avatar size="sm" alt={bounty.owner?.name} className="h-8 w-8" />
                            <span className="truncate">{bounty.owner?.name}</span>
                          </div>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View Details</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
                <Trophy className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-300">No bounties found</h3>
                <p className="text-zinc-500 mt-1 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you&apos;re looking for.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
