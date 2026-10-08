"use client";

import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell, Shield, Eye, Moon, Sun, Palette, LogOut, Trash2, User,
} from "lucide-react";

export default function SettingsPage() {
  const { user, isAuthenticated, loginAsDemo, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 text-center shadow-xl">
            <CardHeader>
              <CardTitle>Sign in to access settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => loginAsDemo()} className="w-full">Try Demo Mode</Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>Log In</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const toggleVisibility = (vis: "public" | "network" | "connections" | "private") => {
    updateProfile({ profileVisibility: vis });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">Manage your account, privacy, and preferences.</p>

          <div className="space-y-6">
            {/* Account */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Eye className="h-5 w-5" /> Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-sm font-medium mb-3">Profile Visibility</p>
                  <div className="flex flex-wrap gap-2">
                    {(["public", "network", "connections", "private"] as const).map(vis => (
                      <button
                        key={vis}
                        onClick={() => toggleVisibility(vis)}
                        className={`px-4 py-2 rounded-full border-2 text-sm capitalize transition-all ${
                          user.profileVisibility === vis
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        {vis}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Searchable Profile</p>
                    <p className="text-xs text-muted-foreground">Allow others to find you via search</p>
                  </div>
                  <button
                    onClick={() => updateProfile({ searchVisibility: !user.searchVisibility })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      user.searchVisibility ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      user.searchVisibility ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {["New match found", "Connection request", "Project invitation", "Message received", "Weekly digest"].map(item => (
                  <div key={item} className="flex items-center justify-between">
                    <p className="text-sm">{item}</p>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow translate-x-6" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Moon className="h-5 w-5" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Sun className="h-5 w-5" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-lg text-destructive flex items-center gap-2"><Shield className="h-5 w-5" /> Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sign out</p>
                    <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { logout(); router.push("/"); }}>
                    <LogOut className="h-4 w-4 me-2" /> Sign Out
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-destructive">Delete account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 me-2" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="pb-8">
              <Badge variant="secondary">Demo Mode • NEXUS v0.1.0</Badge>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
