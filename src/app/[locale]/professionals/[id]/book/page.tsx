"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, CreditCard, Video } from "lucide-react";

const professionalCatalog = [
  {
    id: "p-1",
    name: "Selma Habib",
    field: "Product Strategy",
    rate: "$75 / 30 min",
    availability: "Available this week",
    expertise: "Roadmaps, founder coaching, business model clarity",
    slots: ["Tue, 4:00 PM", "Wed, 1:30 PM", "Thu, 10:00 AM"],
  },
  {
    id: "p-2",
    name: "Daniel Kors",
    field: "Software Engineering",
    rate: "$90 / 30 min",
    availability: "Next 2 days",
    expertise: "System design, mentoring, architecture reviews",
    slots: ["Wed, 6:00 PM", "Thu, 5:00 PM", "Fri, 3:30 PM"],
  },
  {
    id: "p-3",
    name: "Mira Ibrahim",
    field: "Career Coaching",
    rate: "$60 / 30 min",
    availability: "Open slots this week",
    expertise: "Career transitions, communications, interview prep",
    slots: ["Mon, 5:30 PM", "Tue, 12:00 PM", "Fri, 9:00 AM"],
  },
  {
    id: "p-4",
    name: "Jamal Naser",
    field: "Marketing & Growth",
    rate: "$80 / 30 min",
    availability: "Available tomorrow",
    expertise: "Brand positioning, acquisition funnels, customer messaging",
    slots: ["Thu, 2:00 PM", "Fri, 11:00 AM", "Sat, 3:00 PM"],
  },
  {
    id: "p-5",
    name: "Leah Royce",
    field: "Finance & Planning",
    rate: "$95 / 30 min",
    availability: "This weekend",
    expertise: "Budgeting, startup finance, decision-making frameworks",
    slots: ["Sat, 11:30 AM", "Sun, 2:00 PM", "Mon, 9:00 AM"],
  },
  {
    id: "p-6",
    name: "Farid Mendez",
    field: "Design & UX",
    rate: "$70 / 30 min",
    availability: "Open this afternoon",
    expertise: "Product design critique, user flows, interaction improvement",
    slots: ["Today, 3:00 PM", "Tomorrow, 9:30 AM", "Wed, 12:00 PM"],
  },
];

export default function ProfessionalBookPage() {
  const params = useParams<{ id?: string; locale?: string }>();
  const router = useRouter();
  const locale = useLocale();
  const expert = useMemo(
    () => professionalCatalog.find((person) => person.id === params.id) ?? professionalCatalog[0],
    [params.id],
  );
  const [selectedSlot, setSelectedSlot] = useState(expert.slots[0]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto max-w-5xl px-4 py-8 md:py-10">
        <Link href={`/${locale}/professionals`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to professionals
        </Link>

        {!submitted ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-7">
              <Badge className="mb-3 inline-flex items-center gap-2">{expert.field}</Badge>
              <h1 className="text-3xl font-black tracking-tight">Book a session with {expert.name}</h1>
              <p className="mt-3 text-sm text-muted-foreground">{expert.expertise}</p>

              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {expert.availability}</div>
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> {expert.rate}</div>
                <div className="flex items-center gap-2"><Video className="h-4 w-4 text-primary" /> 1:1 video session</div>
              </div>

              <div className="mt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Pick a time</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {expert.slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-2xl border px-3 py-3 text-left text-sm transition-colors ${
                        selectedSlot === slot ? "border-primary bg-primary/8 text-primary" : "bg-background text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl border bg-card p-6 shadow-sm md:p-7">
              <h2 className="text-xl font-black">Payment & booking</h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border bg-background/70 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expert</span>
                    <span className="font-medium">{expert.name}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Selected slot</span>
                    <span className="font-medium">{selectedSlot}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{expert.rate}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Full name</label>
                  <input className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="Rami Hassan" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="rami@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment method</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={() => setPaymentMethod("card")} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm ${paymentMethod === "card" ? "border-primary bg-primary/8 text-primary" : "bg-background text-muted-foreground"}`}>
                      <CreditCard className="h-4 w-4" /> Card
                    </button>
                    <button type="button" onClick={() => setPaymentMethod("wallet")} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm ${paymentMethod === "wallet" ? "border-primary bg-primary/8 text-primary" : "bg-background text-muted-foreground"}`}>
                      <span className="h-2.5 w-2.5 rounded-full bg-current" /> Wallet
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full">Pay {expert.rate}</Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black">Session booked</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your 1:1 meeting with {expert.name} is confirmed for {selectedSlot}. You’ll receive the video link and reminder by email.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={`/${locale}/professionals`}>
                <Button variant="outline">Back to professionals</Button>
              </Link>
              <Button onClick={() => router.push(`/${locale}/feed`)}>Go to feed</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
