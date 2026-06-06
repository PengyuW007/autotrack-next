import { Lead } from "@/domain/objects/Lead";
import { LeadRepo } from "@/lib/persistence/stub/LeadRepo";
import { leadStubDB } from "@/tests/stub/LeadStubDB";

describe("LeadRepo", () => {
    test("gets all leads", () => {
        const repo = new LeadRepo(leadStubDB);

        const leads = repo.getAllLeads();

        expect(leads.length).toBe(2);
        expect(leads[0].getLeadName()).toBe("John Smith");
        expect(leads[1].getLeadName()).toBe("Sarah Chen");
    });

    test("gets lead by id", () => {
        const repo = new LeadRepo(leadStubDB);

        const lead = repo.getLeadById(1);

        expect(lead).not.toBeNull();
        expect(lead?.leadID).toBe(1);
        expect(lead?.getLeadName()).toBe("John Smith");
    });

    test("returns null when lead id does not exist", () => {
        const repo = new LeadRepo(leadStubDB);

        const lead = repo.getLeadById(999);

        expect(lead).toBeNull();
    });

    test("inserts a new lead", () => {
        const repo = new LeadRepo(leadStubDB);

        const newLead = new Lead({
            firstName: "Test",
            lastName: "Lead",
            phone: "555-9999",
            leadEmail: "test@example.com",
            stage: "NEW",
        });

        const result = repo.insertLead(newLead);

        expect(result).toBeNull();
        expect(repo.getAllLeads().length).toBe(3);
        expect(newLead.leadID).toBe(3);
    });

    test("prevents duplicate lead insertion", () => {
        const repo = new LeadRepo(leadStubDB);

        const duplicateLead = new Lead({
            leadID: 1,
            firstName: "Duplicate",
            lastName: "Lead",
        });

        const result = repo.insertLead(duplicateLead);

        expect(result).toBe("Duplicate lead.");
        expect(repo.getAllLeads().length).toBe(2);
    });

    test("updates an existing lead", () => {
        const repo = new LeadRepo(leadStubDB);

        const lead = repo.getLeadById(1);

        expect(lead).not.toBeNull();

        lead!.setLeadName("John Updated");
        lead!.phone = "999-9999";

        const result = repo.updateLead(lead!);

        expect(result).toBeNull();

        const updatedLead = repo.getLeadById(1);

        expect(updatedLead?.getLeadName()).toBe("John Updated");
        expect(updatedLead?.phone).toBe("999-9999");
    });

    test("returns error when updating non-existing lead", () => {
        const repo = new LeadRepo(leadStubDB);

        const ghostLead = new Lead({
            leadID: 999,
            firstName: "Ghost",
            lastName: "Lead",
        });

        const result = repo.updateLead(ghostLead);

        expect(result).toBe("Lead not found.");
    });

    test("deletes an existing lead", () => {
        const repo = new LeadRepo(leadStubDB);

        const result = repo.deleteLead(1);

        expect(result).toBeNull();
        expect(repo.getAllLeads().length).toBe(1);
        expect(repo.getLeadById(1)).toBeNull();
    });

    test("returns error when deleting non-existing lead", () => {
        const repo = new LeadRepo(leadStubDB);

        const result = repo.deleteLead(999);

        expect(result).toBe("Lead not found.");
        expect(repo.getAllLeads().length).toBe(2);
    });
});