"use client";

import { useState } from "react";
import { Lead } from "@/domain/objects/Lead";
import LeadTableRow from "./LeadTableRow";

interface LeadTableProps {
    leads: Lead[];
}

export default function LeadTable({ leads }: LeadTableProps) {
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [stageFilter, setStageFilter] = useState("ALL");
    const [tradeInFilter, setTradeInFilter] = useState("ALL");
    const [scoreFilter, setScoreFilter] = useState("ALL");

    const filteredLeads = leads.filter((lead) => {
        const keyword = searchText.toLowerCase();

        const matchesSearch =
            lead.getLeadName().toLowerCase().includes(keyword) ||
            lead.phone.toLowerCase().includes(keyword) ||
            lead.leadEmail.toLowerCase().includes(keyword);

        const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "ACTIVE" && lead.status) ||
            (statusFilter === "INACTIVE" && !lead.status);

        const matchesStage =
            stageFilter === "ALL" ||
            lead.stage.toUpperCase() === stageFilter;

        const hasTradeIn = lead.tradeInVehicle !== null;

        const matchesTradeIn =
            tradeInFilter === "ALL" ||
            (tradeInFilter === "YES" && hasTradeIn) ||
            (tradeInFilter === "NO" && !hasTradeIn);

        const matchesScore =
            scoreFilter === "ALL" ||
            (scoreFilter === "BELOW_50" && lead.score < 50) ||
            (scoreFilter === "BETWEEN_50_79" && lead.score >= 50 && lead.score <= 79) ||
            (scoreFilter === "ABOVE_80" && lead.score >= 80);

        return (
            matchesSearch &&
            matchesStatus &&
            matchesStage &&
            matchesTradeIn &&
            matchesScore
        );
    });

    return (
        <div>
            <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex flex-wrap gap-6">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone."
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        className="w-full max-w-md rounded-lg border px-4 py-3 text-gray-900"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="rounded-lg border px-4 py-3 text-gray-900"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <select
                        value={stageFilter}
                        onChange={(event) => setStageFilter(event.target.value)}
                        className="rounded-lg border px-4 py-3 text-gray-900"
                    >
                        <option value="ALL">All Stages</option>
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="VISITED">Visited</option>
                        <option value="TEST_DRIVE">Test Drive</option>
                        <option value="NEGOTIATION">Negotiation</option>
                        <option value="CLOSED">Closed</option>
                    </select>

                    <select
                        value={tradeInFilter}
                        onChange={(event) => setTradeInFilter(event.target.value)}
                        className="rounded-lg border px-4 py-3 text-gray-900"
                    >
                        <option value="ALL">All Trade-in</option>
                        <option value="YES">Yes</option>
                        <option value="NO">No</option>
                    </select>

                    <select
                        value={scoreFilter}
                        onChange={(event) => setScoreFilter(event.target.value)}
                        className="rounded-lg border px-4 py-3 text-gray-900"
                    >
                        <option value="ALL">All Scores</option>
                        <option value="BELOW_50">Below 50</option>
                        <option value="BETWEEN_50_79">50 - 79</option>
                        <option value="ABOVE_80">80+</option>
                    </select>
                </div>
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
                        <LeadTableRow
                            key={lead.leadID}
                            lead={lead}
                            onStatusChange={(leadId, newStatus) => {
                                const targetLead = leads.find(
                                    l => l.leadID === leadId
                                );

                                if (targetLead) {
                                    targetLead.status = newStatus;
                                }
                            }}
                        />
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}