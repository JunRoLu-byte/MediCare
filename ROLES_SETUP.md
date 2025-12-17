# Sistema de Roles - Guía de Configuración

## 📋 Descripción

Sistema simple de control de acceso basado en roles (RBAC) para Medicare. Permite asignar diferentes permisos a usuarios según su rol en el sistema.

## 🎭 Roles Disponibles

### 1. **Paciente** (`paciente`)
- Ver y gestionar sus propias citas médicas
- Ver sus propias recetas
- Editar su perfil personal
- Ver lista de doctores disponibles

### 2. **Doctor** (`doctor`)
- Ver todas las citas médicas (especialmente las asignadas a él)
- Crear y editar recetas médicas
- Ver información de todos los pacientes
- Actualizar estado de citas

### 3. **Recepcionista** (`recepcionista`)
- Gestionar citas de todos los pacientes
- Crear, editar y cancelar citas
- Ver información de pacientes
- Ver lista de doctores

### 4. **Administrador** (`administrador`)
- Acceso completo a todas las funcionalidades
- Gestionar usuarios y asignar roles
- Gestionar doctores
- Acceso total a citas, recetas y pacientes

## 🚀 Instalación

### Opción 1: Migración (Si ya tienes datos)

Si ya tienes la base de datos con pacientes, doctores y citas, usa el archivo de migración:

```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: roles_migration.sql
```

Este script:
- ✅ Mantiene todos tus datos existentes
- ✅ Agrega las tablas de roles
- ✅ Actualiza las políticas RLS
- ✅ Asigna rol "paciente" a usuarios existentes automáticamente

### Opción 2: Instalación Completa (Base de datos nueva)

Si estás empezando desde cero:

```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: supabase_schema_with_roles.sql
```

Este script crea todo desde cero incluyendo el sistema de roles.

### Opción 3: Limpiar y Empezar de Nuevo

Si quieres borrar todo y empezar de cero:

```sql
-- Archivo: cleanup_database.sql
-- Descomenta la OPCIÓN 2 y ejecútala
-- Luego ejecuta: supabase_schema_with_roles.sql
```

## 📊 Estructura de la Base de Datos

### Nuevas Tablas

```
roles
├── id (UUID)
├── name (VARCHAR) - 'paciente', 'doctor', etc.
├── display_name (VARCHAR) - Nombre para mostrar
└── description (TEXT)

permissions
├── id (UUID)
├── name (VARCHAR) - 'view_appointments', etc.
├── resource (VARCHAR) - 'appointments', 'prescriptions', etc.
├── action (VARCHAR) - 'view', 'create', 'edit', 'delete'
└── description (TEXT)

role_permissions
├── role_id (UUID) → roles.id
└── permission_id (UUID) → permissions.id

user_roles
├── user_id (UUID) → auth.users.id
├── role_id (UUID) → roles.id
├── assigned_at (TIMESTAMP)
└── assigned_by (UUID) → auth.users.id
```

### Tabla Actualizada

```
doctors
├── ... (campos existentes)
└── user_id (UUID) → auth.users.id [NUEVO]
```

El campo `user_id` vincula un doctor con su cuenta de usuario autenticado.

## 🔧 Uso en SQL

### Asignar Rol a Usuario

```sql
-- Asignar rol de doctor
SELECT assign_user_role('user-uuid-aqui', 'doctor');

-- Asignar rol de recepcionista
SELECT assign_user_role('user-uuid-aqui', 'recepcionista');

-- Asignar rol de administrador
SELECT assign_user_role('user-uuid-aqui', 'administrador');
```

### Verificar Roles y Permisos

```sql
-- Ver roles de un usuario
SELECT * FROM get_user_roles('user-uuid-aqui');

-- Verificar si tiene un rol específico
SELECT user_has_role('user-uuid-aqui', 'doctor');

-- Verificar si tiene un permiso específico
SELECT user_has_permission('user-uuid-aqui', 'create_prescription');
```

### Remover Rol

```sql
SELECT remove_user_role('user-uuid-aqui', 'doctor');
```

### Vincular Doctor con Usuario

```sql
-- Actualizar doctor existente con user_id
UPDATE public.doctors
SET user_id = 'user-uuid-del-doctor'
WHERE id = 'doctor-uuid';
```

## 💻 Uso en TypeScript

Ver archivo `supabase.ts` actualizado con funciones helper:

```typescript
import { roleHelpers } from '@/lib/supabase';

// Obtener roles del usuario actual
const { data: roles } = await roleHelpers.getUserRoles(userId);

// Verificar si tiene un rol
const { data: isDoctor } = await roleHelpers.hasRole(userId, 'doctor');

// Verificar si tiene un permiso
const { data: canCreate } = await roleHelpers.hasPermission(userId, 'create_prescription');

// Asignar rol (solo admin)
await roleHelpers.assignRole(userId, 'recepcionista');

// Remover rol (solo admin)
await roleHelpers.removeRole(userId, 'doctor');
```

## 🔐 Políticas de Seguridad (RLS)

Las políticas RLS se actualizan automáticamente para usar roles:

### Citas (Appointments)
- **Pacientes**: Solo ven sus propias citas
- **Doctores**: Ven citas donde son el doctor asignado
- **Recepcionistas**: Ven y gestionan todas las citas
- **Admins**: Acceso completo

### Recetas (Prescriptions)
- **Pacientes**: Solo ven sus propias recetas
- **Doctores**: Ven todas las recetas y pueden crear/editar
- **Admins**: Acceso completo

### Pacientes (Patients)
- **Pacientes**: Solo ven y editan su propio perfil
- **Doctores/Recepcionistas**: Ven todos los pacientes
- **Admins**: Acceso completo

## 📝 Casos de Uso Comunes

### 1. Crear un Usuario Doctor

```sql
-- 1. El doctor se registra normalmente (se crea como paciente por defecto)
-- 2. Admin le asigna rol de doctor
SELECT assign_user_role('doctor-user-uuid', 'doctor');

-- 3. Vincular con registro en tabla doctors
UPDATE public.doctors
SET user_id = 'doctor-user-uuid'
WHERE email = 'doctor@email.com';

-- 4. Opcional: Remover rol de paciente si no lo necesita
SELECT remove_user_role('doctor-user-uuid', 'paciente');
```

### 2. Crear un Usuario Recepcionista

```sql
-- 1. Crear cuenta de usuario en Supabase Auth
-- 2. Asignar rol
SELECT assign_user_role('recep-user-uuid', 'recepcionista');
```

### 3. Crear un Administrador

```sql
-- Solo otro admin puede hacer esto
SELECT assign_user_role('new-admin-uuid', 'administrador');
```

### 4. Usuario con Múltiples Roles

```sql
-- Un doctor que también es admin
SELECT assign_user_role('user-uuid', 'doctor');
SELECT assign_user_role('user-uuid', 'administrador');
```

## 🔍 Consultas Útiles

### Ver todos los roles y sus permisos

```sql
SELECT 
    r.display_name as rol,
    p.name as permiso,
    p.description
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.display_name, p.resource, p.action;
```

### Ver usuarios y sus roles

```sql
SELECT 
    u.email,
    r.display_name as rol,
    ur.assigned_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
ORDER BY u.email;
```

### Encontrar usuarios sin roles

```sql
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL;
```

## ⚠️ Notas Importantes

1. **Usuarios Nuevos**: Por defecto, todos los usuarios nuevos reciben el rol "paciente" automáticamente.

2. **Doctores**: Deben tener:
   - Un registro en `auth.users` (para login)
   - Un registro en `doctors` (información profesional)
   - Rol "doctor" asignado en `user_roles`
   - Campo `user_id` en `doctors` vinculado a `auth.users`

3. **RLS Activo**: Row Level Security está habilitado. Si desactivas RLS temporalmente para testing, recuerda reactivarlo en producción.

4. **Primer Admin**: El primer administrador debe ser asignado manualmente desde el SQL Editor de Supabase, ya que solo admins pueden asignar roles.

## 🛠️ Troubleshooting

### "No puedo ver datos aunque tenga el rol correcto"

Verifica que RLS esté habilitado:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### "Error al asignar rol"

Verifica que el rol existe:
```sql
SELECT * FROM roles WHERE name = 'nombre-del-rol';
```

### "Las políticas no funcionan"

Verifica que las funciones helper existen:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'user_%';
```

## 📚 Próximos Pasos

1. Ejecutar el script SQL apropiado en Supabase
2. Actualizar `supabase.ts` con las funciones helper
3. Crear tu primer usuario administrador
4. Asignar roles a usuarios existentes
5. Implementar verificación de roles en tu frontend
