import {
    Activity,
    CalendarCheck,
    CheckCircle2,
    CircleDollarSign,
    Gauge,
    MessageSquareReply,
    TrendingUp,
    Users,
} from "lucide-react";

import {
    AnalyticsNumberMetric,
    AnalyticsRatioMetric,
    AnalyticsService,
} from "@/domain/business/AnalyticsService";
import { ScoringService } from "@/domain/business/ScoringService";
import { LeadRepo } from "@/lib/persistence/real/supabase/LeadRepo";
import { NotificationRepo } from "@/lib/persistence/real/supabase/NotificationRepo";
import { TaskRepo } from "@/lib/persistence/real/supabase/TaskRepo";

const sectionConfig = [
    {
        title: "Conversion Performance",
        description: "How effectively leads move into appointments and deliveries.",
        icon: TrendingUp,
    },
    {
        title: "Lead Quality",
        description: "Current pipeline health and high-intent opportunity mix.",
        icon: Gauge,
    },
    {
        title: "Communication Effectiveness",
        description: "Customer engagement, two-way conversations, and follow-up discipline.",
        icon: MessageSquareReply,
    },
    {
        title: "Revenue Insights",
        description: "Budget quality and margin-related delivery indicators.",
        icon: CircleDollarSign,
    },
];

function formatPercent(value: number): string {
    return `${value}%`;
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-CA", {
        maximumFractionDigits: 1,
    }).format(value);
}

function RatioCard({ metric }: { metric: AnalyticsRatioMetric }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {metric.label}
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-950">
                        {formatPercent(metric.percentage)}
                    </h3>
                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {metric.numerator}/{metric.denominator}
                </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${metric.percentage}%` }}
                />
            </div>

            <p className="mt-3 text-sm text-slate-500">
                {metric.description}
            </p>

            {metric.note ? (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    {metric.note}
                </p>
            ) : null}
        </div>
    );
}

function NumberCard({ metric }: { metric: AnalyticsNumberMetric }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
                {metric.label}
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {formatNumber(metric.value)}
            </h3>
            <p className="mt-3 text-sm text-slate-500">
                {metric.description}
            </p>

            {metric.note ? (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    {metric.note}
                </p>
            ) : null}
        </div>
    );
}

function SectionHeader({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description: string;
    icon: typeof Activity;
}) {
    return (
        <div className="mb-5 flex items-center justify-between gap-4">
            <div>
                <h2 className="text-lg font-bold text-slate-950">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>
            </div>
            <Icon className="shrink-0 text-blue-600" size={22} />
        </div>
    );
}

export default async function AnalyticsPage() {
    const leadRepository = new LeadRepo();
    const taskRepository = new TaskRepo();
    const notificationRepository = new NotificationRepo();
    const analyticsService = new AnalyticsService(new ScoringService());

    const [leads, tasks, notifications] = await Promise.all([
        leadRepository.getAllLeads(),
        taskRepository.getAllTasks(),
        notificationRepository.getAllNotifications(),
    ]);

    const summary = analyticsService.getAnalyticsSummary(
        leads,
        tasks,
        notifications
    );
    const [conversionConfig, qualityConfig, communicationConfig, revenueConfig] =
        sectionConfig;

    return (
        <main className="space-y-6 text-slate-900">
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader {...conversionConfig} />
                <div className="grid gap-4 md:grid-cols-2">
                    <RatioCard
                        metric={
                            summary.conversionPerformance
                                .leadAppointmentRatio
                        }
                    />
                    <RatioCard
                        metric={
                            summary.conversionPerformance.leadDeliveryRatio
                        }
                    />
                </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader {...qualityConfig} />
                <div className="grid gap-4 md:grid-cols-2">
                    <RatioCard metric={summary.leadQuality.activeLeadRatio} />
                    <RatioCard metric={summary.leadQuality.hotLeadRatio} />
                </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader {...communicationConfig} />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <RatioCard
                        metric={
                            summary.communicationEffectiveness
                                .engagementRatio
                        }
                    />
                    <RatioCard
                        metric={
                            summary.communicationEffectiveness
                                .twoWayCommunicationRatio
                        }
                    />
                    <RatioCard
                        metric={
                            summary.communicationEffectiveness
                                .followUpCompletionRatio
                        }
                    />
                    <RatioCard
                        metric={
                            summary.communicationEffectiveness
                                .onTimeFollowUpRatio
                        }
                    />
                    <NumberCard
                        metric={
                            summary.communicationEffectiveness
                                .averageTouchpointsPerLead
                        }
                    />
                </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader {...revenueConfig} />
                <div className="grid gap-4 md:grid-cols-2">
                    <RatioCard
                        metric={summary.revenueInsights.highValueLeadRatio}
                    />
                    <RatioCard
                        metric={summary.revenueInsights.budgetThresholdRatio}
                    />
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Users size={22} />
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                        Data Source
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        Calculated from real Leads, Tasks, and Notifications repositories.
                    </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CalendarCheck size={22} />
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                        Appointment Detection
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        Appointment ratios use appointment-related task and notification records.
                    </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CheckCircle2 size={22} />
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                        Extensible Summary
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        New metrics can be added to AnalyticsSummary without changing repository boundaries.
                    </p>
                </div>
            </section>
        </main>
    );
}
