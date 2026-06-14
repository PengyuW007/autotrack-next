export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Notification } from "@/domain/objects/Notification";
import { NotificationRepo } from "@/lib/persistence/real/supabase/NotificationRepo";

export default async function TestNotificationRepoPage() {
    const repo = new NotificationRepo();

    const testNotification = new Notification(
        null,
        "Follow-up reminder notification",
        new Date()
    );

    const insertError =
        await repo.insertNotification(testNotification);

    const insertedNotification =
        await repo.getNotificationById(testNotification.getEventID());

    testNotification.setTitle("Updated follow-up reminder notification");

    const updateError =
        await repo.updateNotification(testNotification);

    const updatedNotification =
        await repo.getNotificationById(testNotification.getEventID());

    const deleteError =
        await repo.deleteNotification(testNotification.getEventID());

    const deletedNotification =
        await repo.getNotificationById(testNotification.getEventID());

    const allNotifications =
        await repo.getAllNotifications();

    return (
        <main className="p-6">
            <h1>Notification Repo Test</h1>

            <pre>
                {JSON.stringify(
                    {
                        insertedNotificationId: testNotification.getEventID(),
                        insertError,
                        insertedNotification,
                        updateError,
                        updatedNotification,
                        deleteError,
                        deletedNotification,
                        totalNotifications: allNotifications.length,
                        allNotifications,
                    },
                    null,
                    2
                )}
            </pre>
        </main>
    );
}