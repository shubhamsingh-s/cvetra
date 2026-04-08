"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "student" | "recruiter";

interface User {
    id: string;
    email: string;
    full_name?: string;
    role: UserRole;
    company_name?: string;
    is_active: boolean;
    is_superuser: boolean;
}

interface AuthSession {
    token: string;
    user: User;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (session: AuthSession) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getDashboardPath(role: UserRole) {
    return role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/student";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window === "undefined") return null;

        const savedUser = localStorage.getItem("user");
        if (!savedUser) return null;

        try {
            return JSON.parse(savedUser) as User;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });
    const [token, setToken] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("token");
    });
    const [isLoading] = useState(false);
    const router = useRouter();

    const login = ({ token: newToken, user: nextUser }: AuthSession) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(nextUser));
        setToken(newToken);
        setUser(nextUser);
        router.push(getDashboardPath(nextUser.role));
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
