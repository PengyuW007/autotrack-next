export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Vehicle } from "@/domain/objects/Vehicle";
import { VehicleRepo } from "@/lib/persistence/real/supabase/VehicleRepo";

export default async function TestVehicleRepoPage() {
    const repo = new VehicleRepo();

    const testVehicle = new Vehicle(
        "Volkswagen",
        "Atlas",
        2026,
        "Highline",
        58000,
        "Blue",
        true,
        "TESTVIN123456789",
        "Automatic"
    );

    const insertError = await repo.insertVehicle(testVehicle);

    const insertedVehicle = await repo.getVehicleById(testVehicle.vehicleID);

    testVehicle.color = "Black";
    testVehicle.price = 60000;

    const updateError = await repo.updateVehicle(testVehicle);

    const updatedVehicle = await repo.getVehicleById(testVehicle.vehicleID);

    // Keep this commented first so you can see the vehicle in Supabase
    const deleteError = await repo.deleteVehicle(testVehicle.vehicleID);
    const deletedVehicle = await repo.getVehicleById(testVehicle.vehicleID);

    const allVehicles = await repo.getAllVehicles();


    return (
        <main className="p-6">
            <h1>Vehicle Repo Test</h1>

            <pre>
                {JSON.stringify(
                    {
                        insertedVehicleId: testVehicle.vehicleID,
                        insertError,
                        insertedVehicle,
                        updateError,
                        updatedVehicle,
                        deleteError,
                        deletedVehicle,
                        totalVehicles: allVehicles.length,
                        allVehicles,
                        // deleteError,
                    },
                    null,
                    2
                )}
            </pre>
        </main>
    );
}