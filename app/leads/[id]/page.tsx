import Link from "next/link";

import LeadDetailPanel, {
    LeadDetailViewModel,
} from "@/components/leads/LeadDetailPanel";
import { Lead } from "@/domain/objects/Lead";
import { LeadRepo } from "@/lib/persistence/stub/LeadRepo";
import { leadStubDB } from "@/tests/stub/LeadStubDB";

interface LeadDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

function toDateInputValue(date: Date | null | undefined) {
    if (!date) {
        return "";
    }

    return date.toISOString().split("T")[0];
}

function toLeadDetailViewModel(lead: Lead): LeadDetailViewModel {
    return {
        leadID: lead.leadID,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        leadEmail: lead.leadEmail,
        leadDivision: lead.leadDivision,
        leadAddress: lead.leadAddress,
        leadCity: lead.leadCity,
        leadProvince: lead.leadProvince,
        leadCountry: lead.leadCountry,
        leadPostalCode: lead.leadPostalCode,
        budget: lead.budget,
        vehicleInterest: lead.vehicleInterest?.getFullDescription() ?? "",
        tradeInVehicle: lead.tradeInVehicle?.getFullDescription() ?? "",
        stage: lead.stage,
        followUpDate: toDateInputValue(lead.followUpDate),
        score: lead.score,
        notes: lead.notes,
        createdAt: toDateInputValue(lead.createdAt),
        lastInteractionDate: toDateInputValue(lead.lastInteractionDate),
        lastInteractionBy: lead.lastInteractionBy,
        status: lead.status,
    };
}

export default async function LeadDetailPage({
    params,
}: LeadDetailPageProps) {
    const { id } = await params;

    const leadRepository = new LeadRepo(leadStubDB);
    const lead = leadRepository.getLeadById(Number(id));

    if (!lead) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Lead Not Found
                </h1>

                <Link href="/leads" className="text-blue-600">
                    Back to Leads
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/leads" className="text-sm text-blue-600">
                    Back to Leads
                </Link>

                <h1 className="mt-2 text-2xl font-bold text-gray-900">
                    Lead Details
                </h1>
            </div>

            <LeadDetailPanel lead={toLeadDetailViewModel(lead)} />
        </div>
    );
}
