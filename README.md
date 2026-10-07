# NEXUS - Professional Collaboration Network

NEXUS is a next-generation professional collaboration network built for builders. It moves beyond static resumes and noisy feeds to focus on what you can build, the skills you have, and the impact you want to make.

## Getting Started

To run the application locally in development mode:

```bash
cd /Users/mouayad/.gemini/antigravity-ide/scratch/nexus
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

1. **Intelligent Discovery (`/discover`)**: A powerful search and discovery engine for projects and people.
2. **AI Match Dashboard (`/matches`)**: View your personalized recommendations with transparent explanations of *why* you matched based on skills, intent, and complementarity.
3. **Project Workspaces (`/projects/[id]`)**: Deep-dive into project needs, team, and milestones.
4. **Seamless Onboarding (Phase 2)**: Progressive profiling to capture skills, intent, and availability.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: custom Shadcn-inspired accessible components
- **Database**: Supabase PostgreSQL (SQL migrations available in `supabase/migrations`)

## Demo Data

The app is seeded with a comprehensive set of highly realistic professional data to demonstrate the matching capabilities immediately without needing an external API key.

## Next Steps

1. **Phase 2: Profiles & Onboarding**: Implement the 10-step progressive onboarding and full profile system.
2. **Database Integration**: Apply the Supabase migrations and connect the Next.js app to the database.
