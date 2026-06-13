import {
    Bell,
    CalendarCheck,
    Clock,
    MessageSquareWarning,
    Phone,
    UserRound,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";

const summaryCards = [
    {
        title: "Today's Tasks",
        value: "12",
        description: "Follow-ups scheduled for today",
        icon: CalendarCheck,
    },
    {
        title: "High Priority",
        value: "4",
        description: "Leads need immediate attention",
        icon: AlertTriangle,
    },
    {
        title: "Unreplied Messages",
        value: "3",
        description: "Customer messages waiting",
        icon: MessageSquareWarning,
    },
    {
        title: "Overdue",
        value: "2",
        description: "Missed follow-up tasks",
        icon: Clock,
    },
];

const priorityItems = [
    {
        name: "Michael Chen",
        type: "Unreplied message",
        detail: "Asked about Tiguan Comfortline availability",
        time: "2 hours ago",
        priority: "High",
    },
    {
        name: "Sarah Lee",
        type: "Follow-up overdue",
        detail: "Test drive follow-up was due this morning",
        time: "Today 9:00 AM",
        priority: "High",
    },
    {
        name: "David Wang",
        type: "Hot lead",
        detail: "Requested final price for Atlas Highline",
        time: "Yesterday",
        priority: "Medium",
    },
];

const todayTasks = [
    {
        title: "Call Jason about Jetta quote",
        type: "Call",
        time: "10:30 AM",
        icon: Phone,
    },
    {
        title: "Reply to Emily's trade-in message",
        type: "Message",
        time: "11:00 AM",
        icon: MessageSquareWarning,
    },
    {
        title: "Confirm test drive with Kevin",
        type: "Appointment",
        time: "1:30 PM",
        icon: CalendarCheck,
    },
    {
        title: "Follow up with Linda after showroom visit",
        type: "Follow-up",
        time: "3:00 PM",
        icon: UserRound,
    },
    {
        title: "Follow up with Linda after test drive",
        type: "Follow-up",
        time: "4:00 PM",
        icon: UserRound,
    },
];

const activities = [
    "New lead added: Daniel Zhang",
    "Emma replied to your Atlas follow-up",
    "Appointment booked with Kevin at 1:30 PM",
    "Sarah Lee moved to High Priority",
];

export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-8 py-8 text-slate-900">
            <section className="mb-8">
                {/*<p className="text-sm font-medium text-blue-600">Dashboard</p>*/}
                <h1 className="mt-2 text-4xl font-bold text-slate-950">
                    Today&apos;s Sales Command Center
                </h1>
                {/*<p className="mt-3 max-w-2xl text-slate-500">*/}
                {/*    Track today&apos;s follow-ups, urgent customer messages, and priority*/}
                {/*    leads in one place.*/}
                {/*</p>*/}
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
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

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                {/* Priority Action Center */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-950">
                                Priority Action Center
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Start with these leads first.
                            </p>
                        </div>

                        <Bell className="text-blue-600" size={24} />
                    </div>

                    <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
                        {priorityItems.map((item) => (
                            <div
                                key={item.name}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-950">
                                            {item.name}
                                        </h3>
                                        <p className="mt-1 text-sm font-medium text-blue-600">
                                            {item.type}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {item.detail}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                        {item.priority}
                                    </span>
                                </div>

                                <p className="mt-3 text-xs text-slate-400">{item.time}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today's Tasks */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-950">Today&apos;s Tasks</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Scheduled follow-ups and reminders.
                    </p>

                    <div className="mt-6 max-h-[420px] space-y-4 overflow-y-auto pr-2">
                        {todayTasks.map((task) => {
                            const Icon = task.icon;

                            return (
                                <div
                                    key={task.title}
                                    className="flex items-start gap-4 rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Icon size={20} />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-950">
                                            {task.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {task.type} - {task.time}
                                        </p>
                                    </div>

                                    <CheckCircle2 className="text-slate-300" size={22} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Recent Activity */}
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">Recent Activity</h2>

                <div className="mt-5 max-h-[260px] space-y-3 overflow-y-auto pr-2">
                    {activities.map((activity) => (
                        <div
                            key={activity}
                            className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
                        >
                            {activity}
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
