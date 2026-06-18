import { Lead } from "@/domain/objects/Lead";
import { Notification } from "@/domain/objects/Notification";
import { Task } from "@/domain/objects/Task";
import { ScoringService } from "@/domain/business/ScoringService";
import { PriorityManager } from "@/domain/business/PriorityManager";

export type AgendaActivityType = "TASK" | "NOTIFICATION";

export type AgendaActivity = {
    id: number;
    type: AgendaActivityType;
    title: string;
    date: Date;
    leadId: number | null;
    leadName: string;
    completed: boolean | null;
};

export class AgendaService {
    private scoringService: ScoringService;
    private priorityManager: PriorityManager;
    private highPriorityThreshold: number;

    constructor(
        scoringService: ScoringService,
        priorityManager: PriorityManager
    ) {
        this.scoringService = scoringService;
        this.priorityManager = priorityManager;
        this.highPriorityThreshold = ScoringService.THRESHOLD;
    }

    getTodayAgenda(
        allLeads: Lead[],
        allTasks: Task[],
        targetDate: Date
    ): Lead[] {
        const targetDateStr = this.formatDate(targetDate);
        const realTodayStr = this.formatDate(new Date());

        const isViewingToday = targetDateStr === realTodayStr;
        const agendaMap = new Map<number, Lead>();

        const currentTime = Date.now();
        const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;

        for (const lead of allLeads) {
            const currentScore = this.scoringService.calculateScore(lead);
            lead.updateScore(currentScore);

            let hasTaskOnDate = false;

            if (
                lead.followUpDate &&
                this.formatDate(lead.followUpDate) === targetDateStr
            ) {
                hasTaskOnDate = true;
            }

            if (!hasTaskOnDate && allTasks) {
                for (const task of allTasks) {
                    if (
                        task.getLead()?.leadID === lead.leadID &&
                        task.getDate() &&
                        this.formatDate(task.getDate()) === targetDateStr
                    ) {
                        hasTaskOnDate = true;
                        break;
                    }
                }
            }

            const isHighPriority = currentScore >= this.highPriorityThreshold;

            let lastInteraction = 0;

            if (lead.lastInteractionDate !== null) {
                lastInteraction = lead.lastInteractionDate.getTime();
            } else if (lead.createdAt !== null) {
                lastInteraction = lead.createdAt.getTime();
            }

            const isNeglected =
                currentTime - lastInteraction > threeDaysInMillis;

            if (
                hasTaskOnDate ||
                (isViewingToday && isHighPriority && isNeglected)
            ) {
                agendaMap.set(lead.leadID, lead);
            }
        }

        return this.priorityManager.getPrioritizedList([...agendaMap.values()]);
    }

    getDailyActivities(
        allTasks: Task[],
        allNotifications: Notification[],
        targetDate: Date
    ): AgendaActivity[] {
        const targetDateStr = this.formatDate(targetDate);

        const taskActivities = allTasks
            .filter((task) => this.formatDate(task.getDate()) === targetDateStr)
            .map((task): AgendaActivity => {
                const lead = task.getLead();

                return {
                    id: task.getEventID(),
                    type: "TASK",
                    title: task.getTitle(),
                    date: task.getDate(),
                    leadId: lead?.leadID ?? null,
                    leadName: lead?.getLeadName() ?? "No lead assigned",
                    completed: task.isCompleted(),
                };
            });

        const notificationActivities = allNotifications
            .filter(
                (notification) =>
                    this.formatDate(notification.getDate()) === targetDateStr
            )
            .map((notification): AgendaActivity => {
                const lead = notification.getLead();

                return {
                    id: notification.getEventID(),
                    type: "NOTIFICATION",
                    title: notification.getTitle(),
                    date: notification.getDate(),
                    leadId: lead?.leadID ?? null,
                    leadName: lead?.getLeadName() ?? "No lead assigned",
                    completed: null,
                };
            });

        return [...taskActivities, ...notificationActivities].sort(
            (activityA, activityB) =>
                activityA.date.getTime() - activityB.date.getTime()
        );
    }

    private formatDate(date: Date): string {
        const normalizedDate = new Date(date);
        const year = normalizedDate.getFullYear();
        const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
        const day = String(normalizedDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }
}
