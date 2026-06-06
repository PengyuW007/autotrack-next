export default function TopBar() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <div>
                <h2 className="text-lg font-semibold">
                    AutoTrack CRM
                </h2>
                <p className="text-sm text-gray-500">
                    Scientific sales follow-up system
                </p>
            </div>

            <div className="text-sm text-gray-600">
                Pengyu Wang
            </div>
        </header>
    );
}