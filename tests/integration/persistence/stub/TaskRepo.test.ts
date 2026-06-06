import { Task } from "@/domain/objects/Task";
import { TaskRepo } from "@/lib/persistence/stub/TaskRepo";
import { taskStubDB } from "@/tests/stub/TaskStubDB";
import { leadStubDB } from "@/tests/stub/LeadStubDB";

describe("TaskRepo", () => {
    test("gets all tasks", () => {
        const repo = new TaskRepo(taskStubDB);

        expect(repo.getAllTasks().length).toBe(taskStubDB.length);
    });

    test("gets task by id", () => {
        const repo = new TaskRepo(taskStubDB);

        const task = repo.getTaskById(1);

        expect(task).not.toBeNull();
        expect(task?.getEventID()).toBe(1);
    });

    test("inserts a new task", () => {
        const repo = new TaskRepo(taskStubDB);

        const task = new Task(
            leadStubDB[0],
            "New follow-up task",
            new Date()
        );

        const result = repo.insertTask(task);

        expect(result).toBeNull();
        expect(repo.getAllTasks().length).toBe(taskStubDB.length + 1);
        expect(task.getEventID()).toBeGreaterThan(0);
    });

    test("updates an existing task", () => {
        const repo = new TaskRepo(taskStubDB);

        const task = repo.getTaskById(1)!;
        task.setTitle("Updated Task");
        task.setCompleted(true);

        const result = repo.updateTask(task);

        expect(result).toBeNull();
        expect(repo.getTaskById(1)?.getTitle()).toBe("Updated Task");
        expect(repo.getTaskById(1)?.isCompleted()).toBe(true);
    });

    test("deletes an existing task", () => {
        const repo = new TaskRepo(taskStubDB);

        const result = repo.deleteTask(1);

        expect(result).toBeNull();
        expect(repo.getTaskById(1)).toBeNull();
    });
});