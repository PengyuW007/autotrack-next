"use client";

import { useEffect, useState } from "react";

import LeadTable from "@/components/leads/LeadTable";
import { Lead } from "@/domain/objects/Lead";
import { LeadRepo } from "@/lib/persistence/real/supabase/LeadRepo";

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadLeads() {
            const leadRepository = new LeadRepo();
            const nextLeads = await leadRepository.getAllLeads();

            if (active) {
                setLeads(nextLeads);
                setLoading(false);
            }
        }

        loadLeads();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div>
            {loading ? (
                <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                    Loading leads...
                </div>
            ) : (
                <LeadTable leads={leads} />
            )}
        </div>
    );
}
