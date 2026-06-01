// tests/mocks/LeadStubDB.ts

import { Lead } from "@/domain/objects/Lead";
import { vehicleStubDB } from "./VehicleStubDB";

export const leadStubDB: Lead[] = [
    new Lead({
        leadID: 1,
        firstName: "John",
        lastName: "Smith",
        phone: "416-000-1111",
        leadEmail: "john@example.com",
        vehicleInterest: vehicleStubDB[0],
        stage: "NEW",
        score: 85,
    }),
    new Lead({
        leadID: 2,
        firstName: "Sarah",
        lastName: "Chen",
        phone: "647-000-2222",
        leadEmail: "sarah@example.com",
        vehicleInterest: vehicleStubDB[1],
        stage: "WORKING",
        score: 62,
    }),
];