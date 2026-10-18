"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpenText, CalendarDays, Search, Sparkles, Users, Clock3, ArrowRight } from "lucide-react";

const workshops = [
  {
    id: "ws-1",
    title: "AI for Everyday Problem Solving",
    category: "University Subjects",
    host: "Dr. Amina Reza",
    audience: "Students + early career builders",
    format: "Live cohort session",
    time: "Sat · 10:00 AM",
    price: "Free",
    description: "Learn how to apply AI tools to university assignments, research, and personal productivity without overcomplicating the workflow.",
  },
  {
    id: "ws-2",
    title: "Finding Your Career Direction",
    category: "Life & Career",
    host: "Nadia Musa",
    audience: "Students and career switchers",
    format: "Interactive workshop",
    time: "Thu · 7:00 PM",
    price: "$25",
    description: "A practical workshop on clarifying strengths, identifying opportunities, and building your next move with more confidence.",
  },
  {
    id: "ws-3",
    title: "Personal Development for Consistency",
    category: "Personal Growth",
    host: "Omar Haddad",
    audience: "Professionals and creatives",
    format: "Small-group session",
    time: "Sun · 9:30 AM",
    price: "$30",
    description: "Build routines that sustain momentum, reduce overwhelm, and create long-term personal performance without burnout.",
  },
  {
    id: "ws-4",
    title: "Academic Research Bootcamp",
    category: "University Subjects",
    host: "Prof. Lina Shah",
    audience: "Graduate students",
    format: "Hands-on sprint",
    time: "Tue · 6:00 PM",
    price: "$40",
    description: "Turn a messy idea into a structured research plan, methodology, and execution roadmap that actually holds up.",
  },
  {
    id: "ws-5",
    title: "Speaking with Clarity and Confidence",
    category: "Communication",
    host: "Rayan Cole",
    audience: "Founders and professionals",
    format: "Live workshop",
    time: "Fri · 5:00 PM",
    price: "$35",
    description: "Learn how to structure stories, speak clearly under pressure, and make your message stick in interviews, panels, and meetings.",
  },
  {
    id: "ws-6",
    title: "Productive Habits for Students",
    category: "Personal Growth",
    host: "Selma Idris",
    audience: "University students",
    format: "Guided cohort",
    time: "Mon · 8:00 PM",
    price: "Free",
    description: "A realistic workshop on time planning, energy management, and study systems that actually fit busy student life.",
  },
];

const categories = ["All", "University Subjects", "Life & Career", "Personal Growth", "Communication"];

export default function WorkshopsPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const locale = useLocale();

  const filtered = useMemo(() => {
    return workshops.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const haystack = `${item.title} ${item.host} ${item.description} ${item.category}`.toLowerCase();
      const matchesSearch = haystack.includes(query.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [query, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3 inline-flex items-center gap-2">
              <BookOpenText className="h-3.5 w-3.5" /> Workshops
            </Badge>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Growth sessions for learning, life, and real progress.</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Discover practical workshops led by tutors, professionals, and mentors across university subjects, personal development, and life skills.
            </p>
          </div>

          <Link href={`/${locale}/workshops/new`} className="w-full max-w-xs lg:w-auto">
            <Button className="w-full gap-2 lg:w-auto">
              Host a workshop
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
              placeholder="Search workshops..."
              className="h-11 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selectedCategory === category ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="group overflow-hidden border bg-card shadow-sm transition-transform hover:-translate-y-1">
              <div className="border-b bg-gradient-to-r from-primary/10 via-background to-background p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em]">
                    {item.category}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground">{item.price}</span>
                </div>
                <CardTitle className="text-xl font-semibold leading-snug">{item.title}</CardTitle>
              </div>

              <CardContent className="space-y-4 p-4">
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">{item.description}</CardDescription>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{item.host}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>{item.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-primary" />
                    <span>{item.format}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    {item.audience}
                  </div>
                  <Link href={`/${locale}/workshops/${item.id}/reserve`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      Reserve seat
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
            No workshops match your current search.
          </div>
        )}
      </main>
    </div>
  );
}
