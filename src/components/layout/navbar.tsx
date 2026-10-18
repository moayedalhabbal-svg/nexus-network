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
  Bell, ChevronDown, LogOut, User, Settings, Menu, X, ShieldAlert, Trophy, ShoppingBag,
  BookOpenText, BriefcaseBusiness, MoreHorizontal
} from "lucide-react";
import { LanguageSelector } from "./language-selector";
import { ThemeToggle } from "../theme-toggle";
import { useTranslations, useLocale } from "next-intl";

export function Navbar() {
  const { user, isAuthenticated, isDemoMode, loginAsDemo, logout } = useAuth();
  const pathname = usePathname();
  const locale = useLocale();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const t = useTranslations("navigation");
  const adminRoles = (user as { roles?: string[] } | null)?.roles ?? [];
  const canAccessAdmin = Boolean(
    user && (
      adminRoles.includes("admin") ||
      user.name?.toLowerCase().includes("admin") ||
      user.email?.toLowerCase().includes("admin")
    )
  );

  const navLinks = isAuthenticated
    ? [
        { href: `/${locale}/feed`, label: "Feed", icon: Sparkles },
        { href: `/${locale}/discover`, label: "Discover", icon: Search },
        { href: `/${locale}/workshops`, label: "Workshops", icon: BookOpenText },
        { href: `/${locale}/matches`, label: "Matches", icon: Sparkles },
        { href: `/${locale}/projects`, label: "Projects", icon: FolderKanban },
        { href: `/${locale}/marketplace`, label: "Marketplace", icon: ShoppingBag },
        { href: `/${locale}/bounties`, label: "Bounties", icon: Trophy },
        { href: `/${locale}/projects/manage`, label: "Workspace", icon: FolderKanban },
        { href: `/${locale}/network`, label: "Network", icon: Users },
        { href: `/${locale}/messages`, label: "Messages", icon: MessageSquare },
        { href: `/${locale}/professionals`, label: "Professionals", icon: BriefcaseBusiness },
        { href: `/${locale}/opportunities`, label: "Opportunities", icon: Sparkles },
      ]
    : [
        { href: `/${locale}/feed`, label: "Feed", icon: Sparkles },
        { href: `/${locale}/discover`, label: "Discover", icon: Search },
        { href: `/${locale}/workshops`, label: "Workshops", icon: BookOpenText },
        { href: `/${locale}/matches`, label: "Matches", icon: Sparkles },
        { href: `/${locale}/projects`, label: "Projects", icon: FolderKanban },
        { href: `/${locale}/marketplace`, label: "Marketplace", icon: ShoppingBag },
        { href: `/${locale}/bounties`, label: "Bounties", icon: Trophy },
        { href: `/${locale}/projects/manage`, label: "Workspace", icon: FolderKanban },
        { href: `/${locale}/professionals`, label: "Professionals", icon: BriefcaseBusiness },
        { href: `/${locale}/network`, label: "Network", icon: Users },
      ];

  const primaryLinks = navLinks.slice(0, 6);
  const overflowLinks = navLinks.slice(6);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="nexus-shell flex items-center justify-between gap-3 rounded-full px-3 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              href={isAuthenticated ? `/${locale}/discover` : `/${locale}`}
              className="group flex shrink-0 items-center gap-3 rounded-full border border-border/70 bg-background/80 px-2.5 py-1.5 shadow-[0_0_0_1px_rgba(148,163,184,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30"
            >
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-slate-200/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 shadow-[0_10px_18px_-12px_rgba(15,23,42,0.9)]">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.25),transparent_60%)]" />
                <div className="relative z-10 flex h-5 w-5 items-center justify-center">
                  <div className="absolute h-3 w-3 rounded-full border border-sky-300/90" />
                  <div className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-sky-300/90" />
                  <div className="absolute top-0 left-1/2 h-5 w-px -translate-x-1/2 bg-sky-300/90" />
                  <div className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-sky-300/90" />
                  <div className="absolute right-0 top-1/2 h-px w-2 -translate-y-1/2 bg-sky-300/90" />
                  <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                </div>
              </div>
              <div className="hidden items-center sm:flex">
                <span className="text-[0.7rem] font-black uppercase tracking-[0.28em] text-foreground">NEXUS</span>
              </div>
            </Link>

            <nav className="hidden min-w-0 flex-1 items-center gap-1 md:flex md:justify-start">
              {primaryLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-2.5 py-2 text-[11px] font-medium transition-all xl:text-sm ${
                    isActive(link.href)
                      ? "bg-primary/8 text-primary ring-1 ring-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}

              {overflowLinks.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMoreMenu((value) => !value)}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-2.5 py-2 text-[11px] font-medium transition-all xl:text-sm ${
                      overflowLinks.some(link => isActive(link.href))
                        ? "bg-primary/8 text-primary ring-1 ring-primary/15"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                    }`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    More
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  {showMoreMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                      <div className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-2xl border border-border/60 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
                        {overflowLinks.map(link => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setShowMoreMenu(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                              isActive(link.href)
                                ? "bg-primary/8 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <Link href={`/${locale}/notifications`} className="relative hidden sm:inline-flex rounded-full p-2 text-muted-foreground hover:bg-accent transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-full p-1 pe-3 hover:bg-accent transition-colors"
                >
                  <Avatar size="sm" alt={user.name || "User"} />
                  <span className="text-sm font-medium hidden sm:inline">
                    {user.name ? user.name.split(' ')[0] : 'Member'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-full sm:w-64 rounded-xl border bg-background shadow-xl z-50 p-2 animate-fade-in max-w-[calc(100vw-32px)]">
                      <div className="px-3 py-3 border-b mb-2">
                        <p className="font-semibold text-sm">{user.name || "NEXUS Member"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{user.headline || ""}</p>
                        <Badge variant="secondary" className="mt-2 text-[10px]">
                          {isDemoMode ? "Demo Mode" : "Member"}
                        </Badge>
                      </div>
                      <Link href={`/${locale}/profile`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors">
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                      <Link href={`/${locale}/projects/manage`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors">
                        <FolderKanban className="h-4 w-4" /> Manage Projects
                      </Link>
                      {canAccessAdmin && (
                        <Link href={`/${locale}/admin`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors text-primary font-medium">
                          <ShieldAlert className="h-4 w-4" /> Admin Panel
                        </Link>
                      )}
                      <Link href={`/${locale}/settings`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors">
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
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Log In</Button>
              </Link>
              <Link href={`/${locale}/onboarding`}>
                <Button size="sm">{t("signup")}</Button>
              </Link>
            </>
          )}

          <ThemeToggle />
          <LanguageSelector />

          {/* Mobile menu toggle (Only for non-authenticated) */}
          {!isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileNav(!showMobileNav)}
            >
              {showMobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
        </div>
      </div>

      {/* Mobile nav */}
      {!isAuthenticated && showMobileNav && (
        <div className="container mx-auto px-4 pb-3 md:hidden">
          <div className="nexus-shell rounded-2xl p-3 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMobileNav(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
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
        </div>
      )}
    </header>
  );
}
