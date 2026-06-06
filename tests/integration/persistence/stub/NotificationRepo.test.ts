import { Notification } from "@/domain/objects/Notification";
import { NotificationRepo } from "@/lib/persistence/stub/NotificationRepo";
import { notificationStubDB } from "@/tests/stub/NotificationStubDB";
import { leadStubDB } from "@/tests/stub/LeadStubDB";

describe("NotificationRepo", () => {
    test("gets all notifications", () => {
        const repo = new NotificationRepo(notificationStubDB);

        expect(repo.getAllNotifications().length).toBe(notificationStubDB.length);
    });

    test("gets notification by id", () => {
        const repo = new NotificationRepo(notificationStubDB);

        const notification = repo.getNotificationById(1);

        expect(notification).not.toBeNull();
        expect(notification?.getEventID()).toBe(1);
    });

    test("inserts a new notification", () => {
        const repo = new NotificationRepo(notificationStubDB);

        const notification = new Notification(
            leadStubDB[0],
            "New notification",
            new Date()
        );

        const result = repo.insertNotification(notification);

        expect(result).toBeNull();
        expect(repo.getAllNotifications().length).toBe(notificationStubDB.length + 1);
        expect(notification.getEventID()).toBeGreaterThan(0);
    });

    test("updates an existing notification", () => {
        const repo = new NotificationRepo(notificationStubDB);

        const notification = repo.getNotificationById(1)!;
        notification.setTitle("Updated Notification");

        const result = repo.updateNotification(notification);

        expect(result).toBeNull();
        expect(repo.getNotificationById(1)?.getTitle()).toBe("Updated Notification");
    });

    test("deletes an existing notification", () => {
        const repo = new NotificationRepo(notificationStubDB);

        const result = repo.deleteNotification(1);

        expect(result).toBeNull();
        expect(repo.getNotificationById(1)).toBeNull();
    });
});