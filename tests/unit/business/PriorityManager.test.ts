import { Lead } from "@/domain/objects/Lead";
import { ScoringService } from "@/domain/business/ScoringService";
import { PriorityManager } from "@/domain/business/PriorityManager";

describe("PriorityManager", () => {
    const scoringService = new ScoringService();

    test("sorts leads by score descending", () => {
        const priorityManager = new PriorityManager(scoringService);

        const lowLead = new Lead({
            leadID: 1,
            firstName: "Low",
            stage: "NEW",
            score: 40,
        });

        const highLead = new Lead({
            leadID: 2,
            firstName: "High",
            stage: "NEGOTIATION",
            score: 160,
        });

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
        });

        const result = priorityManager.getPrioritizedList([lead]);

        expect(result[0].score).toBeGreaterThan(0);
    });

    test("adds or updates lead in priority queue", () => {
        const priorityManager = new PriorityManager(scoringService);

        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            stage: "NEW",
        });

        priorityManager.addOrUpdateLead(lead);

        expect(priorityManager.peekTopLead()?.leadID).toBe(1);
    });

    test("removes lead from priority queue", () => {
        const priorityManager = new PriorityManager(scoringService);

        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            stage: "NEW",
        });

        priorityManager.addOrUpdateLead(lead);
        priorityManager.removeLead(lead);

        expect(priorityManager.peekTopLead()).toBeNull();
    });
});