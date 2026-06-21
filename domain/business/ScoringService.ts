import { Lead } from "@/domain/objects/Lead";
import { Task } from "@/domain/objects/Task";

export type LeadPriorityLevel = "HOT" | "HIGH" | "MEDIUM" | "LOW" | "CLOSED";

export type LeadPriorityResult = {
    score: number;
    level: LeadPriorityLevel;
    hasStrongBuyingIntent: boolean;
    reasons: string[];
};

export class ScoringService {
    static readonly THRESHOLD = 100;
    static readonly HOT_THRESHOLD = 140;
    static readonly MEDIUM_THRESHOLD = 60;

    private readonly silentMilestones = [3, 8, 15, 30, 90, 180, 365];

    calculateScore(lead: Lead): number {
        if (this.isClosedLead(lead)) {
            return 0;
        }

        return this.calculatePriority(lead).score;
    }

    calculatePriority(lead: Lead): LeadPriorityResult {
        const reasons: string[] = [];

        if (this.isClosedLead(lead)) {
            return {
                score: 0,
                level: "CLOSED",
                hasStrongBuyingIntent: false,
                reasons: ["Lead is closed and excluded from active follow-up."],
            };
        }

        const stageWeight = this.getStageWeight(lead.stage);
        let score = stageWeight;

        reasons.push(`${this.normalizeStage(lead.stage)} stage base score ${stageWeight}.`);

        const engagementResult = this.getEngagementWeight(lead);
        score += engagementResult.score;
        reasons.push(...engagementResult.reasons);

        const timeResult = this.getTimeWeight(lead);
        score += timeResult.score;
        reasons.push(...timeResult.reasons);

        const hasStrongBuyingIntent = this.hasStrongBuyingIntent(lead);

        return {
            score,
            level: this.getPriorityLevel(score, hasStrongBuyingIntent),
            hasStrongBuyingIntent,
            reasons: this.getPriorityReasons(reasons, score, hasStrongBuyingIntent),
        };
    }

    getScientificMission(
        lead: Lead | null,
        targetDate: Date,
        existingTasks: Task[] = []
    ): string | null {
        if (!lead || !lead.createdAt) {
            return null;
        }

        const targetDateStr = this.formatDate(targetDate);

        for (const task of existingTasks) {
            if (
                task.getLead()?.leadID === lead.leadID &&
                this.formatDate(task.getDate()) === targetDateStr
            ) {
                return task.getTitle();
            }
        }

        const createdDate = this.resetTime(lead.createdAt);
        const target = this.resetTime(targetDate);

        if (this.getDaysDiff(createdDate, target) === 1) {
            return "Gratitude: Thank You & Info Swap";
        }

        const pivotDate =
            lead.lastInteractionDate !== null &&
            lead.lastInteractionBy === "LEAD"
                ? lead.lastInteractionDate
                : lead.createdAt;

        const daysFromPivot = this.getDaysDiff(
            this.resetTime(pivotDate),
            target
        );

        if (lead.lastInteractionBy === "LEAD" && daysFromPivot <= 2) {
            return "URGENT: Lead replied. Respond within 48h!";
        }

        for (const milestone of this.silentMilestones) {
            if (daysFromPivot === milestone) {
                return this.getMissionNameByDay(milestone);
            }
        }

        const priority = this.calculatePriority(lead);

        if (priority.level === "HOT" || priority.level === "HIGH") {
            return `${priority.level} Priority: Nurture ${lead.stage} (Score: ${Math.floor(priority.score)})`;
        }

        return `Standard Follow-up: ${lead.stage}`;
    }

    generateTimeline(lead: Lead | null, existingTasks: Task[] = []): Task[] {
        const timeline: Task[] = [];

        if (!lead || !lead.createdAt) {
            return timeline;
        }

        timeline.push(
            ...existingTasks.filter((task) => task.getLead()?.leadID === lead.leadID)
        );

        const today = this.resetTime(new Date());

        const gratitudeTitle = "Gratitude: Thank You & Info Swap";

        if (!this.containsTask(timeline, gratitudeTitle)) {
            const day1 = this.addDays(lead.createdAt, 1);

            if (day1 <= today) {
                const task = new Task(lead, gratitudeTitle, day1);
                task.setCompleted(true);
                timeline.push(task);
            }
        }

        const urgentTitle = "URGENT: Lead replied. Respond within 48h!";

        if (
            lead.lastInteractionBy === "LEAD" &&
            !this.containsTask(timeline, urgentTitle)
        ) {
            const urgentTask = new Task(lead, urgentTitle, today);

            const daysFromPivot = this.getDaysDiff(
                this.resetTime(lead.lastInteractionDate ?? lead.createdAt),
                today
            );

            urgentTask.setCompleted(daysFromPivot > 2);
            timeline.push(urgentTask);
        }

        const pivotDate =
            lead.lastInteractionDate !== null &&
            lead.lastInteractionBy === "LEAD"
                ? lead.lastInteractionDate
                : lead.createdAt;

        for (const milestone of this.silentMilestones) {
            const title = this.getMissionNameByDay(milestone);

            if (!this.containsTask(timeline, title)) {
                const milestoneDate = this.addDays(pivotDate, milestone);

                if (milestoneDate <= today) {
                    const task = new Task(lead, title, milestoneDate);
                    task.setCompleted(milestoneDate < today);
                    timeline.push(task);
                }
            }
        }

        return timeline.sort(
            (taskA, taskB) => taskA.getDate().getTime() - taskB.getDate().getTime()
        );
    }

    private getStageWeight(stage: string | null | undefined): number {
        if (!stage) return 0;

        switch (stage.toUpperCase()) {
            case "NEW":
                return 20;
            case "CONTACTED":
                return 40;
            case "VISITED":
                return 60;
            case "TEST_DRIVE":
                return 80;
            case "NEGOTIATION":
                return 110;
            case "CLOSED":
                return 0;
            default:
                return 10;
        }
    }

    private getTimeWeight(lead: Lead): { score: number; reasons: string[] } {
        const pivotDate = lead.lastInteractionDate || lead.createdAt;

        if (!pivotDate) {
            return { score: 0, reasons: [] };
        }

        const daysSilent = this.getDaysDiff(
            this.resetTime(pivotDate),
            this.resetTime(new Date())
        );

        if (daysSilent > 7) {
            return {
                score: 30,
                reasons: ["Lead has been silent for more than 7 days."],
            };
        }

        if (daysSilent > 3) {
            return {
                score: 15,
                reasons: ["Lead has been silent for more than 3 days."],
            };
        }

        return { score: 0, reasons: [] };
    }

    private getEngagementWeight(lead: Lead): {
        score: number;
        reasons: string[];
    } {
        let engagementScore = 0;
        const notes = lead.notes ? lead.notes.toLowerCase() : "";
        const reasons: string[] = [];

        if (this.hasRecentLeadReply(lead)) {
            engagementScore += 30;
            reasons.push("Recent reply from the lead.");
        }

        if (
            notes.includes("hot") ||
            notes.includes("ready") ||
            notes.includes("urgent")
        ) {
            engagementScore += 20;
            reasons.push("Notes contain hot, ready, or urgent buying intent.");
        }

        if (this.hasMultipleShowroomVisits(lead)) {
            engagementScore += 20;
            reasons.push("Multiple showroom visits indicate stronger intent.");
        }

        if (this.hasCompletedTestDrive(lead)) {
            engagementScore += 20;
            reasons.push("Test drive completed.");
        }

        if (this.hasSecondTestDrive(lead)) {
            engagementScore += 15;
            reasons.push("Second test drive requested or completed.");
        }

        if (this.hasPriceNegotiationSignal(lead)) {
            engagementScore += 30;
            reasons.push("Price negotiation signal found.");
        }

        return { score: engagementScore, reasons };
    }

    private getPriorityLevel(
        score: number,
        hasStrongBuyingIntent: boolean
    ): LeadPriorityLevel {
        if (score >= ScoringService.HOT_THRESHOLD && hasStrongBuyingIntent) {
            return "HOT";
        }

        if (score >= ScoringService.THRESHOLD) {
            return "HIGH";
        }

        if (score >= ScoringService.MEDIUM_THRESHOLD) {
            return "MEDIUM";
        }

        return "LOW";
    }

    private getPriorityReasons(
        reasons: string[],
        score: number,
        hasStrongBuyingIntent: boolean
    ): string[] {
        const priorityReasons = [...reasons];

        if (hasStrongBuyingIntent) {
            priorityReasons.push("Strong buying intent signal detected.");
        }

        if (score >= ScoringService.HOT_THRESHOLD && !hasStrongBuyingIntent) {
            priorityReasons.push(
                "Score is high, but HOT priority requires strong buying intent."
            );
        }

        return priorityReasons.slice(0, 5);
    }

    private hasStrongBuyingIntent(lead: Lead): boolean {
        const stage = this.normalizeStage(lead.stage);

        return (
            stage === "NEGOTIATION" ||
            this.hasRecentLeadReply(lead) ||
            this.hasUrgencyKeywords(lead) ||
            this.hasMultipleShowroomVisits(lead) ||
            this.hasCompletedTestDrive(lead) ||
            this.hasSecondTestDrive(lead) ||
            this.hasPriceNegotiationSignal(lead)
        );
    }

    private hasRecentLeadReply(lead: Lead): boolean {
        if (lead.lastInteractionBy !== "LEAD" || !lead.lastInteractionDate) {
            return false;
        }

        const daysSinceReply = this.getDaysDiff(
            this.resetTime(lead.lastInteractionDate),
            this.resetTime(new Date())
        );

        return daysSinceReply >= 0 && daysSinceReply <= 3;
    }

    private hasUrgencyKeywords(lead: Lead): boolean {
        const notes = lead.notes ? lead.notes.toLowerCase() : "";

        return (
            notes.includes("hot") ||
            notes.includes("ready") ||
            notes.includes("urgent")
        );
    }

    private hasMultipleShowroomVisits(lead: Lead): boolean {
        const notes = lead.notes ? lead.notes.toLowerCase() : "";

        return (
            notes.includes("multiple visit") ||
            notes.includes("second visit") ||
            notes.includes("visited twice") ||
            notes.includes("two visits") ||
            notes.includes("2 visits") ||
            notes.includes("came back")
        );
    }

    private hasCompletedTestDrive(lead: Lead): boolean {
        const notes = lead.notes ? lead.notes.toLowerCase() : "";

        return (
            notes.includes("test drive completed") ||
            notes.includes("completed test drive")
        );
    }

    private hasSecondTestDrive(lead: Lead): boolean {
        const notes = lead.notes ? lead.notes.toLowerCase() : "";

        return (
            notes.includes("second test drive") ||
            notes.includes("2nd test drive") ||
            notes.includes("another test drive")
        );
    }

    private hasPriceNegotiationSignal(lead: Lead): boolean {
        const notes = lead.notes ? lead.notes.toLowerCase() : "";

        return (
            notes.includes("price") ||
            notes.includes("discount") ||
            notes.includes("deal") ||
            notes.includes("monthly payment") ||
            notes.includes("payment")
        );
    }

    private isClosedLead(lead: Lead): boolean {
        return this.normalizeStage(lead.stage) === "CLOSED";
    }

    private normalizeStage(stage: string | null | undefined): string {
        return stage ? stage.toUpperCase() : "DEFAULT";
    }

    private getMissionNameByDay(day: number): string {
        switch (day) {
            case 3:
                return "New Ideas: Follow up thoughts";
            case 8:
                return "Market Update: Inventory/Trade-in";
            case 15:
                return "Resource: Hidden feature video";
            case 30:
                return "Checking In: Specific specs";
            case 90:
                return "Seasonal: Service specials";
            case 180:
                return "Relationship: High-level check-in";
            case 365:
                return "Anniversary: Yearly check-in";
            default:
                return "Follow up";
        }
    }

    private containsTask(taskList: Task[], title: string): boolean {
        return taskList.some((task) => task.getTitle() === title);
    }

    private addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return this.resetTime(result);
    }

    private getDaysDiff(startDate: Date, endDate: Date): number {
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        return Math.floor(
            (endDate.getTime() - startDate.getTime()) / millisecondsPerDay
        );
    }

    private resetTime(date: Date): Date {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    private formatDate(date: Date): string {
        const normalizedDate = new Date(date);
        const year = normalizedDate.getFullYear();
        const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
        const day = String(normalizedDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }
}
