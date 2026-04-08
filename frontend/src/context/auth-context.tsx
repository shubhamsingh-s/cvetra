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
    login: (token: string) => void;
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
        if (savedToken) {
            setToken(savedToken);
            // In a real app, you would fetch the user profile here
            // For now, we'll mock a user if a token exists
            setUser({
                id: "1",
                email: "user@example.com",
                is_active: true,
                is_superuser: false,
            });
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser({
            id: "1",
            email: "user@example.com",
            is_active: true,
            is_superuser: false,
        });
        router.push("/dashboard/student");
    };

    const logout = () => {
        localStorage.removeItem("token");
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
