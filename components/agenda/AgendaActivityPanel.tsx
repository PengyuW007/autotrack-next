import {
    Bell,
    CalendarCheck,
    CheckCircle2,
    Circle,
} from "lucide-react";

import { AgendaActivity } from "@/domain/business/AgendaService";

type Props = {
    selectedDate: Date;
    agendaActivities: AgendaActivity[];
    loading: boolean;
};

function formatTime(date: Date) {
    return new Intl.DateTimeFormat("en-CA", {
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

export default function AgendaActivityPanel({
    selectedDate,
    agendaActivities,
    loading,
}: Props) {
    return (
        <section className="min-h-[320px] rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Daily Activities</h2>
                    <p className="text-sm text-slate-500">
                        {selectedDate.toDateString()}
                    </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                    {agendaActivities.length} Activities
                </span>
            </div>

            <div className="h-[280px] space-y-3 overflow-y-auto pr-2">
                {loading ? (
                    <p className="text-sm text-slate-400">
                        Loading activities...
                    </p>
                ) : null}

                {!loading &&
                    agendaActivities.map((activity) => {
                        const isTask = activity.type === "TASK";
                        const Icon = isTask ? CalendarCheck : Bell;

                        return (
                            <div
                                key={`${activity.type}-${activity.id}`}
                                className="rounded-lg border border-slate-200 p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-3">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                                isTask
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "bg-amber-50 text-amber-600"
                                            }`}
                                        >
                                            <Icon size={20} />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-slate-950">
                                                {activity.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {activity.leadName} - {formatTime(activity.date)}
                                            </p>
                                        </div>
                                    </div>

                                    {isTask ? (
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                activity.completed
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {activity.completed ? (
                                                <CheckCircle2 size={14} />
                                            ) : (
                                                <Circle size={14} />
                                            )}
                                            {activity.completed
                                                ? "Completed"
                                                : "Uncompleted"}
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                            Notification
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                {!loading && agendaActivities.length === 0 ? (
                    <p className="text-sm text-slate-400">
                        No activities for this date.
                    </p>
                ) : null}
            </div>
        </section>
    );
}
