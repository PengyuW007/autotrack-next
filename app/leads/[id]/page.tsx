import Link from "next/link";
import LeadDetailPanel from "@/components/leads/LeadDetailPanel";
import { LeadRepo } from "@/lib/persistence/stub/LeadRepo";
import { leadStubDB } from "@/tests/stub/LeadStubDB";

interface LeadDetailPageProps {
    params: Promise<{
        id: string;
    }>;
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
                    ← Back to Leads
                </Link>

                <h1 className="mt-2 text-2xl font-bold text-gray-900">
                    Lead Details
                </h1>
            </div>

            <LeadDetailPanel lead={lead} />
        </div>
    );
}