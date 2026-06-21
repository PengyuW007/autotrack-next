import { Lead } from "@/domain/objects/Lead";
import { Task } from "@/domain/objects/Task";
import { supabase } from "@/lib/supabase/client";

type TaskRow = {
    task_id: number;
    lead_id: number | null;
    title: string | null;
    task_date: string | null;
    completed: boolean | null;
};

type TaskInsertRow = Omit<TaskRow, "task_id"> & {
    task_id?: number;
};

const TABLE_NAME = "tasks";

function createLeadReference(leadId: number | null): Lead | null {
    if (!leadId) {
        return null;
    }

    return new Lead({
        leadID: leadId,
        firstName: `Lead ${leadId}`,
    });
}

function mapRowToTask(row: TaskRow): Task {
    const task = new Task(
        createLeadReference(row.lead_id),
        row.title ?? "",
        row.task_date ? new Date(row.task_date) : new Date(),
        row.task_id
    );

    task.setCompleted(row.completed ?? false);
    return task;
}

function mapTaskToRow(task: Task): TaskInsertRow {
    const leadId = task.getLead()?.leadID ?? null;

    const row: TaskInsertRow = {
        lead_id: leadId,
        title: task.getTitle(),
        task_date: task.getDate().toISOString(),
        completed: task.isCompleted(),
    };

    if (task.getEventID() !== -1) {
        row.task_id = task.getEventID();
    }

    return row;
}

function formatTaskDateKey(date: Date): string {
    const normalizedDate = new Date(date);
    const year = normalizedDate.getFullYear();
    const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
    const day = String(normalizedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isSameLogicalTask(taskA: Task, taskB: Task): boolean {
    return (
        taskA.getLead()?.leadID === taskB.getLead()?.leadID &&
        taskA.getTitle() === taskB.getTitle() &&
        formatTaskDateKey(taskA.getDate()) ===
            formatTaskDateKey(taskB.getDate())
    );
}

export class TaskRepo {
    async getAllTasks(): Promise<Task[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("task_date", { ascending: true });

        if (error || !data) {
            return [];
        }

        return data.map((row) => mapRowToTask(row as TaskRow));
    }

    async getTaskById(id: number): Promise<Task | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("task_id", id)
            .maybeSingle();

        if (error || !data) {
            return null;
        }

        return mapRowToTask(data as TaskRow);
    }

    async getTasksByLeadId(leadId: number): Promise<Task[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("lead_id", leadId)
            .order("task_date", { ascending: true });

        if (error || !data) {
            return [];
        }

        return data.map((row) => mapRowToTask(row as TaskRow));
    }

    async insertTask(task: Task): Promise<string | null> {
        const leadId = task.getLead()?.leadID;

        if (!leadId) {
            return "Task must be associated with a lead.";
        }

        const existingTasks = await this.getTasksByLeadId(leadId);
        const existingTask = existingTasks.find((currentTask) =>
            isSameLogicalTask(currentTask, task)
        );

        if (existingTask) {
            task.setEventID(existingTask.getEventID());
            return null;
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(mapTaskToRow(task))
            .select("*")
            .single();

        if (error) {
            return error.message;
        }

        if (data) {
            task.setEventID((data as TaskRow).task_id);
        }

        return null;
    }

    async updateTask(task: Task): Promise<string | null> {
        if (!task.getLead()?.leadID) {
            return "Task must be associated with a lead.";
        }

        const existingTask = await this.getTaskById(task.getEventID());

        if (!existingTask) {
            return "Task not found.";
        }

        const { error } = await supabase
            .from(TABLE_NAME)
            .update(mapTaskToRow(task))
            .eq("task_id", task.getEventID());

        return error?.message ?? null;
    }

    async deleteTask(id: number): Promise<string | null> {
        const existingTask = await this.getTaskById(id);

        if (!existingTask) {
            return "Task not found.";
        }

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("task_id", id);

        return error?.message ?? null;
    }
}
