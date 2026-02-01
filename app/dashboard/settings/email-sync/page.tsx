"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import EmailSettings from "@/components/features/profile/EmailSettings";

export default function EmailSyncSettingsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 p-6">
            <header className="flex items-center gap-4 mb-10 pt-4">
                <button onClick={() => router.back()} className="p-3 bg-muted rounded-2xl border border-border">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold tracking-tight">Email Sync</h1>
            </header>

            <div className="max-w-md mx-auto">
                <EmailSettings />
            </div>
        </div>
    );
}
