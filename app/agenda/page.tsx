"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import AgendaCalendar from "@/components/agenda/AgendaCalendar";
import AgendaActivityPanel from "@/components/agenda/AgendaActivityPanel";

import {
    AgendaActivity,
    AgendaService,
} from "@/domain/business/AgendaService";
import { ScoringService } from "@/domain/business/ScoringService";
import { PriorityManager } from "@/domain/business/PriorityManager";
import { Lead } from "@/domain/objects/Lead";
import { Task } from "@/domain/objects/Task";

import { LeadRepo } from "@/lib/persistence/real/supabase/LeadRepo";
import { NotificationRepo } from "@/lib/persistence/real/supabase/NotificationRepo";
import { TaskRepo } from "@/lib/persistence/real/supabase/TaskRepo";

function formatDateInput(date: Date): string {
    const normalizedDate = new Date(date);
    const year = normalizedDate.getFullYear();
    const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
    const day = String(normalizedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function createDateTime(dateValue: string, timeValue: string): Date {
    const [year, month, day] = dateValue.split("-").map(Number);
    const [hour, minute] = timeValue.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute);
}

function formatLeadDetails(lead: Lead): string {
    return [lead.phone, lead.leadEmail].filter(Boolean).join(" - ");
}

function getUnfinishedTaskCount(activities: AgendaActivity[]): number {
    return activities.filter(
        (activity) =>
            activity.type === "TASK" && activity.completed === false
    ).length;
}

function getPastUnfinishedTaskCounts(
    tasks: Task[],
    todayDateString: string
): Record<string, number> {
    return tasks.reduce<Record<string, number>>((counts, task) => {
        const taskDateString = formatDateInput(task.getDate());

        if (task.isCompleted() || taskDateString >= todayDateString) {
            return counts;
        }

        counts[taskDateString] = (counts[taskDateString] ?? 0) + 1;
        return counts;
    }, {});
}

export default function AgendaPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [agendaActivities, setAgendaActivities] = useState<AgendaActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTimeMs, setCurrentTimeMs] = useState(0);
    const [todayDateString, setTodayDateString] = useState("");
    const [pastUnfinishedTaskCounts, setPastUnfinishedTaskCounts] = useState<
        Record<string, number>
    >({});
    const [togglingTaskIds, setTogglingTaskIds] = useState<number[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [leadSearchText, setLeadSearchText] = useState("");
    const [leadSearchResults, setLeadSearchResults] = useState<Lead[]>([]);
    const [leadSearchLoading, setLeadSearchLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDate, setNewTaskDate] = useState(formatDateInput(new Date()));
    const [newTaskTime, setNewTaskTime] = useState("09:00");
    const [creatingTask, setCreatingTask] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadAgenda() {
            setLoading(true);

            const leadRepo = new LeadRepo();
            const taskRepo = new TaskRepo();
            const notificationRepo = new NotificationRepo();
            const [followUpLeads, tasks, notifications] = await Promise.all([
                leadRepo.getLeadsByFollowUpDate(selectedDate),
                taskRepo.getAllTasks(),
                notificationRepo.getAllNotifications(),
            ]);

            const scoringService = new ScoringService();
            const priorityManager = new PriorityManager(scoringService);

            const agendaService = new AgendaService(
                scoringService,
                priorityManager
            );

            const systemTasks = agendaService.getSystemAssignedTasks(
                followUpLeads,
                tasks,
                selectedDate
            );
            const createdSystemTasks: Task[] = [];

            for (const task of systemTasks) {
                const error = await taskRepo.insertTask(task);

                if (!error) {
                    createdSystemTasks.push(task);
                }
            }

            if (active) {
                const allTasks = [...tasks, ...createdSystemTasks];
                const now = new Date();

                setAgendaActivities(
                    agendaService.getDailyActivities(
                        allTasks,
                        notifications,
                        selectedDate
                    )
                );
                setCurrentTimeMs(now.getTime());
                setTodayDateString(formatDateInput(now));
                setPastUnfinishedTaskCounts(
                    getPastUnfinishedTaskCounts(allTasks, formatDateInput(now))
                );
                setLoading(false);
            }
        }

        loadAgenda();

        return () => {
            active = false;
        };
    }, [selectedDate, refreshKey]);

    useEffect(() => {
        const query = leadSearchText.trim();

        if (query.length < 2 || selectedLead) {
            return;
        }

        let active = true;

        const timer = window.setTimeout(async () => {
            setLeadSearchLoading(true);

            const leadRepo = new LeadRepo();
            const results = await leadRepo.searchLeads(query, 6);

            if (active) {
                setLeadSearchResults(results);
                setLeadSearchLoading(false);
            }
        }, 250);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [leadSearchText, selectedLead]);

    function changeDate(days: number) {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + days);
        selectAgendaDate(nextDate);
    }

    function selectAgendaDate(date: Date) {
        setSelectedDate(date);
        setNewTaskDate(formatDateInput(date));
    }

    function handleLeadSearchChange(value: string) {
        setLeadSearchText(value);
        setSelectedLead(null);
        setCreateError(null);

        if (value.trim().length < 2) {
            setLeadSearchResults([]);
            setLeadSearchLoading(false);
        }
    }

    function handleSelectLead(lead: Lead) {
        setSelectedLead(lead);
        setLeadSearchText(lead.getLeadName());
        setLeadSearchResults([]);
        setLeadSearchLoading(false);
        setCreateError(null);
    }

    async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedLead) {
            setCreateError("Select a lead before creating the task.");
            return;
        }

        if (!newTaskTitle.trim()) {
            setCreateError("Task title is required.");
            return;
        }

        setCreatingTask(true);
        setCreateError(null);

        const taskRepo = new TaskRepo();
        const task = new Task(
            selectedLead,
            newTaskTitle.trim(),
            createDateTime(newTaskDate, newTaskTime)
        );
        const error = await taskRepo.insertTask(task);

        if (error) {
            setCreateError(error);
            setCreatingTask(false);
            return;
        }

        setCreatingTask(false);
        setNewTaskTitle("");
        setLeadSearchText("");
        setSelectedLead(null);
        setLeadSearchResults([]);
        setRefreshKey((currentKey) => currentKey + 1);
    }

    async function handleToggleTask(activity: AgendaActivity) {
        if (activity.type !== "TASK") {
            return;
        }

        if (togglingTaskIds.includes(activity.id)) {
            return;
        }

        setTogglingTaskIds((currentIds) => [...currentIds, activity.id]);

        const taskRepo = new TaskRepo();
        const task = await taskRepo.getTaskById(activity.id);

        if (!task) {
            setTogglingTaskIds((currentIds) =>
                currentIds.filter((taskId) => taskId !== activity.id)
            );
            return;
        }

        task.setCompleted(!activity.completed);

        const error = await taskRepo.updateTask(task);

        if (error) {
            setCreateError(error);
            setTogglingTaskIds((currentIds) =>
                currentIds.filter((taskId) => taskId !== activity.id)
            );
            return;
        }

        setAgendaActivities((currentActivities) =>
            currentActivities.map((currentActivity) =>
                currentActivity.type === "TASK" &&
                currentActivity.id === activity.id
                    ? {
                          ...currentActivity,
                          completed: !activity.completed,
                      }
                    : currentActivity
            )
        );

        setPastUnfinishedTaskCounts((currentCounts) => {
            const taskDateString = formatDateInput(activity.date);

            if (!todayDateString || taskDateString >= todayDateString) {
                return currentCounts;
            }

            const currentCount = currentCounts[taskDateString] ?? 0;
            const nextCount = activity.completed
                ? currentCount + 1
                : Math.max(0, currentCount - 1);

            if (nextCount === 0) {
                const nextCounts = { ...currentCounts };
                delete nextCounts[taskDateString];
                return nextCounts;
            }

            return {
                ...currentCounts,
                [taskDateString]: nextCount,
            };
        });

        setTogglingTaskIds((currentIds) =>
            currentIds.filter((taskId) => taskId !== activity.id)
        );
    }

    return (
        <main className="flex flex-col gap-6 pb-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => changeDate(-1)}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <input
                        type="date"
                        value={formatDateInput(selectedDate)}
                        onChange={(e) =>
                            selectAgendaDate(createDateTime(e.target.value, "00:00"))
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />

                    <button
                        onClick={() => changeDate(1)}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                    >
                        <ChevronRight size={18} />
                    </button>

                    <button
                        onClick={() => selectAgendaDate(new Date())}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                       Back to Today
                    </button>
                </div>
            </div>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Create Task</h2>
                    <p className="text-sm text-slate-500">
                        Add a scheduled task to Agenda by selecting the related lead first.
                    </p>
                </div>

                <form
                    onSubmit={handleCreateTask}
                    className="grid gap-4 lg:grid-cols-[1.3fr_1.3fr_0.8fr_0.7fr_auto]"
                >
                    <div className="relative">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Lead
                        </label>
                        <input
                            type="search"
                            value={leadSearchText}
                            onChange={(e) =>
                                handleLeadSearchChange(e.target.value)
                            }
                            placeholder="Search by name, phone, or email"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        {leadSearchText.trim().length >= 2 &&
                        !selectedLead &&
                        (leadSearchLoading || leadSearchResults.length > 0) ? (
                            <div className="absolute z-10 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                                {leadSearchLoading ? (
                                    <div className="px-3 py-2 text-sm text-slate-500">
                                        Searching leads...
                                    </div>
                                ) : null}

                                {!leadSearchLoading
                                    ? leadSearchResults.map((lead) => (
                                          <button
                                              key={lead.leadID}
                                              type="button"
                                              onClick={() => handleSelectLead(lead)}
                                              className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                                          >
                                              <span className="font-medium text-slate-950">
                                                  {lead.getLeadName()}
                                              </span>
                                              <span className="mt-0.5 block text-xs text-slate-500">
                                                  {formatLeadDetails(lead) ||
                                                      `Lead #${lead.leadID}`}
                                              </span>
                                          </button>
                                      ))
                                    : null}
                            </div>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Task
                        </label>
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => {
                                setNewTaskTitle(e.target.value);
                                setCreateError(null);
                            }}
                            placeholder="Example: Confirm test drive"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Date
                        </label>
                        <input
                            type="date"
                            value={newTaskDate}
                            onChange={(e) => setNewTaskDate(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Time
                        </label>
                        <input
                            type="time"
                            value={newTaskTime}
                            onChange={(e) => setNewTaskTime(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={creatingTask}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {creatingTask ? "Creating..." : "Add Task"}
                        </button>
                    </div>
                </form>

                {selectedLead ? (
                    <p className="mt-3 text-sm text-slate-600">
                        Selected lead:{" "}
                        <span className="font-semibold text-slate-950">
                            {selectedLead.getLeadName()}
                        </span>
                    </p>
                ) : null}

                {createError ? (
                    <p className="mt-3 text-sm font-medium text-red-600">
                        {createError}
                    </p>
                ) : null}
            </section>

            <AgendaCalendar
                selectedDate={selectedDate}
                onSelectDate={selectAgendaDate}
                unfinishedTaskCount={
                    loading ? 0 : getUnfinishedTaskCount(agendaActivities)
                }
                pastUnfinishedTaskCounts={pastUnfinishedTaskCounts}
                todayDateString={todayDateString}
            />

            <AgendaActivityPanel
                selectedDate={selectedDate}
                agendaActivities={loading ? [] : agendaActivities}
                loading={loading}
                currentTimeMs={currentTimeMs}
                togglingTaskIds={togglingTaskIds}
                onToggleTask={handleToggleTask}
            />
        </main>
    );
}
