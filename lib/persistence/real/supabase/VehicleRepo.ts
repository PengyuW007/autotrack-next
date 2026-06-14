import { supabase } from "@/lib/supabase/client";
import { Vehicle } from "@/domain/objects/Vehicle";

type VehicleRow = {
    vehicle_id: number;
    make: string | null;
    model: string | null;
    year: number | null;
    trim: string | null;
    price: number | null;
    color: string | null;
    in_stock: boolean | null;
    vin: string | null;
    transmission: string | null;
};

type VehicleInsertRow = Omit<VehicleRow, "vehicle_id"> & {
    vehicle_id?: number;
};

const TABLE_NAME = "vehicles";

function mapRowToVehicle(row: VehicleRow): Vehicle {
    const vehicle = new Vehicle(
        row.make,
        row.model,
        row.year,
        row.trim,
        row.price ?? 0,
        row.color,
        row.in_stock ?? false,
        row.vin ?? "N/A",
        row.transmission ?? "Automatic"
    );

    vehicle.vehicleID = row.vehicle_id;
    return vehicle;
}

function mapVehicleToRow(vehicle: Vehicle): VehicleInsertRow {
    const row: VehicleInsertRow = {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        trim: vehicle.trim,
        price: vehicle.price,
        color: vehicle.color,
        in_stock: vehicle.inStock,
        vin: vehicle.vin,
        transmission: vehicle.transmission,
    };

    if (vehicle.vehicleID !== 0) {
        row.vehicle_id = vehicle.vehicleID;
    }

    return row;
}

export class VehicleRepo {
    async getAllVehicles(): Promise<Vehicle[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("vehicle_id", { ascending: true });

        if (error || !data) {
            return [];
        }

        return data.map((row) => mapRowToVehicle(row as VehicleRow));
    }

    async getVehicleById(id: number): Promise<Vehicle | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("vehicle_id", id)
            .maybeSingle();

        if (error || !data) {
            return null;
        }

        return mapRowToVehicle(data as VehicleRow);
    }

    async insertVehicle(vehicle: Vehicle): Promise<string | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(mapVehicleToRow(vehicle))
            .select("*")
            .single();

        if (error) {
            return error.message;
        }

        if (data) {
            vehicle.vehicleID = (data as VehicleRow).vehicle_id;
        }

        return null;
    }

    async updateVehicle(vehicle: Vehicle): Promise<string | null> {
        const existingVehicle = await this.getVehicleById(vehicle.vehicleID);

        if (!existingVehicle) {
            return "Vehicle not found.";
        }

        const { error } = await supabase
            .from(TABLE_NAME)
            .update(mapVehicleToRow(vehicle))
            .eq("vehicle_id", vehicle.vehicleID);

        return error?.message ?? null;
    }

    async deleteVehicle(id: number): Promise<string | null> {
        const existingVehicle = await this.getVehicleById(id);

        if (!existingVehicle) {
            return "Vehicle not found.";
        }

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("vehicle_id", id);

        return error?.message ?? null;
    }
}
