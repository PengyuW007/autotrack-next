import { Lead } from "@/domain/objects/Lead";
import { Task } from "@/domain/objects/Task";
import { ScoringService } from "@/domain/business/ScoringService";
import { PriorityManager } from "@/domain/business/PriorityManager";
import { AgendaService } from "@/domain/business/AgendaService";

describe("AgendaService", () => {
    const scoringService = new ScoringService();

    test("includes lead with follow-up date on target date", () => {
        const priorityManager = new PriorityManager(scoringService);
        const agendaService = new AgendaService(scoringService, priorityManager);

        const targetDate = new Date("2026-06-01");

        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            stage: "NEW",
            followUpDate: targetDate,
            createdAt: new Date("2026-05-30"),
        });

        const result = agendaService.getTodayAgenda([lead], [], targetDate);

        expect(result.length).toBe(1);
        expect(result[0].leadID).toBe(1);
    });

    test("includes lead with task on target date", () => {
        const priorityManager = new PriorityManager(scoringService);
        const agendaService = new AgendaService(scoringService, priorityManager);

        const targetDate = new Date("2026-06-01");

        const lead = new Lead({
            leadID: 1,
            firstName: "Sarah",
            stage: "CONTACTED",
            createdAt: new Date("2026-05-30"),
        });

        const task = new Task(lead, "Follow up", targetDate, 1);

        const result = agendaService.getTodayAgenda([lead], [task], targetDate);

        expect(result.length).toBe(1);
        expect(result[0].leadID).toBe(1);
    });

    test("does not include lead without task or follow-up date", () => {
        const priorityManager = new PriorityManager(scoringService);
        const agendaService = new AgendaService(scoringService, priorityManager);

        const targetDate = new Date("2026-06-01");

        const lead = new Lead({
            leadID: 1,
            firstName: "Mike",
            stage: "NEW",
            followUpDate: new Date("2026-06-10"),
            createdAt: new Date("2026-06-01"),
        });

        const result = agendaService.getTodayAgenda([lead], [], targetDate);

        expect(result.length).toBe(0);
    });

    test("returns agenda sorted by priority score", () => {
        const priorityManager = new PriorityManager(scoringService);
        const agendaService = new AgendaService(scoringService, priorityManager);

        const targetDate = new Date("2026-06-01");

        const lowLead = new Lead({
            leadID: 1,
            firstName: "Low",
            stage: "NEW",
            followUpDate: targetDate,
            createdAt: new Date("2026-05-30"),
        });

        const highLead = new Lead({
            leadID: 2,
            firstName: "High",
            stage: "NEGOTIATION",
            followUpDate: targetDate,
            notes: "urgent ready to buy",
            createdAt: new Date("2026-05-20"),
        });

        const result = agendaService.getTodayAgenda(
            [lowLead, highLead],
            [],
            targetDate
        );

        expect(result[0].leadID).toBe(2);
        expect(result[1].leadID).toBe(1);
    });
});