export default function TopBar() {
    return (
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8 shadow-sm">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    AutoTrack CRM
                </h2>
                <p className="text-gray-600">
                    Scientific sales follow-up system
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                    PW
                </div>
                <span className="font-semibold text-gray-900">
                    Pengyu Wang
                </span>
            </div>
        </header>
    );
}