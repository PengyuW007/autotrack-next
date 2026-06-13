"use client";

import LeadTable from "@/components/leads/LeadTable";
import { LeadRepo } from "@/lib/persistence/stub/LeadRepo";
import { leadStubDB } from "@/tests/stub/LeadStubDB";

export default function LeadsPage() {
    const leadRepository = new LeadRepo(leadStubDB);
    const leads = leadRepository.getAllLeads();

    return (
        <div>
            <LeadTable leads={leads} />
        </div>
    );
}
