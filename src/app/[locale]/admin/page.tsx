"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEED_USERS, SEED_PROJECTS, SEED_REPORTS, SEED_AUDIT_LOGS } from "@/lib/seed-data";
import { ShieldAlert, Users, FolderKanban, Activity, AlertTriangle, CheckCircle, Ban, ArrowUpRight, History, Eye, XCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "moderation" | "audit">("overview");
  const [reports] = useState(SEED_REPORTS);
  const [logs] = useState(SEED_AUDIT_LOGS);

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
              onClick={() => setActiveTab("moderation")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "moderation" ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <AlertTriangle className="h-4 w-4" /> Moderation Queue
              {reports.filter(r => r.status === 'pending').length > 0 && (
                 <Badge className="ml-auto bg-destructive text-destructive-foreground">
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
                        <h3 className="text-3xl font-bold">{SEED_USERS.length + 1240}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-500 font-medium">
                      <ArrowUpRight className="h-4 w-4 mr-1" /> +12% this week
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Active Projects</p>
                        <h3 className="text-3xl font-bold">{SEED_PROJECTS.length + 342}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-500 font-medium">
                      <ArrowUpRight className="h-4 w-4 mr-1" /> +8% this week
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
                      <ArrowUpRight className="h-4 w-4 mr-1" /> +24% this week
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
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-medium">User</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                        <th className="px-6 py-4 font-medium">Joined</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SEED_USERS.map(user => (
                        <tr key={user.id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <Avatar size="sm" alt={user.name} />
                            <div>
                              <div className="font-semibold">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">{user.roles?.[0] || 'User'}</Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            Mar 2024
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-green-500/10 text-green-500 border-green-200/20">Active</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">Suspend</Button>
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
                                <Button variant="link" size="sm" className="h-auto p-0 ml-2"><Eye className="h-3 w-3 mr-1" /> View</Button>
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
                  <table className="w-full text-sm text-left">
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
                             <span className="text-muted-foreground ml-2 text-xs font-mono">{log.targetId}</span>
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
          
        </main>
      </div>
    </div>
  );
}
