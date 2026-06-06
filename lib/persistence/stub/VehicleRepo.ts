import { Vehicle } from "@/domain/objects/Vehicle";
import { VehicleDataAccess } from "@/lib/persistence/interfaces/VehicleDataAccess";

export class VehicleRepo implements VehicleDataAccess {
    private vehicles: Vehicle[];

    constructor(initialVehicles: Vehicle[] = []) {
        this.vehicles = [...initialVehicles];
    }

    getAllVehicles(): Vehicle[] {
        return [...this.vehicles];
    }

    getVehicleById(id: number): Vehicle | null {
        return this.vehicles.find((vehicle) => vehicle.vehicleID === id) ?? null;
    }

    insertVehicle(vehicle: Vehicle): string | null {
        if (vehicle.vehicleID !== 0 && this.getVehicleById(vehicle.vehicleID)) {
            return "Duplicate vehicle.";
        }

        if (vehicle.vehicleID === 0) {
            vehicle.vehicleID = this.getNextId();
        }

        this.vehicles.push(vehicle);
        return null;
    }

    updateVehicle(vehicle: Vehicle): string | null {
        const index = this.vehicles.findIndex(
            (item) => item.vehicleID === vehicle.vehicleID
        );

        if (index === -1) {
            return "Vehicle not found.";
        }

        this.vehicles[index] = vehicle;
        return null;
    }

    deleteVehicle(id: number): string | null {
        const index = this.vehicles.findIndex((vehicle) => vehicle.vehicleID === id);

        if (index === -1) {
            return "Vehicle not found.";
        }

        this.vehicles.splice(index, 1);
        return null;
    }

    private getNextId(): number {
        if (this.vehicles.length === 0) {
            return 1;
        }

        return Math.max(...this.vehicles.map((vehicle) => vehicle.vehicleID)) + 1;
    }
}