"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight, Check, Cpu, Search, Sparkles, Star } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { marketplaceProducts } from "@/lib/marketplace-data";

const categories = ["All software", "AI", "Operations", "Execution", "Analytics"];

export default function SoftwarePage() {
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All software");
  const products = useMemo(() => marketplaceProducts.filter((product) => {
    const matchesCategory = activeCategory === "All software" || product.category === activeCategory;
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || [product.name, product.description, ...product.features]
      .some((value) => value.toLowerCase().includes(search));
    return product.purchaseType === "subscription" && matchesCategory && matchesQuery;
  }), [activeCategory, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-4 py-8 md:py-10">
        <section className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-9">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(ellipse_at_right,rgba(14,165,233,0.15),transparent_70%)] md:block" />
          <div className="relative max-w-3xl">
            <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2"><Cpu className="h-3.5 w-3.5" /> Software directory</Badge>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Software for the work you’re building.</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Find focused tools from independent builders and teams. Compare plans, explore what each tool does, and start a demo subscription.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-sky-500/25 bg-sky-500/5 px-3 py-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-sky-600" /> Demo catalog: subscriptions are simulated; no payment is collected.
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-2xl border bg-card p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search software and capabilities" className="h-11 pl-9" />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter software by category">
              {categories.map((category) => (
                <button key={category} type="button" onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${activeCategory === category ? "border-foreground bg-foreground text-background" : "bg-background text-muted-foreground hover:bg-accent"}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><h2 className="text-xl font-bold">Explore software</h2><p className="mt-1 text-sm text-muted-foreground">Plans shown in USD. Choose monthly or annual billing on the product page.</p></div>
            <span className="shrink-0 text-sm text-muted-foreground">{products.length} tools</span>
          </div>
          {products.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <Link key={product.id} href={`/${locale}/marketplace/${product.id}`} className="group block">
                  <Card className="h-full overflow-hidden transition-transform group-hover:-translate-y-1">
                    <div className={`flex h-28 items-start justify-between bg-gradient-to-br ${product.accent} p-4`}>
                      <Badge className="bg-white/15 text-white ring-1 ring-white/20">SaaS</Badge>
                      <Cpu className="h-5 w-5 text-white" />
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-3"><Badge variant="outline">{product.category}</Badge><span className="font-bold">${product.monthlyPrice}<span className="text-sm font-normal text-muted-foreground"> / month</span></span></div>
                      <CardTitle className="mt-2 text-xl">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="font-medium text-foreground">{product.rating}</span><span>({product.reviews} reviews)</span></div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {product.features.map((feature) => <li key={feature} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{feature}</li>)}
                      </ul>
                    </CardContent>
                    <CardFooter className="justify-between border-t pt-4">
                      <span className="text-xs text-muted-foreground">by {product.seller}</span>
                      <Button size="sm">View plans <ArrowRight className="ml-1 h-4 w-4" /></Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-10 text-center"><Cpu className="mx-auto h-8 w-8 text-muted-foreground" /><h3 className="mt-3 font-semibold">No software matches that search</h3><p className="mt-1 text-sm text-muted-foreground">Try a different keyword or category.</p></div>
          )}
        </section>

        <section className="mt-10 flex flex-col gap-4 rounded-2xl border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold">Built a tool people can use?</h2><p className="mt-1 text-sm text-muted-foreground">Explore the creator marketplace and bring your system to NEXUS.</p></div>
          <Link href={`/${locale}/marketplace`}><Button variant="outline">Explore creator marketplace <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </section>
      </main>
    </div>
  );
}