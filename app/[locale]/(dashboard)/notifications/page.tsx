import NotificationContent from "@/components/notifications/NotificationsContent";
import React from "react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NotificationsPage({ params }: PageProps) {
  const { locale } = await params;
  return <NotificationContent/>;
}
