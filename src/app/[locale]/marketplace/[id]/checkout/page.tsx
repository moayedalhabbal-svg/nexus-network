"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { getMarketplaceProductById } from "@/lib/marketplace-data";

export default function MarketplaceCheckoutPage() {
  const params = useParams<{ id?: string }>();
  const locale = useLocale();
  const router = useRouter();
  const product = useMemo(() => getMarketplaceProductById(params?.id ?? "") ?? null, [params?.id]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [submitted, setSubmitted] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const isSubscription = product?.purchaseType === "subscription";
  const amount = isSubscription
    ? billingPeriod === "annual" ? product?.annualPrice : product?.monthlyPrice
    : product?.price;

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto max-w-xl px-4 py-10">
          <div className="rounded-3xl border border-dashed bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-black">Product not found</h1>
            <Link href={`/${locale}/marketplace`} className="mt-6 inline-block">
              <Button>Back to marketplace</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto max-w-5xl px-4 py-8 md:py-10">
        <Link href={`/${locale}/marketplace/${product.id}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to product
        </Link>

        {!submitted ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <form onSubmit={handleSubmit} className="rounded-3xl border bg-card p-6 shadow-sm md:p-7">
              <h1 className="text-2xl font-black tracking-tight">Checkout</h1>
              <p className="mt-2 text-sm text-muted-foreground">{isSubscription ? "Choose a billing plan to start your software subscription." : "Complete your purchase securely and get instant access."}</p>

              {isSubscription && (
                <div className="mt-5 rounded-xl border border-sky-500/25 bg-sky-500/5 p-3 text-sm text-muted-foreground">
                  Demo checkout only. No payment will be collected and no real subscription will be created.
                </div>
              )}

              <div className="mt-6 space-y-4">
                {isSubscription && (
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Billing period</legend>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setBillingPeriod("monthly")} aria-pressed={billingPeriod === "monthly"} className={`rounded-xl border px-3 py-3 text-left text-sm ${billingPeriod === "monthly" ? "border-primary bg-primary/8 text-primary" : "bg-background text-muted-foreground"}`}>
                        <span className="block font-semibold">Monthly</span><span>${product.monthlyPrice} / month</span>
                      </button>
                      <button type="button" onClick={() => setBillingPeriod("annual")} aria-pressed={billingPeriod === "annual"} className={`rounded-xl border px-3 py-3 text-left text-sm ${billingPeriod === "annual" ? "border-primary bg-primary/8 text-primary" : "bg-background text-muted-foreground"}`}>
                        <span className="block font-semibold">Annual</span><span>${product.annualPrice} / year</span>
                      </button>
                    </div>
                  </fieldset>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full name</label>
                  <input className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="Aisha Ibrahim" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="aisha@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment method</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={() => setPaymentMethod("card")} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${paymentMethod === "card" ? "border-primary bg-primary/8 text-primary" : "bg-background text-muted-foreground"}`}>
                      <CreditCard className="h-4 w-4" /> Card
                    </button>
                    <button type="button" onClick={() => setPaymentMethod("wallet")} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${paymentMethod === "wallet" ? "border-primary bg-primary/8 text-primary" : "bg-background text-muted-foreground"}`}>
                      <span className="h-2.5 w-2.5 rounded-full bg-current" /> Wallet
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Card number</label>
                  <input className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="•••• 4242  •••• 4242" />
                </div>
              </div>

              <Button type="submit" className="mt-6 w-full">{isSubscription ? `Start demo subscription · $${amount}/${billingPeriod === "annual" ? "year" : "month"}` : `Pay $${product.price}`}</Button>
            </form>

            <aside className="rounded-3xl border bg-card p-6 shadow-sm md:p-7">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> Secure checkout
              </div>

              <div className="mt-5 rounded-2xl border bg-background/70 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Product</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Seller</span>
                  <span className="font-medium">{product.seller}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">${amount}{isSubscription ? ` / ${billingPeriod === "annual" ? "year" : "month"}` : ""}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {product.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge className="bg-primary/10 text-primary">Included</Badge>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black">{isSubscription ? "Demo subscription started" : "Purchase complete"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{isSubscription ? `${product.name} is ready to explore in this demo. No payment was collected.` : `You bought ${product.name}. Your access is ready and a receipt has been sent to your email.`}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={`/${locale}/${isSubscription ? "software" : "marketplace"}`}>
                <Button variant="outline">Back to {isSubscription ? "software" : "marketplace"}</Button>
              </Link>
              <Button onClick={() => router.push(`/${locale}/feed`)}>Go to feed</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
