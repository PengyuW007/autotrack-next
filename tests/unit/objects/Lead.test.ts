import { Lead } from "@/domain/objects/Lead";

describe("Lead", () => {
    test("creates lead with valid name", () => {
        const lead = new Lead({
            leadID: 1,
            firstName: "John",
            lastName: "Smith",
            phone: "416-000-1111",
            leadEmail: "john@example.com",
            score: 85,
        });

        expect(lead.leadID).toBe(1);
        expect(lead.getLeadName()).toBe("John Smith");
        expect(lead.phone).toBe("416-000-1111");
        expect(lead.score).toBe(85);
    });

    test("trims first name and last name", () => {
        const lead = new Lead({
            firstName: "  John  ",
            lastName: "  Smith  ",
        });

        expect(lead.firstName).toBe("John");
        expect(lead.lastName).toBe("Smith");
    });

    test("throws error when both first and last name are empty", () => {
        expect(() => {
            new Lead({});
        }).toThrow("Lead must have at least a First Name or a Last Name.");
    });

    test("sets full name correctly", () => {
        const lead = new Lead({ firstName: "Temp" });

        lead.setLeadName("Sarah Chen");

        expect(lead.firstName).toBe("Sarah");
        expect(lead.lastName).toBe("Chen");
        expect(lead.getLeadName()).toBe("Sarah Chen");
    });

    test("compares leads by leadID", () => {
        const lead1 = new Lead({ leadID: 1, firstName: "John" });
        const lead2 = new Lead({ leadID: 1, firstName: "Sarah" });

        expect(lead1.equals(lead2)).toBe(true);
    });
});