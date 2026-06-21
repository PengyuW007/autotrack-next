import { Lead } from "@/domain/objects/Lead";
import { Task } from "@/domain/objects/Task";
import { ScoringService } from "@/domain/business/ScoringService";

describe("ScoringService", () => {
    const scoringService = new ScoringService();

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-20"));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("calculates score for each lead stage", () => {
        expect(scoringService.calculateScore(new Lead({
            firstName: "New",
            stage: "NEW",
            createdAt: new Date("2026-06-20"),
        }))).toBe(40);

        expect(scoringService.calculateScore(new Lead({
            firstName: "Contacted",
            stage: "CONTACTED",
            createdAt: new Date("2026-06-20"),
        }))).toBe(50);

        expect(scoringService.calculateScore(new Lead({
            firstName: "Visited",
            stage: "VISITED",
            createdAt: new Date("2026-06-20"),
        }))).toBe(80);

        expect(scoringService.calculateScore(new Lead({
            firstName: "TestDrive",
            stage: "TEST_DRIVE",
            createdAt: new Date("2026-06-20"),
        }))).toBe(110);

        expect(scoringService.calculateScore(new Lead({
            firstName: "Negotiation",
            stage: "NEGOTIATION",
            createdAt: new Date("2026-06-20"),
        }))).toBe(160);

        expect(scoringService.calculateScore(new Lead({
            firstName: "Closed",
            stage: "CLOSED",
            createdAt: new Date("2026-06-20"),
        }))).toBe(0);
    });

    test("adds notes engagement score for hot ready urgent lead", () => {
        const lead = new Lead({
            firstName: "Mike",
            stage: "CONTACTED",
            notes: "Customer is hot and ready to buy urgently",
            createdAt: new Date("2026-06-20"),
        });

        expect(scoringService.calculateScore(lead)).toBe(70);
    });

    test("adds time weight when lead is silent for more than 3 days", () => {
        const lead = new Lead({
            firstName: "Emily",
            stage: "CONTACTED",
            createdAt: new Date("2026-06-16"),
        });

        expect(scoringService.calculateScore(lead)).toBe(65);
    });

    test("adds time weight when lead is silent for more than 7 days", () => {
        const lead = new Lead({
            firstName: "David",
            stage: "CONTACTED",
            createdAt: new Date("2026-06-10"),
        });

        expect(scoringService.calculateScore(lead)).toBe(80);
    });

    test("returns default score for unknown stage", () => {
        const lead = new Lead({
            firstName: "Unknown",
            stage: "UNKNOWN",
            createdAt: new Date("2026-06-20"),
        });

        expect(scoringService.calculateScore(lead)).toBe(10);
    });

    test("returns scientific mission by milestone dates", () => {
        const lead = new Lead({
            firstName: "John",
            stage: "NEW",
            createdAt: new Date("2026-06-01"),
        });

        expect(scoringService.getScientificMission(lead, new Date("2026-06-02"))).toBe(
            "Gratitude: Thank You & Info Swap"
        );

        expect(scoringService.getScientificMission(lead, new Date("2026-06-04"))).toBe(
            "New Ideas: Follow up thoughts"
        );

        expect(scoringService.getScientificMission(lead, new Date("2026-06-09"))).toBe(
            "Market Update: Inventory/Trade-in"
        );

        expect(scoringService.getScientificMission(lead, new Date("2026-06-16"))).toBe(
            "Resource: Hidden feature video"
        );

        expect(scoringService.getScientificMission(lead, new Date("2026-07-01"))).toBe(
            "Checking In: Specific specs"
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

    test("returns high priority mission when score is above threshold", () => {
        const lead = new Lead({
            firstName: "High",
            stage: "NEGOTIATION",
            notes: "ready",
            createdAt: new Date("2026-06-20"),
        });

        expect(scoringService.getScientificMission(lead, new Date("2026-06-20"))).toBe(
            "High Priority: Nurture NEGOTIATION (Score: 180)"
        );
    });

    test("returns standard follow-up when no milestone or urgent rule applies", () => {
        const lead = new Lead({
            firstName: "Normal",
            stage: "NEW",
            createdAt: new Date("2026-06-20"),
        });

        expect(scoringService.getScientificMission(lead, new Date("2026-06-20"))).toBe(
            "Standard Follow-up: NEW"
        );
    });

    test("returns null mission for null lead", () => {
        expect(scoringService.getScientificMission(null, new Date("2026-06-20"))).toBeNull();
    });
});