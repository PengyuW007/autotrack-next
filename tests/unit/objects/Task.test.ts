import { Lead } from "@/domain/objects/Lead";
import { Task } from "@/domain/objects/Task";

describe("Task", () => {
    test("creates task from event base class", () => {
        const lead = new Lead({ leadID: 1, firstName: "John" });
        const date = new Date("2026-06-01");

        const task = new Task(lead, "Follow up", date, 10);

        expect(task.getEventID()).toBe(10);
        expect(task.getTitle()).toBe("Follow up");
        expect(task.getDate()).toEqual(date);
        expect(task.getLead()).toBe(lead);
        expect(task.isCompleted()).toBe(false);
    });

    test("sets task completed status", () => {
        const lead = new Lead({ firstName: "John" });
        const task = new Task(lead, "Follow up", new Date(), 1);

        task.setCompleted(true);

        expect(task.isCompleted()).toBe(true);
    });
});