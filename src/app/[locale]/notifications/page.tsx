"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Bell, ArrowRight, CheckCheck, Clock3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { SEED_NOTIFICATIONS } from "@/lib/seed-data";

export default function NotificationsPage() {
  const { user } = useAuth();
  const locale = useLocale();
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);

  const visibleNotifications = useMemo(() => {
    const targetUserId = user?.id ?? "user-1";
    return notifications
      .filter((notification) => notification.userId === targetUserId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, user]);

  const markAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Bell className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.2em]">Updates</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          </div>

          <Button variant="outline" onClick={markAllAsRead} className="w-fit">
            <CheckCheck className="me-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        <div className="space-y-4">
          {visibleNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                You are all caught up. New updates will appear here.
              </CardContent>
            </Card>
          ) : (
            visibleNotifications.map((notification) => {
              const href = notification.actionUrl.startsWith("/")
                ? `/${locale}${notification.actionUrl}`
                : notification.actionUrl;

              return (
                <Card
                  key={notification.id}
                  className={`overflow-hidden border ${notification.read ? "border-border/60" : "border-primary/30 bg-primary/3"}`}
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {!notification.read && <Badge variant="secondary">New</Badge>}
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{notification.type.replace(/_/g, " ")}</span>
                      </div>
                      <CardTitle className="text-xl">{notification.title}</CardTitle>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="mb-4 text-sm leading-6 text-foreground/80">{notification.message}</p>

                    <Link href={href} className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
