export type MarketplaceProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  seller: string;
  rating: number;
  reviews: number;
  description: string;
  badge?: string;
  accent: string;
  features: string[];
  longDescription: string;
  includes: string[];
  purchaseType?: "one-time" | "subscription";
  monthlyPrice?: number;
  annualPrice?: number;
};

export const marketplaceProducts: MarketplaceProduct[] = [
  {
    id: "focusflow-os",
    name: "FocusFlow OS",
    category: "Focus",
    price: 49,
    seller: "Maya Chen",
    rating: 4.9,
    reviews: 132,
    description: "A workflow system for planning deep work, batching tasks, and reducing context switching.",
    badge: "Best seller",
    accent: "from-violet-500 via-purple-500 to-indigo-500",
    features: ["AI planning", "Daily focus blocks", "Habit tracker"],
    longDescription:
      "FocusFlow OS helps founders and operators turn scattered tasks into a realistic weekly system. It combines planning rituals, energy tracking, and AI-backed suggestions so you can work on the right things at the right time.",
    includes: ["12-week planner", "Daily execution dashboard", "Focus habit tracker", "Team templates"],
  },
  {
    id: "signal-club",
    name: "Signal Club",
    category: "AI",
    price: 29,
    seller: "Nora Patel",
    rating: 4.8,
    reviews: 96,
    description: "A lightweight AI prompt library for research, meeting notes, and faster decision making.",
    accent: "from-cyan-500 via-sky-500 to-blue-600",
    features: ["Prompt pack", "Meeting summaries", "Research workflows"],
    longDescription:
      "Signal Club packs practical AI prompts into a curated workflow for professionals who want faster research, cleaner summaries, and sharper decision support without overengineering their stack.",
    includes: ["100 prompts", "Meeting note templates", "Research playbooks", "Decision frameworks"],
  },
  {
    id: "velocity-suite",
    name: "Velocity Suite",
    category: "Automation",
    price: 79,
    seller: "Andre Moss",
    rating: 5.0,
    reviews: 44,
    description: "Automation templates that turn repetitive work into systems your team can scale without friction.",
    badge: "New",
    accent: "from-emerald-500 via-teal-500 to-cyan-500",
    features: ["Zapier flows", "CRM automations", "Team SOPs"],
    longDescription:
      "Velocity Suite gives teams a library of operating automations designed to shave hours off admin work while keeping systems readable and reliable as the company grows.",
    includes: ["CRM automations", "Team SOP library", "Workflow checklists", "Launch templates"],
  },
  {
    id: "calm-edge",
    name: "CalmEdge Journal",
    category: "Wellbeing",
    price: 19,
    seller: "Leah Brooks",
    rating: 4.7,
    reviews: 210,
    description: "A productivity journal built to improve clarity, recovery, and effective execution over time.",
    accent: "from-amber-500 via-orange-500 to-rose-500",
    features: ["Weekly review", "Energy mapping", "Recovery prompts"],
    longDescription:
      "CalmEdge Journal combines reflection prompts, energy mapping, and weekly reviews to create a healthier rhythm for ambitious people who want sustainable momentum instead of burnout.",
    includes: ["Weekly planning pages", "Energy check-ins", "Recovery prompts", "Focus rituals"],
  },
  {
    id: "ops-lattice",
    name: "Ops Lattice",
    category: "Operations",
    price: 59,
    seller: "Theo Grant",
    rating: 4.9,
    reviews: 68,
    description: "A lean operating system for founders and small teams who want stronger throughput and fewer bottlenecks.",
    accent: "from-fuchsia-500 via-pink-500 to-rose-500",
    features: ["OKR dashboard", "Weekly planning", "Team rituals"],
    longDescription:
      "Ops Lattice lets small, growing teams convert strategy into consistent weekly execution through clarity, role ownership, and a simple operating rhythm.",
    includes: ["OKR dashboard", "Team rituals", "Ownership tracker", "Delivery scorecards"],
  },
  {
    id: "done-stack",
    name: "DoneStack",
    category: "Execution",
    price: 35,
    seller: "Sofia Rami",
    rating: 4.8,
    reviews: 118,
    description: "A simple execution framework for turning priorities into weekly momentum and measurable wins.",
    accent: "from-slate-700 via-slate-800 to-zinc-900",
    features: ["Priority matrix", "Scorecards", "Weekly cadence"],
    longDescription:
      "DoneStack helps teams choose the next important move, track meaningful progress, and keep momentum without turning execution into a reporting ritual.",
    includes: ["Priority matrix", "Delivery scorecards", "Weekly review templates", "Momentum tracker"],
  },
  {
    id: "signaldesk-crm",
    name: "SignalDesk CRM",
    category: "Operations",
    price: 24,
    seller: "NEXUS Demo Studio",
    rating: 4.8,
    reviews: 38,
    description: "A lightweight relationship workspace for founders managing customers, partners, and pipeline.",
    badge: "SaaS · Demo listing",
    accent: "from-sky-600 via-cyan-600 to-teal-500",
    features: ["Contact workspace", "Pipeline views", "Team notes"],
    longDescription: "SignalDesk CRM keeps customer conversations, partner follow-ups, and pipeline work in one clear workspace. This listing demonstrates how software subscriptions will appear in the NEXUS directory.",
    includes: ["Unlimited contacts", "Pipeline and follow-up boards", "Shared team notes", "Demo subscription access"],
    purchaseType: "subscription",
    monthlyPrice: 24,
    annualPrice: 240,
  },
  {
    id: "sprintroom",
    name: "Sprintroom",
    category: "Execution",
    price: 18,
    seller: "NEXUS Demo Studio",
    rating: 4.9,
    reviews: 24,
    description: "A focused planning and delivery space for small product teams and independent builders.",
    badge: "SaaS · Demo listing",
    accent: "from-emerald-600 via-teal-600 to-cyan-600",
    features: ["Sprint planning", "Task boards", "Progress reports"],
    longDescription: "Sprintroom gives small teams a practical home for planning work, tracking delivery, and sharing progress without the overhead of a complex project suite.",
    includes: ["Unlimited active boards", "Sprint planning templates", "Team progress reports", "Demo subscription access"],
    purchaseType: "subscription",
    monthlyPrice: 18,
    annualPrice: 180,
  },
  {
    id: "metricline",
    name: "Metricline",
    category: "Analytics",
    price: 32,
    seller: "NEXUS Demo Studio",
    rating: 4.7,
    reviews: 19,
    description: "A simple metrics hub that helps early teams understand activation, retention, and growth.",
    badge: "SaaS · Demo listing",
    accent: "from-amber-500 via-orange-500 to-rose-500",
    features: ["Metric dashboards", "Weekly snapshots", "Team sharing"],
    longDescription: "Metricline brings a small set of meaningful product and business metrics into one shareable view, helping early teams spot changes and make better weekly decisions.",
    includes: ["Core metrics dashboards", "Weekly snapshots", "Shared team reports", "Demo subscription access"],
    purchaseType: "subscription",
    monthlyPrice: 32,
    annualPrice: 320,
  },
];

export function getMarketplaceProductById(id: string) {
  return marketplaceProducts.find((product) => product.id === id);
}
