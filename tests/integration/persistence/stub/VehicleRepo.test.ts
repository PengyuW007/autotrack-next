import { Vehicle } from "@/domain/objects/Vehicle";
import { VehicleRepo } from "@/lib/persistence/stub/VehicleRepo";
import { vehicleStubDB } from "@/tests/stub/VehicleStubDB";

describe("VehicleRepo", () => {
    test("gets all vehicles", () => {
        const repo = new VehicleRepo(vehicleStubDB);

        expect(repo.getAllVehicles().length).toBe(vehicleStubDB.length);
    });

    test("gets vehicle by id", () => {
        const repo = new VehicleRepo(vehicleStubDB);

        const vehicle = repo.getVehicleById(1);

        expect(vehicle).not.toBeNull();
        expect(vehicle?.vehicleID).toBe(1);
    });

    test("inserts a new vehicle", () => {
        const repo = new VehicleRepo(vehicleStubDB);

        const vehicle = new Vehicle(
            "Volkswagen",
            "Golf",
            2025,
            "GTI"
        );

        const result = repo.insertVehicle(vehicle);

        expect(result).toBeNull();
        expect(repo.getAllVehicles().length).toBe(vehicleStubDB.length + 1);
        expect(vehicle.vehicleID).toBeGreaterThan(0);
    });

    test("updates an existing vehicle", () => {
        const repo = new VehicleRepo(vehicleStubDB);

        const vehicle = repo.getVehicleById(1)!;
        vehicle.color = "Black";

        const result = repo.updateVehicle(vehicle);

        expect(result).toBeNull();
        expect(repo.getVehicleById(1)?.color).toBe("Black");
    });

    test("deletes an existing vehicle", () => {
        const repo = new VehicleRepo(vehicleStubDB);

        const result = repo.deleteVehicle(1);

        expect(result).toBeNull();
        expect(repo.getVehicleById(1)).toBeNull();
    });
});