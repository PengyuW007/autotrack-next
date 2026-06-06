import { Notification } from "@/domain/objects/Notification";

export interface NotificationDataAccess {
    getAllNotifications(): Notification[];
    getNotificationById(id: number): Notification | null;
    insertNotification(notification: Notification): string | null;
    updateNotification(notification: Notification): string | null;
    deleteNotification(id: number): string | null;
}