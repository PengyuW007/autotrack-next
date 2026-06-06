import { Task } from "@/domain/objects/Task";

export interface TaskDataAccess {
    getAllTasks(): Task[];
    getTaskById(id: number): Task | null;
    insertTask(task: Task): string | null;
    updateTask(task: Task): string | null;
    deleteTask(id: number): string | null;
}