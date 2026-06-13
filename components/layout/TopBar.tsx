"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
    Bell,
    CalendarDays,
    Clock
} from "lucide-react";

export default function TopBar() {
    const pageInfoMap: Record<string, { title: string; description: string }> = {
        "/dashboard": {
            title: "Dashboard",
            description: "Overview of today's priorities and follow-up actions.",
        },
        "/leads": {
            title: "Leads",
            description: "Manage customer leads, stages, and follow-up status.",
        },
        "/agenda": {
            title: "Agenda",
            description: "Daily follow-up activities generated from leads and tasks.",
        },
        "/analytics": {
            title: "Analytics",
            description: "Track sales performance, lead trends, and activity insights.",
        },
    };

    const pathname = usePathname();

    const pageInfo =
        pathname.startsWith("/leads/") && pathname !== "/leads"
            ? {
                  title: "Lead Details",
                  description: "View customer information, sales status, vehicle interest, and notes.",
              }
            : pageInfoMap[pathname] ?? {
                  title: "AutoTrack CRM",
                  description: "Scientific sales follow-up system",
              };

    const [currentTime, setCurrentTime] = useState(new Date());

    const date = currentTime.toLocaleDateString(
        "en-CA",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

    const time = currentTime.toLocaleTimeString(
        "en-CA",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <header className="flex h-20 items-center justify-between border-b bg-white px-8">

            <div>
                <h1 className="text-2xl font-bold text-slate-950">
                    {pageInfo.title}
                </h1>
                <p className="text-sm text-slate-500">
                    {pageInfo.description}
                </p>
            </div>

            <div className="flex items-center gap-8">

                <Bell
                    size={20}
                    className="cursor-pointer text-gray-500 hover:text-blue-600"
                />

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays size={16}/>
                    {date}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16}/>
                    {time}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                        PW
                    </div>

                    <div>
                        <p className="font-medium text-gray-900">
                            Pengyu Wang
                        </p>

                        <p className="text-xs text-gray-500">
                            Sales Consultant
                        </p>
                    </div>
                </div>

            </div>

        </header>
    );
}
