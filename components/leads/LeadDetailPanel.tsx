import { Lead } from "@/domain/objects/Lead";

interface LeadDetailPanelProps {
    lead: Lead;
}

export default function LeadDetailPanel({ lead }: LeadDetailPanelProps) {
    return (
        <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
                {lead.getLeadName()}
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-500">Phone</p>
                    <p>{lead.phone || "N/A"}</p>
                </div>

                <div>
                    <p className="text-gray-500">Email</p>
                    <p>{lead.leadEmail || "N/A"}</p>
                </div>

                <div>
                    <p className="text-gray-500">Stage</p>
                    <p>{lead.stage}</p>
                </div>

                <div>
                    <p className="text-gray-500">Score</p>
                    <p>{lead.score}</p>
                </div>

                <div>
                    <p className="text-gray-500">Vehicle Interest</p>
                    <p>{lead.vehicleInterest?.getFullDescription() ?? "None"}</p>
                </div>

                <div>
                    <p className="text-gray-500">Budget</p>
                    <p>${lead.budget}</p>
                </div>

                <div className="col-span-2">
                    <p className="text-gray-500">Notes</p>
                    <p>{lead.notes || "No notes available."}</p>
                </div>
            </div>
        </div>
    );
}