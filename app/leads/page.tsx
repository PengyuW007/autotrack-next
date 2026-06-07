"use client";

import LeadTable from "@/components/leads/LeadTable";
import { LeadRepo } from "@/lib/persistence/stub/LeadRepo";
import { leadStubDB } from "@/tests/stub/LeadStubDB";

export default function LeadsPage() {
    const leadRepository = new LeadRepo(leadStubDB);
    const leads = leadRepository.getAllLeads();

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Leads
                </h1>
                <p className="text-gray-600">
                    Manage and prioritize customer leads.
                </p>
            </div>

            <LeadTable leads={leads} />
        </div>
    );
}