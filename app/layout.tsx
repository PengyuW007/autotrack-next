import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = {
    title: "AutoTrack",
    description: "CRM system for automotive sales professionals",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className="h-screen overflow-hidden bg-gray-50 text-gray-900">
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <TopBar />

                <main className="min-h-0 flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
        </body>
        </html>
    );
}
