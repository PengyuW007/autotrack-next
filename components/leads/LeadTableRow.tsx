import Link from "next/link";
import {Lead} from "@/domain/objects/Lead";
import {
    Eye,
    Pencil,
    Trash2
} from "lucide-react";

interface LeadTableRowProps {
    lead: Lead;
    onStatusChange: (
        leadId: number,
        status: boolean
    ) => void;
    onViewBrief: (lead: Lead) => void;
    onDelete: (leadId: number) => void;
}

export default function LeadTableRow({lead, onStatusChange,onViewBrief, onDelete,}: LeadTableRowProps) {
    const formatDate = (date: Date | null | undefined): string => {
        if (!date) {
            return "N/A";
        }

        return date.toISOString().split("T")[0];
    };


    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="px-4 py-4">
                <div className="flex items-center gap-2">
        <span
            className={`h-3 w-3 rounded-full ${
                lead.status ? "bg-green-500" : "bg-red-500"
            }`}
        />

                    <select
                        value={lead.status ? "ACTIVE" : "LOST"}
                        onChange={(event) =>
                            onStatusChange(
                                lead.leadID,
                                event.target.value === "ACTIVE"
                            )
                        }
                        className="rounded border px-2 py-1 text-sm text-gray-900"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="LOST">Lost</option>
                    </select>
                </div>
            </td>

            <td className="px-4 py-4 font-medium text-gray-900">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            console.log("Clicked", lead);
                            onViewBrief(lead)
                        }
                    }
                        className="cursor-pointer text-gray-500 hover:text-blue-600"
                        title="Eye view lead brief"
                    >
                        <Eye size={18} strokeWidth={2} />
                    </button>

                    <Link href={`/leads/${lead.leadID}`} className="text-blue-600">
                        {lead.getLeadName()}
                    </Link>
                </div>
            </td>

            <td className="px-4 py-4">
                <div className="text-gray-900">
                    {lead.leadEmail || "N/A"}
                </div>
                <div className="text-gray-500">
                    {lead.phone || "N/A"}
                </div>
            </td>

            <td className="px-4 py-4">
                {lead.vehicleInterest?.getFullDescription() ?? "None"}
            </td>

            <td className="px-4 py-4">
                {lead.tradeInVehicle
                    ? `Yes - ${lead.tradeInVehicle.getFullDescription()}`
                    : "No"}
            </td>

            <td className="px-4 py-4">{lead.stage}</td>

            <td className="px-4 py-4 font-semibold">
                {Math.floor(lead.score)}
            </td>

            <td className="px-4 py-4">
                {formatDate(lead.lastInteractionDate)}
            </td>

            <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href={`/leads/${lead.leadID}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modify Lead"
                    >
                        <Pencil size={18} />
                    </Link>

                    <button
                        onClick={() => onDelete(lead.leadID)}
                        className="cursor-pointer text-red-600 hover:text-red-800"
                        title="Delete Lead"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>

        </tr>
    );
}