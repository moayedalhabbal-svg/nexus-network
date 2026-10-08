import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-context";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import { GlobalAICopilot } from "@/components/layout/ai-copilot";
import { MobileNavWrapper } from "@/components/layout/mobile-nav-wrapper";

export const metadata: Metadata = {
  title: "NEXUS | Build what's next",
  description: "The intelligent professional network that connects people through the projects, ideas, research and opportunities they care about.",
  openGraph: {
    title: "NEXUS | Build what's next",
    description: "Find the people, projects, and opportunities to build what comes next. Where ideas find teams.",
    url: "https://nexus.app",
    siteName: "NEXUS",
    images: [
      {
        url: "https://nexus.app/og.jpg",
        width: 1200,
        height: 630,
        alt: "NEXUS Network",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXUS | Build what's next",
    description: "The intelligent professional network for builders.",
    images: ["https://nexus.app/og.jpg"],
  },
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'ar' }];
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { setRequestLocale } = await import('next-intl/server');
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            {children}
            <GlobalAICopilot />
            <MobileNavWrapper />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
