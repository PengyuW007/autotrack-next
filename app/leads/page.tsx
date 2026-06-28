"use client";

import { useEffect, useState } from "react";

import LeadTable from "@/components/leads/LeadTable";
import { ScoringService } from "@/domain/business/ScoringService";
import { Lead } from "@/domain/objects/Lead";
import { LeadTradeInVehicleRepo } from "@/lib/persistence/real/supabase/LeadTradeInVehicleRepo";
import { LeadVehicleInterestRepo } from "@/lib/persistence/real/supabase/LeadVehicleInterestRepo";
import { LeadRepo } from "@/lib/persistence/real/supabase/LeadRepo";
import { VehicleRepo } from "@/lib/persistence/real/supabase/VehicleRepo";

async function hydrateLeadTableData(leads: Lead[]): Promise<Lead[]> {
    const vehicleRepository = new VehicleRepo();
    const vehicleInterestRepository = new LeadVehicleInterestRepo(
        vehicleRepository
    );
    const tradeInVehicleRepository = new LeadTradeInVehicleRepo(
        vehicleRepository
    );
    const scoringService = new ScoringService();

    return Promise.all(
        leads.map(async (lead) => {
            const [vehicleInterest, tradeInVehicle] = await Promise.all([
                vehicleInterestRepository.getVehicleInterestByLeadId(
                    lead.leadID
                ),
                tradeInVehicleRepository.getTradeInVehicleByLeadId(
                    lead.leadID
                ),
            ]);

            lead.vehicleInterest = vehicleInterest;
            lead.tradeInVehicle = tradeInVehicle;
            lead.updateScore(scoringService.calculatePriority(lead).score);

            return lead;
        })
    );
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadLeads() {
            const leadRepository = new LeadRepo();
            const leadsFromRepository = await leadRepository.getAllLeads();
            const nextLeads = await hydrateLeadTableData(leadsFromRepository);

            if (active) {
                setLeads(nextLeads);
                setLoading(false);
            }
        }

        loadLeads();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div>
            {loading ? (
                <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                    Loading leads...
                </div>
            ) : (
                <LeadTable leads={leads} />
            )}
        </div>
    );
}
