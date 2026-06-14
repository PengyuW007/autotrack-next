"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import AgendaCalendar from "@/components/agenda/AgendaCalendar";
import AgendaActivityPanel from "@/components/agenda/AgendaActivityPanel";

import { AgendaService } from "@/domain/business/AgendaService";
import { ScoringService } from "@/domain/business/ScoringService";
import { PriorityManager } from "@/domain/business/PriorityManager";

import { Lead } from "@/domain/objects/Lead";
import { LeadRepo } from "@/lib/persistence/real/supabase/LeadRepo";
import { TaskRepo } from "@/lib/persistence/real/supabase/TaskRepo";

export default function AgendaPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [agendaLeads, setAgendaLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadAgenda() {
            setLoading(true);

            const leadRepo = new LeadRepo();
            const taskRepo = new TaskRepo();
            const [leads, tasks] = await Promise.all([
                leadRepo.getAllLeads(),
                taskRepo.getAllTasks(),
            ]);

            const scoringService = new ScoringService();
            const priorityManager = new PriorityManager(scoringService);

            const agendaService = new AgendaService(
                scoringService,
                priorityManager
            );

            if (active) {
                setAgendaLeads(
                    agendaService.getTodayAgenda(
                        leads,
                        tasks,
                        selectedDate
                    )
                );
                setLoading(false);
            }
        }

        loadAgenda();

        return () => {
            active = false;
        };
    }, [selectedDate]);

    function changeDate(days: number) {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + days);
        setSelectedDate(nextDate);
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
                        value={selectedDate.toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />

                    <button
                        onClick={() => changeDate(1)}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                    >
                        <ChevronRight size={18} />
                    </button>

                    <button
                        onClick={() => setSelectedDate(new Date())}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                       Back to Today
                    </button>
                </div>
            </div>

            <AgendaCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                agendaCount={loading ? 0 : agendaLeads.length}
            />

            <AgendaActivityPanel
                selectedDate={selectedDate}
                agendaLeads={loading ? [] : agendaLeads}
            />
        </main>
    );
}
