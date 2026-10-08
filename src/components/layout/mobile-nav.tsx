"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Briefcase, Sparkles, MessageSquare } from "lucide-react";
import { useLocale } from "next-intl";

export function MobileNav() {
  const pathname = usePathname();
  const locale = useLocale();

  const navItems = [
    { href: `/${locale}/feed`, icon: Home, label: "Home" },
    { href: `/${locale}/discover`, icon: Compass, label: "Discover" },
    { href: `/${locale}/projects`, icon: Briefcase, label: "Projects" },
    { href: `/${locale}/matches`, icon: Sparkles, label: "Matches" },
    { href: `/${locale}/messages`, icon: MessageSquare, label: "Messages" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
