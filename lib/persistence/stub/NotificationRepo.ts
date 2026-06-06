import { Notification } from "@/domain/objects/Notification";
import { NotificationDataAccess } from "@/lib/persistence/interfaces/NotificationDataAccess";

export class NotificationRepo implements NotificationDataAccess {
    private notifications: Notification[];

    constructor(initialNotifications: Notification[] = []) {
        this.notifications = [...initialNotifications];
    }

    getAllNotifications(): Notification[] {
        return [...this.notifications];
    }

    getNotificationById(id: number): Notification | null {
        return (
            this.notifications.find(
                (notification) => notification.getEventID() === id
            ) ?? null
        );
    }

    insertNotification(notification: Notification): string | null {
        if (
            notification.getEventID() !== -1 &&
            this.getNotificationById(notification.getEventID())
        ) {
            return "Duplicate notification.";
        }

        if (notification.getEventID() === -1) {
            notification.setEventID(this.getNextId());
        }

        this.notifications.push(notification);
        return null;
    }

    updateNotification(notification: Notification): string | null {
        const index = this.notifications.findIndex(
            (item) => item.getEventID() === notification.getEventID()
        );

        if (index === -1) {
            return "Notification not found.";
        }

        this.notifications[index] = notification;
        return null;
    }

    deleteNotification(id: number): string | null {
        const index = this.notifications.findIndex(
            (notification) => notification.getEventID() === id
        );

        if (index === -1) {
            return "Notification not found.";
        }

        this.notifications.splice(index, 1);
        return null;
    }

    private getNextId(): number {
        if (this.notifications.length === 0) {
            return 1;
        }

        return Math.max(
            ...this.notifications.map((notification) => notification.getEventID())
        ) + 1;
    }
}