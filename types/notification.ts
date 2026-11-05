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

export type BroadcastResponse = { recipients: number };
