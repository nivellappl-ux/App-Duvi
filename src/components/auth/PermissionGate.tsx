import React, { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface PermissionGateProps {
    children: ReactNode;
    permission?: string;
    role?: string;
    fallback?: ReactNode;
}

/**
 * PermissionGate
 * 
 * Conditionally renders children based on user permissions or roles.
 * Use this to protect UI elements (buttons, menu items, sections).
 */
export function PermissionGate({
    children,
    permission,
    role,
    fallback = null
}: PermissionGateProps) {
    const { hasPermission, hasRole, isLoading } = useAuth();

    if (isLoading) return null;

    const canAccess =
        (!permission || hasPermission(permission)) &&
        (!role || hasRole(role));

    if (!canAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
