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

    constructor(
        scoringService: ScoringService,
        priorityManager: PriorityManager
    ) {
        this.scoringService = scoringService;
        this.priorityManager = priorityManager;
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
            const priority = this.scoringService.calculatePriority(lead);
            lead.updateScore(priority.score);

            if (priority.level === "CLOSED") {
                continue;
            }

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

            const isHighPriority =
                priority.level === "HOT" || priority.level === "HIGH";

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

        const taskActivities = this.getUniqueTasks(allTasks)
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

    getSystemAssignedTasks(
        allLeads: Lead[],
        existingTasks: Task[],
        targetDate: Date
    ): Task[] {
        const targetDateStr = this.formatDate(targetDate);

        return allLeads.flatMap((lead) => {
            if (!this.isActiveSystemLead(lead)) {
                return [];
            }

            const candidateTasks = this.getSystemTaskCandidatesForDate(
                lead,
                targetDate
            );

            return candidateTasks.filter(
                (task) =>
                    !this.hasDuplicateTask(existingTasks, task) &&
                    this.formatDate(task.getDate()) === targetDateStr
            );
        });
    }

    getMissingSystemAssignedTasksUpToDate(
        allLeads: Lead[],
        existingTasks: Task[],
        targetDate: Date
    ): Task[] {
        const target = this.resetTime(targetDate);
        const missingTasks: Task[] = [];
        const knownTasks = this.getUniqueTasks(existingTasks);

        for (const lead of allLeads) {
            if (!this.isActiveSystemLead(lead)) {
                continue;
            }

            const timeline = this.scoringService.generateTimeline(
                lead,
                knownTasks
            );

            for (const task of timeline) {
                if (
                    task.getEventID() !== -1 ||
                    task.getDate().getTime() > target.getTime() ||
                    this.hasDuplicateTask(knownTasks, task)
                ) {
                    continue;
                }

                missingTasks.push(task);
                knownTasks.push(task);
            }
        }

        return missingTasks;
    }

    private getSystemTaskCandidatesForDate(
        lead: Lead,
        targetDate: Date
    ): Task[] {
        const candidates: Task[] = [];
        const targetDateStr = this.formatDate(targetDate);
        const hasScheduledFollowUp =
            lead.followUpDate &&
            this.formatDate(lead.followUpDate) === targetDateStr;
        const hasInitialGratitudeTask =
            this.scoringService.shouldCreateInitialGratitudeTask(
                lead,
                targetDate
            );
        const hasSilentMilestone =
            this.scoringService.getSilentMilestoneForDate(
                lead,
                targetDate
            ) !== null;

        if (hasInitialGratitudeTask) {
            candidates.push(
                new Task(lead, "Gratitude: Thank You & Info Swap", targetDate)
            );
        }

        if (hasScheduledFollowUp || hasSilentMilestone) {
            const title =
                this.scoringService.getScientificMission(lead, targetDate, []) ??
                `Follow up with ${lead.getLeadName()}`;
            candidates.push(new Task(lead, title, targetDate));
        }

        return candidates.filter(
            (candidate, index) =>
                candidates.findIndex(
                    (task) =>
                        task.getLead()?.leadID ===
                            candidate.getLead()?.leadID &&
                        this.formatDate(task.getDate()) ===
                            this.formatDate(candidate.getDate()) &&
                        task.getTitle() === candidate.getTitle()
                ) === index
        );
    }

    private isActiveSystemLead(lead: Lead): boolean {
        return (
            lead.leadID > 0 &&
            this.scoringService.calculatePriority(lead).level !== "CLOSED"
        );
    }

    private hasDuplicateTask(tasks: Task[], candidateTask: Task): boolean {
        return tasks.some(
            (task) =>
                task.getLead()?.leadID ===
                    candidateTask.getLead()?.leadID &&
                this.formatDate(task.getDate()) ===
                    this.formatDate(candidateTask.getDate()) &&
                task.getTitle() === candidateTask.getTitle()
        );
    }

    getUniqueTasks(tasks: Task[]): Task[] {
        const uniqueTaskMap = new Map<string, Task>();

        for (const task of tasks) {
            const key = this.getTaskIdentityKey(task);
            const existingTask = uniqueTaskMap.get(key);

            if (!existingTask) {
                uniqueTaskMap.set(key, task);
                continue;
            }

            if (
                existingTask.getEventID() === -1 ||
                (task.getEventID() !== -1 &&
                    task.getEventID() < existingTask.getEventID())
            ) {
                uniqueTaskMap.set(key, task);
            }
        }

        return [...uniqueTaskMap.values()].sort(
            (taskA, taskB) =>
                taskA.getDate().getTime() - taskB.getDate().getTime()
        );
    }

    private getTaskIdentityKey(task: Task): string {
        return [
            task.getLead()?.leadID ?? "no-lead",
            this.formatDate(task.getDate()),
            task.getTitle(),
        ].join("|");
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
