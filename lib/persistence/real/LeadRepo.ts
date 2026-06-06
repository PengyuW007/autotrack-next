import { Lead } from "@/domain/objects/Lead";
import { LeadDataAccess } from "@/lib/persistence/interfaces/LeadDataAccess";

export class LeadRepo implements LeadDataAccess {
    private leads: Lead[];

    constructor(initialLeads: Lead[] = []) {
        this.leads = [...initialLeads];
    }

    getAllLeads(): Lead[] {
        return [...this.leads];
    }

    getLeadById(id: number): Lead | null {
        return this.leads.find((lead) => lead.leadID === id) ?? null;
    }

    insertLead(lead: Lead): string | null {
        if (this.getLeadById(lead.leadID)) {
            return "Duplicate lead.";
        }

        if (lead.leadID === 0) {
            lead.leadID = this.leads.length + 1;
        }

        this.leads.push(lead);
        return null;
    }

    updateLead(lead: Lead): string | null {
        const index = this.leads.findIndex((item) => item.leadID === lead.leadID);

        if (index === -1) {
            return "Lead not found.";
        }

        this.leads[index] = lead;
        return null;
    }

    deleteLead(id: number): string | null {
        const index = this.leads.findIndex((lead) => lead.leadID === id);

        if (index === -1) {
            return "Lead not found.";
        }

        this.leads.splice(index, 1);
        return null;
    }
}