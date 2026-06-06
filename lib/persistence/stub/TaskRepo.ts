import { Task } from "@/domain/objects/Task";
import { TaskDataAccess } from "@/lib/persistence/interfaces/TaskDataAccess";

export class TaskRepo implements TaskDataAccess {
    private tasks: Task[];

    constructor(initialTasks: Task[] = []) {
        this.tasks = [...initialTasks];
    }

    getAllTasks(): Task[] {
        return [...this.tasks];
    }

    getTaskById(id: number): Task | null {
        return this.tasks.find((task) => task.getEventID() === id) ?? null;
    }

    insertTask(task: Task): string | null {
        if (task.getEventID() !== -1 && this.getTaskById(task.getEventID())) {
            return "Duplicate task.";
        }

        if (task.getEventID() === -1) {
            task.setEventID(this.getNextId());
        }

        this.tasks.push(task);
        return null;
    }

    updateTask(task: Task): string | null {
        const index = this.tasks.findIndex(
            (item) => item.getEventID() === task.getEventID()
        );

        if (index === -1) {
            return "Task not found.";
        }

        this.tasks[index] = task;
        return null;
    }

    deleteTask(id: number): string | null {
        const index = this.tasks.findIndex((task) => task.getEventID() === id);

        if (index === -1) {
            return "Task not found.";
        }

        this.tasks.splice(index, 1);
        return null;
    }

    private getNextId(): number {
        if (this.tasks.length === 0) {
            return 1;
        }

        return Math.max(...this.tasks.map((task) => task.getEventID())) + 1;
    }
}