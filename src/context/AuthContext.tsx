import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface Profile {
    id: string;
    full_name: string;
    must_change_password: boolean;
    suspended: boolean;
}

interface AuthContextValue {
    user: User | null;
    profile: Profile | null;
    roles: string[];
    permissions: string[];
    isAuthenticated: boolean;
    isLoading: boolean;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSession = async (session: Session | null) => {
        if (session?.user) {
            setUser(session.user);
            await fetchUserData(session.user.id);
        } else {
            setUser(null);
            setProfile(null);
            setRoles([]);
            setPermissions([]);
        }
        setIsLoading(false);
    };

    const fetchUserData = async (userId: string) => {
        try {
            // Fetch Profile
            const { data: prof } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", userId)
                .single();

            setProfile(prof);

            // Fetch Roles
            const { data: rls } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", userId);

            const roleNames = rls?.map(r => r.role) || [];
            setRoles(roleNames);

            // Fetch Permissions (Granular RBAC)
            // Note: This requires the role_permissions mapping
            const { data: perms } = await supabase
                .from("role_permissions")
                .select("permission_name")
                .in("role", roleNames);

            setPermissions(perms?.map(p => p.permission_name) || []);
        } catch (error) {
            console.error("Error fetching enterprise user data:", error);
        }
    };

    const hasPermission = (permission: string) => {
        return permissions.includes(permission) || roles.includes("super_admin");
    };

    const hasRole = (role: string) => {
        return roles.includes(role);
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            roles,
            permissions,
            isAuthenticated: !!user,
            isLoading,
            hasPermission,
            hasRole,
            logout
        }}>
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
