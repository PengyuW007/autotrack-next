import { Lead } from "@/domain/objects/Lead";
import { Task } from "@/domain/objects/Task";

export class ScoringService {
    static readonly THRESHOLD = 100;

    private readonly silentMilestones = [3, 8, 15, 30, 90, 180, 365];

    calculateScore(lead: Lead): number {
        let score = 0;

        score += this.getStageWeight(lead.stage);
        score += this.getTimeWeight(lead);
        score += this.getEngagementWeight(lead);

        return score;
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

        const score = this.calculateScore(lead);

        if (score >= ScoringService.THRESHOLD) {
            return `High Priority: Nurture ${lead.stage} (Score: ${Math.floor(score)})`;
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
                return 40;
            case "CONTACTED":
                return 50;
            case "VISITED":
                return 60;
            case "TEST_DRIVE":
                return 70;
            case "NEGOTIATION":
                return 100;
            case "CLOSED":
                return 0;
            default:
                return 10;
        }
    }

    private getTimeWeight(lead: Lead): number {
        const pivotDate = lead.lastInteractionDate || lead.createdAt;

        if (!pivotDate) return 0;

        const daysSilent = this.getDaysDiff(
            this.resetTime(pivotDate),
            this.resetTime(new Date())
        );

        if (daysSilent > 7) return 30;
        if (daysSilent > 3) return 15;

        return 0;
    }

    private getEngagementWeight(lead: Lead): number {
        let engagementScore = 0;

        const stage = lead.stage ? lead.stage.toUpperCase() : "";

        if (stage === "VISITED") {
            engagementScore += 20;
        } else if (stage === "TEST_DRIVE") {
            engagementScore += 40;
        } else if (stage === "NEGOTIATION") {
            engagementScore += 60;
        }

        const notes = lead.notes ? lead.notes.toLowerCase() : "";

        if (
            notes.includes("hot") ||
            notes.includes("ready") ||
            notes.includes("urgent")
        ) {
            engagementScore += 20;
        }

        return engagementScore;
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