import {
    Activity,
    BarChart3,
    CalendarClock,
    CheckCircle2,
    CircleDollarSign,
    Gauge,
    PieChart,
    TrendingUp,
    Users,
} from "lucide-react";

import { LeadRepo } from "@/lib/persistence/real/supabase/LeadRepo";
import { TaskRepo } from "@/lib/persistence/real/supabase/TaskRepo";

const moneyFormatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: 0,
});

function getPercent(value: number, total: number) {
    if (total === 0) {
        return 0;
    }

    return Math.round((value / total) * 100);
}

function formatDate(date: Date | null | undefined) {
    if (!date) {
        return "No activity";
    }

    return new Intl.DateTimeFormat("en-CA", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export default async function AnalyticsPage() {
    const leadRepository = new LeadRepo();
    const taskRepository = new TaskRepo();

    const [leads, tasks] = await Promise.all([
        leadRepository.getAllLeads(),
        taskRepository.getAllTasks(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalLeads = leads.length;
    const activeLeads = leads.filter((lead) => lead.status).length;
    const closedLeads = leads.filter((lead) => !lead.status).length;
    const hotLeads = leads.filter((lead) => lead.score >= 80).length;
    const tradeInLeads = leads.filter((lead) => lead.tradeInVehicle !== null).length;
    const averageScore =
        totalLeads === 0
            ? 0
            : Math.round(
                  leads.reduce((total, lead) => total + lead.score, 0) / totalLeads
              );
    const totalPipeline = leads.reduce((total, lead) => total + lead.budget, 0);
    const overdueTasks = tasks.filter((task) => {
        const taskDate = new Date(task.getDate());
        taskDate.setHours(0, 0, 0, 0);

        return !task.isCompleted() && taskDate < today;
    }).length;

    const stageCounts = leads.reduce<Record<string, number>>((counts, lead) => {
        const stage = lead.stage || "UNKNOWN";
        counts[stage] = (counts[stage] ?? 0) + 1;
        return counts;
    }, {});

    const stageRows = Object.entries(stageCounts).sort(
        ([stageA], [stageB]) => stageA.localeCompare(stageB)
    );

    const scoreBands = [
        {
            label: "Hot",
            detail: "80+ score",
            count: leads.filter((lead) => lead.score >= 80).length,
            color: "bg-green-500",
        },
        {
            label: "Warm",
            detail: "50 - 79 score",
            count: leads.filter((lead) => lead.score >= 50 && lead.score < 80).length,
            color: "bg-blue-500",
        },
        {
            label: "Cold",
            detail: "Below 50 score",
            count: leads.filter((lead) => lead.score < 50).length,
            color: "bg-slate-400",
        },
    ];

    const topLeads = [...leads]
        .sort((leadA, leadB) => leadB.score - leadA.score)
        .slice(0, 4);

    const metricCards = [
        {
            title: "Total Leads",
            value: totalLeads.toString(),
            description: `${activeLeads} active, ${closedLeads} lost`,
            icon: Users,
        },
        {
            title: "Average Score",
            value: averageScore.toString(),
            description: `${hotLeads} leads scoring 80+`,
            icon: Gauge,
        },
        {
            title: "Pipeline Budget",
            value: moneyFormatter.format(totalPipeline),
            description: "Declared customer budgets",
            icon: CircleDollarSign,
        },
        {
            title: "Overdue Tasks",
            value: overdueTasks.toString(),
            description: "Open follow-ups past due",
            icon: CalendarClock,
        },
    ];

    return (
        <main className="text-slate-900">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metricCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Icon size={22} />
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

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-950">
                                Stage Distribution
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Where leads currently sit in the sales process.
                            </p>
                        </div>
                        <BarChart3 className="text-blue-600" size={22} />
                    </div>

                    <div className="space-y-4">
                        {stageRows.map(([stage, count]) => {
                            const percent = getPercent(count, totalLeads);

                            return (
                                <div key={stage}>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-700">
                                            {stage.replace("_", " ")}
                                        </span>
                                        <span className="text-slate-500">
                                            {count} lead{count === 1 ? "" : "s"} - {percentFormatter.format(percent)}%
                                        </span>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-blue-600"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-950">
                                Lead Quality
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Score bands and trade-in opportunity mix.
                            </p>
                        </div>
                        <PieChart className="text-blue-600" size={22} />
                    </div>

                    <div className="space-y-4">
                        {scoreBands.map((band) => {
                            const percent = getPercent(band.count, totalLeads);

                            return (
                                <div key={band.label} className="rounded-lg bg-slate-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-950">
                                                {band.label}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {band.detail}
                                            </p>
                                        </div>
                                        <span className="text-lg font-bold text-slate-950">
                                            {band.count}
                                        </span>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                        <div
                                            className={`h-full rounded-full ${band.color}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                        <TrendingUp size={20} />
                        <span>
                            {tradeInLeads} of {totalLeads} leads have trade-in potential.
                        </span>
                    </div>
                </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-950">
                            Top Lead Opportunities
                        </h2>
                        <Activity className="text-blue-600" size={22} />
                    </div>

                    <div className="space-y-3">
                        {topLeads.map((lead) => (
                            <div
                                key={lead.leadID}
                                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                            >
                                <div>
                                    <p className="font-semibold text-slate-950">
                                        {lead.getLeadName()}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {lead.vehicleInterest?.getFullDescription() ?? "No vehicle selected"}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-lg font-bold text-blue-600">
                                        {Math.floor(lead.score)}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {lead.stage}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-950">
                            Follow-up Health
                        </h2>
                        <CheckCircle2 className="text-blue-600" size={22} />
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="px-4 py-3">Lead</th>
                                    <th className="px-4 py-3">Last Interaction</th>
                                    <th className="px-4 py-3">Next Follow-up</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead.leadID} className="border-t border-slate-200">
                                        <td className="px-4 py-3 font-medium text-slate-950">
                                            {lead.getLeadName()}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {formatDate(lead.lastInteractionDate)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {formatDate(lead.followUpDate)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    lead.status
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-red-50 text-red-700"
                                                }`}
                                            >
                                                {lead.status ? "Active" : "Lost"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    );
}
