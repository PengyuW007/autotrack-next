// tests/mocks/VehicleStubDB.ts

import { Vehicle } from "@/domain/objects/Vehicle";

export const vehicleStubDB: Vehicle[] = [
    new Vehicle("Volkswagen", "Atlas", 2025, "Comfortline", 52000, "Black", true, "N/A", "Automatic"),
    new Vehicle("Volkswagen", "Tiguan", 2024, "Highline", 43000, "White", true, "N/A", "Automatic"),
];