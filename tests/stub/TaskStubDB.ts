// tests/mocks/TaskStubDB.ts

import { Task } from "@/domain/objects/Task";
import { leadStubDB } from "./LeadStubDB";

export const taskStubDB: Task[] = [
    new Task(leadStubDB[0], "Follow up with John Smith", new Date("2026-06-01"), 1),
    new Task(leadStubDB[1], "Send Tiguan quote", new Date("2026-06-02"), 2),
];