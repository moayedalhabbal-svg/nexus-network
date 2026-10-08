"use client";

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';

export function LanguageSelector() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const locales = [
    { code: 'en', label: 'English', rtl: false },
    { code: 'ar', label: 'العربية', rtl: true },
    { code: 'fr', label: 'Français', rtl: false }
  ];

  const handleLanguageChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="text-muted-foreground hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border bg-card shadow-xl z-50 p-2 animate-fade-in">
            {locales.map((l) => (
              <button
                key={l.code}
                onClick={() => handleLanguageChange(l.code)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  locale === l.code
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent text-foreground"
                }`}
                dir={l.rtl ? 'rtl' : 'ltr'}
              >
                <span>{l.label}</span>
                {locale === l.code && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
