import { Lead } from "@/domain/objects/Lead";
import { Notification } from "@/domain/objects/Notification";

describe("Notification", () => {
    test("creates notification from event base class", () => {
        const lead = new Lead({ leadID: 1, firstName: "John" });
        const date = new Date("2026-06-01");

        const notification = new Notification(
            lead,
            "Missed call",
            date,
            20
        );

        expect(notification.getEventID()).toBe(20);
        expect(notification.getTitle()).toBe("Missed call");
        expect(notification.getDate()).toEqual(date);
        expect(notification.getLead()).toBe(lead);
        expect(notification.getLeadID()).toBe(1);
    });

    test("returns 0 leadID when lead is null", () => {
        const notification = new Notification(
            null,
            "System notification",
            new Date(),
            1
        );

        expect(notification.getLeadID()).toBe(0);
    });
});