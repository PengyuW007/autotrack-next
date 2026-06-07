"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "⌂" },
    { label: "Leads", href: "/leads", icon: "👥" },
    { label: "Agenda", href: "/agenda", icon: "▣" },
    { label: "Analytics", href: "/analytics", icon: "▥" },
    // { label: "Settings", href: "/settings", icon: "⚙" },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`flex min-h-screen flex-col border-r border-gray-200 bg-white shadow-sm transition-all duration-300 ${
                collapsed ? "w-24" : "w-72"
            }`}
        >
            <div className="flex items-center justify-between px-6 py-6">
                {!collapsed && (
                    <h1 className="text-3xl font-bold text-blue-600">
                        AutoTrack
                    </h1>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                    {collapsed ? "»" : "‹"}
                </button>
            </div>

            <nav className="mt-6 flex flex-col gap-3 px-4">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <span className="text-2xl">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto border-t border-gray-200 px-6 py-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                        PW
                    </div>

                    {!collapsed && (
                        <div>
                            <p className="font-semibold text-gray-900">
                                Pengyu Wang
                            </p>
                            <p className="text-sm text-gray-500">
                                Sales Professional
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}