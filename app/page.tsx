export default function Home() {
    return (
        <div className="mx-auto max-w-5xl">
            <h1 className="text-5xl font-bold text-gray-900">
                AutoTrack
            </h1>

            <p className="mt-4 text-3xl font-semibold text-blue-600">
                Landing page / main entrance
            </p>

            <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900">
                    Welcome to AutoTrack CRM
                </h2>
                <p className="mt-3 text-lg text-gray-600">
                    Your centralized system for managing leads, follow-ups,
                    and sales performance.
                </p>
            </div>
        </div>
    );
}