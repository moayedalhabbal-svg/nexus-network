"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CalendarRange, CheckCircle2, Clock3, Sparkles } from "lucide-react";

export default function HostWorkshopPage() {
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
        <Link href={`/${locale}/workshops`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to workshops
        </Link>

        {!submitted ? (
          <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Host a workshop
              </div>
              <h1 className="text-3xl font-black tracking-tight">Share knowledge with your community.</h1>
              <p className="mt-2 text-sm text-muted-foreground">Create a workshop for students, founders, and professionals in your field.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Workshop title</label>
                  <Input defaultValue="AI Leadership for New Builders" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input defaultValue="University Subjects" />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" defaultValue="2026-10-27" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" defaultValue="18:30" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea className="min-h-28 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="Help people turn their ideas into practical systems, frameworks, and momentum for real results." />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border bg-background/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium"><CalendarRange className="h-4 w-4 text-primary" /> Format</div>
                  <p className="text-sm text-muted-foreground">Live cohort session · 60 minutes</p>
                </div>
                <div className="rounded-2xl border bg-background/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Clock3 className="h-4 w-4 text-primary" /> Price</div>
                  <p className="text-sm text-muted-foreground">Free or paid session setup</p>
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">Submit workshop</Button>
            </form>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center shadow-sm md:p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black">Workshop submitted</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your workshop request is live. NEXUS will review it and publish it to learners in the next 24 hours.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={`/${locale}/workshops`}>
                <Button variant="outline">View workshops</Button>
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
