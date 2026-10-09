/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEED_USERS, SEED_PROJECTS, SEED_REPORTS, SEED_AUDIT_LOGS } from "@/lib/seed-data";
import { ShieldAlert, Users, FolderKanban, Activity, AlertTriangle, CheckCircle, Ban, ArrowUpRight, History, Eye, XCircle, LineChart, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "projects" | "moderation" | "audit" | "analytics" | "liquidity">("overview");
  const [reports] = useState(SEED_REPORTS);
  const [logs] = useState(SEED_AUDIT_LOGS);
  
  const router = useRouter();
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [realProjects, setRealProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalProjects: 0 });
  const [loading, setLoading] = useState(true);

  // Backfill State
  const [backfilling, setBackfilling] = useState(false);
  const [backfillStats, setBackfillStats] = useState<{ updated: number, failed: number, hasMore: boolean | "unknown", fetchFailed?: boolean } | null>(null);
  const [failedProjects, setFailedProjects] = useState<string[]>([]);
  const [failedProfiles, setFailedProfiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { getAdminUsersAction, getAdminProjectsAction, getAdminStatsAction } = await import("@/app/actions/admin");
        
        const statsRes = await getAdminStatsAction();
        if (!statsRes.success) {
          router.push("/"); // Redirect if unauthorized
          return;
        }
        
        setStats(statsRes.stats || { totalUsers: 0, totalProjects: 0 });

        const usersRes = await getAdminUsersAction();
        if (usersRes.success && usersRes.users) {
          setRealUsers(usersRes.users);
        }

        const projRes = await getAdminProjectsAction();
        if (projRes.success && projRes.projects) {
          setRealProjects(projRes.projects);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to completely delete this user? This cannot be undone.")) return;
    try {
      const { deleteUserAction } = await import("@/app/actions/admin");
      const res = await deleteUserAction(userId);
      if (res.success) {
        setRealUsers(realUsers.filter(u => u.id !== userId));
      } else {
        alert("Failed to delete user: " + res.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to completely delete this project? This cannot be undone.")) return;
    try {
      const { deleteProjectAction } = await import("@/app/actions/admin");
      const res = await deleteProjectAction(projectId);
      if (res.success) {
        setRealProjects(realProjects.filter(p => p.id !== projectId));
      } else {
        alert("Failed to delete project: " + res.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackfill = async () => {
    if (!confirm("Start AI Embedding backfill batch? This processes up to 100 missing records.")) return;
    setBackfilling(true);
    try {
      const { backfillEmbeddingsAction } = await import("@/app/actions/admin-backfill");
      const res = await backfillEmbeddingsAction(failedProjects, failedProfiles);
      if (res.success) {
        setBackfillStats({
          updated: (backfillStats?.updated || 0) + (res.updated || 0),
          failed: (backfillStats?.failed || 0) + (res.errors?.length || 0),
          hasMore: res.hasMore !== undefined ? res.hasMore : false,
          fetchFailed: res.fetchFailed
        });
        setFailedProjects(res.failedProjectIds || []);
        setFailedProfiles(res.failedProfileIds || []);
      } else {
        alert("Backfill failed: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error triggering backfill");
    } finally {
      setBackfilling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Admin Sidebar */}
        <aside className="w-full md:w-64 border-r bg-background flex flex-col h-auto md:min-h-[calc(100vh-64px)]">
          <div className="p-6 border-b">
            <h2 className="font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" /> Admin Control
            </h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "overview" ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <Activity className="h-4 w-4" /> Platform Overview
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "users" ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <Users className="h-4 w-4" /> Manage Users
            </button>
            <button 
              onClick={() => setActiveTab("projects")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "projects" ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <FolderKanban className="h-4 w-4" /> Manage Projects
            </button>
            <button 
              onClick={() => setActiveTab("moderation")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "moderation" ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <AlertTriangle className="h-4 w-4" /> Moderation Queue
              {reports.filter(r => r.status === 'pending').length > 0 && (
                 <Badge className="ms-auto bg-destructive text-destructive-foreground">
                   {reports.filter(r => r.status === 'pending').length}
                 </Badge>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("audit")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "audit" ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <History className="h-4 w-4" /> Audit Logs
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "analytics" ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <LineChart className="h-4 w-4" /> Product Analytics
            </button>
            <button 
              onClick={() => setActiveTab("liquidity")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "liquidity" ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <Activity className="h-4 w-4" /> Network Liquidity
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10">
          
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h1>
                <p className="text-muted-foreground">High-level metrics and growth analytics.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
                        <h3 className="text-3xl font-bold">{loading ? "..." : stats.totalUsers}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-500 font-medium">
                      <ArrowUpRight className="h-4 w-4 me-1" /> +12% this week
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Active Projects</p>
                        <h3 className="text-3xl font-bold">{loading ? "..." : stats.totalProjects}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-500 font-medium">
                      <ArrowUpRight className="h-4 w-4 me-1" /> +8% this week
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Successful Matches</p>
                        <h3 className="text-3xl font-bold">892</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-500 font-medium">
                      <ArrowUpRight className="h-4 w-4 me-1" /> +24% this week
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Pending Reports</p>
                        <h3 className="text-3xl font-bold text-destructive">
                           {reports.filter(r => r.status === 'pending').length}
                        </h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-muted-foreground font-medium">
                      Requires attention
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI System Status */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> AI Intelligence Engine
                  </CardTitle>
                  <CardDescription>Monitor and repair vector embeddings for the semantic matching engine.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Vector Dimension Check: <span className="text-green-500 font-bold">vector(768) OK</span></p>
                      <p className="text-sm text-muted-foreground">Model: gemini-embedding-2</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button 
                        onClick={handleBackfill} 
                        disabled={backfilling}
                        variant={(backfillStats?.hasMore === true || backfillStats?.hasMore === "unknown" || backfillStats?.fetchFailed) ? "default" : "secondary"}
                      >
                        {backfilling ? "Processing Batch..." : "Rebuild AI Embeddings (Batch of 100)"}
                      </Button>
                    </div>
                  </div>

                  {backfillStats && (
                    <div className="mt-4 p-4 rounded-md bg-muted/50 border flex items-center justify-between">
                      <div className="space-x-4">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          {backfillStats.updated} Updated
                        </Badge>
                        <Badge variant="outline" className={backfillStats.failed > 0 ? "text-destructive border-destructive bg-destructive/10" : ""}>
                          {backfillStats.failed} Failed
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">
                        {backfillStats.fetchFailed ? (
                          <span className="text-destructive flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1"/> Fetch error occurred. Remaining records unknown.
                          </span>
                        ) : backfillStats.hasMore === true ? (
                          <span className="text-amber-600">More records remaining. Click again to continue.</span>
                        ) : backfillStats.hasMore === "unknown" ? (
                          <span className="text-amber-600">Remaining records unknown due to partial errors.</span>
                        ) : (
                          <span className="text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1"/> Database Fully Embedded</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Charts Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Network Growth</CardTitle>
                  <CardDescription>Daily active users and new project creations over the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full bg-muted/30 rounded-xl border border-dashed flex items-center justify-center text-muted-foreground flex-col gap-3">
                    <Activity className="h-8 w-8 opacity-50" />
                    <p>Chart visualization rendering engine not initialized in demo mode.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Users</h1>
                <p className="text-muted-foreground">View and manage all registered accounts on the platform.</p>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-start">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-medium">User</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                        <th className="px-6 py-4 font-medium">Joined</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realUsers.length === 0 && loading && (
                        <tr><td colSpan={5} className="px-6 py-4 text-center">Loading users...</td></tr>
                      )}
                      {realUsers.map(user => (
                        <tr key={user.id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <Avatar size="sm" alt={user.full_name} src={user.avatar_url} />
                            <div>
                              <div className="font-semibold">{user.full_name}</div>
                              <div className="text-xs text-muted-foreground">{user.username}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">{user.is_admin ? 'Admin' : 'User'}</Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-green-500/10 text-green-500 border-green-200/20">Active</Badge>
                          </td>
                          <td className="px-6 py-4 text-end">
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Projects</h1>
                <p className="text-muted-foreground">View and moderate all created projects on the platform.</p>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-start">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-medium">Project</th>
                        <th className="px-6 py-4 font-medium">Owner</th>
                        <th className="px-6 py-4 font-medium">Stage</th>
                        <th className="px-6 py-4 font-medium">Created</th>
                        <th className="px-6 py-4 font-medium text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realProjects.length === 0 && loading && (
                        <tr><td colSpan={5} className="px-6 py-4 text-center">Loading projects...</td></tr>
                      )}
                      {realProjects.map(project => (
                        <tr key={project.id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold">{project.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{project.pitch}</div>
                          </td>
                          <td className="px-6 py-4 flex items-center gap-2">
                            <Avatar size="sm" alt={project.profiles?.full_name} src={project.profiles?.avatar_url} />
                            <span className="text-xs">{project.profiles?.full_name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="capitalize">{project.stage}</Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {formatDate(project.created_at)}
                          </td>
                          <td className="px-6 py-4 text-end">
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProject(project.id)}>Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "moderation" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-destructive">Moderation Dashboard</h1>
                <p className="text-muted-foreground">Review flagged content, spam reports, and terms of service violations.</p>
              </div>

              <div className="grid gap-6">
                {reports.map(report => (
                  <Card key={report.id} className={`border ${report.status === 'pending' ? 'border-destructive/50 shadow-md' : 'border-border/50 bg-muted/20'}`}>
                    <CardHeader className="pb-3 border-b border-border/50">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                             <Badge variant={report.status === 'pending' ? 'destructive' : 'outline'} className="capitalize">
                               {report.status}
                             </Badge>
                             <Badge variant="secondary" className="capitalize">
                               Target: {report.targetType}
                             </Badge>
                             <Badge variant="outline" className="capitalize text-muted-foreground">
                               Reason: {report.reason.replace('_', ' ')}
                             </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</span>
                       </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-4">
                       <div className="grid md:grid-cols-2 gap-4">
                          <div>
                             <p className="text-sm font-semibold text-muted-foreground mb-1">Reported Entity</p>
                             <div className="flex items-center gap-2">
                                <Avatar size="sm" alt={report.targetName} />
                                <span className="font-medium">{report.targetName}</span>
                                <Button variant="link" size="sm" className="h-auto p-0 ms-2"><Eye className="h-3 w-3 me-1" /> View</Button>
                             </div>
                          </div>
                          <div>
                             <p className="text-sm font-semibold text-muted-foreground mb-1">Reporter</p>
                             <div className="flex items-center gap-2">
                                <Avatar size="sm" alt={report.reporterName} />
                                <span className="text-sm">{report.reporterName}</span>
                             </div>
                          </div>
                       </div>
                       <div className="mt-4 p-3 bg-muted/50 rounded-md border border-border/50">
                          <p className="text-sm font-semibold mb-1">Description:</p>
                          <p className="text-sm text-foreground/80">{report.description}</p>
                       </div>

                       {report.status !== 'pending' && (
                          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                             <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">Resolution ({formatDate(report.reviewedAt || '')})</p>
                             <p className="text-sm text-green-700/80 dark:text-green-400/80">Moderator: {report.reviewedBy}</p>
                             <p className="text-sm text-green-700/80 dark:text-green-400/80">Action Taken: <span className="capitalize">{report.actionTaken?.replace('_', ' ')}</span></p>
                             <p className="text-sm text-green-700/80 dark:text-green-400/80 mt-1">Notes: {report.resolution}</p>
                          </div>
                       )}
                    </CardContent>
                    
                    {report.status === 'pending' && (
                       <CardFooter className="pt-4 border-t border-border/50 bg-muted/20 flex gap-3 justify-end">
                          <Button variant="outline" size="sm" className="gap-2">
                             <XCircle className="h-4 w-4" /> Dismiss Report
                          </Button>
                          <Button variant="destructive" size="sm" className="gap-2">
                             <Ban className="h-4 w-4" /> Take Action
                          </Button>
                       </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Audit Logs</h1>
                <p className="text-muted-foreground">Immutable record of all administrative and moderation actions.</p>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-start">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-medium">Timestamp</th>
                        <th className="px-6 py-4 font-medium">Admin</th>
                        <th className="px-6 py-4 font-medium">Action</th>
                        <th className="px-6 py-4 font-medium">Target</th>
                        <th className="px-6 py-4 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{log.adminName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="capitalize bg-muted/50">{log.action.replace(/_/g, ' ')}</Badge>
                          </td>
                          <td className="px-6 py-4">
                             <span className="capitalize">{log.targetType}</span>
                             <span className="text-muted-foreground ms-2 text-xs font-mono">{log.targetId}</span>
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <p className="truncate" title={log.details}>{log.details}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
          
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Product Analytics</h1>
                <p className="text-muted-foreground">Monitor the primary product metric: Meaningful Collaborations Created.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-4">
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Matches</p>
                    <h3 className="text-3xl font-bold text-blue-500">1,245</h3>
                    <p className="text-xs text-muted-foreground mt-2">AI \u0026 Manual discover</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Connections</p>
                    <h3 className="text-3xl font-bold text-yellow-500">892</h3>
                    <p className="text-xs text-muted-foreground mt-2">71% conversion rate</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Applications</p>
                    <h3 className="text-3xl font-bold text-orange-500">412</h3>
                    <p className="text-xs text-muted-foreground mt-2">46% conversion rate</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-sm bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-primary">Collaborations</p>
                    </div>
                    <h3 className="text-3xl font-bold text-primary">156</h3>
                    <p className="text-xs text-primary/80 mt-2">37% conversion rate</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "liquidity" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Network Liquidity</h1>
                <p className="text-muted-foreground">Monitor marketplace health: supply, demand, and match conversion.</p>
              </div>
              <NetworkLiquidityDashboard />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Subcomponent to fetch and render the liquidity data
function NetworkLiquidityDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/app/actions/liquidity").then(module => {
      module.getNetworkLiquidityStats().then(res => {
        if (res.success) {
          setStats(res.data);
        }
        setLoading(false);
      });
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <Activity className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Analyzing network liquidity...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load data</h3>
          <p className="text-muted-foreground max-w-md">
            The liquidity data could not be retrieved from the database.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {stats.note && (
        <div className="bg-yellow-500/10 text-yellow-600 p-4 rounded-md text-sm border border-yellow-500/20 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {stats.note}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unfilled Project Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.unfilledRolesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active recruiting requests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invitations Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.invitations.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Invitation Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.invitations.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.invitations.accepted} accepted</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill Supply vs Demand</CardTitle>
          <CardDescription>Most requested skills and the number of users who possess them.</CardDescription>
        </CardHeader>
        <CardContent>
          {!stats.skillGaps ? (
            <div className="text-center p-8 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>No active skill requests to analyze.</p>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {stats.skillGaps.map((gap: any, i: number) => {
                const ratio = gap.available > 0 ? gap.count / gap.available : gap.count;
                const isCritical = ratio > 2 && gap.available < 5;
                
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{gap.name}</span>
                        {isCritical && <Badge variant="destructive" className="text-[10px]">Supply Shortage</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {gap.count} requests • {gap.available} eligible users
                      </p>
                    </div>
                    
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden flex">
                      <div className="bg-primary h-full" style={{ width: `${Math.min(100, (gap.available / Math.max(gap.count, 1)) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
