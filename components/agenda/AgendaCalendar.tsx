"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    agendaCount: number;
};

export default function AgendaCalendar({
    selectedDate,
    onSelectDate,
    agendaCount,
}: Props) {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const days = Array.from({ length: 35 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        return date;
    });

    function isSameDate(a: Date, b: Date) {
        return a.toDateString() === b.toDateString();
    }

    function changeMonth(offset: number) {
        const next = new Date(selectedDate);
        next.setMonth(next.getMonth() + offset);
        onSelectDate(next);
    }

    return (
        <section className="w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <button
                    onClick={() => changeMonth(-1)}
                    className="rounded-lg border px-3 py-1"
                    aria-label="Previous month"
                >
                    <ChevronLeft size={16} />
                </button>

                <h2 className="text-lg font-semibold">
                    {selectedDate.toLocaleString("en-CA", {
                        month: "long",
                        year: "numeric",
                    })}
                </h2>

                <button
                    onClick={() => changeMonth(1)}
                    className="rounded-lg border px-3 py-1"
                    aria-label="Next month"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-7 border-t border-l text-sm">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="border-r border-b bg-slate-50 p-2 font-medium">
                        {day}
                    </div>
                ))}

                {days.map((date) => {
                    const active = isSameDate(date, selectedDate);
                    const muted = date.getMonth() !== month;

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onSelectDate(date)}
                            className={`min-h-[66px] border-b border-r p-2 text-left hover:bg-blue-50 ${
                                active ? "bg-blue-100" : ""
                            } ${muted ? "text-slate-300" : "text-slate-700"}`}
                        >
                            <div className="font-medium">{date.getDate()}</div>

                            {active && agendaCount > 0 && (
                                <div className="mt-2 rounded-md bg-blue-600 px-2 py-1 text-xs text-white">
                                    {agendaCount} activities
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
