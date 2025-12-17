-- =====================================================
-- SISTEMA MÉDICO - ESQUEMA COMPLETO EN ESPAÑOL (SUPABASE)
-- =====================================================
-- NOTA: auth.users ya existe en Supabase (no se crea aquí)
-- =====================================================

-- Recomendado (normalmente ya está habilitado en Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TABLA: pacientes
-- =====================================================
CREATE TABLE public.pacientes (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    genero VARCHAR(20) CHECK (genero IN ('Masculino', 'Femenino', 'Otro', 'Prefiero no decir')),
    tipo_sangre VARCHAR(5) CHECK (tipo_sangre IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    direccion TEXT,
    contacto_emergencia_nombre VARCHAR(255),
    contacto_emergencia_telefono VARCHAR(20),
    seguro_proveedor VARCHAR(255),
    seguro_numero VARCHAR(100),
    alergias TEXT,
    condiciones_cronicas TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABLA: especialidades
-- =====================================================
CREATE TABLE public.especialidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(10),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLA: medicos
-- =====================================================
CREATE TABLE public.medicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    especialidad_id UUID REFERENCES public.especialidades(id) ON DELETE SET NULL,
    numero_colegiatura VARCHAR(50) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    biografia TEXT,
    educacion TEXT,
    certificaciones TEXT,
    anios_experiencia INTEGER DEFAULT 0,
    tarifa_consulta DECIMAL(10, 2) DEFAULT 0,
    foto_url TEXT,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABLA: horarios_medicos
-- =====================================================
CREATE TABLE public.horarios_medicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    disponible BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(medico_id, dia_semana, hora_inicio)
);

-- =====================================================
-- 5. TABLA: citas
-- =====================================================
CREATE TABLE public.citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'Programada'
        CHECK (estado IN ('Programada', 'Pendiente Pago', 'Confirmada', 'En Curso', 'Completada', 'Cancelada', 'No Asistio')),
    tipo_cita VARCHAR(50) DEFAULT 'Consulta General'
        CHECK (tipo_cita IN ('Consulta General', 'Seguimiento', 'Emergencia', 'Telemedicina')),
    motivo TEXT,
    notas TEXT,
    recordatorio_enviado BOOLEAN DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABLA: historias_medicas
-- =====================================================
CREATE TABLE public.historias_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES public.medicos(id) ON DELETE SET NULL,
    cita_id UUID REFERENCES public.citas(id) ON DELETE SET NULL,
    fecha_visita DATE NOT NULL,
    diagnostico TEXT,
    sintomas TEXT,
    tratamiento TEXT,
    notas TEXT,
    signos_vitales JSONB, -- {temperatura, presion_arterial, frecuencia_cardiaca, peso, talla}
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABLA: recetas
-- =====================================================
CREATE TABLE public.recetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES public.medicos(id) ON DELETE SET NULL,
    historia_medica_id UUID REFERENCES public.historias_medicas(id) ON DELETE SET NULL,
    fecha_receta DATE NOT NULL DEFAULT CURRENT_DATE,
    medicamento_nombre VARCHAR(255) NOT NULL,
    dosis VARCHAR(100) NOT NULL,
    frecuencia VARCHAR(100) NOT NULL,
    duracion VARCHAR(100),
    instrucciones TEXT,
    activa BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABLA: examenes
-- =====================================================
CREATE TABLE public.examenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES public.medicos(id) ON DELETE SET NULL,
    historia_medica_id UUID REFERENCES public.historias_medicas(id) ON DELETE SET NULL,
    examen_nombre VARCHAR(255) NOT NULL,
    examen_tipo VARCHAR(100),
    fecha_examen DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente'
        CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado', 'Cancelado')),
    resultados TEXT,
    archivo_url TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. TABLA: pagos
-- =====================================================
CREATE TABLE public.pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    cita_id UUID REFERENCES public.citas(id) ON DELETE SET NULL,
    monto DECIMAL(10, 2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN',
    metodo_pago VARCHAR(50)
        CHECK (metodo_pago IN ('Efectivo', 'Tarjeta', 'Transferencia', 'Yape', 'Plin', 'Culqi')),
    estado_pago VARCHAR(20) DEFAULT 'Pendiente'
        CHECK (estado_pago IN ('Pendiente', 'Completado', 'Fallido', 'Reembolsado')),
    transaccion_id VARCHAR(255),
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notas TEXT,
    voucher_data_url TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. TABLA: notificaciones
-- =====================================================
CREATE TABLE public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('Cita', 'Resultado', 'Recordatorio', 'Mensaje', 'Sistema')),
    leido BOOLEAN DEFAULT false,
    relacionado_id UUID,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. TABLA: resenas
-- =====================================================
CREATE TABLE public.resenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE,
    cita_id UUID REFERENCES public.citas(id) ON DELETE SET NULL,
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    verificada BOOLEAN DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(paciente_id, cita_id)
);

-- =====================================================
-- 12. TABLA: documentos_medicos
-- =====================================================
CREATE TABLE public.documentos_medicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    subido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    documento_nombre VARCHAR(255) NOT NULL,
    documento_tipo VARCHAR(100),
    archivo_url TEXT NOT NULL,
    tamano_archivo INTEGER,
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notas TEXT
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_citas_paciente ON public.citas(paciente_id);
CREATE INDEX idx_citas_medico ON public.citas(medico_id);
CREATE INDEX idx_citas_fecha ON public.citas(fecha_cita);
CREATE INDEX idx_citas_estado ON public.citas(estado);

CREATE INDEX idx_historias_paciente ON public.historias_medicas(paciente_id);
CREATE INDEX idx_historias_medico ON public.historias_medicas(medico_id);

CREATE INDEX idx_recetas_paciente ON public.recetas(paciente_id);
CREATE INDEX idx_recetas_activa ON public.recetas(activa);

CREATE INDEX idx_examenes_paciente ON public.examenes(paciente_id);
CREATE INDEX idx_examenes_estado ON public.examenes(estado);

CREATE INDEX idx_pagos_paciente ON public.pagos(paciente_id);
CREATE INDEX idx_pagos_estado ON public.pagos(estado_pago);

CREATE INDEX idx_notificaciones_usuario ON public.notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leido ON public.notificaciones(leido);

CREATE INDEX idx_resenas_medico ON public.resenas(medico_id);

-- =====================================================
-- FUNCIÓN/TRIGGERS para actualizado_en
-- =====================================================
CREATE OR REPLACE FUNCTION public.actualizar_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pacientes_actualizado_en
BEFORE UPDATE ON public.pacientes
FOR EACH ROW EXECUTE FUNCTION public.actualizar_actualizado_en();

CREATE TRIGGER trg_medicos_actualizado_en
BEFORE UPDATE ON public.medicos
FOR EACH ROW EXECUTE FUNCTION public.actualizar_actualizado_en();

CREATE TRIGGER trg_citas_actualizado_en
BEFORE UPDATE ON public.citas
FOR EACH ROW EXECUTE FUNCTION public.actualizar_actualizado_en();

CREATE TRIGGER trg_historias_actualizado_en
BEFORE UPDATE ON public.historias_medicas
FOR EACH ROW EXECUTE FUNCTION public.actualizar_actualizado_en();

CREATE TRIGGER trg_examenes_actualizado_en
BEFORE UPDATE ON public.examenes
FOR EACH ROW EXECUTE FUNCTION public.actualizar_actualizado_en();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historias_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_medicos ENABLE ROW LEVEL SECURITY;

-- Políticas para PACIENTES
CREATE POLICY "Pacientes pueden ver su perfil" ON public.pacientes
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Pacientes pueden actualizar su perfil" ON public.pacientes
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden insertar su perfil de paciente" ON public.pacientes
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para CITAS
CREATE POLICY "Pacientes pueden ver sus citas" ON public.citas
    FOR SELECT USING (auth.uid() = paciente_id);

CREATE POLICY "Pacientes pueden crear citas" ON public.citas
    FOR INSERT WITH CHECK (auth.uid() = paciente_id);

CREATE POLICY "Pacientes pueden actualizar sus citas" ON public.citas
    FOR UPDATE USING (auth.uid() = paciente_id);

-- Políticas para HISTORIAS MÉDICAS
CREATE POLICY "Pacientes pueden ver sus historias medicas" ON public.historias_medicas
    FOR SELECT USING (auth.uid() = paciente_id);

-- Políticas para RECETAS
CREATE POLICY "Pacientes pueden ver sus recetas" ON public.recetas
    FOR SELECT USING (auth.uid() = paciente_id);

-- Políticas para EXÁMENES
CREATE POLICY "Pacientes pueden ver sus examenes" ON public.examenes
    FOR SELECT USING (auth.uid() = paciente_id);

-- Políticas para PAGOS
CREATE POLICY "Pacientes pueden ver sus pagos" ON public.pagos
    FOR SELECT USING (auth.uid() = paciente_id);

CREATE POLICY "Pacientes pueden crear sus pagos" ON public.pagos
    FOR INSERT WITH CHECK (auth.uid() = paciente_id);

CREATE POLICY "Pacientes pueden actualizar sus pagos" ON public.pagos
    FOR UPDATE USING (auth.uid() = paciente_id);

-- Políticas para NOTIFICACIONES
CREATE POLICY "Usuarios pueden ver sus notificaciones" ON public.notificaciones
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus notificaciones" ON public.notificaciones
    FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas para RESEÑAS
CREATE POLICY "Pacientes pueden crear resenas" ON public.resenas
    FOR INSERT WITH CHECK (auth.uid() = paciente_id);

CREATE POLICY "Cualquiera puede ver resenas" ON public.resenas
    FOR SELECT USING (true);

-- Políticas para DOCUMENTOS MÉDICOS
CREATE POLICY "Pacientes pueden ver sus documentos" ON public.documentos_medicos
    FOR SELECT USING (auth.uid() = paciente_id);

-- Políticas para MÉDICOS / ESPECIALIDADES / HORARIOS (públicas de lectura)
CREATE POLICY "Cualquiera puede ver especialidades" ON public.especialidades
    FOR SELECT USING (true);

CREATE POLICY "Cualquiera puede ver medicos activos" ON public.medicos
    FOR SELECT USING (activo = true);

CREATE POLICY "Cualquiera puede ver horarios medicos" ON public.horarios_medicos
    FOR SELECT USING (true);

-- =====================================================
-- PATCH ADMIN (RLS) - ESQUEMA EN ESPAÑOL
-- Permite que SOLO el correo admin pueda ver/actualizar todos los pagos
-- Correo admin: 2411080183@undc.edu.pe
-- =====================================================

-- Función helper: valida admin por email dentro del JWT
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(auth.jwt() ->> 'email', '') = '2411080183@undc.edu.pe';
END;
$$ LANGUAGE plpgsql STABLE;

-- Asegurar RLS habilitado (por si acaso)
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;

-- Policies para el admin
CREATE POLICY "Admin puede ver todos los pagos" ON public.pagos
FOR SELECT USING (public.es_admin());

CREATE POLICY "Admin puede actualizar todos los pagos" ON public.pagos
FOR UPDATE USING (public.es_admin());

-- Para que los JOINs del dashboard funcionen
CREATE POLICY "Admin puede ver pacientes" ON public.pacientes
FOR SELECT USING (public.es_admin());

CREATE POLICY "Admin puede ver citas" ON public.citas
FOR SELECT USING (public.es_admin());

CREATE POLICY "Admin puede actualizar citas" ON public.citas
FOR UPDATE USING (public.es_admin());

CREATE POLICY "Admin puede ver medicos" ON public.medicos
FOR SELECT USING (public.es_admin());

-- =====================================================
-- FIN PATCH ADMIN
-- =====================================================

-- =====================================================
-- DATOS INICIALES
-- =====================================================
INSERT INTO public.especialidades (nombre, descripcion, icono) VALUES
    ('Cardiologia', 'Especialistas en salud cardiovascular', '❤️'),
    ('Pediatria', 'Cuidado especializado para niños', '👶'),
    ('Traumatologia', 'Tratamiento de lesiones y problemas oseos', '🦴'),
    ('Neurologia', 'Diagnostico y tratamiento del sistema nervioso', '🧠'),
    ('Medicina General', 'Atencion medica integral', '🩺'),
    ('Dermatologia', 'Cuidado de la piel', '🧴'),
    ('Oftalmologia', 'Salud visual y ocular', '👁️'),
    ('Ginecologia', 'Salud de la mujer', '🌸'),
    ('Psiquiatria', 'Salud mental', '🧠'),
    ('Odontologia', 'Salud dental', '🦷');

INSERT INTO public.medicos (nombre_completo, especialidad_id, numero_colegiatura, telefono, email, biografia, educacion, certificaciones, anios_experiencia, tarifa_consulta, activo) VALUES
    (
        'Dr. Carlos Mendoza Rios',
        (SELECT id FROM public.especialidades WHERE nombre = 'Cardiologia'),
        'CMP-12345',
        '+51 987 654 321',
        'carlos.mendoza@medicare.pe',
        'Especialista en cardiologia intervencionista.',
        'Universidad Peruana Cayetano Heredia',
        'Colegio Medico del Peru',
        15,
        200.00,
        true
    ),
    (
        'Dra. Maria Gonzalez Torres',
        (SELECT id FROM public.especialidades WHERE nombre = 'Pediatria'),
        'CMP-23456',
        '+51 987 654 322',
        'maria.gonzalez@medicare.pe',
        'Dedicada al cuidado integral de niños y adolescentes.',
        'Universidad Nacional Mayor de San Marcos',
        'Especialista en Neonatologia',
        12,
        120.00,
        true
    ),
    (
        'Dr. Roberto Silva Paredes',
        (SELECT id FROM public.especialidades WHERE nombre = 'Traumatologia'),
        'CMP-34567',
        '+51 987 654 323',
        'roberto.silva@medicare.pe',
        'Cirujano ortopedico especializado en columna.',
        'Universidad Nacional de Trujillo',
        'Cirujano Ortopedico Certificado',
        18,
        160.00,
        true
    ),
    (
        'Dra. Ana Torres Vega',
        (SELECT id FROM public.especialidades WHERE nombre = 'Neurologia'),
        'CMP-45678',
        '+51 987 654 324',
        'ana.torres@medicare.pe',
        'Neurologa clinica con experiencia en trastornos del movimiento.',
        'Universidad Peruana de Ciencias Aplicadas',
        'Especialista en Neurologia Clinica',
        10,
        230.00,
        true
    );

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================
CREATE VIEW public.citas_completas AS
SELECT
    c.id,
    c.fecha_cita,
    c.hora_cita,
    c.estado,
    c.tipo_cita,
    c.motivo,
    c.notas,
    p.nombre_completo AS paciente_nombre,
    p.telefono AS paciente_telefono,
    m.nombre_completo AS medico_nombre,
    e.nombre AS especialidad_nombre,
    m.tarifa_consulta,
    c.creado_en
FROM public.citas c
JOIN public.pacientes p ON c.paciente_id = p.id
JOIN public.medicos m ON c.medico_id = m.id
LEFT JOIN public.especialidades e ON m.especialidad_id = e.id;

CREATE VIEW public.historial_medico_completo AS
SELECT
    hm.id,
    hm.fecha_visita,
    hm.diagnostico,
    hm.sintomas,
    hm.tratamiento,
    p.nombre_completo AS paciente_nombre,
    m.nombre_completo AS medico_nombre,
    e.nombre AS especialidad_nombre
FROM public.historias_medicas hm
JOIN public.pacientes p ON hm.paciente_id = p.id
LEFT JOIN public.medicos m ON hm.medico_id = m.id
LEFT JOIN public.especialidades e ON m.especialidad_id = e.id;

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================