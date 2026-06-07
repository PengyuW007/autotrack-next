import Link from "next/link";
import {Lead} from "@/domain/objects/Lead";

interface LeadTableRowProps {
    lead: Lead;
    onStatusChange: (
        leadId: number,
        status: boolean
    ) => void;
}

export default function LeadTableRow({lead, onStatusChange}: LeadTableRowProps) {
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

            <td className="px-4 py-4 font-medium text-blue-600">
                <Link href={`/leads/${lead.leadID}`}>
                    {lead.getLeadName()}
                </Link>
            </td>

            <td className="px-4 py-4">
                <div>{lead.phone || "N/A"}</div>
                <div className="text-gray-500">
                    {lead.leadEmail || "N/A"}
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
                {formatDate(lead.createdAt)}
            </td>
        </tr>
    );
}