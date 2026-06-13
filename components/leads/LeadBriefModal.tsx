import { X } from "lucide-react";

import { Lead } from "@/domain/objects/Lead";

interface LeadBriefModalProps {
    lead: Lead | null;
    onClose: () => void;
}

export default function LeadBriefModal({ lead, onClose }: LeadBriefModalProps) {
    if (!lead) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        Lead Brief
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        aria-label="Close lead brief"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                    <p><strong>Name:</strong> {lead.getLeadName()}</p>
                    <p><strong>Phone:</strong> {lead.phone || "N/A"}</p>
                    <p><strong>Email:</strong> {lead.leadEmail || "N/A"}</p>
                    <p><strong>Stage:</strong> {lead.stage}</p>
                    <p><strong>Score:</strong> {lead.score}</p>
                    <p>
                        <strong>Vehicle Interest:</strong>{" "}
                        {lead.vehicleInterest?.getFullDescription() ?? "None"}
                    </p>
                    <p>
                        <strong>Trade-in:</strong>{" "}
                        {lead.tradeInVehicle?.getFullDescription() ?? "No"}
                    </p>
                    <p><strong>Notes:</strong> {lead.notes || "No notes"}</p>
                </div>
            </div>
        </div>
    );
}
