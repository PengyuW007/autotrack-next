import { Lead } from "@/domain/objects/Lead";

type Props = {
    selectedDate: Date;
    agendaLeads: Lead[];
};

export default function AgendaActivityPanel({
                                                selectedDate,
                                                agendaLeads,
                                            }: Props) {
    return (
        <section className="h-1/2 rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Today&apos;s Activities</h2>
                    <p className="text-sm text-slate-500">
                        {selectedDate.toDateString()}
                    </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
          {agendaLeads.length} items
        </span>
            </div>

            <div className="h-[calc(100%-72px)] space-y-3 overflow-y-auto pr-2">
                {agendaLeads.map((lead) => (
                    <div key={lead.leadID} className="rounded-xl border p-4">
                        <div className="flex justify-between">
                            <h3 className="font-semibold">{lead.getLeadName()}</h3>
                            <span className="text-sm text-slate-500">
                Score: {lead.score ?? "N/A"}
              </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Stage: {lead.stage}
                        </p>

                        <p className="text-sm text-slate-500">
                            Status: {lead.status}
                        </p>
                    </div>
                ))}

                {agendaLeads.length === 0 && (
                    <p className="text-sm text-slate-400">
                        No activities for this date.
                    </p>
                )}
            </div>
        </section>
    );
}