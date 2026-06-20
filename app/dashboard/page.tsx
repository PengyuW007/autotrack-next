import Link from "next/link";
import {
    AlertTriangle,
    Bell,
    CalendarCheck,
    CheckCircle2,
    Clock,
    MessageSquareReply,
    MessageSquareWarning,
    Phone,
    PlusCircle,
    RefreshCcw,
    UserRound,
} from "lucide-react";

import { AgendaService } from "@/domain/business/AgendaService";
import {
    DashboardService,
    DashboardTaskStatus,
} from "@/domain/business/DashboardService";
import { PriorityManager } from "@/domain/business/PriorityManager";
import { ScoringService } from "@/domain/business/ScoringService";
import { Task } from "@/domain/objects/Task";
import { LeadRepo } from "@/lib/persistence/real/supabase/LeadRepo";
import { TaskRepo } from "@/lib/persistence/real/supabase/TaskRepo";

const recentActivities = [
    {
        label: "New lead added",
        detail: "Daniel Zhang was added from website inquiry.",
        time: "12 minutes ago",
        icon: PlusCircle,
    },
    {
        label: "Customer reply received",
        detail: "Sarah Chen replied to the Tiguan follow-up message.",
        time: "2 hours ago",
        icon: MessageSquareReply,
    },
    {
        label: "Task completed",
        detail: "John Smith quote call marked complete.",
        time: "Yesterday 4:20 PM",
        icon: CheckCircle2,
    },
    {
        label: "Lead status changed",
        detail: "Sarah Chen moved from Contacted to Test Drive.",
        time: "Yesterday 2:10 PM",
        icon: RefreshCcw,
    },
    {
        label: "Reminder triggered",
        detail: "Follow-up reminder created for John Smith.",
        time: "Yesterday 9:00 AM",
        icon: Bell,
    },
];

function getPriorityTone(tone: string) {
    if (tone === "red") {
        return "border-red-200 bg-red-50 text-red-700";
    }

    if (tone === "amber") {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-blue-200 bg-blue-50 text-blue-700";
}

function getTaskTone(status: DashboardTaskStatus) {
    if (status === "overdue") {
        return {
            card: "border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100/60",
            icon: "bg-red-100 text-red-700",
            title: "text-red-950",
            meta: "text-red-700",
            badge: "bg-red-100 text-red-700",
            label: "Overdue",
        };
    }

    if (status === "completed") {
        return {
            card: "border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100/60",
            icon: "bg-green-100 text-green-700",
            title: "text-green-950 line-through",
            meta: "text-green-700 line-through",
            badge: "bg-green-100 text-green-700",
            label: "Completed",
        };
    }

    return {
        card: "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50",
        icon: "bg-slate-100 text-slate-600",
        title: "text-slate-950",
        meta: "text-slate-500",
        badge: "bg-white text-slate-600",
        label: "Scheduled",
    };
}

function getTaskIcon(type: string) {
    if (type === "Follow-up call") {
        return Phone;
    }

    if (type === "Message") {
        return MessageSquareReply;
    }

    if (type === "Appointment") {
        return CalendarCheck;
    }

    return UserRound;
}

export default async function DashboardPage() {
    const targetDate = new Date();
    const leadRepo = new LeadRepo();
    const taskRepo = new TaskRepo();
    const scoringService = new ScoringService();
    const priorityManager = new PriorityManager(scoringService);
    const agendaService = new AgendaService(scoringService, priorityManager);
    const dashboardService = new DashboardService(
        scoringService,
        agendaService
    );

    const [leads, tasks, followUpLeads] = await Promise.all([
        leadRepo.getAllLeads(),
        taskRepo.getAllTasks(),
        leadRepo.getLeadsByFollowUpDate(targetDate),
    ]);

    const systemTasks = dashboardService.getSystemAssignedTasks(
        followUpLeads,
        tasks,
        targetDate
    );
    const createdSystemTasks: Task[] = [];

    for (const task of systemTasks) {
        const error = await taskRepo.insertTask(task);

        if (!error) {
            createdSystemTasks.push(task);
        }
    }

    const dashboardData = dashboardService.getDashboardData(
        leads,
        [...tasks, ...createdSystemTasks],
        targetDate
    );

    const summaryCards = [
        {
            title: "Today's Tasks",
            value: dashboardData.metrics.todayTaskCount.toString(),
            description: "Scheduled work due today",
            icon: CalendarCheck,
        },
        {
            title: "High Priority Leads",
            value: dashboardData.metrics.highPriorityLeadCount.toString(),
            description: "Need immediate attention today",
            icon: AlertTriangle,
        },
        {
            title: "Unreplied Messages",
            value: dashboardData.metrics.unrepliedMessageCount.toString(),
            description: "Customer replies waiting for response",
            icon: MessageSquareWarning,
        },
        {
            title: "Overdue Follow-ups",
            value: dashboardData.metrics.overdueTaskCount.toString(),
            description: "Missed or past-due scheduled actions",
            icon: Clock,
        },
    ];

    return (
        <main className="bg-slate-50 text-slate-900">
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Icon size={24} />
                            </div>

                            <p className="text-sm font-medium text-slate-500">
                                {card.title}
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-950">
                                {card.value}
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                {card.description}
                            </p>
                        </div>
                    );
                })}
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-950">
                                Priority Action Center
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Recommended urgent actions based on score, overdue work, unreplied messages, and important lead activity.
                            </p>
                        </div>

                        <Bell className="shrink-0 text-blue-600" size={24} />
                    </div>

                    <div className="max-h-[430px] space-y-4 overflow-y-auto pr-2">
                        {dashboardData.priorityActions.map((action) => (
                            <Link
                                key={action.leadId}
                                href={`/leads/${action.leadId}`}
                                className={`block rounded-lg border p-5 transition hover:border-blue-300 hover:bg-blue-50/60 ${getPriorityTone(action.tone)}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-slate-950">
                                                {action.leadName}
                                            </h3>
                                            <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold">
                                                Score {action.score}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm font-semibold">
                                            {action.stage} - {action.status}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-700">
                                            {action.vehicleInterest}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-700">
                                            {action.reason}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold">
                                        High
                                    </span>
                                </div>
                            </Link>
                        ))}

                        {dashboardData.priorityActions.length === 0 ? (
                            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                No high-priority leads found.
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-950">
                            Today&apos;s Tasks
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Planned work for today only. Overdue tasks stay on top, scheduled tasks stay neutral, and completed work moves to the bottom.
                        </p>
                    </div>

                    <div className="max-h-[430px] space-y-4 overflow-y-auto pr-2">
                        {dashboardData.todayTasks.map((task) => {
                            const Icon = getTaskIcon(task.type);
                            const tone = getTaskTone(task.status);
                            const taskContent = (
                                <>
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
                                        <Icon size={20} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className={`font-semibold ${tone.title}`}>
                                                {task.title}
                                            </h3>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
                                                {tone.label}
                                            </span>
                                        </div>
                                        <p className={`mt-1 text-sm ${tone.meta}`}>
                                            {task.time} - {task.type} - score {task.score}
                                        </p>
                                        <p className={`mt-1 text-xs ${tone.meta}`}>
                                            {task.leadName}
                                        </p>
                                    </div>
                                </>
                            );

                            if (!task.leadId) {
                                return (
                                    <div
                                        key={task.id}
                                        className={`flex items-start gap-4 rounded-lg border p-4 transition ${tone.card}`}
                                    >
                                        {taskContent}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={task.id}
                                    href={`/leads/${task.leadId}`}
                                    className={`flex items-start gap-4 rounded-lg border p-4 transition ${tone.card}`}
                                >
                                    {taskContent}
                                </Link>
                            );
                        })}

                        {dashboardData.todayTasks.length === 0 ? (
                            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                No tasks scheduled for today.
                            </p>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-slate-950">
                        Recent Activity
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Recent system updates from leads, messages, tasks, appointments, and reminders.
                    </p>
                    {/* TODO: Replace static recent activity with NotificationRepository and message activity tracking. */}
                </div>

                <div className="max-h-[270px] space-y-3 overflow-y-auto pr-2">
                    {recentActivities.map((activity) => {
                        const Icon = activity.icon;

                        return (
                            <div
                                key={`${activity.label}-${activity.time}`}
                                className="flex gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600"
                            >
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
                                    <Icon size={17} />
                                </div>

                                <div>
                                    <p className="font-semibold text-slate-950">
                                        {activity.label}
                                    </p>
                                    <p className="mt-1">
                                        {activity.detail}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
