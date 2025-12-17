# 🏥 Guía Rápida - Base de Datos Simplificada MediCare

## 📋 Tablas Incluidas

### ✅ **4 Tablas Esenciales:**

1. **`patients`** - Perfiles de pacientes
2. **`doctors`** - Información de doctores  
3. **`appointments`** - Citas médicas
4. **`prescriptions`** - Recetas médicas

---

## 🚀 Instalación Rápida

### **Paso 1: Aplicar el Esquema**

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Abre **SQL Editor**
3. Copia todo el contenido de `supabase_schema_simple.sql`
4. Pégalo y haz clic en **Run**

### **Paso 2: Verificar**

Ejecuta esta query para verificar que todo se creó correctamente:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'doctors', 'appointments', 'prescriptions');
```

Deberías ver las 4 tablas.

---

## 📊 Estructura de Datos

### **Tabla: patients**
```typescript
{
  id: UUID,                    // Referencia a auth.users
  full_name: string,
  email: string,
  phone: string,
  date_of_birth: Date,
  gender: 'Masculino' | 'Femenino' | 'Otro',
  address: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

### **Tabla: doctors**
```typescript
{
  id: UUID,
  full_name: string,
  specialty: string,           // Ej: "Cardiología", "Pediatría"
  license_number: string,      // Número de colegiatura
  phone: string,
  email: string,
  consultation_fee: number,    // Precio de consulta
  is_active: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

### **Tabla: appointments**
```typescript
{
  id: UUID,
  patient_id: UUID,            // Referencia a patients
  doctor_id: UUID,             // Referencia a doctors
  appointment_date: Date,
  appointment_time: Time,
  status: 'Programada' | 'Confirmada' | 'Completada' | 'Cancelada',
  reason: string,              // Motivo de la cita
  notes: string,               // Notas adicionales
  created_at: timestamp,
  updated_at: timestamp
}
```

### **Tabla: prescriptions**
```typescript
{
  id: UUID,
  patient_id: UUID,
  doctor_id: UUID,
  appointment_id: UUID,
  prescription_date: Date,
  medication_name: string,     // Nombre del medicamento
  dosage: string,              // Ej: "500mg"
  frequency: string,           // Ej: "Cada 8 horas"
  duration: string,            // Ej: "7 días"
  instructions: string,        // Instrucciones adicionales
  created_at: timestamp
}
```

---

## 💻 Ejemplos de Uso en TypeScript

### **1. Obtener todos los doctores activos**

```typescript
const { data: doctors, error } = await supabase
  .from('doctors')
  .select('*')
  .eq('is_active', true)
  .order('full_name');
```

### **2. Crear una cita médica**

```typescript
const { data, error } = await supabase
  .from('appointments')
  .insert({
    patient_id: user.id,
    doctor_id: 'uuid-del-doctor',
    appointment_date: '2024-12-20',
    appointment_time: '10:00:00',
    status: 'Programada',
    reason: 'Consulta general por dolor de cabeza'
  })
  .select()
  .single();
```

### **3. Obtener citas del paciente**

```typescript
const { data: appointments, error } = await supabase
  .from('appointments_full') // Vista con info completa
  .select('*')
  .eq('patient_id', user.id)
  .order('appointment_date', { ascending: true });
```

### **4. Crear una receta médica**

```typescript
const { data, error } = await supabase
  .from('prescriptions')
  .insert({
    patient_id: user.id,
    doctor_id: 'uuid-del-doctor',
    appointment_id: 'uuid-de-la-cita',
    medication_name: 'Ibuprofeno',
    dosage: '400mg',
    frequency: 'Cada 8 horas',
    duration: '5 días',
    instructions: 'Tomar después de las comidas'
  })
  .select()
  .single();
```

### **5. Obtener recetas del paciente**

```typescript
const { data: prescriptions, error } = await supabase
  .from('prescriptions')
  .select(`
    *,
    doctors (
      full_name,
      specialty
    )
  `)
  .eq('patient_id', user.id)
  .order('prescription_date', { ascending: false });
```

### **6. Actualizar estado de cita**

```typescript
const { data, error } = await supabase
  .from('appointments')
  .update({ status: 'Confirmada' })
  .eq('id', appointmentId)
  .select()
  .single();
```

### **7. Cancelar una cita**

```typescript
const { data, error } = await supabase
  .from('appointments')
  .update({ status: 'Cancelada' })
  .eq('id', appointmentId)
  .eq('patient_id', user.id) // Seguridad: solo el paciente puede cancelar
  .select()
  .single();
```

---

## 🔐 Seguridad (RLS)

El esquema incluye políticas de seguridad automáticas:

- ✅ Los pacientes solo ven sus propios datos
- ✅ Los pacientes solo pueden crear/editar sus propias citas
- ✅ Todos pueden ver la lista de doctores activos
- ✅ Los pacientes solo ven sus propias recetas

---

## ⚡ Características Automáticas

### **Auto-creación de Perfil**
Cuando un usuario se registra, automáticamente se crea su perfil en la tabla `patients` con:
- Nombre completo (del registro)
- Email
- Teléfono (si se proporcionó)

### **Actualización Automática de Timestamps**
Los campos `updated_at` se actualizan automáticamente cuando modificas un registro.

---

## 🎯 Próximos Pasos

1. ✅ Aplicar el esquema en Supabase
2. ✅ Actualizar `src/lib/supabase.ts` con funciones helper
3. ✅ Crear página de agendar citas (`/agendar-consulta`)
4. ✅ Crear página de mis citas
5. ✅ Crear página de recetas médicas

---

## 📝 Datos de Ejemplo

El esquema incluye **5 doctores** de ejemplo:

- Dr. Carlos Mendoza Ríos - **Cardiología** (S/ 200)
- Dra. María González Torres - **Pediatría** (S/ 120)
- Dr. Roberto Silva Paredes - **Traumatología** (S/ 160)
- Dra. Ana Torres Vega - **Neurología** (S/ 230)
- Dr. Luis Ramírez Castro - **Medicina General** (S/ 100)

---

**¡Tu base de datos simplificada está lista! 🎉**
