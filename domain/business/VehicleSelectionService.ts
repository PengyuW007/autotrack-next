import { Vehicle } from "@/domain/objects/Vehicle";
import { LeadTradeInVehicleRepo } from "@/lib/persistence/real/supabase/LeadTradeInVehicleRepo";
import { LeadVehicleInterestRepo } from "@/lib/persistence/real/supabase/LeadVehicleInterestRepo";
import { VehicleRepo } from "@/lib/persistence/real/supabase/VehicleRepo";

export type VehicleSelection = {
    year: string;
    make: string;
    model: string;
    trim: string;
};

export class VehicleSelectionService {
    private vehicleRepo: VehicleRepo;
    private leadVehicleInterestRepo: LeadVehicleInterestRepo;
    private leadTradeInVehicleRepo: LeadTradeInVehicleRepo;

    constructor(
        vehicleRepo = new VehicleRepo(),
        leadVehicleInterestRepo = new LeadVehicleInterestRepo(vehicleRepo),
        leadTradeInVehicleRepo = new LeadTradeInVehicleRepo(vehicleRepo)
    ) {
        this.vehicleRepo = vehicleRepo;
        this.leadVehicleInterestRepo = leadVehicleInterestRepo;
        this.leadTradeInVehicleRepo = leadTradeInVehicleRepo;
    }

    searchYears(query: string): Promise<number[]> {
        return this.vehicleRepo.searchYears(query);
    }

    searchMakes(year: string, query: string): Promise<string[]> {
        const parsedYear = Number(year);

        if (!parsedYear) {
            return Promise.resolve([]);
        }

        return this.vehicleRepo.searchMakes(parsedYear, query);
    }

    searchModels(
        year: string,
        make: string,
        query: string
    ): Promise<string[]> {
        const parsedYear = Number(year);

        if (!parsedYear || !make.trim()) {
            return Promise.resolve([]);
        }

        return this.vehicleRepo.searchModels(parsedYear, make.trim(), query);
    }

    searchTrims(
        year: string,
        make: string,
        model: string,
        query: string
    ): Promise<string[]> {
        const parsedYear = Number(year);

        if (!parsedYear || !make.trim() || !model.trim()) {
            return Promise.resolve([]);
        }

        return this.vehicleRepo.searchTrims(
            parsedYear,
            make.trim(),
            model.trim(),
            query
        );
    }

    async saveLeadVehicleInterest(
        leadId: number,
        selection: VehicleSelection
    ): Promise<string | null> {
        const year = Number(selection.year);
        const make = selection.make.trim();
        const model = selection.model.trim();
        const trim = selection.trim.trim();

        if (!year && !make && !model && !trim) {
            return this.leadVehicleInterestRepo.clearVehicleInterest(leadId);
        }

        if (!year || !make || !model) {
            return "Year, make, and model are required to save vehicle interest.";
        }

        return this.leadVehicleInterestRepo.saveVehicleInterest({
            leadId,
            year,
            make,
            model,
            trim,
        });
    }

    async saveLeadTradeInVehicle(
        leadId: number,
        selection: VehicleSelection
    ): Promise<string | null> {
        const year = Number(selection.year);
        const make = selection.make.trim();
        const model = selection.model.trim();
        const trim = selection.trim.trim();

        if (!year && !make && !model && !trim) {
            return this.leadTradeInVehicleRepo.clearTradeInVehicle(leadId);
        }

        if (!year || !make || !model) {
            return "Year, make, and model are required to save trade-in vehicle.";
        }

        return this.leadTradeInVehicleRepo.saveTradeInVehicle({
            leadId,
            year,
            make,
            model,
            trim,
        });
    }

    toSelection(vehicle: Vehicle | null): VehicleSelection {
        return {
            year: vehicle?.year?.toString() ?? "",
            make: vehicle?.make ?? "",
            model: vehicle?.model ?? "",
            trim: vehicle?.trim ?? "",
        };
    }
}
