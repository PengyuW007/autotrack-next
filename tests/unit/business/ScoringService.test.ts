import { ScoringService } from "@/domain/business/ScoringService";
import { Lead } from "@/domain/objects/Lead";
import { Task } from "@/domain/objects/Task";

describe("ScoringService", () => {
    const scoringService = new ScoringService();

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-20"));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("calculates base score for each lead stage", () => {
        expect(scoringService.calculateScore(new Lead({
            firstName: "New",
            stage: "NEW",
            createdAt: new Date("2026-06-20"),
        }))).toBe(20);

        expect(scoringService.calculateScore(new Lead({
            firstName: "Contacted",
            stage: "CONTACTED",
            createdAt: new Date("2026-06-20"),
        }))).toBe(35);

        expect(scoringService.calculateScore(new Lead({
            firstName: "Visited",
            stage: "VISITED",
            createdAt: new Date("2026-06-20"),
        }))).toBe(55);

        expect(scoringService.calculateScore(new Lead({
            firstName: "TestDrive",
            stage: "TEST_DRIVE",
            createdAt: new Date("2026-06-20"),
        }))).toBe(75);

        expect(scoringService.calculateScore(new Lead({
            firstName: "Negotiation",
            stage: "NEGOTIATION",
            createdAt: new Date("2026-06-20"),
        }))).toBe(110);

        expect(scoringService.calculateScore(new Lead({
            firstName: "Closed",
            stage: "CLOSED",
            createdAt: new Date("2026-06-20"),
        }))).toBe(0);

        expect(scoringService.calculateScore(new Lead({
            firstName: "Unknown",
            stage: "UNKNOWN",
            createdAt: new Date("2026-06-20"),
        }))).toBe(10);
    });

    test("recalculates score when stage changes", () => {
        const lead = new Lead({
            firstName: "Stage",
            stage: "NEW",
            createdAt: new Date("2026-06-20"),
        });

        expect(scoringService.calculateScore(lead)).toBe(20);

        lead.stage = "NEGOTIATION";

        expect(scoringService.calculateScore(lead)).toBe(110);
    });

    test("classifies closed lead as closed with score zero", () => {
        const priority = scoringService.calculatePriority(new Lead({
            firstName: "Closed",
            stage: "CLOSED",
            notes: "urgent ready price",
            createdAt: new Date("2026-06-01"),
            lastInteractionDate: new Date("2026-06-20"),
            lastInteractionBy: "LEAD",
        }));

        expect(priority.score).toBe(0);
        expect(priority.level).toBe("CLOSED");
    });

    test("classifies visited lead with one casual visit as medium", () => {
        const priority = scoringService.calculatePriority(new Lead({
            firstName: "Visited",
            stage: "VISITED",
            notes: "Stopped by casually to look around",
            createdAt: new Date("2026-06-20"),
        }));

        expect(priority.score).toBe(55);
        expect(priority.level).toBe("MEDIUM");
    });

    test("adds buying intent for visited lead with multiple visits", () => {
        const priority = scoringService.calculatePriority(new Lead({
            firstName: "Repeat",
            stage: "VISITED",
            notes: "Customer made multiple visits and came back with spouse",
            createdAt: new Date("2026-06-20"),
        }));

        expect(priority.score).toBe(75);
        expect(priority.level).toBe("MEDIUM");
        expect(priority.hasStrongBuyingIntent).toBe(true);
    });

    test("classifies test drive lead with strong buying intent as high", () => {
        const priority = scoringService.calculatePriority(new Lead({
            firstName: "Drive",
            stage: "TEST_DRIVE",
            createdAt: new Date("2026-06-18"),
            lastInteractionDate: new Date("2026-06-20"),
            lastInteractionBy: "LEAD",
        }));

        expect(priority.score).toBe(105);
        expect(priority.level).toBe("HIGH");
    });

    test("classifies negotiation lead as high by default", () => {
        const priority = scoringService.calculatePriority(new Lead({
            firstName: "Negotiation",
            stage: "NEGOTIATION",
            createdAt: new Date("2026-06-20"),
        }));

        expect(priority.score).toBe(110);
        expect(priority.level).toBe("HIGH");
    });

    test("classifies negotiation lead with urgent recent reply as hot", () => {
        const priority = scoringService.calculatePriority(new Lead({
            firstName: "Hot",
            stage: "NEGOTIATION",
            notes: "urgent, ready to buy today",
            createdAt: new Date("2026-06-18"),
            lastInteractionDate: new Date("2026-06-20"),
            lastInteractionBy: "LEAD",
        }));

        expect(priority.score).toBe(160);
        expect(priority.level).toBe("HOT");
    });

    test("does not classify overdue weak lead as hot", () => {
        const priority = scoringService.calculatePriority(new Lead({
            firstName: "Weak",
            stage: "NEW",
            createdAt: new Date("2026-06-01"),
        }));

        expect(priority.score).toBe(0);
        expect(priority.level).toBe("LOW");
    });

    test("new and contacted leads stay low unless they show engagement", () => {
        const newLead = new Lead({
            firstName: "New",
            stage: "NEW",
            createdAt: new Date("2026-06-20"),
        });
        const contactedLead = new Lead({
            firstName: "Contacted",
            stage: "CONTACTED",
            createdAt: new Date("2026-06-20"),
        });
        const interestedLead = new Lead({
            firstName: "Interested",
            stage: "CONTACTED",
            notes: "Interested in a hybrid SUV",
            createdAt: new Date("2026-06-20"),
        });

        expect(scoringService.getPriorityLevel(newLead)).toBe("LOW");
        expect(scoringService.getPriorityLevel(contactedLead)).toBe("LOW");
        expect(scoringService.calculateScore(interestedLead)).toBe(55);
        expect(scoringService.getPriorityLevel(interestedLead)).toBe("MEDIUM");
    });

    test("long silence reduces score and priority confidence", () => {
        const activeLead = new Lead({
            firstName: "Active",
            stage: "TEST_DRIVE",
            createdAt: new Date("2026-06-20"),
        });
        const silentLead = new Lead({
            firstName: "Silent",
            stage: "TEST_DRIVE",
            createdAt: new Date("2026-03-01"),
        });

        expect(scoringService.calculateScore(activeLead)).toBe(75);
        expect(scoringService.calculateScore(silentLead)).toBe(15);
        expect(scoringService.getPriorityLevel(silentLead)).toBe("LOW");
        expect(scoringService.getPriorityReasons(silentLead)).toContain(
            "Lead is long silent and should be treated as reactivation."
        );
    });

    test("returns scientific mission by silent milestone dates", () => {
        const lead = new Lead({
            firstName: "John",
            stage: "NEW",
            createdAt: new Date("2026-06-01"),
        });

        expect(scoringService.getScientificMission(lead, new Date("2026-06-04"))).toBe(
            "Quick check-in: Gratitude follow-up"
        );
        expect(scoringService.getScientificMission(lead, new Date("2026-06-09"))).toBe(
            "New idea: Vehicle option follow-up"
        );
        expect(scoringService.getScientificMission(lead, new Date("2026-06-16"))).toBe(
            "Market update: Inventory follow-up"
        );
        expect(scoringService.getScientificMission(lead, new Date("2026-07-01"))).toBe(
            "Long-term check-in"
        );
        expect(scoringService.getScientificMission(lead, new Date("2026-08-30"))).toBe(
            "Low-pressure reactivation follow-up"
        );
        expect(scoringService.getScientificMission(lead, new Date("2026-11-28"))).toBe(
            "Low-pressure reactivation follow-up"
        );
        expect(scoringService.getScientificMission(lead, new Date("2027-06-01"))).toBe(
            "Low-pressure reactivation follow-up"
        );
    });

    test("returns urgent mission when lead replied within 48 hours", () => {
        const lead = new Lead({
            firstName: "Sarah",
            stage: "CONTACTED",
            createdAt: new Date("2026-06-01"),
            lastInteractionDate: new Date("2026-06-18"),
            lastInteractionBy: "LEAD",
        });

        expect(scoringService.getScientificMission(lead, new Date("2026-06-20"))).toBe(
            "URGENT: Lead replied. Respond within 48h!"
        );
    });

    test("returns existing task title instead of generating duplicate mission", () => {
        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            stage: "NEW",
            createdAt: new Date("2026-06-01"),
        });

        const existingTask = new Task(
            lead,
            "User-created appointment",
            new Date("2026-06-04"),
            101
        );

        expect(scoringService.getScientificMission(
            lead,
            new Date("2026-06-04"),
            [existingTask]
        )).toBe("User-created appointment");
    });

    test("returns high priority mission for high priority lead", () => {
        const lead = new Lead({
            firstName: "High",
            stage: "NEGOTIATION",
            createdAt: new Date("2026-06-20"),
        });

        expect(scoringService.getScientificMission(lead, new Date("2026-06-20"))).toBe(
            "HIGH Priority: Nurture NEGOTIATION (Score: 110)"
        );
    });

    test("returns null mission for null lead", () => {
        expect(scoringService.getScientificMission(null, new Date("2026-06-20"))).toBeNull();
    });
});
