"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.replace("/auth/login");
            return;
        }

        router.replace(user.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/student");
    }, [isLoading, router, user]);

    return (
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
            Redirecting to your dashboard...
        </div>
    );
}
