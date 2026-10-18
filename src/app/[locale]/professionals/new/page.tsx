"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Sparkles } from "lucide-react";

export default function NewConsultantPage() {
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Link href={`/${locale}/professionals`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to professionals
        </Link>

        {!submitted ? (
          <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <BriefcaseBusiness className="h-3.5 w-3.5" /> Consultant profile
              </div>
              <h1 className="text-3xl font-black tracking-tight">Join the expert network.</h1>
              <p className="mt-2 text-sm text-muted-foreground">Offer 1:1 sessions in your field and help people move faster with expert guidance.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full name</label>
                  <Input defaultValue="Maya Hassan" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Field</label>
                  <Input defaultValue="Product Strategy" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expertise</label>
                <Input defaultValue="Roadmaps, founder coaching, market clarity" />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session rate</label>
                  <Input defaultValue="$85 / 30 min" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Availability</label>
                  <Input defaultValue="This week" />
                </div>
              </div>

              <div className="rounded-2xl border bg-background/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-primary" /> Why people should book you</div>
                <textarea className="min-h-28 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="I help early-stage teams sharpen their product direction, reduce decision overload, and build sharper launch plans." />
              </div>

              <Button type="submit" className="w-full md:w-auto">Submit profile</Button>
            </form>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center shadow-sm md:p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black">Profile submitted</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your consultation profile is now in review and will be published to the network once approved.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={`/${locale}/professionals`}>
                <Button variant="outline">View professionals</Button>
              </Link>
              <Link href={`/${locale}/feed`}>
                <Button>Go to feed</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
