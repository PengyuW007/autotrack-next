import { Lead } from "@/domain/objects/Lead";
import {
    LeadPriorityResult,
    ScoringService,
} from "@/domain/business/ScoringService";

export class PriorityManager {
    private scoringService: ScoringService;
    private priorityQueue: Lead[];

    constructor(scoringService: ScoringService) {
        this.scoringService = scoringService;
        this.priorityQueue = [];
    }

    getPrioritizedList(inputLeads: Lead[] | null | undefined): Lead[] {
        this.priorityQueue = [];

        if (inputLeads) {
            for (const lead of inputLeads) {
                const priority = this.getPriorityForLead(lead);

                if (priority.level !== "CLOSED") {
                    this.priorityQueue.push(lead);
                }
            }
        }

        return this.getAllLeadsSorted();
    }

    addOrUpdateLead(lead: Lead): void {
        this.removeLead(lead);

        const priority = this.getPriorityForLead(lead);

        if (priority.level !== "CLOSED") {
            this.priorityQueue.push(lead);
        }
    }

    getPriorityForLead(lead: Lead): LeadPriorityResult {
        const priority = this.scoringService.calculatePriority(lead);
        lead.updateScore(priority.score);
        return priority;
    }

    removeLead(lead: Lead): void {
        this.priorityQueue = this.priorityQueue.filter(
            (item) => item.leadID !== lead.leadID
        );
    }

    peekTopLead(): Lead | null {
        const sortedList = this.getAllLeadsSorted();

        if (sortedList.length === 0) {
            return null;
        }

        return sortedList[0];
    }

    getAllLeadsSorted(): Lead[] {
        return [...this.priorityQueue]
            .filter(
                (lead) =>
                    this.scoringService.calculatePriority(lead).level !==
                    "CLOSED"
            )
            .sort((leadA, leadB) => {
                const priorityA = this.scoringService.calculatePriority(leadA);
                const priorityB = this.scoringService.calculatePriority(leadB);
                leadA.updateScore(priorityA.score);
                leadB.updateScore(priorityB.score);

                return (
                    this.getPriorityRank(priorityB.level) -
                        this.getPriorityRank(priorityA.level) ||
                    priorityB.score - priorityA.score
                );
            });
    }

    private getPriorityRank(priorityLevel: LeadPriorityResult["level"]): number {
        switch (priorityLevel) {
            case "HOT":
                return 4;
            case "HIGH":
                return 3;
            case "MEDIUM":
                return 2;
            case "LOW":
                return 1;
            default:
                return 0;
        }
    }
}
