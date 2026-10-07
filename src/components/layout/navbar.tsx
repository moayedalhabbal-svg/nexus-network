import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight">NEXUS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/discover" className="transition-colors hover:text-foreground/80 text-foreground/60">Discover</Link>
            <Link href="/projects" className="transition-colors hover:text-foreground/80 text-foreground/60">Projects</Link>
            <Link href="/network" className="transition-colors hover:text-foreground/80 text-foreground/60">Network</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button>Join the Network</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
