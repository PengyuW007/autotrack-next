import { Lead } from "@/domain/objects/Lead";

export interface LeadDataAccess {
    getAllLeads(): Promise<Lead[]>;
    getLeadById(id: number): Promise<Lead | null>;
    createLead(lead: Lead): Promise<Lead>;
    updateLead(lead: Lead): Promise<Lead>;
    deleteLead(id: number): Promise<void>;
}