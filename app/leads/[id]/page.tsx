import Link from "next/link";

import LeadDetailPanel, {
    LeadDetailNotificationViewModel,
    LeadDetailTaskViewModel,
    LeadDetailViewModel,
} from "@/components/leads/LeadDetailPanel";
import { AgendaService } from "@/domain/business/AgendaService";
import { PriorityManager } from "@/domain/business/PriorityManager";
import { ScoringService } from "@/domain/business/ScoringService";
import { Lead } from "@/domain/objects/Lead";
import { Notification } from "@/domain/objects/Notification";
import { Task } from "@/domain/objects/Task";
import { LeadRepo } from "@/lib/persistence/real/supabase/LeadRepo";
import { LeadVehicleInterestRepo } from "@/lib/persistence/real/supabase/LeadVehicleInterestRepo";
import { NotificationRepo } from "@/lib/persistence/real/supabase/NotificationRepo";
import { TaskRepo } from "@/lib/persistence/real/supabase/TaskRepo";
import { VehicleRepo } from "@/lib/persistence/real/supabase/VehicleRepo";

interface LeadDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

function toDateInputValue(date: Date | null | undefined) {
    if (!date) {
        return "";
    }

    return date.toISOString().split("T")[0];
}

function toTimeInputValue(date: Date | null | undefined) {
    if (!date) {
        return "";
    }

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}

function toLeadDetailViewModel(
    lead: Lead,
    scoringService: ScoringService
): LeadDetailViewModel {
    const priority = scoringService.calculatePriority(lead);

    return {
        leadID: lead.leadID,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        leadEmail: lead.leadEmail,
        leadDivision: lead.leadDivision,
        leadAddress: lead.leadAddress,
        leadCity: lead.leadCity,
        leadProvince: lead.leadProvince,
        leadCountry: lead.leadCountry,
        leadPostalCode: lead.leadPostalCode,
        budget: lead.budget,
        vehicleInterestId: lead.vehicleInterest?.vehicleID ?? null,
        vehicleInterest: lead.vehicleInterest?.getFullDescription() ?? "",
        vehicleInterestYear: lead.vehicleInterest?.year?.toString() ?? "",
        vehicleInterestMake: lead.vehicleInterest?.make ?? "",
        vehicleInterestModel: lead.vehicleInterest?.model ?? "",
        vehicleInterestTrim: lead.vehicleInterest?.trim ?? "",
        tradeInVehicleId: lead.tradeInVehicle?.vehicleID ?? null,
        tradeInVehicle: lead.tradeInVehicle?.getFullDescription() ?? "",
        stage: lead.stage,
        followUpDate: toDateInputValue(lead.followUpDate),
        score: priority.score,
        priorityLevel: priority.level,
        priorityReasons: priority.reasons,
        notes: lead.notes,
        createdAt: toDateInputValue(lead.createdAt),
        lastInteractionDate: toDateInputValue(lead.lastInteractionDate),
        lastInteractionBy: lead.lastInteractionBy,
        status: lead.status,
    };
}

function toTaskViewModel(task: Task): LeadDetailTaskViewModel {
    return {
        taskID: task.getEventID(),
        title: task.getTitle(),
        date: toDateInputValue(task.getDate()),
        time: toTimeInputValue(task.getDate()),
        completed: task.isCompleted(),
        leadID: task.getLead()?.leadID ?? null,
    };
}

function sortTaskViewModelsByNewest(
    tasks: LeadDetailTaskViewModel[]
): LeadDetailTaskViewModel[] {
    return [...tasks].sort(
        (taskA, taskB) =>
            new Date(`${taskB.date}T${taskB.time || "00:00"}:00`).getTime() -
            new Date(`${taskA.date}T${taskA.time || "00:00"}:00`).getTime()
    );
}

function toNotificationViewModel(
    notification: Notification
): LeadDetailNotificationViewModel {
    return {
        notificationID: notification.getEventID(),
        title: notification.getTitle(),
        date: toDateInputValue(notification.getDate()),
        leadID: notification.getLead()?.leadID ?? null,
    };
}

export default async function LeadDetailPage({
    params,
}: LeadDetailPageProps) {
    const { id } = await params;

    const leadRepository = new LeadRepo();
    const vehicleRepository = new VehicleRepo();
    const leadVehicleInterestRepository = new LeadVehicleInterestRepo(
        vehicleRepository
    );
    const taskRepository = new TaskRepo();
    const notificationRepository = new NotificationRepo();
    const scoringService = new ScoringService();
    const priorityManager = new PriorityManager(scoringService);
    const agendaService = new AgendaService(scoringService, priorityManager);

    const lead = await leadRepository.getLeadById(Number(id));

    if (!lead) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Lead Not Found
                </h1>

                <Link href="/leads" className="text-blue-600">
                    Back to Leads
                </Link>
            </div>
        );
    }

    const [vehicleInterest, tradeInVehicle, leadTasks, leadNotifications] =
        await Promise.all([
            leadVehicleInterestRepository.getVehicleInterestByLeadId(
                lead.leadID
            ),
            lead.tradeInVehicle?.vehicleID
                ? vehicleRepository.getVehicleById(lead.tradeInVehicle.vehicleID)
                : Promise.resolve(null),
            taskRepository.getTasksByLeadId(lead.leadID),
            notificationRepository.getNotificationsByLeadId(lead.leadID),
        ]);

    const missingSystemTasks =
        agendaService.getMissingSystemAssignedTasksUpToDate(
            [lead],
            leadTasks,
            new Date()
        );
    const createdSystemTasks: Task[] = [];

    for (const task of missingSystemTasks) {
        const error = await taskRepository.insertTask(task);

        if (!error) {
            createdSystemTasks.push(task);
        }
    }

    lead.vehicleInterest = vehicleInterest;
    lead.tradeInVehicle = tradeInVehicle;
    lead.updateScore(scoringService.calculateScore(lead));

    return (
        <div>
            <div className="mb-4">
                <Link href="/leads" className="text-sm text-blue-600">
                    Back to Leads
                </Link>
            </div>

            <LeadDetailPanel
                lead={toLeadDetailViewModel(lead, scoringService)}
                tasks={sortTaskViewModelsByNewest(
                    agendaService
                        .getUniqueTasks([...leadTasks, ...createdSystemTasks])
                        .map(toTaskViewModel)
                )}
                notifications={leadNotifications.map(toNotificationViewModel)}
            />
        </div>
    );
}
