import { Lead } from "@/domain/objects/Lead";

export interface LeadDataAccess {
    getAllLeads(): Lead[];
    getLeadById(id: number): Lead | null;
    insertLead(lead: Lead): string | null;
    updateLead(lead: Lead): string | null;
    deleteLead(id: number): string | null;
}