"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
    CalendarClock,
    Car,
    Check,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Save,
    Trash2,
    UserRound,
    X,
} from "lucide-react";

export interface LeadDetailViewModel {
    leadID: number;
    firstName: string;
    lastName: string;
    phone: string;
    leadEmail: string;
    leadDivision: string;
    leadAddress: string;
    leadCity: string;
    leadProvince: string;
    leadCountry: string;
    leadPostalCode: string;
    budget: number;
    vehicleInterest: string;
    tradeInVehicle: string;
    stage: string;
    followUpDate: string;
    score: number;
    notes: string;
    createdAt: string;
    lastInteractionDate: string;
    lastInteractionBy: string;
    status: boolean;
}

interface LeadDetailPanelProps {
    lead: LeadDetailViewModel;
}

const stageOptions = [
    "NEW",
    "CONTACTED",
    "VISITED",
    "TEST_DRIVE",
    "NEGOTIATION",
    "CLOSED",
];

const currencyFormatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
});

function formatDisplayDate(value: string) {
    if (!value) {
        return "N/A";
    }

    return new Intl.DateTimeFormat("en-CA", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

function Field({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: ComponentType<{ size?: number; className?: string }>;
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <Icon size={16} className="text-blue-600" />
                {label}
            </div>
            <p className="text-sm font-semibold text-slate-950">
                {value || "N/A"}
            </p>
        </div>
    );
}

export default function LeadDetailPanel({ lead }: LeadDetailPanelProps) {
    const router = useRouter();
    const [currentLead, setCurrentLead] = useState(lead);
    const [draftLead, setDraftLead] = useState(lead);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const fullName = useMemo(
        () => `${currentLead.firstName} ${currentLead.lastName}`.trim(),
        [currentLead.firstName, currentLead.lastName]
    );

    const draftFullName = `${draftLead.firstName} ${draftLead.lastName}`.trim();

    function updateDraft<Value extends keyof LeadDetailViewModel>(
        field: Value,
        value: LeadDetailViewModel[Value]
    ) {
        setDraftLead((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function handleSave() {
        setCurrentLead(draftLead);
        setIsEditing(false);
    }

    function handleCancel() {
        setDraftLead(currentLead);
        setIsEditing(false);
    }

    function handleDelete() {
        setIsDeleted(true);
        setShowDeleteConfirm(false);
    }

    if (isDeleted) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <h2 className="text-xl font-bold text-red-900">
                    Lead removed from this view
                </h2>
                <p className="mt-2 text-sm text-red-700">
                    This demo uses in-memory stub data, so the delete action is shown locally.
                </p>
                <button
                    onClick={() => router.push("/leads")}
                    className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                    Back to Leads
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <UserRound size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-950">
                                    {fullName}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Lead #{currentLead.leadID} - created {formatDisplayDate(currentLead.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    <Pencil size={16} />
                                    Modify
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-500">Stage</p>
                        <p className="mt-2 text-xl font-bold text-slate-950">
                            {currentLead.stage}
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-500">Score</p>
                        <p className="mt-2 text-xl font-bold text-slate-950">
                            {Math.floor(currentLead.score)}
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-500">Status</p>
                        <p
                            className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
                                currentLead.status
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            <Check size={14} />
                            {currentLead.status ? "Active" : "Lost"}
                        </p>
                    </div>
                </div>
            </section>

            {isEditing ? (
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-950">
                        Modify Lead Information
                    </h3>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-slate-700">
                            First Name
                            <input
                                value={draftLead.firstName}
                                onChange={(event) => updateDraft("firstName", event.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Last Name
                            <input
                                value={draftLead.lastName}
                                onChange={(event) => updateDraft("lastName", event.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Phone
                            <input
                                value={draftLead.phone}
                                onChange={(event) => updateDraft("phone", event.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Email
                            <input
                                value={draftLead.leadEmail}
                                onChange={(event) => updateDraft("leadEmail", event.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Stage
                            <select
                                value={draftLead.stage}
                                onChange={(event) => updateDraft("stage", event.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            >
                                {stageOptions.map((stage) => (
                                    <option key={stage} value={stage}>
                                        {stage}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Status
                            <select
                                value={draftLead.status ? "ACTIVE" : "LOST"}
                                onChange={(event) => updateDraft("status", event.target.value === "ACTIVE")}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="LOST">Lost</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Budget
                            <input
                                type="number"
                                value={draftLead.budget}
                                onChange={(event) => updateDraft("budget", Number(event.target.value))}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Score
                            <input
                                type="number"
                                min={0}
                                max={150}
                                value={draftLead.score}
                                onChange={(event) => updateDraft("score", Number(event.target.value))}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Follow-up Date
                            <input
                                type="date"
                                value={draftLead.followUpDate}
                                onChange={(event) => updateDraft("followUpDate", event.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            City
                            <input
                                value={draftLead.leadCity}
                                onChange={(event) => updateDraft("leadCity", event.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700 md:col-span-2">
                            Address
                            <input
                                value={draftLead.leadAddress}
                                onChange={(event) => updateDraft("leadAddress", event.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700 md:col-span-2">
                            Notes
                            <textarea
                                value={draftLead.notes}
                                onChange={(event) => updateDraft("notes", event.target.value)}
                                rows={5}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-950"
                            />
                        </label>
                    </div>

                    <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                        Previewing edits for {draftFullName || "this lead"}. Stub data is in-memory, so saved changes apply to this detail view only.
                    </p>
                </section>
            ) : (
                <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-950">
                            Contact Information
                        </h3>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <Field label="Phone" value={currentLead.phone} icon={Phone} />
                            <Field label="Email" value={currentLead.leadEmail} icon={Mail} />
                            <Field
                                label="Address"
                                value={[
                                    currentLead.leadAddress,
                                    currentLead.leadCity,
                                    currentLead.leadProvince,
                                    currentLead.leadPostalCode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                                icon={MapPin}
                            />
                            <Field
                                label="Division"
                                value={currentLead.leadDivision}
                                icon={UserRound}
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-950">
                            Sales Details
                        </h3>

                        <div className="mt-5 space-y-4">
                            <Field
                                label="Vehicle Interest"
                                value={currentLead.vehicleInterest || "None"}
                                icon={Car}
                            />
                            <Field
                                label="Trade-in Vehicle"
                                value={currentLead.tradeInVehicle || "No trade-in"}
                                icon={Car}
                            />
                            <Field
                                label="Budget"
                                value={currencyFormatter.format(currentLead.budget)}
                                icon={CalendarClock}
                            />
                        </div>
                    </div>
                </section>
            )}

            {!isEditing && (
                <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-950">
                            Follow-up
                        </h3>
                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Next follow-up</span>
                                <span className="font-semibold text-slate-950">
                                    {formatDisplayDate(currentLead.followUpDate)}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Last interaction</span>
                                <span className="font-semibold text-slate-950">
                                    {formatDisplayDate(currentLead.lastInteractionDate)}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Interaction by</span>
                                <span className="font-semibold text-slate-950">
                                    {currentLead.lastInteractionBy || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-950">
                            Notes
                        </h3>
                        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">
                            {currentLead.notes || "No notes available."}
                        </p>
                    </div>
                </section>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-950">
                            Delete this lead?
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                            This removes {fullName} from the current detail view. Persistent deletion will be connected when the real repository is wired in.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Delete Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
