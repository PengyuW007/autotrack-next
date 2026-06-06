// tests/mocks/VehicleStubDB.ts

import { Vehicle } from "@/domain/objects/Vehicle";

const atlas = new Vehicle(
    "Volkswagen",
    "Atlas",
    2025,
    "Comfortline",
    52000,
    "Black",
    true,
    "N/A",
    "Automatic"
);
atlas.vehicleID = 1;

const tiguan = new Vehicle(
    "Volkswagen",
    "Tiguan",
    2024,
    "Highline",
    43000,
    "White",
    true,
    "N/A",
    "Automatic"
);
tiguan.vehicleID = 2;

export const vehicleStubDB: Vehicle[] = [
    atlas,
    tiguan,
];