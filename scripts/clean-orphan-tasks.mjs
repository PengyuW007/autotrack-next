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

async function getAllRows(tableName, columns) {
    const { data, error } = await supabase.from(tableName).select(columns);

    if (error) {
        throw new Error(`Failed to load ${tableName}: ${error.message}`);
    }

    return data ?? [];
}

async function cleanOrphanTasks() {
    const [tasks, leads] = await Promise.all([
        getAllRows("tasks", "task_id, lead_id"),
        getAllRows("leads", "lead_id"),
    ]);

    const validLeadIds = new Set(leads.map((lead) => lead.lead_id));
    const orphanTaskIds = tasks
        .filter(
            (task) =>
                task.lead_id === null ||
                task.lead_id === undefined ||
                !validLeadIds.has(task.lead_id)
        )
        .map((task) => task.task_id);

    if (orphanTaskIds.length === 0) {
        console.log("No orphan tasks found.");
        return;
    }

    const { error } = await supabase
        .from("tasks")
        .delete()
        .in("task_id", orphanTaskIds);

    if (error) {
        throw new Error(`Failed to delete orphan tasks: ${error.message}`);
    }

    console.log(`Deleted ${orphanTaskIds.length} orphan task(s).`);
}

cleanOrphanTasks().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
