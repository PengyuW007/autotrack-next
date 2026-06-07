import Link from "next/link";
import { Lead } from "@/domain/objects/Lead";

interface LeadTableRowProps {
    lead: Lead;
}

export default function LeadTableRow({ lead }: LeadTableRowProps) {
    const formatDate = (date: Date | null | undefined): string => {
        if (!date) {
            return "N/A";
        }

        return date.toISOString().split("T")[0];
    };


    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="px-4 py-4">
                {lead.status ? "Active" : "Inactive"}
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