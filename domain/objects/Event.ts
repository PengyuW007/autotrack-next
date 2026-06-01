import { Lead } from "./Lead";

export abstract class Event {
    protected lead: Lead | null;
    protected title: string;
    protected date: Date;
    protected eventID: number;

    protected constructor(
        lead: Lead | null,
        title: string,
        date: Date
    ) {
        this.lead = lead;
        this.title = title || "";
        this.date = date || new Date();
        this.eventID = -1;
    }

    getLead(): Lead | null {
        return this.lead;
    }

    setLead(lead: Lead | null): void {
        this.lead = lead;
    }

    getTitle(): string {
        return this.title;
    }

    setTitle(title: string): void {
        this.title = title;
    }

    getDate(): Date {
        return this.date;
    }

    setDate(date: Date): void {
        this.date = date;
    }

    getEventID(): number {
        return this.eventID;
    }

    setEventID(eventID: number): void {
        this.eventID = eventID;
    }
}