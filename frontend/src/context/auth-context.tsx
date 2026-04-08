"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    email: string;
    full_name?: string;
    is_active: boolean;
    is_superuser: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, role?: string, company?: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");
        const savedCompany = localStorage.getItem("company");
        const savedEmail = localStorage.getItem("email");
        if (savedToken) {
            setToken(savedToken);
            // In a real app, fetch user profile. For demo, restore from localStorage when present.
            setUser({
                id: "1",
                email: savedEmail || "user@example.com",
                is_active: true,
                is_superuser: false,
            });
            // Attach role/company to window for quick access in UI (non-ideal but simple)
            if (savedRole) (window as any).__ROLE = savedRole;
            if (savedCompany) (window as any).__COMPANY = savedCompany;
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, role: string = "student", company?: string) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", role);
        if (company) localStorage.setItem("company", company);
        setToken(newToken);
        setUser({
            id: "1",
            email: "user@example.com",
            is_active: true,
            is_superuser: false,
        });
        // Navigate to role-specific dashboard
        if (role === "recruiter") router.push("/dashboard/recruiter");
        else router.push("/dashboard/student");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("company");
        localStorage.removeItem("email");
        setToken(null);
        setUser(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
