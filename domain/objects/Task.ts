import { Event } from "./Event";
import { Lead } from "./Lead";

export class Task extends Event {
    private completed: boolean;

    constructor(
        lead: Lead | null,
        title: string,
        date: Date,
        id: number = -1
    ) {
        super(lead, title, date);
        this.setEventID(id);
        this.completed = false;
    }

    isCompleted(): boolean {
        return this.completed;
    }

    setCompleted(completed: boolean): void {
        this.completed = completed;
    }
}