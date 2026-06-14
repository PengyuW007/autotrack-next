import { supabase } from "@/lib/supabase/client";

export default async function TestSupabasePage() {
    const { data, error } = await supabase
        .from("leads")
        .select("*");

    return (
        <main className="p-6">
            <h1>Supabase Test</h1>

            <pre>
                {JSON.stringify(
                    {
                        data,
                        error,
                    },
                    null,
                    2
                )}
            </pre>
        </main>
    );
}