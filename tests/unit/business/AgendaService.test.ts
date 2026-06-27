import { Lead } from "@/domain/objects/Lead";
import { Task } from "@/domain/objects/Task";
import { Notification } from "@/domain/objects/Notification";
import { ScoringService } from "@/domain/business/ScoringService";
import { PriorityManager } from "@/domain/business/PriorityManager";
import { AgendaService } from "@/domain/business/AgendaService";

describe("AgendaService", () => {
    const scoringService = new ScoringService();

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-20"));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const createService = () => {
        const priorityManager = new PriorityManager(scoringService);
        return new AgendaService(scoringService, priorityManager);
    };

    test("includes lead with follow-up date on target date", () => {
        const agendaService = createService();
        const targetDate = new Date("2026-06-20");

        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            stage: "NEW",
            followUpDate: targetDate,
            createdAt: new Date("2026-06-18"),
        });

        const result = agendaService.getTodayAgenda([lead], [], targetDate);

        expect(result.length).toBe(1);
        expect(result[0].leadID).toBe(1);
    });

    test("includes lead with task on target date", () => {
        const agendaService = createService();
        const targetDate = new Date("2026-06-20");

        const lead = new Lead({
            leadID: 1,
            firstName: "Sarah",
            stage: "CONTACTED",
            createdAt: new Date("2026-06-18"),
        });

        const task = new Task(lead, "Follow up", targetDate, 1);

        const result = agendaService.getTodayAgenda([lead], [task], targetDate);

        expect(result.length).toBe(1);
        expect(result[0].leadID).toBe(1);
    });

    test("does not include lead without task or follow-up date", () => {
        const agendaService = createService();
        const targetDate = new Date("2026-06-20");

        const lead = new Lead({
            leadID: 1,
            firstName: "Mike",
            stage: "NEW",
            followUpDate: new Date("2026-06-25"),
            createdAt: new Date("2026-06-19"),
        });

        const result = agendaService.getTodayAgenda([lead], [], targetDate);

        expect(result.length).toBe(0);
    });

    test("includes high-priority neglected lead when viewing today", () => {
        const agendaService = createService();
        const targetDate = new Date("2026-06-20");

        const lead = new Lead({
            leadID: 1,
            firstName: "Hot",
            stage: "NEGOTIATION",
            notes: "urgent ready",
            createdAt: new Date("2026-06-16"),
            lastInteractionDate: new Date("2026-06-16"),
        });

        const result = agendaService.getTodayAgenda([lead], [], targetDate);

        expect(result.length).toBe(1);
        expect(result[0].leadID).toBe(1);
    });

    test("returns agenda sorted by priority score", () => {
        const agendaService = createService();
        const targetDate = new Date("2026-06-20");

        const lowLead = new Lead({
            leadID: 1,
            firstName: "Low",
            stage: "NEW",
            followUpDate: targetDate,
            createdAt: new Date("2026-06-18"),
        });

        const highLead = new Lead({
            leadID: 2,
            firstName: "High",
            stage: "NEGOTIATION",
            followUpDate: targetDate,
            notes: "urgent ready to buy",
            createdAt: new Date("2026-06-10"),
        });

        const result = agendaService.getTodayAgenda([lowLead, highLead], [], targetDate);

        expect(result[0].leadID).toBe(2);
        expect(result[1].leadID).toBe(1);
    });

    test("excludes closed leads and sorts hot and high leads first", () => {
        const agendaService = createService();
        const targetDate = new Date("2026-06-20");

        const closedLead = new Lead({
            leadID: 1,
            firstName: "Closed",
            stage: "CLOSED",
            followUpDate: targetDate,
            notes: "urgent ready price",
            createdAt: new Date("2026-06-01"),
        });

        const mediumLead = new Lead({
            leadID: 2,
            firstName: "Medium",
            stage: "VISITED",
            followUpDate: targetDate,
            createdAt: new Date("2026-06-20"),
        });

        const reactivationLead = new Lead({
            leadID: 5,
            firstName: "Reactivation",
            stage: "TEST_DRIVE",
            followUpDate: targetDate,
            createdAt: new Date("2026-03-01"),
        });

        const highLead = new Lead({
            leadID: 3,
            firstName: "High",
            stage: "NEGOTIATION",
            followUpDate: targetDate,
            createdAt: new Date("2026-06-20"),
        });

        const hotLead = new Lead({
            leadID: 4,
            firstName: "Hot",
            stage: "NEGOTIATION",
            followUpDate: targetDate,
            notes: "urgent and ready",
            createdAt: new Date("2026-06-18"),
            lastInteractionDate: new Date("2026-06-20"),
            lastInteractionBy: "LEAD",
        });

        const result = agendaService.getTodayAgenda(
            [closedLead, mediumLead, highLead, hotLead, reactivationLead],
            [],
            targetDate
        );

        expect(result.map((lead) => lead.leadID)).toEqual([4, 3, 2, 5]);
    });

    test("generates system assigned task and avoids duplicate task", () => {
        const agendaService = createService();
        const targetDate = new Date("2026-06-20");

        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            stage: "NEW",
            followUpDate: targetDate,
            createdAt: new Date("2026-06-19"),
        });

        const generatedTasks = agendaService.getSystemAssignedTasks([lead], [], targetDate);

        expect(generatedTasks.length).toBe(1);
        expect(generatedTasks[0].getLead()?.leadID).toBe(1);

        const duplicateCheck = agendaService.getSystemAssignedTasks([lead], generatedTasks, targetDate);

        expect(duplicateCheck.length).toBe(0);
    });

    test("generates gratitude task on creation day regardless of current stage", () => {
        const agendaService = createService();
        const targetDate = new Date("2026-06-20");
        const stages = [
            "NEW",
            "CONTACTED",
            "VISITED",
            "TEST_DRIVE",
            "NEGOTIATION",
        ];

        for (const stage of stages) {
            const lead = new Lead({
                leadID: stages.indexOf(stage) + 1,
                firstName: stage,
                stage,
                followUpDate: new Date("2026-07-01"),
                createdAt: targetDate,
            });

            const generatedTasks = agendaService.getSystemAssignedTasks(
                [lead],
                [],
                targetDate
            );

            expect(generatedTasks).toHaveLength(1);
            expect(generatedTasks[0].getTitle()).toBe(
                "Gratitude: Thank You & Info Swap"
            );
            expect(generatedTasks[0].getLead()?.leadID).toBe(lead.leadID);
        }
    });

    test("backfills missing system tasks from lead creation through today", () => {
        const agendaService = createService();
        const lead = new Lead({
            leadID: 1,
            firstName: "Old",
            stage: "NEW",
            followUpDate: new Date("2026-12-31"),
            createdAt: new Date("2026-03-13"),
        });

        const generatedTasks =
            agendaService.getMissingSystemAssignedTasksUpToDate(
                [lead],
                [],
                new Date("2026-06-21")
            );

        expect(generatedTasks.map((task) => task.getTitle())).toEqual([
            "Gratitude: Thank You & Info Swap",
            "Quick check-in: Gratitude follow-up",
            "New idea: Vehicle option follow-up",
            "Market update: Inventory follow-up",
            "Long-term check-in",
            "Low-pressure reactivation follow-up",
        ]);
        expect(generatedTasks.every((task) => !task.isCompleted())).toBe(true);
    });

    test("collapses duplicate logical tasks by lead date and title", () => {
        const agendaService = createService();
        const lead = new Lead({
            leadID: 1,
            firstName: "Duplicate",
            stage: "NEW",
            createdAt: new Date("2026-03-13"),
        });
        const firstTask = new Task(
            lead,
            "Gratitude: Thank You & Info Swap",
            new Date("2026-03-13T04:00:00"),
            10
        );
        const secondTask = new Task(
            lead,
            "Gratitude: Thank You & Info Swap",
            new Date("2026-03-13T04:00:00"),
            11
        );

        const uniqueTasks = agendaService.getUniqueTasks([
            secondTask,
            firstTask,
        ]);

        expect(uniqueTasks).toHaveLength(1);
        expect(uniqueTasks[0].getEventID()).toBe(10);
    });

    test("uses completed duplicate task when merging logical duplicates", () => {
        const agendaService = createService();
        const lead = new Lead({
            leadID: 1,
            firstName: "Duplicate",
            stage: "NEW",
            createdAt: new Date("2026-03-13"),
        });
        const uncompletedTask = new Task(
            lead,
            "Gratitude: Thank You & Info Swap",
            new Date("2026-03-13T04:00:00"),
            10
        );
        const completedTask = new Task(
            lead,
            "Gratitude: Thank You & Info Swap",
            new Date("2026-03-13T04:00:00"),
            11
        );
        completedTask.setCompleted(true);

        const uniqueTasks = agendaService.getUniqueTasks([
            uncompletedTask,
            completedTask,
        ]);

        expect(uniqueTasks).toHaveLength(1);
        expect(uniqueTasks[0].getEventID()).toBe(10);
        expect(uniqueTasks[0].isCompleted()).toBe(true);
    });

    test("does not let generated tasks duplicate persisted real tasks", () => {
        const agendaService = createService();
        const lead = new Lead({
            leadID: 1,
            firstName: "Duplicate",
            stage: "NEW",
            createdAt: new Date("2026-03-13"),
        });
        const persistedTask = new Task(
            lead,
            "Gratitude: Thank You & Info Swap",
            new Date("2026-03-13T04:00:00"),
            10
        );
        persistedTask.setCompleted(true);
        const generatedTask = new Task(
            lead,
            "Gratitude: Thank You & Info Swap",
            new Date("2026-03-13T04:00:00")
        );

        const uniqueTasks = agendaService.getUniqueTasks([
            generatedTask,
            persistedTask,
        ]);

        expect(uniqueTasks).toHaveLength(1);
        expect(uniqueTasks[0].getEventID()).toBe(10);
        expect(uniqueTasks[0].isCompleted()).toBe(true);
    });

    test("generates silent milestone tasks without requiring follow-up date", () => {
        const agendaService = createService();
        const milestones = [
            {
                targetDate: "2026-06-04",
                title: "Quick check-in: Gratitude follow-up",
            },
            {
                targetDate: "2026-06-09",
                title: "New idea: Vehicle option follow-up",
            },
            {
                targetDate: "2026-06-16",
                title: "Market update: Inventory follow-up",
            },
            {
                targetDate: "2026-07-01",
                title: "Long-term check-in",
            },
            {
                targetDate: "2026-08-30",
                title: "Low-pressure reactivation follow-up",
            },
            {
                targetDate: "2026-11-28",
                title: "Low-pressure reactivation follow-up",
            },
            {
                targetDate: "2027-06-01",
                title: "Low-pressure reactivation follow-up",
            },
        ];

        for (const milestone of milestones) {
            const lead = new Lead({
                leadID: 1,
                firstName: "Silent",
                stage: "CONTACTED",
                followUpDate: new Date("2027-12-31"),
                createdAt: new Date("2026-06-01"),
            });

            const generatedTasks = agendaService.getSystemAssignedTasks(
                [lead],
                [],
                new Date(milestone.targetDate)
            );

            expect(generatedTasks).toHaveLength(1);
            expect(generatedTasks[0].getTitle()).toBe(milestone.title);
            expect(generatedTasks[0].getLead()?.leadID).toBe(1);
        }
    });

    test("combines tasks and notifications into daily activities", () => {
        const agendaService = createService();
        const targetDate = new Date("2026-06-20");

        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            lastName: "Smith",
            stage: "NEW",
            createdAt: new Date("2026-06-19"),
        });

        const task = new Task(lead, "Call customer", targetDate, 1);
        const notification = new Notification(lead, "Incoming message", targetDate, 2);

        const result = agendaService.getDailyActivities([task], [notification], targetDate);

        expect(result.length).toBe(2);
        expect(result[0].type).toBe("TASK");
        expect(result[1].type).toBe("NOTIFICATION");
    });
});
