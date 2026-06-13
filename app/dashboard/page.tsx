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

const priorityActions = [
    {
        leadId: 2,
        leadName: "Sarah Chen",
        type: "Overdue follow-up",
        detail: "Test drive follow-up was due this morning.",
        time: "Today 9:00 AM",
        priority: "High",
        score: 96,
        tone: "red",
    },
    {
        leadId: 1,
        leadName: "John Smith",
        type: "High-score lead",
        detail: "Waiting for pricing confirmation on Jetta Comfortline.",
        time: "Today 10:30 AM",
        priority: "High",
        score: 85,
        tone: "amber",
    },
    {
        leadId: 2,
        leadName: "Sarah Chen",
        type: "Unreplied message",
        detail: "Asked whether Tiguan inventory can be held until Friday.",
        time: "2 hours ago",
        priority: "High",
        score: 82,
        tone: "red",
    },
    {
        leadId: 1,
        leadName: "John Smith",
        type: "Appointment confirmation",
        detail: "Confirm showroom visit and trade-in documents.",
        time: "Today 1:30 PM",
        priority: "Medium",
        score: 74,
        tone: "blue",
    },
];

const todayTasks = [
    {
        leadId: 1,
        title: "Call John about Jetta quote",
        type: "Follow-up call",
        time: "10:30 AM",
        status: "overdue",
        score: 85,
        icon: Phone,
    },
    {
        leadId: 2,
        title: "Send Tiguan payment options",
        type: "Message",
        time: "11:00 AM",
        status: "scheduled",
        score: 62,
        icon: MessageSquareReply,
    },
    {
        leadId: 1,
        title: "Confirm afternoon showroom appointment",
        type: "Appointment",
        time: "1:30 PM",
        status: "scheduled",
        score: 74,
        icon: CalendarCheck,
    },
    {
        leadId: 2,
        title: "Prepare trade-in estimate notes",
        type: "Preparation",
        time: "3:00 PM",
        status: "scheduled",
        score: 58,
        icon: UserRound,
    },
    {
        leadId: 1,
        title: "Review John Smith quote notes",
        type: "Follow-up",
        time: "9:00 AM",
        status: "completed",
        score: 70,
        icon: CheckCircle2,
    },
];

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

const overdueFollowUps = priorityActions.filter(
    (action) => action.type === "Overdue follow-up"
).length;

const summaryCards = [
    {
        title: "Today's Tasks",
        value: todayTasks.length.toString(),
        description: "Scheduled work due today",
        icon: CalendarCheck,
    },
    {
        title: "High Priority Leads",
        value: priorityActions
            .filter((action) => action.priority === "High")
            .length.toString(),
        description: "Need immediate attention today",
        icon: AlertTriangle,
    },
    {
        title: "Unreplied Messages",
        value: priorityActions
            .filter((action) => action.type === "Unreplied message")
            .length.toString(),
        description: "Customer replies waiting for response",
        icon: MessageSquareWarning,
    },
    {
        title: "Overdue Follow-ups",
        value: overdueFollowUps.toString(),
        description: "Missed or past-due scheduled actions",
        icon: Clock,
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

function getTaskStatusRank(status: string) {
    if (status === "overdue") {
        return 0;
    }

    if (status === "scheduled") {
        return 1;
    }

    return 2;
}

function getTaskTone(status: string) {
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

export default function DashboardPage() {
    const sortedTodayTasks = [...todayTasks].sort((taskA, taskB) => {
        const rankDiff =
            getTaskStatusRank(taskA.status) - getTaskStatusRank(taskB.status);

        if (rankDiff !== 0) {
            return rankDiff;
        }

        return taskA.time.localeCompare(taskB.time);
    });

    return (
        <main className="bg-slate-50 text-slate-900">
            <section className="mb-8">
                <h1 className="text-4xl font-bold text-slate-950">
                    Today&apos;s Sales Command Center
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-slate-500">
                    Dashboard summarizes the most important actions from Agenda, Leads, and future notifications without replacing those pages.
                </p>
            </section>

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
                        {priorityActions.map((action) => (
                            <Link
                                key={`${action.leadId}-${action.type}-${action.time}`}
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
                                            {action.type}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-700">
                                            {action.detail}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold">
                                        {action.priority}
                                    </span>
                                </div>

                                <p className="mt-3 text-xs text-slate-500">
                                    {action.time}
                                </p>
                            </Link>
                        ))}
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
                        {sortedTodayTasks.map((task) => {
                            const Icon = task.icon;
                            const tone = getTaskTone(task.status);

                            return (
                                <Link
                                    key={`${task.leadId}-${task.title}`}
                                    href={`/leads/${task.leadId}`}
                                    className={`flex items-start gap-4 rounded-lg border p-4 transition ${tone.card}`}
                                >
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
                                    </div>
                                </Link>
                            );
                        })}
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
