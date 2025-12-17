// =====================================================
// AUTHORIZATION MIDDLEWARE
// =====================================================
// Middleware para proteger rutas y componentes basado en roles
// Uso: import { requireRole, requirePermission } from '@/lib/auth-middleware'

import { roleHelpers, type UserRole, type Permission } from './supabase';
import { useEffect, useState } from 'react';

/**
 * Verifica si el usuario actual tiene un rol específico
 * @param requiredRole - El rol requerido
 * @returns true si el usuario tiene el rol, false si no
 */
export async function requireRole(requiredRole: UserRole): Promise<boolean> {
    try {
        const { data, error } = await roleHelpers.isAdmin();

        // Si es admin, siempre tiene acceso
        if (data === true) return true;

        // Verificar el rol específico
        const { user, roles } = await roleHelpers.getCurrentUserWithRoles();

        if (!user || !roles) return false;

        return roles.some((role: any) => role.role_name === requiredRole);
    } catch (error) {
        console.error('Error checking role:', error);
        return false;
    }
}

/**
 * Verifica si el usuario actual tiene un permiso específico
 * @param requiredPermission - El permiso requerido
 * @returns true si el usuario tiene el permiso, false si no
 */
export async function requirePermission(requiredPermission: Permission): Promise<boolean> {
    try {
        const { user } = await roleHelpers.getCurrentUserWithRoles();

        if (!user) return false;

        const { data, error } = await roleHelpers.hasPermission(user.id, requiredPermission);

        if (error) {
            console.error('Error checking permission:', error);
            return false;
        }

        return data === true;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}

/**
 * Verifica si el usuario actual tiene al menos uno de los roles especificados
 * @param roles - Array de roles permitidos
 * @returns true si el usuario tiene al menos uno de los roles
 */
export async function requireAnyRole(roles: UserRole[]): Promise<boolean> {
    try {
        const { user, roles: userRoles } = await roleHelpers.getCurrentUserWithRoles();

        if (!user || !userRoles) return false;

        return userRoles.some((userRole: any) =>
            roles.includes(userRole.role_name as UserRole)
        );
    } catch (error) {
        console.error('Error checking roles:', error);
        return false;
    }
}

/**
 * Verifica si el usuario actual tiene todos los roles especificados
 * @param roles - Array de roles requeridos
 * @returns true si el usuario tiene todos los roles
 */
export async function requireAllRoles(roles: UserRole[]): Promise<boolean> {
    try {
        const { user, roles: userRoles } = await roleHelpers.getCurrentUserWithRoles();

        if (!user || !userRoles) return false;

        const userRoleNames = userRoles.map((role: any) => role.role_name);

        return roles.every(role => userRoleNames.includes(role));
    } catch (error) {
        console.error('Error checking roles:', error);
        return false;
    }
}

/**
 * Hook personalizado para usar en componentes React
 * Ejemplo de uso:
 * 
 * const { hasRole, hasPermission, isLoading } = useAuth();
 * 
 * if (isLoading) return <Loading />;
 * if (!hasRole('doctor')) return <Unauthorized />;
 */
export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUserAndRoles();
    }, []);

    async function loadUserAndRoles() {
        try {
            const { user, roles } = await roleHelpers.getCurrentUserWithRoles();
            setUser(user);
            setRoles(roles || []);
        } catch (error) {
            console.error('Error loading user and roles:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const hasRole = (role: UserRole) => {
        return roles.some((r: any) => r.role_name === role);
    };

    const hasAnyRole = (requiredRoles: UserRole[]) => {
        return roles.some((r: any) => requiredRoles.includes(r.role_name));
    };

    const hasPermission = async (permission: Permission) => {
        if (!user) return false;
        const { data } = await roleHelpers.hasPermission(user.id, permission);
        return data === true;
    };

    return {
        user,
        roles,
        isLoading,
        hasRole,
        hasAnyRole,
        hasPermission,
        isAdmin: hasRole('administrador'),
        isDoctor: hasRole('doctor'),
        isReceptionist: hasRole('recepcionista'),
        isPatient: hasRole('paciente'),
    };
}

// Nota: Para usar useAuth, necesitas importar React
// import React from 'react';
