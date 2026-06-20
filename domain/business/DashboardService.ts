import { AgendaService } from "@/domain/business/AgendaService";
import { ScoringService } from "@/domain/business/ScoringService";
import { Lead } from "@/domain/objects/Lead";
import { Task } from "@/domain/objects/Task";

export type DashboardTaskStatus = "overdue" | "scheduled" | "completed";

export type DashboardTaskItem = {
    id: number;
    leadId: number | null;
    leadName: string;
    title: string;
    type: string;
    time: string;
    status: DashboardTaskStatus;
    score: number;
    date: Date;
};

export type DashboardPriorityItem = {
    leadId: number;
    leadName: string;
    vehicleInterest: string;
    stage: string;
    status: string;
    score: number;
    reason: string;
    tone: "red" | "amber" | "blue";
};

export type DashboardMetrics = {
    todayTaskCount: number;
    highPriorityLeadCount: number;
    unrepliedMessageCount: number;
    overdueTaskCount: number;
};

export type DashboardData = {
    metrics: DashboardMetrics;
    todayTasks: DashboardTaskItem[];
    priorityActions: DashboardPriorityItem[];
};

export class DashboardService {
    private scoringService: ScoringService;
    private agendaService: AgendaService;
    private highPriorityThreshold: number;

    constructor(
        scoringService: ScoringService,
        agendaService: AgendaService
    ) {
        this.scoringService = scoringService;
        this.agendaService = agendaService;
        this.highPriorityThreshold = ScoringService.THRESHOLD;
    }

    getDashboardData(
        leads: Lead[],
        tasks: Task[],
        targetDate: Date
    ): DashboardData {
        const todayTasks = this.getTodayTasks(tasks, leads, targetDate);
        const overdueTasks = this.getOverdueTasks(tasks, targetDate);
        const highPriorityLeads = this.getHighPriorityLeads(leads);

        return {
            metrics: {
                todayTaskCount: todayTasks.length,
                highPriorityLeadCount: highPriorityLeads.length,
                // TODO: Replace with NotificationRepository or message activity tracking once inbound message state exists.
                unrepliedMessageCount: 0,
                overdueTaskCount: overdueTasks.length,
            },
            todayTasks,
            priorityActions: highPriorityLeads.map((lead) =>
                this.toPriorityItem(lead)
            ),
        };
    }

    getSystemAssignedTasks(
        leads: Lead[],
        existingTasks: Task[],
        targetDate: Date
    ): Task[] {
        return this.agendaService.getSystemAssignedTasks(
            leads,
            existingTasks,
            targetDate
        );
    }

    getTodayTasks(
        tasks: Task[],
        leads: Lead[],
        targetDate: Date
    ): DashboardTaskItem[] {
        const leadMap = this.createLeadMap(leads);
        const targetDateString = this.formatDate(targetDate);

        return tasks
            .filter(
                (task) => this.formatDate(task.getDate()) === targetDateString
            )
            .map((task) => this.toTaskItem(task, leadMap, targetDate))
            .sort((taskA, taskB) => {
                const statusRank =
                    this.getTaskStatusRank(taskA.status) -
                    this.getTaskStatusRank(taskB.status);

                if (statusRank !== 0) {
                    return statusRank;
                }

                const timeDiff =
                    taskA.date.getTime() - taskB.date.getTime();

                if (timeDiff !== 0) {
                    return timeDiff;
                }

                return taskB.score - taskA.score;
            });
    }

    getOverdueTasks(tasks: Task[], targetDate: Date): Task[] {
        const targetDateString = this.formatDate(targetDate);

        return tasks.filter(
            (task) =>
                !task.isCompleted() &&
                this.formatDate(task.getDate()) < targetDateString
        );
    }

    getHighPriorityLeads(leads: Lead[]): Lead[] {
        return [...leads]
            .map((lead) => {
                lead.updateScore(
                    Math.max(
                        lead.score,
                        this.scoringService.calculateScore(lead)
                    )
                );
                return lead;
            })
            .filter((lead) => lead.score >= this.highPriorityThreshold)
            .sort((leadA, leadB) => leadB.score - leadA.score);
    }

    private toTaskItem(
        task: Task,
        leadMap: Map<number, Lead>,
        targetDate: Date
    ): DashboardTaskItem {
        const leadId = task.getLead()?.leadID ?? null;
        const lead = leadId ? leadMap.get(leadId) : null;
        const status = this.getTaskStatus(task, targetDate);

        return {
            id: task.getEventID(),
            leadId,
            leadName: lead?.getLeadName() ?? `Lead ${leadId ?? "N/A"}`,
            title: task.getTitle(),
            type: this.getTaskType(task.getTitle()),
            time: this.formatTime(task.getDate()),
            status,
            score: lead?.score ?? 0,
            date: task.getDate(),
        };
    }

    private toPriorityItem(lead: Lead): DashboardPriorityItem {
        return {
            leadId: lead.leadID,
            leadName: lead.getLeadName(),
            vehicleInterest:
                lead.vehicleInterest?.getFullDescription() ??
                "No vehicle interest listed",
            stage: lead.stage,
            status: lead.status ? "Active" : "Lost",
            score: Math.floor(lead.score),
            reason: "High priority lead based on score.",
            tone: this.getPriorityTone(lead.score),
        };
    }

    private createLeadMap(leads: Lead[]): Map<number, Lead> {
        return new Map(leads.map((lead) => [lead.leadID, lead]));
    }

    private getTaskStatus(
        task: Task,
        targetDate: Date
    ): DashboardTaskStatus {
        if (task.isCompleted()) {
            return "completed";
        }

        if (task.getDate().getTime() < targetDate.getTime()) {
            return "overdue";
        }

        return "scheduled";
    }

    private getTaskStatusRank(status: DashboardTaskStatus): number {
        if (status === "overdue") {
            return 0;
        }

        if (status === "scheduled") {
            return 1;
        }

        return 2;
    }

    private getTaskType(title: string): string {
        const normalizedTitle = title.toLowerCase();

        if (
            normalizedTitle.includes("call") ||
            normalizedTitle.includes("phone")
        ) {
            return "Follow-up call";
        }

        if (
            normalizedTitle.includes("message") ||
            normalizedTitle.includes("email") ||
            normalizedTitle.includes("send")
        ) {
            return "Message";
        }

        if (
            normalizedTitle.includes("appointment") ||
            normalizedTitle.includes("test drive")
        ) {
            return "Appointment";
        }

        return "Follow-up";
    }

    private getPriorityTone(score: number): "red" | "amber" | "blue" {
        if (score >= this.highPriorityThreshold + 20) {
            return "red";
        }

        if (score >= this.highPriorityThreshold) {
            return "amber";
        }

        return "blue";
    }

    private formatDate(date: Date): string {
        const normalizedDate = new Date(date);
        const year = normalizedDate.getFullYear();
        const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
        const day = String(normalizedDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    private formatTime(date: Date): string {
        return new Intl.DateTimeFormat("en-CA", {
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    }
}
