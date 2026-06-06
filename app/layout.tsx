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
      <body>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <TopBar />

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
      </body>
      </html>
  );
}