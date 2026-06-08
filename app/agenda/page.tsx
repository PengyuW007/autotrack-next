"use client";

import { useMemo, useState } from "react";
import { AgendaService } from "@/domain/business/AgendaService";
import { ScoringService } from "@/domain/business/ScoringService";
import { PriorityManager } from "@/domain/business/PriorityManager";

import AgendaCalendar from "@/components/agenda/AgendaCalendar";
import AgendaActivityPanel from "@/components/agenda/AgendaActivityPanel";

import { LeadRepo } from "@/lib/persistence/stub/LeadRepo";
import { TaskRepo } from "@/lib/persistence/stub/TaskRepo";

import { leadStubDB } from "@/tests/stub/LeadStubDB";
import { taskStubDB } from "@/tests/stub/TaskStubDB";

export default function AgendaPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const agendaLeads = useMemo(() => {
        const leadRepo = new LeadRepo(leadStubDB);
        const leads = leadRepo.getAllLeads();
        const taskRepo = new TaskRepo(taskStubDB);
        const tasks = taskRepo.getAllTasks();

        const scoringService = new ScoringService();
        const priorityManager = new PriorityManager(scoringService);

        const agendaService = new AgendaService(
            scoringService,
            priorityManager
        );

        return agendaService.getTodayAgenda(
            leads,
            tasks,
            selectedDate
        );
    }, [selectedDate]);

    function changeDate(days: number) {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + days);
        setSelectedDate(nextDate);
    }

    return (
        <main className="flex h-[calc(100vh-88px)] flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Agenda</h1>
                    <p className="text-sm text-slate-500">
                        Daily follow-up activities generated from leads and tasks.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => changeDate(-1)}>Previous</button>

                    <input
                        type="date"
                        value={selectedDate.toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    />

                    <button onClick={() => changeDate(1)}>Next</button>
                    <button onClick={() => setSelectedDate(new Date())}>Today</button>
                </div>
            </div>

            <AgendaCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                agendaCount={agendaLeads.length}
            />

            <AgendaActivityPanel
                selectedDate={selectedDate}
                agendaLeads={agendaLeads}
            />
        </main>
    );
}