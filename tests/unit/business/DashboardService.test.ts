import { AgendaService } from "@/domain/business/AgendaService";
import { DashboardService } from "@/domain/business/DashboardService";
import { PriorityManager } from "@/domain/business/PriorityManager";
import { ScoringService } from "@/domain/business/ScoringService";
import { Lead } from "@/domain/objects/Lead";

describe("DashboardService", () => {
    const createService = () => {
        const scoringService = new ScoringService();
        const priorityManager = new PriorityManager(scoringService);
        const agendaService = new AgendaService(
            scoringService,
            priorityManager
        );

        return new DashboardService(scoringService, agendaService);
    };

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-20"));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("falls back to top active leads when no lead reaches high-priority threshold", () => {
        const dashboardService = createService();
        const deliveredLead = new Lead({
            leadID: 1,
            firstName: "Delivered",
            stage: "DELIVERED",
            createdAt: new Date("2026-06-20"),
        });
        const contactedLead = new Lead({
            leadID: 2,
            firstName: "Contacted",
            stage: "CONTACTED",
            createdAt: new Date("2026-06-20"),
        });
        const appointmentLead = new Lead({
            leadID: 3,
            firstName: "Appointment",
            stage: "APPOINTMENT",
            createdAt: new Date("2026-06-20"),
        });

        const priorityActions = dashboardService.getPriorityActions(
            [deliveredLead, contactedLead, appointmentLead],
            [],
            [],
            new Date("2026-06-20")
        );

        expect(priorityActions.map((action) => action.leadId)).toEqual([3, 2]);
        expect(priorityActions[0].reasonLabel).toBe("Top Recommended Lead");
    });
});
