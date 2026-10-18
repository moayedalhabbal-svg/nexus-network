"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, CreditCard, Video } from "lucide-react";

const workshopCatalog = [
  {
    id: "ws-1",
    title: "AI for Everyday Problem Solving",
    host: "Dr. Amina Reza",
    category: "University Subjects",
    price: "Free",
    duration: "60 min",
    description: "Learn how to apply AI tools to university assignments, research, and personal productivity without overcomplicating the workflow.",
    slots: ["Sat, 10:00 AM", "Sat, 12:30 PM", "Sun, 9:00 AM"],
  },
  {
    id: "ws-2",
    title: "Finding Your Career Direction",
    host: "Nadia Musa",
    category: "Life & Career",
    price: "$25",
    duration: "90 min",
    description: "A practical workshop on clarifying strengths, identifying opportunities, and building your next move with more confidence.",
    slots: ["Thu, 7:00 PM", "Fri, 6:30 PM", "Sat, 11:00 AM"],
  },
  {
    id: "ws-3",
    title: "Personal Development for Consistency",
    host: "Omar Haddad",
    category: "Personal Growth",
    price: "$30",
    duration: "75 min",
    description: "Build routines that sustain momentum, reduce overwhelm, and create long-term personal performance without burnout.",
    slots: ["Sun, 9:30 AM", "Mon, 6:00 PM", "Tue, 8:00 AM"],
  },
  {
    id: "ws-4",
    title: "Academic Research Bootcamp",
    host: "Prof. Lina Shah",
    category: "University Subjects",
    price: "$40",
    duration: "120 min",
    description: "Turn a messy idea into a structured research plan, methodology, and execution roadmap that actually holds up.",
    slots: ["Tue, 6:00 PM", "Wed, 5:30 PM", "Thu, 8:00 AM"],
  },
  {
    id: "ws-5",
    title: "Speaking with Clarity and Confidence",
    host: "Rayan Cole",
    category: "Communication",
    price: "$35",
    duration: "60 min",
    description: "Learn how to structure stories, speak clearly under pressure, and make your message stick in interviews, panels, and meetings.",
    slots: ["Fri, 5:00 PM", "Sat, 1:00 PM", "Mon, 7:30 PM"],
  },
  {
    id: "ws-6",
    title: "Productive Habits for Students",
    host: "Selma Idris",
    category: "Personal Growth",
    price: "Free",
    duration: "45 min",
    description: "A realistic workshop on time planning, energy management, and study systems that actually fit busy student life.",
    slots: ["Mon, 8:00 PM", "Wed, 7:00 PM", "Sun, 4:00 PM"],
  },
];

export default function WorkshopReservePage() {
  const params = useParams<{ id?: string; locale?: string }>();
  const router = useRouter();
  const locale = useLocale();
  const workshop = useMemo(
    () => workshopCatalog.find((item) => item.id === params.id) ?? workshopCatalog[0],
    [params.id],
  );
  const [selectedSlot, setSelectedSlot] = useState(workshop.slots[0]);
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
        <Link href={`/${locale}/workshops`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to workshops
        </Link>

        {!submitted ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-7">
              <Badge className="mb-3 inline-flex items-center gap-2">{workshop.category}</Badge>
              <h1 className="text-3xl font-black tracking-tight">{workshop.title}</h1>
              <p className="mt-3 text-sm text-muted-foreground">{workshop.description}</p>

              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Hosted by {workshop.host}</div>
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> {workshop.duration}</div>
                <div className="flex items-center gap-2"><Video className="h-4 w-4 text-primary" /> Live workshop experience</div>
              </div>

              <div className="mt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Choose a time</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {workshop.slots.map((slot) => (
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
              <h2 className="text-xl font-black">Reserve your seat</h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border bg-background/70 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Workshop</span>
                    <span className="font-medium">{workshop.title}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Selected slot</span>
                    <span className="font-medium">{selectedSlot}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">{workshop.price}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Full name</label>
                  <input className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="Aisha Ibrahim" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="aisha@example.com" />
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

                <Button type="submit" className="w-full">Pay {workshop.price}</Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black">Seat reserved successfully</h2>
            <p className="mt-2 text-sm text-muted-foreground">You’re booked for {workshop.title} on {selectedSlot}. A confirmation email is on the way.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={`/${locale}/workshops`}>
                <Button variant="outline">Back to workshops</Button>
              </Link>
              <Button onClick={() => router.push(`/${locale}/feed`)}>Go to feed</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
