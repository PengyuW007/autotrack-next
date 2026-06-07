"use client";

import { useState } from "react";
import { Lead } from "@/domain/objects/Lead";
import LeadTableRow from "./LeadTableRow";

interface LeadTableProps {
    leads: Lead[];
}

export default function LeadTable({ leads }: LeadTableProps) {
    const [searchText, setSearchText] = useState("");

    const filteredLeads = leads.filter((lead) => {
        const keyword = searchText.toLowerCase();

        return (
            lead.getLeadName().toLowerCase().includes(keyword) ||
            lead.phone.toLowerCase().includes(keyword) ||
            lead.leadEmail.toLowerCase().includes(keyword)
        );
    });

    return (
        <div>
            <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
                <input
                    type="text"
                    placeholder="Search by name, email, or phone."
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    className="w-full max-w-md rounded-lg border px-4 py-3 text-gray-900"
                />
            </div>

            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-900">
                    <tr>
                        <th className="px-4 py-4">Lead Status</th>
                        <th className="px-4 py-4">Name</th>
                        <th className="px-4 py-4">Contact</th>
                        <th className="px-4 py-4">Vehicle Interest</th>
                        <th className="px-4 py-4">Trade-in Vehicle</th>
                        <th className="px-4 py-4">Stage</th>
                        <th className="px-4 py-4">Score</th>
                        <th className="px-4 py-4">Created At</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredLeads.map((lead) => (
                        <LeadTableRow key={lead.leadID} lead={lead} />
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}