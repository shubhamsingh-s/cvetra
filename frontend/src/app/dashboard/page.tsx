"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

/**
 * Dashboard Entry Point
 * Handles redirection to role-specific dashboards
 */
export default function DashboardRedirect() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace("/auth/login");
            return;
        }

        // Ensure role-based redirection
        if (user.role === "recruiter") {
            router.replace("/dashboard/recruiter");
        } else {
            router.replace("/dashboard/student");
        }
    }, [isLoading, router, user]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-muted-foreground gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-medium animate-pulse">Authenticating session...</p>
        </div>
    );
}
