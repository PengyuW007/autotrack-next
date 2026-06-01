import { Event } from "./Event";
import { Lead } from "./Lead";

export class Notification extends Event {
    constructor(
        lead: Lead | null,
        title: string,
        date: Date,
        id: number = -1
    ) {
        super(lead, title, date);
        this.setEventID(id);
    }

    getLeadID(): number {
        return this.lead ? this.lead.leadID : 0;
    }
}