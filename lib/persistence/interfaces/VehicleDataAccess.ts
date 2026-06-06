import { Vehicle } from "@/domain/objects/Vehicle";

export interface VehicleDataAccess {
    getAllVehicles(): Vehicle[];
    getVehicleById(id: number): Vehicle | null;
    insertVehicle(vehicle: Vehicle): string | null;
    updateVehicle(vehicle: Vehicle): string | null;
    deleteVehicle(id: number): string | null;
}