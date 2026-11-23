export type NotificationDto = {
  id: string;
  title: string;
  body: string;
  dataJson: string | null;
  createdAtUtc: string;
  isRead: boolean;
  expiresAtUtc: string | null;
  recurring: boolean;
  startup: boolean;
};

/** One row of the admin history: a notification sent once, with how many people got it and how many read it. */
export type AdminNotificationDto = {
  id: string;
  title: string;
  body: string;
  type: string;
  dataJson: string | null;
  createdAtUtc: string;
  expiresAtUtc: string | null;
  recurring: boolean;
  startup: boolean;
  recipientCount: number;
  readCount: number;
  recurrenceHours: number | null;
  lastSentAtUtc: string | null;
};

export type NotificationRecipientDto = {
  userId: string;
  deliveredAtUtc: string;
  readAtUtc: string | null;
};

export type BroadcastResponse = { recipients: number };
