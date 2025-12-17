# Ejemplos de Uso del Sistema de Roles

Este documento contiene ejemplos prácticos de cómo usar el sistema de roles en tu aplicación.

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Ejemplos en SQL](#ejemplos-en-sql)
3. [Ejemplos en TypeScript/React](#ejemplos-en-typescriptreact)
4. [Proteger Rutas](#proteger-rutas)
5. [Componentes Condicionales](#componentes-condicionales)

## Configuración Inicial

### 1. Ejecutar Script SQL

Primero, ejecuta uno de los scripts SQL en Supabase:

```sql
-- Si ya tienes datos, usa la migración:
-- Ejecuta: roles_migration.sql

-- Si es una instalación nueva:
-- Ejecuta: supabase_schema_with_roles.sql
```

### 2. Crear Primer Administrador

```sql
-- Obtén el UUID de tu usuario desde Supabase Dashboard > Authentication
-- Reemplaza 'tu-user-uuid' con el UUID real

SELECT assign_user_role('tu-user-uuid', 'administrador');

-- Verificar que se asignó correctamente
SELECT * FROM get_user_roles('tu-user-uuid');
```

## Ejemplos en SQL

### Asignar Roles a Usuarios

```sql
-- Asignar rol de doctor
SELECT assign_user_role('user-uuid', 'doctor');

-- Asignar rol de recepcionista
SELECT assign_user_role('user-uuid', 'recepcionista');

-- Un usuario puede tener múltiples roles
SELECT assign_user_role('user-uuid', 'doctor');
SELECT assign_user_role('user-uuid', 'administrador');
```

### Vincular Doctor con Usuario

```sql
-- Paso 1: Crear usuario en Supabase Auth (desde el dashboard)
-- Paso 2: Asignar rol de doctor
SELECT assign_user_role('doctor-user-uuid', 'doctor');

-- Paso 3: Vincular con registro en tabla doctors
UPDATE public.doctors
SET user_id = 'doctor-user-uuid'
WHERE email = 'doctor@email.com';

-- Paso 4: Verificar
SELECT 
    d.full_name,
    d.email,
    u.email as user_email,
    r.display_name as rol
FROM doctors d
JOIN auth.users u ON d.user_id = u.id
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE d.user_id = 'doctor-user-uuid';
```

### Consultas Útiles

```sql
-- Ver todos los usuarios con sus roles
SELECT 
    u.email,
    STRING_AGG(r.display_name, ', ') as roles
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email
ORDER BY u.email;

-- Ver permisos de un rol específico
SELECT 
    r.display_name as rol,
    p.name as permiso,
    p.resource,
    p.action,
    p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'doctor'
ORDER BY p.resource, p.action;
```

## Ejemplos en TypeScript/React

### Verificar Rol del Usuario Actual

```typescript
import { roleHelpers } from '@/lib/supabase';

// En un componente o función
async function checkUserRole() {
    const { user, roles } = await roleHelpers.getCurrentUserWithRoles();
    
    if (!user) {
        console.log('Usuario no autenticado');
        return;
    }
    
    console.log('Usuario:', user.email);
    console.log('Roles:', roles);
    
    // Verificar si es doctor
    const { data: isDoctor } = await roleHelpers.isDoctor();
    if (isDoctor) {
        console.log('El usuario es un doctor');
    }
    
    // Verificar si es admin
    const { data: isAdmin } = await roleHelpers.isAdmin();
    if (isAdmin) {
        console.log('El usuario es administrador');
    }
}
```

### Verificar Permisos

```typescript
import { roleHelpers } from '@/lib/supabase';

async function checkPermissions(userId: string) {
    // Verificar si puede crear recetas
    const { data: canCreatePrescription } = await roleHelpers.hasPermission(
        userId, 
        'create_prescription'
    );
    
    if (canCreatePrescription) {
        console.log('Puede crear recetas');
    }
    
    // Verificar si puede ver todas las citas
    const { data: canViewAll } = await roleHelpers.hasPermission(
        userId,
        'view_all_appointments'
    );
    
    if (canViewAll) {
        console.log('Puede ver todas las citas');
    }
}
```

### Asignar Roles (Solo Admin)

```typescript
import { roleHelpers } from '@/lib/supabase';

async function assignDoctorRole(userId: string) {
    // Solo un admin puede hacer esto
    const { data, error } = await roleHelpers.assignRole(userId, 'doctor');
    
    if (error) {
        console.error('Error asignando rol:', error);
        return;
    }
    
    console.log('Rol asignado exitosamente');
}
```

## Proteger Rutas

### Usando Middleware

```typescript
// app/dashboard/doctor/page.tsx
import { requireRole } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';

export default async function DoctorDashboard() {
    const hasAccess = await requireRole('doctor');
    
    if (!hasAccess) {
        redirect('/unauthorized');
    }
    
    return (
        <div>
            <h1>Dashboard de Doctor</h1>
            {/* Contenido solo para doctores */}
        </div>
    );
}
```

### Proteger Múltiples Roles

```typescript
// app/admin/page.tsx
import { requireAnyRole } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
    // Permitir acceso a admins y recepcionistas
    const hasAccess = await requireAnyRole(['administrador', 'recepcionista']);
    
    if (!hasAccess) {
        redirect('/');
    }
    
    return <div>Panel de Administración</div>;
}
```

## Componentes Condicionales

### Usando el Hook useAuth

```typescript
'use client';

import { useAuth } from '@/lib/auth-middleware';

export default function DashboardPage() {
    const { user, roles, isLoading, isDoctor, isAdmin } = useAuth();
    
    if (isLoading) {
        return <div>Cargando...</div>;
    }
    
    if (!user) {
        return <div>Por favor inicia sesión</div>;
    }
    
    return (
        <div>
            <h1>Bienvenido, {user.email}</h1>
            
            {/* Mostrar solo para doctores */}
            {isDoctor && (
                <div>
                    <h2>Panel de Doctor</h2>
                    <button>Crear Receta</button>
                </div>
            )}
            
            {/* Mostrar solo para admins */}
            {isAdmin && (
                <div>
                    <h2>Panel de Administración</h2>
                    <button>Gestionar Usuarios</button>
                </div>
            )}
            
            {/* Mostrar roles del usuario */}
            <div>
                <h3>Tus roles:</h3>
                <ul>
                    {roles.map((role: any) => (
                        <li key={role.role_name}>{role.role_display_name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
```

### Botón Condicional

```typescript
'use client';

import { useAuth } from '@/lib/auth-middleware';

export function CreatePrescriptionButton() {
    const { hasRole } = useAuth();
    
    // Solo mostrar para doctores y admins
    if (!hasRole('doctor') && !hasRole('administrador')) {
        return null;
    }
    
    return (
        <button onClick={handleCreatePrescription}>
            Crear Receta Médica
        </button>
    );
}
```

### Verificar Permiso Específico

```typescript
'use client';

import { useState, useEffect } from 'react';
import { roleHelpers } from '@/lib/supabase';

export function AppointmentActions({ appointmentId }: { appointmentId: string }) {
    const [canEdit, setCanEdit] = useState(false);
    const [canDelete, setCanDelete] = useState(false);
    
    useEffect(() => {
        checkPermissions();
    }, []);
    
    async function checkPermissions() {
        const { user } = await roleHelpers.getCurrentUserWithRoles();
        if (!user) return;
        
        const { data: edit } = await roleHelpers.hasPermission(
            user.id, 
            'edit_any_appointment'
        );
        const { data: del } = await roleHelpers.hasPermission(
            user.id, 
            'delete_any_appointment'
        );
        
        setCanEdit(edit === true);
        setCanDelete(del === true);
    }
    
    return (
        <div>
            {canEdit && (
                <button>Editar Cita</button>
            )}
            {canDelete && (
                <button>Cancelar Cita</button>
            )}
        </div>
    );
}
```

## Ejemplo Completo: Panel de Administración

```typescript
'use client';

import { useState, useEffect } from 'react';
import { roleHelpers } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-middleware';

export default function UserManagementPage() {
    const { isAdmin, isLoading } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    
    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);
    
    async function loadData() {
        // Cargar todos los roles disponibles
        const { data: rolesData } = await roleHelpers.getAllRoles();
        setRoles(rolesData || []);
        
        // Aquí cargarías la lista de usuarios
        // (necesitarías crear una función para esto)
    }
    
    async function handleAssignRole(userId: string, roleName: string) {
        const { error } = await roleHelpers.assignRole(userId, roleName as any);
        
        if (error) {
            alert('Error asignando rol: ' + error.message);
        } else {
            alert('Rol asignado exitosamente');
            loadData(); // Recargar datos
        }
    }
    
    if (isLoading) {
        return <div>Cargando...</div>;
    }
    
    if (!isAdmin) {
        return <div>No tienes permisos para ver esta página</div>;
    }
    
    return (
        <div>
            <h1>Gestión de Usuarios</h1>
            
            <div>
                <h2>Roles Disponibles</h2>
                <ul>
                    {roles.map(role => (
                        <li key={role.id}>
                            <strong>{role.display_name}</strong>: {role.description}
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Aquí irían los usuarios y opciones para asignar roles */}
        </div>
    );
}
```

## Notas Importantes

1. **Server vs Client Components**: 
   - Usa `async/await` en Server Components
   - Usa `useEffect` y hooks en Client Components

2. **Seguridad**: 
   - Las verificaciones en el frontend son solo para UX
   - La seguridad real está en las políticas RLS de Supabase

3. **Performance**: 
   - Cachea los roles del usuario cuando sea posible
   - Evita verificar permisos en cada render

4. **Testing**: 
   - Siempre prueba con diferentes roles
   - Verifica que RLS esté habilitado en producción
