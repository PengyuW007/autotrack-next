import { Event } from "./Event";
import { Lead } from "./Lead";

export class Task extends Event {
    private completed: boolean;
    private taskType: string;
    private notes: string;

    constructor(
        lead: Lead | null,
        title: string,
        date: Date,
        id: number = -1,
        taskType: string = "",
        notes: string = ""
    ) {
        super(lead, title, date);
        this.setEventID(id);
        this.completed = false;
        this.taskType = taskType;
        this.notes = notes;
    }

    isCompleted(): boolean {
        return this.completed;
    }

    setCompleted(completed: boolean): void {
        this.completed = completed;
    }

    getTaskType(): string {
        return this.taskType;
    }

    setTaskType(taskType: string): void {
        this.taskType = taskType;
    }

    getNotes(): string {
        return this.notes;
    }

    setNotes(notes: string): void {
        this.notes = notes;
    }
}
