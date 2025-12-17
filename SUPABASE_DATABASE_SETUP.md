# 🗄️ Guía de Configuración de Base de Datos - MediCare

Esta guía te ayudará a configurar la base de datos completa de MediCare en Supabase.

---

## 📋 Contenido del Esquema

El archivo `supabase_schema.sql` incluye:

### **12 Tablas Principales:**

1. **`patients`** - Perfiles de pacientes
2. **`specialties`** - Especialidades médicas
3. **`doctors`** - Información de doctores
4. **`doctor_schedules`** - Horarios de disponibilidad
5. **`appointments`** - Citas médicas
6. **`medical_records`** - Historial médico
7. **`prescriptions`** - Recetas médicas
8. **`lab_tests`** - Análisis y estudios
9. **`payments`** - Pagos y facturación
10. **`notifications`** - Notificaciones del sistema
11. **`reviews`** - Reseñas y calificaciones
12. **`medical_documents`** - Documentos médicos

### **Características Adicionales:**

- ✅ **Índices** para optimizar consultas
- ✅ **Triggers** para actualizar `updated_at` automáticamente
- ✅ **Row Level Security (RLS)** para proteger datos
- ✅ **Vistas** para consultas complejas
- ✅ **Datos iniciales** (especialidades y doctores de ejemplo)

---

## 🚀 Cómo Aplicar el Esquema

### **Opción 1: SQL Editor de Supabase (Recomendado)**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **"New Query"**
4. Copia todo el contenido de `supabase_schema.sql`
5. Pégalo en el editor
6. Haz clic en **"Run"** o presiona `Ctrl + Enter`
7. Espera a que se ejecute (puede tardar 10-20 segundos)

### **Opción 2: Supabase CLI**

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Iniciar sesión
supabase login

# Aplicar el esquema
supabase db push --db-url "tu-connection-string"
```

### **Opción 3: Ejecutar por Partes**

Si tienes problemas ejecutando todo junto, ejecuta en este orden:

1. **Primero**: Tablas base (patients, specialties, doctors)
2. **Segundo**: Tablas relacionadas (appointments, medical_records, etc.)
3. **Tercero**: Índices y triggers
4. **Cuarto**: Políticas RLS
5. **Quinto**: Datos iniciales

---

## 🔐 Row Level Security (RLS)

El esquema incluye políticas de seguridad para proteger los datos:

### **Pacientes:**
- ✅ Solo pueden ver y editar su propia información
- ✅ Solo pueden ver sus propias citas, recetas, y resultados

### **Doctores:**
- ✅ Todos pueden ver doctores activos
- ✅ Los doctores pueden ver sus citas asignadas

### **Público:**
- ✅ Cualquiera puede ver especialidades
- ✅ Cualquiera puede ver horarios de doctores
- ✅ Cualquiera puede ver reseñas

---

## 📊 Relaciones entre Tablas

```
auth.users (Supabase)
    ↓
patients (1:1)
    ↓
    ├── appointments (1:N)
    │       ↓
    │       └── payments (1:1)
    │
    ├── medical_records (1:N)
    │       ↓
    │       ├── prescriptions (1:N)
    │       └── lab_tests (1:N)
    │
    ├── notifications (1:N)
    ├── reviews (1:N)
    └── medical_documents (1:N)

doctors (N:1) ← specialties
    ↓
    ├── doctor_schedules (1:N)
    ├── appointments (1:N)
    ├── medical_records (1:N)
    └── reviews (1:N)
```

---

## 🔧 Configuración Post-Instalación

### **1. Crear un Perfil de Paciente al Registrarse**

Agrega esta función en Supabase para crear automáticamente un perfil de paciente cuando un usuario se registra:

```sql
-- Función para crear perfil de paciente automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.patients (id, full_name, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### **2. Habilitar Storage para Documentos**

Para subir documentos médicos (PDFs, imágenes):

1. Ve a **Storage** en Supabase Dashboard
2. Crea un bucket llamado `medical-documents`
3. Configura las políticas:

```sql
-- Permitir a pacientes subir sus documentos
CREATE POLICY "Patients can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'medical-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir a pacientes ver sus documentos
CREATE POLICY "Patients can view own documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'medical-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

### **3. Configurar Email Templates**

Para notificaciones de citas:

1. Ve a **Authentication** → **Email Templates**
2. Personaliza los templates para:
   - Confirmación de cita
   - Recordatorio de cita (24h antes)
   - Resultados disponibles

---

## 📝 Ejemplos de Uso

### **Crear una Cita**

```typescript
const { data, error } = await supabase
  .from('appointments')
  .insert({
    patient_id: user.id,
    doctor_id: 'uuid-del-doctor',
    appointment_date: '2024-12-15',
    appointment_time: '10:00:00',
    reason: 'Consulta general',
    appointment_type: 'Consulta General'
  });
```

### **Obtener Citas del Paciente**

```typescript
const { data, error } = await supabase
  .from('appointments_full') // Vista con información completa
  .select('*')
  .eq('patient_id', user.id)
  .order('appointment_date', { ascending: true });
```

### **Obtener Doctores por Especialidad**

```typescript
const { data, error } = await supabase
  .from('doctors')
  .select(`
    *,
    specialties (
      name,
      icon
    )
  `)
  .eq('specialties.name', 'Cardiología')
  .eq('is_active', true);
```

### **Crear Historial Médico**

```typescript
const { data, error } = await supabase
  .from('medical_records')
  .insert({
    patient_id: user.id,
    doctor_id: 'uuid-del-doctor',
    appointment_id: 'uuid-de-la-cita',
    visit_date: '2024-12-12',
    diagnosis: 'Hipertensión arterial',
    symptoms: 'Dolor de cabeza, mareos',
    treatment: 'Medicación antihipertensiva',
    vital_signs: {
      temperature: 36.5,
      blood_pressure: '140/90',
      heart_rate: 75,
      weight: 70,
      height: 170
    }
  });
```

---

## 🔍 Consultas Útiles

### **Ver todas las citas de hoy**

```sql
SELECT * FROM appointments_full
WHERE appointment_date = CURRENT_DATE
ORDER BY appointment_time;
```

### **Doctores con mejor calificación**

```sql
SELECT 
    d.full_name,
    s.name AS specialty,
    AVG(r.rating) AS avg_rating,
    COUNT(r.id) AS total_reviews
FROM doctors d
LEFT JOIN specialties s ON d.specialty_id = s.id
LEFT JOIN reviews r ON d.id = r.doctor_id
WHERE d.is_active = true
GROUP BY d.id, d.full_name, s.name
HAVING COUNT(r.id) > 0
ORDER BY avg_rating DESC;
```

### **Pacientes con citas pendientes**

```sql
SELECT 
    p.full_name,
    p.phone,
    a.appointment_date,
    a.appointment_time,
    d.full_name AS doctor_name
FROM patients p
JOIN appointments a ON p.id = a.patient_id
JOIN doctors d ON a.doctor_id = d.id
WHERE a.status IN ('Programada', 'Confirmada')
AND a.appointment_date >= CURRENT_DATE
ORDER BY a.appointment_date, a.appointment_time;
```

---

## 🛠️ Mantenimiento

### **Backup Regular**

```bash
# Exportar toda la base de datos
supabase db dump -f backup.sql

# Restaurar desde backup
supabase db reset --db-url "connection-string" < backup.sql
```

### **Limpiar Citas Antiguas**

```sql
-- Archivar citas completadas de hace más de 1 año
UPDATE appointments
SET status = 'Archivada'
WHERE status = 'Completada'
AND appointment_date < CURRENT_DATE - INTERVAL '1 year';
```

---

## ⚠️ Notas Importantes

1. **Backup antes de aplicar**: Siempre haz backup antes de ejecutar el esquema
2. **Entorno de prueba**: Prueba primero en un proyecto de desarrollo
3. **Datos sensibles**: Los datos médicos son sensibles, asegúrate de cumplir con regulaciones
4. **RLS activo**: Verifica que RLS esté habilitado en producción
5. **Índices**: Los índices mejoran el rendimiento pero ocupan espacio

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en Supabase Dashboard → Logs
2. Verifica que las políticas RLS estén correctas
3. Asegúrate de que el usuario esté autenticado
4. Consulta la [documentación de Supabase](https://supabase.com/docs)

---

## 🎯 Próximos Pasos

Después de aplicar el esquema:

1. ✅ Actualiza `src/lib/supabase.ts` con funciones helper
2. ✅ Crea componentes para agendar citas
3. ✅ Implementa el dashboard de pacientes
4. ✅ Agrega funcionalidad de pagos
5. ✅ Configura notificaciones por email

---

**¡Tu base de datos MediCare está lista para usar! 🎉**
