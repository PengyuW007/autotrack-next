import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
}

function createDemoLead(index) {
    const createdAt = addDays(new Date(), -index);
    const followUpDate = addDays(new Date(), index % 14);
    followUpDate.setHours(9 + (index % 8), index % 2 === 0 ? 0 : 30, 0, 0);

    const stages = [
        "NEW",
        "CONTACTED",
        "VISITED",
        "TEST_DRIVE",
        "NEGOTIATION",
    ];

    return {
        first_name: "LEAD",
        last_name: String(index),
        phone: `555-010${String(index).padStart(2, "0")}`,
        lead_email: `lead${index}@autotrack.test`,
        lead_division: "Sales",
        lead_address: `${100 + index} Demo Street`,
        lead_city: "Toronto",
        lead_province: "ON",
        lead_country: "Canada",
        lead_postal_code: `M${index % 9}A ${index % 10}B${index % 10}`,
        budget: 25000 + index * 500,
        vehicle_interest_id: null,
        trade_in_vehicle_id: null,
        stage: stages[(index - 1) % stages.length],
        follow_up_date: followUpDate.toISOString(),
        score: 30 + (index % 70),
        notes: `Demo lead ${index}`,
        created_at: createdAt.toISOString(),
        last_interaction_date: createdAt.toISOString(),
        last_interaction_by: index % 3 === 0 ? "LEAD" : "USER",
        status: true,
    };
}

async function deleteTableRows(tableName, idColumn) {
    const { error } = await supabase
        .from(tableName)
        .delete()
        .neq(idColumn, -1);

    if (error) {
        throw new Error(`Failed to clear ${tableName}: ${error.message}`);
    }
}

async function resetDemoLeads() {
    console.log("Clearing notifications, tasks, and leads...");

    await deleteTableRows("notifications", "notification_id");
    await deleteTableRows("tasks", "task_id");
    await deleteTableRows("leads", "lead_id");

    const demoLeads = Array.from({ length: 100 }, (_, index) =>
        createDemoLead(index + 1)
    );

    console.log("Inserting 100 numbered demo leads...");

    const { error } = await supabase.from("leads").insert(demoLeads);

    if (error) {
        throw new Error(`Failed to insert demo leads: ${error.message}`);
    }

    console.log("Reset complete. Created LEAD 1 through LEAD 100.");
}

resetDemoLeads().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
