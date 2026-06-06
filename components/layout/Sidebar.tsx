import Link from "next/link";

export default function Sidebar() {
    return (
        <aside className="w-64 min-h-screen border-r bg-white p-6">
            <h1 className="mb-8 text-2xl font-bold">
                AutoTrack
            </h1>

            <nav className="flex flex-col gap-3">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/leads">Leads</Link>
                <Link href="/agenda">Agenda</Link>
                <Link href="/analytics">Analytics</Link>
                {/*<Link href="/settings">Settings</Link>*/}
            </nav>
        </aside>
    );
}