export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Task } from "@/domain/objects/Task";
import { TaskRepo } from "@/lib/persistence/real/supabase/TaskRepo";

export default async function TestTaskRepoPage() {
    const repo = new TaskRepo();

    const testTask = new Task(
        null,
        "Call customer for follow-up",
        new Date(),
    );

    const insertError = await repo.insertTask(testTask);

    const insertedTask = await repo.getTaskById(testTask.getEventID());

    testTask.setCompleted(true);

    const updateError = await repo.updateTask(testTask);

    const updatedTask = await repo.getTaskById(testTask.getEventID());

    // const deleteError = await repo.deleteTask(testTask.getEventID());
    //
    // const deletedTask = await repo.getTaskById(testTask.getEventID());

    const allTasks = await repo.getAllTasks();

    return (
        <main className="p-6">
            <h1>Task Repo Test</h1>

            <pre>
                {JSON.stringify(
                    {
                        insertedTaskId: testTask.getEventID(),
                        insertError,
                        insertedTask,
                        updateError,
                        updatedTask,
                        // deleteError,
                        // deletedTask,
                        totalTasks: allTasks.length,
                        allTasks,
                    },
                    null,
                    2
                )}
            </pre>
        </main>
    );
}