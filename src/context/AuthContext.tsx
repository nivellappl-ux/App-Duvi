import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
    id: string;
    name: string;
    role: string;
    email: string;
    avatar: string;
}

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_USER: User = {
    id: "1",
    name: "João Silva",
    role: "Administrador",
    email: "joao.silva@duvion.ao",
    avatar: "JS"
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem("duvion-user");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse user from local storage", e);
            return null;
        }
    });

    const login = async (email: string, pass: string) => {
        // Basic mock login
        localStorage.setItem("duvion-user", JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
    };

    const logout = () => {
        localStorage.removeItem("duvion-user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
