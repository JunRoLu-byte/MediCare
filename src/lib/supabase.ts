import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const authHelpers = {
    // Sign up new user
    signUp: async (email: string, password: string, metadata?: { full_name?: string; phone?: string }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: undefined, // Disable email confirmation redirect
            },
        });
        return { data, error };
    },

    // Sign in existing user
    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Get current user
    getCurrentUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    },

    // Reset password
    resetPassword: async (email: string) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);
        return { data, error };
    },

    // Update user
    updateUser: async (updates: { email?: string; password?: string; data?: any }) => {
        const { data, error } = await supabase.auth.updateUser(updates);
        return { data, error };
    },

    // Sign in with Google OAuth
    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        return { data, error };
    },
};

// =====================================================
// DATABASE HELPER FUNCTIONS
// =====================================================

// Doctor helper functions
export const doctorHelpers = {
    // Get all active doctors
    getActiveDoctors: async () => {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('is_active', true)
            .order('full_name');
        return { data, error };
    },

    // Get doctor by ID
    getDoctorById: async (doctorId: string) => {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', doctorId)
            .single();
        return { data, error };
    },

    // Get doctors by specialty
    getDoctorsBySpecialty: async (specialty: string) => {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('specialty', specialty)
            .eq('is_active', true)
            .order('full_name');
        return { data, error };
    },
};

// Appointment helper functions
export const appointmentHelpers = {
    // Create new appointment
    createAppointment: async (appointmentData: {
        patient_id: string;
        doctor_id: string;
        appointment_date: string;
        appointment_time: string;
        reason?: string;
        notes?: string;
    }) => {
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                ...appointmentData,
                status: 'Programada'
            })
            .select()
            .single();
        return { data, error };
    },

    // Get patient appointments
    getPatientAppointments: async (patientId: string) => {
        const { data, error } = await supabase
            .from('appointments_full')
            .select('*')
            .eq('patient_id', patientId)
            .order('appointment_date', { ascending: true });
        return { data, error };
    },

    // Get upcoming appointments
    getUpcomingAppointments: async (patientId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('appointments_full')
            .select('*')
            .eq('patient_id', patientId)
            .gte('appointment_date', today)
            .in('status', ['Programada', 'Confirmada'])
            .order('appointment_date', { ascending: true });
        return { data, error };
    },

    // Update appointment status
    updateAppointmentStatus: async (appointmentId: string, status: string) => {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointmentId)
            .select()
            .single();
        return { data, error };
    },

    // Cancel appointment
    cancelAppointment: async (appointmentId: string, patientId: string) => {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'Cancelada' })
            .eq('id', appointmentId)
            .eq('patient_id', patientId)
            .select()
            .single();
        return { data, error };
    },

    // Delete appointment
    deleteAppointment: async (appointmentId: string, patientId: string) => {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', appointmentId)
            .eq('patient_id', patientId);
        return { error };
    },
};

// Payment helper functions
export const paymentHelpers = {
    // Create new payment (appointment_id can be null and linked later)
    createPayment: async (paymentData: {
        patient_id: string;
        appointment_id?: string | null;
        amount: number;
        currency?: string;
        payment_method: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin' | 'Culqi';
        payment_status?: 'Pendiente' | 'Completado' | 'Fallido' | 'Reembolsado';
        transaction_id?: string;
        notes?: string;
    }) => {
        const { data, error } = await supabase
            .from('payments')
            .insert({
                ...paymentData,
                appointment_id: paymentData.appointment_id ?? null,
                currency: paymentData.currency ?? 'PEN',
                payment_status: paymentData.payment_status ?? 'Completado'
            })
            .select()
            .single();
        return { data, error };
    },

    // Link an existing payment to an appointment
    attachPaymentToAppointment: async (paymentId: string, patientId: string, appointmentId: string) => {
        const { data, error } = await supabase
            .from('payments')
            .update({ appointment_id: appointmentId })
            .eq('id', paymentId)
            .eq('patient_id', patientId)
            .select()
            .single();
        return { data, error };
    },
};

export const adminHelpers = {
    getAllPagos: async () => {
        const { data, error } = await supabase
            .from('pagos')
            .select(`
                *,
                pacientes (
                    nombre_completo,
                    telefono
                ),
                citas (
                    fecha_cita,
                    hora_cita,
                    estado,
                    medicos (
                        nombre_completo
                    )
                )
            `)
            .order('fecha_pago', { ascending: false });
        return { data, error };
    },

    updatePagoEstado: async (pagoId: string, estado_pago: 'Pendiente' | 'Completado' | 'Fallido' | 'Reembolsado') => {
        const { data, error } = await supabase
            .from('pagos')
            .update({ estado_pago })
            .eq('id', pagoId)
            .select()
            .single();
        return { data, error };
    },

    updateCitaEstado: async (citaId: string, estado: string) => {
        const { data, error } = await supabase
            .from('citas')
            .update({ estado })
            .eq('id', citaId)
            .select()
            .single();
        return { data, error };
    },
};

// =====================================================
// HELPERS PARA ESQUEMA EN ESPAÑOL (BD NUEVA)
// =====================================================

export const medicoHelpers = {
    getMedicosActivos: async () => {
        const { data, error } = await supabase
            .from('medicos')
            .select('id, nombre_completo, tarifa_consulta, especialidad_id, especialidades(nombre)')
            .eq('activo', true)
            .order('nombre_completo');
        return { data, error };
    },

    getMedicoInfoById: async (medicoId: string) => {
        const { data, error } = await supabase
            .from('medicos')
            .select('id, tarifa_consulta')
            .eq('id', medicoId)
            .single();
        return { data, error };
    },

    getMedicoInfoByNombre: async (nombreCompleto: string) => {
        const { data, error } = await supabase
            .from('medicos')
            .select('id, tarifa_consulta')
            .eq('nombre_completo', nombreCompleto)
            .single();
        return { data, error };
    },
};

export const pacienteHelpers = {
    ensurePacienteExists: async (user: { id: string; email?: string | null; user_metadata?: any }) => {
        const fullNameFromMeta = user.user_metadata?.full_name ?? user.user_metadata?.nombre_completo;
        const emailPrefix = (user.email ?? '').split('@')[0];
        const nombre_completo = String(fullNameFromMeta ?? emailPrefix ?? 'Paciente').trim() || 'Paciente';
        const telefono = user.user_metadata?.phone ?? user.user_metadata?.telefono ?? null;

        const { data, error } = await supabase
            .from('pacientes')
            .upsert(
                {
                    id: user.id,
                    nombre_completo,
                    telefono,
                },
                { onConflict: 'id' }
            )
            .select()
            .single();

        return { data, error };
    },
};

export const citaHelpers = {
    createCita: async (citaData: {
        paciente_id: string;
        medico_id: string;
        fecha_cita: string;
        hora_cita: string;
        estado?: string;
        motivo?: string;
        notas?: string;
    }) => {
        const { data, error } = await supabase
            .from('citas')
            .insert({
                ...citaData,
                estado: citaData.estado ?? 'Programada',
            })
            .select()
            .single();
        return { data, error };
    },

    getCitasByPaciente: async (pacienteId: string, limit = 10) => {
        const { data, error } = await supabase
            .from('citas')
            .select(
                `
                id,
                fecha_cita,
                hora_cita,
                estado,
                motivo,
                notas,
                creado_en,
                medicos (
                    nombre_completo
                )
            `
            )
            .eq('paciente_id', pacienteId)
            .order('fecha_cita', { ascending: false })
            .order('hora_cita', { ascending: false })
            .limit(limit);
        return { data, error };
    },

    getCitasConfirmadasByPaciente: async (pacienteId: string, limit = 10) => {
        const { data, error } = await supabase
            .from('citas')
            .select(
                `
                id,
                fecha_cita,
                hora_cita,
                estado,
                motivo,
                notas,
                creado_en,
                medicos (
                    nombre_completo
                )
            `
            )
            .eq('paciente_id', pacienteId)
            .eq('estado', 'Confirmada')
            .order('fecha_cita', { ascending: false })
            .order('hora_cita', { ascending: false })
            .limit(limit);
        return { data, error };
    },

    countCitasByEstados: async (pacienteId: string, estados: string[]) => {
        const { count, error } = await supabase
            .from('citas')
            .select('id', { count: 'exact', head: true })
            .eq('paciente_id', pacienteId)
            .in('estado', estados);
        return { count: count ?? 0, error };
    },
};

export const pagoHelpers = {
    createPago: async (pagoData: {
        paciente_id: string;
        cita_id?: string | null;
        monto: number;
        moneda?: string;
        metodo_pago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin' | 'Culqi';
        estado_pago?: 'Pendiente' | 'Completado' | 'Fallido' | 'Reembolsado';
        transaccion_id?: string;
        notas?: string;
        voucher_data_url?: string;
    }) => {
        const { data, error } = await supabase
            .from('pagos')
            .insert({
                ...pagoData,
                cita_id: pagoData.cita_id ?? null,
                moneda: pagoData.moneda ?? 'PEN',
                estado_pago: pagoData.estado_pago ?? 'Pendiente',
            })
            .select()
            .single();
        return { data, error };
    },

    getPagosByPaciente: async (pacienteId: string, limit = 10) => {
        const { data, error } = await supabase
            .from('pagos')
            .select('id, cita_id, monto, moneda, metodo_pago, estado_pago, transaccion_id, fecha_pago, creado_en')
            .eq('paciente_id', pacienteId)
            .order('fecha_pago', { ascending: false })
            .limit(limit);
        return { data, error };
    },

    attachPagoToCita: async (pagoId: string, pacienteId: string, citaId: string) => {
        const { data, error } = await supabase
            .from('pagos')
            .update({ cita_id: citaId })
            .eq('id', pagoId)
            .eq('paciente_id', pacienteId)
            .select()
            .single();
        return { data, error };
    },
};

export const recetaHelpers = {
    countRecetasActivasByPaciente: async (pacienteId: string) => {
        const { count, error } = await supabase
            .from('recetas')
            .select('id', { count: 'exact', head: true })
            .eq('paciente_id', pacienteId)
            .eq('activa', true);
        return { count: count ?? 0, error };
    },
};

export const examenHelpers = {
    countExamenesPendientesByPaciente: async (pacienteId: string) => {
        const { count, error } = await supabase
            .from('examenes')
            .select('id', { count: 'exact', head: true })
            .eq('paciente_id', pacienteId)
            .in('estado', ['Pendiente', 'En Proceso']);
        return { count: count ?? 0, error };
    },
};

// Prescription helper functions
export const prescriptionHelpers = {
    // Create new prescription
    createPrescription: async (prescriptionData: {
        patient_id: string;
        doctor_id: string;
        appointment_id?: string;
        medication_name: string;
        dosage: string;
        frequency: string;
        duration?: string;
        instructions?: string;
    }) => {
        const { data, error } = await supabase
            .from('prescriptions')
            .insert(prescriptionData)
            .select()
            .single();
        return { data, error };
    },

    // Get patient prescriptions
    getPatientPrescriptions: async (patientId: string) => {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                doctors (
                    full_name,
                    specialty
                )
            `)
            .eq('patient_id', patientId)
            .order('prescription_date', { ascending: false });
        return { data, error };
    },

    // Get prescriptions by appointment
    getPrescriptionsByAppointment: async (appointmentId: string) => {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                doctors (
                    full_name,
                    specialty
                )
            `)
            .eq('appointment_id', appointmentId)
            .order('prescription_date', { ascending: false });
        return { data, error };
    },
};

// Patient helper functions
export const patientHelpers = {
    // Get patient profile
    getPatientProfile: async (patientId: string) => {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();
        return { data, error };
    },

    // Update patient profile
    updatePatientProfile: async (patientId: string, updates: {
        full_name?: string;
        phone?: string;
        date_of_birth?: string;
        gender?: string;
        address?: string;
    }) => {
        const { data, error } = await supabase
            .from('patients')
            .update(updates)
            .eq('id', patientId)
            .select()
            .single();
        return { data, error };
    },
};

// =====================================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// =====================================================

// TypeScript types for roles and permissions
export type UserRole = 'paciente' | 'doctor' | 'recepcionista' | 'administrador';

export type Permission =
    // Appointments
    | 'view_own_appointments' | 'view_all_appointments'
    | 'create_own_appointment' | 'create_any_appointment'
    | 'edit_own_appointment' | 'edit_any_appointment'
    | 'delete_own_appointment' | 'delete_any_appointment'
    // Prescriptions
    | 'view_own_prescriptions' | 'view_all_prescriptions'
    | 'create_prescription' | 'edit_prescription' | 'delete_prescription'
    // Patients
    | 'view_own_profile' | 'view_all_patients'
    | 'edit_own_profile' | 'edit_any_patient'
    // Doctors
    | 'view_doctors' | 'manage_doctors'
    // Users
    | 'manage_users' | 'assign_roles';

export interface Role {
    id: string;
    name: UserRole;
    display_name: string;
    description: string | null;
    created_at: string;
}

export interface UserRoleAssignment {
    user_id: string;
    role_id: string;
    assigned_at: string;
    assigned_by: string | null;
}

// Role helper functions
export const roleHelpers = {
    // Get all roles of a user
    getUserRoles: async (userId: string) => {
        const { data, error } = await supabase.rpc('get_user_roles', {
            p_user_id: userId
        });
        return { data, error };
    },

    // Check if user has a specific role
    hasRole: async (userId: string, roleName: UserRole) => {
        const { data, error } = await supabase.rpc('user_has_role', {
            p_user_id: userId,
            p_role_name: roleName
        });
        return { data, error };
    },

    // Check if user has a specific permission
    hasPermission: async (userId: string, permissionName: Permission) => {
        const { data, error } = await supabase.rpc('user_has_permission', {
            p_user_id: userId,
            p_permission_name: permissionName
        });
        return { data, error };
    },

    // Assign role to user (admin only)
    assignRole: async (userId: string, roleName: UserRole) => {
        const { data, error } = await supabase.rpc('assign_user_role', {
            p_user_id: userId,
            p_role_name: roleName
        });
        return { data, error };
    },

    // Remove role from user (admin only)
    removeRole: async (userId: string, roleName: UserRole) => {
        const { data, error } = await supabase.rpc('remove_user_role', {
            p_user_id: userId,
            p_role_name: roleName
        });
        return { data, error };
    },

    // Get all available roles
    getAllRoles: async () => {
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .order('name');
        return { data, error };
    },

    // Get all permissions for a specific role
    getRolePermissions: async (roleId: string) => {
        const { data, error } = await supabase
            .from('role_permissions')
            .select(`
                permission_id,
                permissions (
                    name,
                    resource,
                    action,
                    description
                )
            `)
            .eq('role_id', roleId);
        return { data, error };
    },

    // Get current user with their roles
    getCurrentUserWithRoles: async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return { user: null, roles: null, error: userError };
        }

        const { data: roles, error: rolesError } = await supabase.rpc('get_user_roles', {
            p_user_id: user.id
        });

        return { user, roles, error: rolesError };
    },

    // Check if current user is admin
    isAdmin: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: false, error: null };

        if ((user.email ?? '').toLowerCase() === '2411080183@undc.edu.pe') {
            return { data: true, error: null };
        }

        try {
            const { data, error } = await supabase.rpc('user_has_role', {
                p_user_id: user.id,
                p_role_name: 'administrador'
            });
            return { data, error };
        } catch (error: any) {
            return { data: false, error };
        }
    },

    // Check if current user is doctor
    isDoctor: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: false, error: null };

        const { data, error } = await supabase.rpc('user_has_role', {
            p_user_id: user.id,
            p_role_name: 'doctor'
        });
        return { data, error };
    },

    // Get doctor info if user is a doctor
    getDoctorProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('user_id', userId)
            .single();
        return { data, error };
    },

    // Link doctor account with user account
    linkDoctorToUser: async (doctorId: string, userId: string) => {
        const { data, error } = await supabase
            .from('doctors')
            .update({ user_id: userId })
            .eq('id', doctorId)
            .select()
            .single();
        return { data, error };
    },
};
