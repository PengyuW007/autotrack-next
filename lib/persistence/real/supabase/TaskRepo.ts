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

function padDatePart(value: number): string {
    return String(value).padStart(2, "0");
}

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
        task_date: formatTaskDateTimeForDatabase(task.getDate()),
        completed: task.isCompleted(),
    };

    if (task.getEventID() !== -1) {
        row.task_id = task.getEventID();
    }

    return row;
}

function formatTaskDateKey(date: Date): string {
    const normalizedDate = new Date(date);

    return [
        normalizedDate.getFullYear(),
        padDatePart(normalizedDate.getMonth() + 1),
        padDatePart(normalizedDate.getDate()),
    ].join("-");
}

function formatTaskDateTimeForDatabase(date: Date): string {
    const normalizedDate = new Date(date);

    return `${formatTaskDateKey(normalizedDate)}T${padDatePart(
        normalizedDate.getHours()
    )}:${padDatePart(normalizedDate.getMinutes())}:${padDatePart(
        normalizedDate.getSeconds()
    )}`;
}

function getTaskLogicalKey(task: Task): string {
    return [
        task.getLead()?.leadID ?? "no-lead",
        task.getTitle(),
        formatTaskDateKey(task.getDate()),
    ].join("|");
}

function getTaskDateRange(date: Date): { start: string; end: string } {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    return {
        start: formatTaskDateTimeForDatabase(startDate),
        end: formatTaskDateTimeForDatabase(endDate),
    };
}

function isSameLogicalTask(taskA: Task, taskB: Task): boolean {
    return (
        taskA.getLead()?.leadID === taskB.getLead()?.leadID &&
        taskA.getTitle() === taskB.getTitle() &&
        formatTaskDateKey(taskA.getDate()) ===
            formatTaskDateKey(taskB.getDate())
    );
}

function shouldReplaceCanonicalTask(currentTask: Task, candidateTask: Task): boolean {
    if (currentTask.getEventID() === -1 && candidateTask.getEventID() !== -1) {
        return true;
    }

    if (candidateTask.getEventID() === -1 && currentTask.getEventID() !== -1) {
        return false;
    }

    const timeDiff =
        candidateTask.getDate().getTime() - currentTask.getDate().getTime();

    if (timeDiff !== 0) {
        return timeDiff < 0;
    }

    return candidateTask.getEventID() < currentTask.getEventID();
}

function mergeDuplicateTaskState(currentTask: Task, duplicateTask: Task): Task {
    if (duplicateTask.isCompleted()) {
        currentTask.setCompleted(true);
    }

    return currentTask;
}

function getCanonicalTasks(tasks: Task[]): Task[] {
    const canonicalTasks = new Map<string, Task>();

    for (const task of tasks) {
        const key = getTaskLogicalKey(task);
        const currentTask = canonicalTasks.get(key);

        if (!currentTask) {
            canonicalTasks.set(key, task);
            continue;
        }

        if (shouldReplaceCanonicalTask(currentTask, task)) {
            canonicalTasks.set(key, mergeDuplicateTaskState(task, currentTask));
            continue;
        }

        mergeDuplicateTaskState(currentTask, task);
    }

    return [...canonicalTasks.values()].sort(
        (taskA, taskB) => taskA.getDate().getTime() - taskB.getDate().getTime()
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

        return getCanonicalTasks(data.map((row) => mapRowToTask(row as TaskRow)));
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

        return getCanonicalTasks(data.map((row) => mapRowToTask(row as TaskRow)));
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
        const leadId = task.getLead()?.leadID;

        if (!leadId) {
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

        if (error) {
            return error.message;
        }

        const duplicateError = await this.updateDuplicateTaskCompletion(task);

        return duplicateError;
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

    private async updateDuplicateTaskCompletion(task: Task): Promise<string | null> {
        const leadId = task.getLead()?.leadID;

        if (!leadId) {
            return null;
        }

        const dateRange = getTaskDateRange(task.getDate());
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ completed: task.isCompleted() })
            .eq("lead_id", leadId)
            .eq("title", task.getTitle())
            .gte("task_date", dateRange.start)
            .lt("task_date", dateRange.end)
            .neq("task_id", task.getEventID());

        return error?.message ?? null;
    }
}
