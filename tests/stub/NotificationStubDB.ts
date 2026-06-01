// tests/mocks/NotificationStubDB.ts

import { Notification } from "@/domain/objects/Notification";
import { leadStubDB } from "./LeadStubDB";

export const notificationStubDB: Notification[] = [
    new Notification(leadStubDB[0], "Missed call from John Smith", new Date("2026-06-01"), 1),
    new Notification(leadStubDB[1], "Inbound message from Sarah Chen", new Date("2026-06-02"), 2),
];