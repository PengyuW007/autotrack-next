import { Vehicle } from "@/domain/objects/Vehicle";

describe("Vehicle", () => {
    test("creates vehicle with default values", () => {
        const vehicle = new Vehicle();

        expect(vehicle.vehicleID).toBe(0);
        expect(vehicle.price).toBe(0);
        expect(vehicle.inStock).toBe(false);
        expect(vehicle.vin).toBe("N/A");
        expect(vehicle.transmission).toBe("Automatic");
    });

    test("returns full vehicle description", () => {
        const vehicle = new Vehicle(
            "Volkswagen",
            "Atlas",
            2025,
            "Comfortline"
        );

        expect(vehicle.getFullDescription()).toBe(
            "2025 Volkswagen Atlas (Comfortline)"
        );
    });

    test("returns no vehicle details when make and model are empty", () => {
        const vehicle = new Vehicle();

        expect(vehicle.getFullDescription()).toBe("No Vehicle Details");
    });
});