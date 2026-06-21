import { Lead } from "@/domain/objects/Lead";
import { ScoringService } from "@/domain/business/ScoringService";
import { PriorityManager } from "@/domain/business/PriorityManager";

describe("PriorityManager", () => {
    const scoringService = new ScoringService();

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-20"));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("sorts leads by score descending", () => {
        const priorityManager = new PriorityManager(scoringService);

        const lowLead = new Lead({ leadID: 1, firstName: "Low", stage: "NEW", score: 20 });
        const highLead = new Lead({ leadID: 2, firstName: "High", stage: "NEGOTIATION", score: 110 });

        const result = priorityManager.getPrioritizedList([lowLead, highLead]);

        expect(result[0].leadID).toBe(2);
        expect(result[1].leadID).toBe(1);
    });

    test("calculates score when lead score is 0", () => {
        const priorityManager = new PriorityManager(scoringService);

        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            stage: "NEGOTIATION",
            score: 0,
            createdAt: new Date(),
        });

        const result = priorityManager.getPrioritizedList([lead]);

        expect(result[0].score).toBe(110);
    });

    test("recalculates stale score when lead stage changes", () => {
        const priorityManager = new PriorityManager(scoringService);

        const lead = new Lead({
            leadID: 1,
            firstName: "Stage",
            stage: "VISITED",
            score: 200,
            createdAt: new Date(),
        });

        lead.stage = "NEW";

        const result = priorityManager.getPrioritizedList([lead]);

        expect(result[0].score).toBe(20);
    });

    test("adds lead into priority queue", () => {
        const priorityManager = new PriorityManager(scoringService);

        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            stage: "NEW",
            createdAt: new Date(),
        });

        priorityManager.addOrUpdateLead(lead);

        expect(priorityManager.peekTopLead()?.leadID).toBe(1);
    });

    test("updates existing lead instead of duplicating it", () => {
        const priorityManager = new PriorityManager(scoringService);

        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            stage: "NEW",
            createdAt: new Date(),
        });

        priorityManager.addOrUpdateLead(lead);

        lead.stage = "NEGOTIATION";
        priorityManager.addOrUpdateLead(lead);

        const result = priorityManager.getAllLeadsSorted();

        expect(result.length).toBe(1);
        expect(result[0].score).toBe(110);
    });

    test("excludes closed leads from priority queue", () => {
        const priorityManager = new PriorityManager(scoringService);

        const closedLead = new Lead({
            leadID: 1,
            firstName: "Closed",
            stage: "CLOSED",
            createdAt: new Date(),
        });

        priorityManager.addOrUpdateLead(closedLead);

        expect(priorityManager.peekTopLead()).toBeNull();
        expect(priorityManager.getPriorityForLead(closedLead).level).toBe("CLOSED");
    });

    test("removes lead from priority queue", () => {
        const priorityManager = new PriorityManager(scoringService);

        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            stage: "NEW",
            createdAt: new Date(),
        });

        priorityManager.addOrUpdateLead(lead);
        priorityManager.removeLead(lead);

        expect(priorityManager.peekTopLead()).toBeNull();
    });

    test("returns empty list when input is null or undefined", () => {
        const priorityManager = new PriorityManager(scoringService);

        expect(priorityManager.getPrioritizedList(null)).toEqual([]);
        expect(priorityManager.getPrioritizedList(undefined)).toEqual([]);
    });
});
