"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, BadgeCheck, Check, ShieldCheck, ShoppingBag, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { getMarketplaceProductById } from "@/lib/marketplace-data";

export default function MarketplaceProductPage() {
  const params = useParams<{ id?: string; locale?: string }>();
  const locale = useLocale();
  const product = getMarketplaceProductById(params?.id ?? "");

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-3xl border border-dashed bg-card p-10 text-center shadow-sm">
            <h1 className="text-2xl font-black">Product not found</h1>
            <p className="mt-2 text-muted-foreground">This marketplace item no longer exists or is unavailable.</p>
            <Link href={`/${locale}/marketplace`} className="mt-6 inline-block">
              <Button>Back to marketplace</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
        <Link href={`/${locale}/marketplace`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className={`h-52 bg-gradient-to-br ${product.accent} p-5`}>
              <div className="flex items-center justify-between">
                {product.badge ? (
                  <Badge className="bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm">{product.badge}</Badge>
                ) : (
                  <span />
                )}
                <ShoppingBag className="h-5 w-5 text-white/90" />
              </div>
            </div>

            <div className="p-6 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant="outline">{product.category}</Badge>
                <span className="text-2xl font-black">${product.purchaseType === "subscription" ? product.monthlyPrice : product.price}{product.purchaseType === "subscription" && <span className="text-sm font-medium text-muted-foreground"> / month</span>}</span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{product.name}</h1>
              <p className="mt-3 text-base text-muted-foreground">{product.longDescription}</p>

              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{product.rating}</span>
                <span>({product.reviews} reviews)</span>
                <span className="mx-2">•</span>
                <span>by {product.seller}</span>
              </div>

              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">What’s included</h2>
                <div className="mt-4 space-y-3">
                  {product.includes.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border bg-background/60 p-3 text-sm">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border bg-card p-6 shadow-sm md:p-7">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Instant access • secure checkout
            </div>

            <div className="mt-5 rounded-2xl border bg-background/70 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold">${product.price}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Access</span>
                <span className="font-semibold">{product.purchaseType === "subscription" ? "Online software" : "Instant download"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Support</span>
                <span className="font-semibold">Included</span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {product.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  {feature}
                </div>
              ))}
            </div>

            <Link href={`/${locale}/marketplace/${product.id}/checkout`} className="mt-6 block">
              <Button className="w-full">{product.purchaseType === "subscription" ? `Choose plan · from $${product.monthlyPrice}/mo` : `Buy now for $${product.price}`}</Button>
            </Link>

            <Button variant="outline" className="mt-3 w-full">Add to wishlist</Button>
          </aside>
        </div>
      </main>
    </div>
  );
}
