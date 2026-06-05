import { Lead } from "@/domain/objects/Lead";
import { ScoringService } from "@/domain/business/ScoringService";

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
                if (lead.score === 0) {
                    lead.updateScore(this.scoringService.calculateScore(lead));
                }

                this.priorityQueue.push(lead);
            }
        }

        return this.getAllLeadsSorted();
    }

    addOrUpdateLead(lead: Lead): void {
        this.removeLead(lead);

        const score = this.scoringService.calculateScore(lead);
        lead.updateScore(score);

        this.priorityQueue.push(lead);
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
        return [...this.priorityQueue].sort(
            (leadA, leadB) => leadB.score - leadA.score
        );
    }
}