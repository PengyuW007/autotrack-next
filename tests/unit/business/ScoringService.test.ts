import { Lead } from "@/domain/objects/Lead";
import { ScoringService } from "@/domain/business/ScoringService";

describe("ScoringService", () => {
    const scoringService = new ScoringService();

    test("calculates score for NEW lead", () => {
        const lead = new Lead({
            firstName: "John",
            stage: "NEW",
            createdAt: new Date(),
        });

        expect(scoringService.calculateScore(lead)).toBe(40);
    });

    test("adds engagement score for TEST_DRIVE stage", () => {
        const lead = new Lead({
            firstName: "Sarah",
            stage: "TEST_DRIVE",
            createdAt: new Date(),
        });

        expect(scoringService.calculateScore(lead)).toBe(110);
    });

    test("adds notes engagement score for hot lead", () => {
        const lead = new Lead({
            firstName: "Mike",
            stage: "CONTACTED",
            notes: "Customer is hot and ready to buy",
            createdAt: new Date(),
        });

        expect(scoringService.calculateScore(lead)).toBe(70);
    });

    test("adds time weight when lead is silent for more than 7 days", () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10);

        const lead = new Lead({
            firstName: "Emily",
            stage: "CONTACTED",
            createdAt: oldDate,
        });

        expect(scoringService.calculateScore(lead)).toBe(80);
    });

    test("returns gratitude mission on day 1", () => {
        const createdAt = new Date("2026-06-01");
        const targetDate = new Date("2026-06-02");

        const lead = new Lead({
            firstName: "John",
            stage: "NEW",
            createdAt,
        });

        expect(scoringService.getScientificMission(lead, targetDate)).toBe(
            "Gratitude: Thank You & Info Swap"
        );
    });

    test("returns urgent mission when lead replied within 48 hours", () => {
        const lead = new Lead({
            firstName: "Sarah",
            stage: "CONTACTED",
            createdAt: new Date("2026-06-01"),
            lastInteractionDate: new Date("2026-06-03"),
            lastInteractionBy: "LEAD",
        });

        const targetDate = new Date("2026-06-04");

        expect(scoringService.getScientificMission(lead, targetDate)).toBe(
            "URGENT: Lead replied. Respond within 48h!"
        );
    });

    test("returns milestone mission on day 3", () => {
        const lead = new Lead({
            firstName: "David",
            stage: "NEW",
            createdAt: new Date("2026-06-01"),
        });

        const targetDate = new Date("2026-06-04");

        expect(scoringService.getScientificMission(lead, targetDate)).toBe(
            "New Ideas: Follow up thoughts"
        );
    });
});