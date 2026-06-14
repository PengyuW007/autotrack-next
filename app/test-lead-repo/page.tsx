import { Lead } from "@/domain/objects/Lead";
import { LeadRepo } from "@/lib/persistence/real/supabase/LeadRepo";

export default async function TestLeadRepoPage() {
    const repo = new LeadRepo();

    const testLead = new Lead({
        firstName: "Repo",
        lastName: "Test",
        phone: "111-222-3333",
        leadEmail: "repo@test.com",
        leadCity: "Toronto",
        budget: 42000,
        stage: "NEW",
        score: 60,
        notes: "Testing SupabaseLeadRepository insert method",
    });

    const insertError = await repo.insertLead(testLead);

    testLead.notes = "Updated by SupabaseLeadRepository";
    testLead.score = 75;

    const updateError = await repo.updateLead(testLead);

    const allLeads = await repo.getAllLeads();

    const selectedLead = await repo.getLeadById(testLead.leadID);

    // Optional delete test
    // const deleteError = await repo.deleteLead(testLead.leadID);

    return (
        <main className="p-6">
            <h1>Lead Repo Test</h1>

            <pre>
                {JSON.stringify(
                    {
                        insertedLeadId: testLead.leadID,
                        insertError,
                        updateError,
                        selectedLead,
                        totalLeads: allLeads.length,
                        allLeads,
                    },
                    null,
                    2
                )}
            </pre>
        </main>
    );
}