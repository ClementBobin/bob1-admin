"use client";

import { useParams } from "next/navigation";
import { NotificationEditor } from "@/components/notification-editor";

export default function NotificationsEditPage() {
  const { id } = useParams<{ id: string }>();
  return <NotificationEditor notificationId={id} />;
}
