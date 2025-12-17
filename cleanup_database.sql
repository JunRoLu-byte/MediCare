-- =====================================================
-- MEDICARE - SCRIPT DE LIMPIEZA (CLEANUP)
-- =====================================================
-- ⚠️ ADVERTENCIA: Este script ELIMINARÁ TODAS las tablas
-- y datos del sistema. Úsalo solo si quieres empezar de cero.
-- =====================================================

-- =====================================================
-- OPCIÓN 1: ELIMINAR SOLO TABLAS DE ROLES (MANTENER DATOS MÉDICOS)
-- =====================================================
-- Usa esta opción si solo quieres eliminar el sistema de roles
-- pero mantener pacientes, doctores, citas y recetas

/*
-- Eliminar políticas RLS de roles
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
DROP POLICY IF EXISTS "Anyone can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Only admins can manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can remove roles" ON public.user_roles;

-- Eliminar funciones de roles
DROP FUNCTION IF EXISTS public.get_user_roles(UUID);
DROP FUNCTION IF EXISTS public.user_has_role(UUID, VARCHAR);
DROP FUNCTION IF EXISTS public.user_has_permission(UUID, VARCHAR);
DROP FUNCTION IF EXISTS public.assign_user_role(UUID, VARCHAR);
DROP FUNCTION IF EXISTS public.remove_user_role(UUID, VARCHAR);

-- Eliminar tablas de roles (en orden por dependencias)
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- Eliminar columna user_id de doctors
ALTER TABLE public.doctors DROP COLUMN IF EXISTS user_id;
*/

-- =====================================================
-- OPCIÓN 2: ELIMINAR TODO EL SISTEMA (RESET COMPLETO)
-- =====================================================
-- ⚠️ ESTO ELIMINARÁ TODOS LOS DATOS MÉDICOS TAMBIÉN
-- Descomenta las siguientes líneas solo si estás seguro

/*
-- 1. Eliminar trigger de creación automática de usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Eliminar funciones
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_roles(UUID);
DROP FUNCTION IF EXISTS public.user_has_role(UUID, VARCHAR);
DROP FUNCTION IF EXISTS public.user_has_permission(UUID, VARCHAR);
DROP FUNCTION IF EXISTS public.assign_user_role(UUID, VARCHAR);
DROP FUNCTION IF EXISTS public.remove_user_role(UUID, VARCHAR);

-- 3. Eliminar vistas
DROP VIEW IF EXISTS public.appointments_full CASCADE;

-- 4. Eliminar políticas RLS de todas las tablas
-- Appointments
DROP POLICY IF EXISTS "Role-based view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Role-based create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Role-based update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Role-based delete appointments" ON public.appointments;

-- Prescriptions
DROP POLICY IF EXISTS "Role-based view prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Role-based create prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Role-based update prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Role-based delete prescriptions" ON public.prescriptions;

-- Patients
DROP POLICY IF EXISTS "Role-based view patients" ON public.patients;
DROP POLICY IF EXISTS "Role-based update patients" ON public.patients;
DROP POLICY IF EXISTS "Users can insert own patient profile" ON public.patients;

-- Doctors
DROP POLICY IF EXISTS "Anyone can view active doctors" ON public.doctors;

-- Roles
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
DROP POLICY IF EXISTS "Anyone can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Only admins can manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can remove roles" ON public.user_roles;

-- 5. Eliminar tablas (en orden por dependencias)
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;

-- 6. Nota: Los usuarios de auth.users NO se eliminan automáticamente
-- Si quieres eliminar usuarios también, debes hacerlo manualmente desde
-- el panel de Supabase en Authentication > Users
*/

-- =====================================================
-- OPCIÓN 3: RESETEAR SOLO POLÍTICAS RLS
-- =====================================================
-- Usa esta opción si las políticas RLS están causando problemas
-- y quieres reconfigurarlas sin perder datos

/*
-- Deshabilitar RLS temporalmente (para desarrollo/testing)
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Para volver a habilitar RLS, ejecuta roles_migration.sql
-- o manualmente:
-- ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
-- etc...
*/

-- =====================================================
-- VERIFICACIÓN DESPUÉS DE LIMPIEZA
-- =====================================================
-- Ejecuta estas consultas para verificar qué tablas quedan:

-- Ver todas las tablas en el esquema public
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- Ver todas las funciones
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- ORDER BY routine_name;

-- Ver todas las políticas RLS
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
