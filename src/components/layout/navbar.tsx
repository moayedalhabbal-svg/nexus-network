"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Sparkles, Search, FolderKanban, Users, MessageSquare,
  Bell, ChevronDown, LogOut, User, Settings, Menu, X,
} from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, loginAsDemo, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const navLinks = isAuthenticated
    ? [
        { href: "/discover", label: "Discover", icon: Search },
        { href: "/projects", label: "Projects", icon: FolderKanban },
        { href: "/matches", label: "Matches", icon: Sparkles },
        { href: "/network", label: "Network", icon: Users },
        { href: "/messages", label: "Messages", icon: MessageSquare },
      ]
    : [
        { href: "/discover", label: "Discover", icon: Search },
        { href: "/projects", label: "Projects", icon: FolderKanban },
        { href: "/network", label: "Network", icon: Users },
      ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href={isAuthenticated ? "/discover" : "/"} className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-extrabold text-sm text-primary-foreground">N</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline">NEXUS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-accent transition-colors"
                >
                  <Avatar size="sm" alt={user.name} />
                  <span className="text-sm font-medium hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border bg-card shadow-xl z-50 p-2 animate-fade-in">
                      <div className="px-3 py-3 border-b mb-2">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{user.headline}</p>
                        <Badge variant="secondary" className="mt-2 text-[10px]">Demo Mode</Badge>
                      </div>
                      <Link href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors">
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                      <Link href="/projects/manage" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors">
                        <FolderKanban className="h-4 w-4" /> Manage Projects
                      </Link>
                      <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      <div className="border-t mt-2 pt-2">
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm text-destructive w-full transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => loginAsDemo()}>
                Demo Login
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Log In</Button>
              </Link>
              <Link href="/onboarding">
                <Button size="sm">Join the Network</Button>
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMobileNav(!showMobileNav)}
          >
            {showMobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {showMobileNav && (
        <div className="md:hidden border-t bg-background p-4 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setShowMobileNav(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
