"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/navbar";
import { marketplaceProducts } from "@/lib/marketplace-data";

const categories = ["all", "AI", "Focus", "Automation", "Wellbeing", "Operations", "Execution"];

export default function MarketplacePage() {
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts = useMemo(() => {
    return marketplaceProducts.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.features.some((feature) => feature.toLowerCase().includes(query.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <section className="rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5" />
                NEXUS Marketplace
              </Badge>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                Buy the tools that make work feel easier.
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Discover practical products built to improve focus, execution, and daily effectiveness for founders, operators, and ambitious teams.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href={`/${locale}/onboarding`}>
                <Button className="h-11 px-5">
                  Sell your product
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="rounded-2xl border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                2,300+ productivity tools sold
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { label: "Top-rated tools", value: "4.9/5 average" },
            { label: "Active sellers", value: "1.7k creators" },
            { label: "Impact-driven", value: "Built for real work" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border bg-card p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search productivity tools, prompts, systems..."
                className="h-11 pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    activeCategory === category
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {category === "all" ? "All" : category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Featured products</h2>
            <span className="text-sm text-muted-foreground">{filteredProducts.length} results</span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <Link key={product.id} href={`/${locale}/marketplace/${product.id}`} className="group block">
                  <Card className="h-full overflow-hidden border bg-card shadow-sm transition-transform hover:-translate-y-1">
                    <div className={`h-28 bg-gradient-to-br ${product.accent} p-4`}>
                      <div className="flex items-center justify-between">
                        {product.badge ? (
                          <Badge variant="secondary" className="bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm">
                            {product.badge}
                          </Badge>
                        ) : (
                          <span className="invisible">.</span>
                        )}
                        <Sparkles className="h-5 w-5 text-white/90" />
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="outline">{product.category}</Badge>
                        <span className="text-lg font-bold">${product.price}</span>
                      </div>
                      <CardTitle className="mt-2 text-xl">{product.name}</CardTitle>
                      <CardDescription className="mt-1">{product.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-foreground">{product.rating}</span>
                        <span>({product.reviews} reviews)</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {product.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-[11px] font-normal">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-t pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Sold by</p>
                        <p className="font-medium">{product.seller}</p>
                      </div>
                      <Button size="sm" asChild>
                        <span>View product</span>
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
              <Zap className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No matches yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another keyword or switch to a different category.
              </p>
            </div>
          )}
        </section>

        <section className="mt-12 rounded-3xl border bg-gradient-to-r from-primary/5 via-background to-primary/5 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <Badge variant="secondary" className="mb-3 inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Sell with confidence
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Turn your workflow into a product.</h2>
              <p className="mt-3 text-muted-foreground">
                If you have a system, prompt pack, template, or productivity tool that helps people work smarter, NEXUS is the place to sell it.
              </p>
            </div>

            <Link href={`/${locale}/onboarding`}>
              <Button size="lg" variant="outline">
                Start selling
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
