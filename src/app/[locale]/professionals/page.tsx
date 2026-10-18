"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Star, Video, ArrowRight, BriefcaseBusiness } from "lucide-react";

const professionals = [
  {
    id: "p-1",
    name: "Selma Habib",
    field: "Product Strategy",
    expertise: "Roadmaps, founder coaching, business model clarity",
    rate: "$75 / 30 min",
    availability: "Available this week",
    rating: 4.9,
  },
  {
    id: "p-2",
    name: "Daniel Kors",
    field: "Software Engineering",
    expertise: "System design, mentoring, architecture reviews",
    rate: "$90 / 30 min",
    availability: "Next 2 days",
    rating: 4.8,
  },
  {
    id: "p-3",
    name: "Mira Ibrahim",
    field: "Career Coaching",
    expertise: "Career transitions, communications, interview prep",
    rate: "$60 / 30 min",
    availability: "Open slots this week",
    rating: 5.0,
  },
  {
    id: "p-4",
    name: "Jamal Naser",
    field: "Marketing & Growth",
    expertise: "Brand positioning, acquisition funnels, customer messaging",
    rate: "$80 / 30 min",
    availability: "Available tomorrow",
    rating: 4.7,
  },
  {
    id: "p-5",
    name: "Leah Royce",
    field: "Finance & Planning",
    expertise: "Budgeting, startup finance, decision-making frameworks",
    rate: "$95 / 30 min",
    availability: "This weekend",
    rating: 4.9,
  },
  {
    id: "p-6",
    name: "Farid Mendez",
    field: "Design & UX",
    expertise: "Product design critique, user flows, interaction improvement",
    rate: "$70 / 30 min",
    availability: "Open this afternoon",
    rating: 4.8,
  },
];

export default function ProfessionalsPage() {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("All");
  const locale = useLocale();

  const filtered = useMemo(() => {
    return professionals.filter((person) => {
      const matchesField = field === "All" || person.field === field;
      const matchesSearch = `${person.name} ${person.field} ${person.expertise}`.toLowerCase().includes(query.toLowerCase());
      return matchesField && matchesSearch;
    });
  }, [field, query]);

  const fields = ["All", ...Array.from(new Set(professionals.map((p) => p.field)))];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3 inline-flex items-center gap-2">
              <BriefcaseBusiness className="h-3.5 w-3.5" /> Professionals
            </Badge>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Consult a specialist in any field.</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Meet experienced professionals for high-signal guidance in career, product, design, engineering, finance, and more.
            </p>
          </div>

          <Link href={`/${locale}/professionals/new`} className="w-full max-w-xs lg:w-auto">
            <Button className="w-full gap-2 lg:w-auto">
              Become a consultant
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>

        <section className="mb-6 flex flex-col gap-4 rounded-3xl border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for a field or expert..."
              className="h-11 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {fields.map((option) => (
              <button
                key={option}
                onClick={() => setField(option)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  field === option ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((person) => (
            <Card key={person.id} className="border bg-card shadow-sm transition-transform hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">{person.name}</CardTitle>
                    <p className="mt-1 text-sm font-medium text-primary">{person.field}</p>
                  </div>
                  <div className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {person.rating}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">{person.expertise}</CardDescription>

                <div className="rounded-2xl border bg-background/70 p-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>{person.rate}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">{person.availability}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t pt-4">
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Video className="h-3.5 w-3.5 text-primary" />
                    1:1 video session
                  </span>
                  <Link href={`/${locale}/professionals/${person.id}/book`}>
                    <Button size="sm" className="gap-2">
                      Book session
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground">
            No professionals match your current filter.
          </div>
        )}
      </main>
    </div>
  );
}
