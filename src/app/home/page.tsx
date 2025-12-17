'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { authHelpers, citaHelpers, examenHelpers, pagoHelpers, pacienteHelpers, recetaHelpers } from '@/lib/supabase';

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [citas, setCitas] = useState<any[]>([]);
    const [actividad, setActividad] = useState<Array<{ icon: string; title: string; date: string }>>([]);
    const [resumen, setResumen] = useState({
        citasProgramadas: 0,
        consultasRealizadas: 0,
        recetasActivas: 0,
        estudiosPendientes: 0,
    });

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        loadDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const checkUser = async () => {
        const { user, error } = await authHelpers.getCurrentUser();

        if (error || !user) {
            router.push('/login');
        } else {
            if ((user.email ?? '').toLowerCase() === '2411080183@undc.edu.pe') {
                router.push('/admin');
                return;
            }
            setUser(user);
        }
        setLoading(false);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const buildEstadoBadge = (estado: string) => {
        const e = (estado ?? '').toLowerCase();
        if (e.includes('pendiente')) return 'pendiente';
        if (e.includes('confirm')) return 'ok';
        if (e.includes('cancel')) return 'bad';
        if (e.includes('complet')) return 'ok';
        return 'neutral';
    };

    const buildPagoIcon = (estadoPago: string) => {
        const e = (estadoPago ?? '').toLowerCase();
        if (e.includes('pendiente')) return '⏳';
        if (e.includes('complet')) return '✅';
        if (e.includes('fall')) return '❌';
        return '💳';
    };

    const loadDashboard = async () => {
        setDashboardLoading(true);
        try {
            await pacienteHelpers.ensurePacienteExists(user);

            const [
                citasResp,
                citasConfirmadasResp,
                pagosResp,
                citasProgResp,
                citasRealResp,
                recetasResp,
                examenesResp,
            ] = await Promise.all([
                citaHelpers.getCitasByPaciente(user.id, 8),
                citaHelpers.getCitasConfirmadasByPaciente(user.id, 12),
                pagoHelpers.getPagosByPaciente(user.id, 6),
                citaHelpers.countCitasByEstados(user.id, ['Programada', 'Pendiente Pago', 'Confirmada']),
                citaHelpers.countCitasByEstados(user.id, ['Completada']),
                recetaHelpers.countRecetasActivasByPaciente(user.id),
                examenHelpers.countExamenesPendientesByPaciente(user.id),
            ]);

            const citasData = Array.isArray(citasResp.data) ? citasResp.data : [];
            const citasConfirmadasData = Array.isArray(citasConfirmadasResp.data) ? citasConfirmadasResp.data : [];
            const pagosData = Array.isArray(pagosResp.data) ? pagosResp.data : [];
            setCitas(citasConfirmadasData);

            setResumen({
                citasProgramadas: citasProgResp.count ?? 0,
                consultasRealizadas: citasRealResp.count ?? 0,
                recetasActivas: recetasResp.count ?? 0,
                estudiosPendientes: examenesResp.count ?? 0,
            });

            const items: Array<{ icon: string; title: string; date: string; sort: number }> = [];

            for (const p of pagosData) {
                const when = p.fecha_pago ?? p.creado_en;
                items.push({
                    icon: buildPagoIcon(p.estado_pago),
                    title: `Pago ${p.estado_pago} - ${p.metodo_pago} (${p.moneda ?? 'PEN'} ${Number(p.monto ?? 0).toFixed(2)})`,
                    date: formatDateTime(when),
                    sort: new Date(when).getTime(),
                });
            }

            for (const c of citasData) {
                const when = c.creado_en ?? `${c.fecha_cita}T${String(c.hora_cita ?? '00:00:00')}`;
                const medicosJoin: any = (c as any).medicos;
                const medicoNombre = Array.isArray(medicosJoin)
                    ? medicosJoin?.[0]?.nombre_completo
                    : medicosJoin?.nombre_completo;
                const doctorName = medicoNombre ? ` - ${medicoNombre}` : '';
                items.push({
                    icon: '📅',
                    title: `Cita ${c.estado}${doctorName}`,
                    date: formatDateTime(when),
                    sort: new Date(when).getTime(),
                });
            }

            items.sort((a, b) => b.sort - a.sort);

            const createdAt = new Date(user.created_at).toISOString();
            items.push({
                icon: '✅',
                title: 'Cuenta creada exitosamente',
                date: formatDate(createdAt),
                sort: new Date(createdAt).getTime(),
            });

            setActividad(items.slice(0, 6).map(({ sort, ...rest }) => rest));
        } finally {
            setDashboardLoading(false);
        }
    };

    const handleLogout = async () => {
        await authHelpers.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.5rem',
                color: '#666'
            }}>
                Cargando...
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // Extract user data
    const fullName = user.user_metadata?.full_name || 'Usuario';
    const email = user.email || '';
    const phone = user.user_metadata?.phone || 'No registrado';
    const isAdmin = email.toLowerCase() === '2411080183@undc.edu.pe';
    const createdAt = new Date(user.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className={styles.homeContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
                        <div className={styles.logoIcon}>🏥</div>
                        <span className={styles.logoText}>MediCare</span>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.logoutButton} onClick={handleLogout}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Profile Section */}
                <section className={styles.profileSection}>
                    <div className={styles.profileHeader}>
                        <div className={styles.profileAvatar}>
                            {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.profileInfo}>
                            <h1 className={styles.profileName}>{fullName}</h1>
                            <p className={styles.profileRole}>{isAdmin ? 'Administrador' : 'Paciente'}</p>
                            <div className={styles.profileMeta}>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaIcon}>📧</span>
                                    <span>{email}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaIcon}>📱</span>
                                    <span>{phone}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaIcon}>📅</span>
                                    <span>Miembro desde {createdAt}</span>
                                </div>
                            </div>
                            <button className={styles.editButton}>
                                Editar Perfil
                            </button>
                        </div>
                    </div>

                    <div className={styles.profileDetails}>
                        <div className={styles.detailCard}>
                            <div className={styles.detailLabel}>ID de Paciente</div>
                            <div className={styles.detailValue}>
                                {user.id.substring(0, 8).toUpperCase()}
                            </div>
                        </div>
                        <div className={styles.detailCard}>
                            <div className={styles.detailLabel}>Email Verificado</div>
                            <div className={styles.detailValue}>
                                {user.email_confirmed_at ? '✅ Sí' : '⏳ Pendiente'}
                            </div>
                        </div>
                        <div className={styles.detailCard}>
                            <div className={styles.detailLabel}>Última Actualización</div>
                            <div className={styles.detailValue}>
                                {new Date(user.updated_at).toLocaleDateString('es-ES')}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className={styles.statsSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>📊</span>
                        Resumen de Salud
                    </h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>{resumen.citasProgramadas}</div>
                            <div className={styles.statLabel}>Citas Programadas</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>{resumen.consultasRealizadas}</div>
                            <div className={styles.statLabel}>Consultas Realizadas</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>{resumen.recetasActivas}</div>
                            <div className={styles.statLabel}>Recetas Activas</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>{resumen.estudiosPendientes}</div>
                            <div className={styles.statLabel}>Estudios Pendientes</div>
                        </div>
                    </div>
                </section>

                <section className={styles.appointmentsSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>📌</span>
                        Mis Citas
                    </h2>
                    {dashboardLoading ? (
                        <div className={styles.appointmentsEmpty}>Cargando citas...</div>
                    ) : citas.length ? (
                        <div className={styles.appointmentsList}>
                            {citas.map((c) => {
                                const badge = buildEstadoBadge(String(c.estado ?? ''));
                                const medicosJoin: any = (c as any).medicos;
                                const doctorName = Array.isArray(medicosJoin)
                                    ? medicosJoin?.[0]?.nombre_completo
                                    : medicosJoin?.nombre_completo;
                                return (
                                    <div key={c.id} className={styles.appointmentCard}>
                                        <div className={styles.appointmentHeader}>
                                            <div className={styles.appointmentDoctor}>{doctorName ?? 'Médico'}</div>
                                            <span className={`${styles.statusBadge} ${styles[`status_${badge}`]}`}>{c.estado}</span>
                                        </div>
                                        <div className={styles.appointmentMeta}>
                                            <div>📅 {formatDate(c.fecha_cita)} - 🕒 {String(c.hora_cita ?? '').slice(0, 5)}</div>
                                            {c.motivo ? <div>📝 {c.motivo}</div> : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.appointmentsEmpty}>Aún no tienes citas confirmadas.</div>
                    )}
                </section>

                {/* Quick Actions */}
                <section className={styles.quickActions}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>⚡</span>
                        Acciones Rápidas
                    </h2>
                    <div className={styles.actionsGrid}>
                        <div className={styles.actionCard}>
                            <div className={styles.actionIcon}>📅</div>
                            <h3>Agendar Cita</h3>
                            <p>Programa una cita con nuestros especialistas médicos</p>
                        </div>
                        <div className={styles.actionCard}>
                            <div className={styles.actionIcon}>📋</div>
                            <h3>Ver Historial</h3>
                            <p>Consulta tu historial médico completo y resultados</p>
                        </div>
                        <div className={styles.actionCard}>
                            <div className={styles.actionIcon}>💊</div>
                            <h3>Mis Recetas</h3>
                            <p>Revisa tus recetas médicas y medicamentos activos</p>
                        </div>
                        <div className={styles.actionCard}>
                            <div className={styles.actionIcon}>👨‍⚕️</div>
                            <h3>Especialistas</h3>
                            <p>Encuentra y contacta a nuestros médicos especialistas</p>
                        </div>
                        <div className={styles.actionCard}>
                            <div className={styles.actionIcon}>📊</div>
                            <h3>Resultados</h3>
                            <p>Accede a los resultados de tus estudios y análisis</p>
                        </div>
                        <div className={styles.actionCard}>
                            <div className={styles.actionIcon}>💬</div>
                            <h3>Telemedicina</h3>
                            <p>Consulta virtual con tu médico desde casa</p>
                        </div>
                    </div>
                </section>

                {/* Recent Activity */}
                <section className={styles.activitySection}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🕐</span>
                        Actividad Reciente
                    </h2>
                    <ul className={styles.activityList}>
                        {dashboardLoading ? (
                            <li className={styles.activityItem}>
                                <div className={styles.activityIconWrapper}>⏳</div>
                                <div className={styles.activityContent}>
                                    <div className={styles.activityTitle}>Cargando actividad...</div>
                                    <div className={styles.activityDate}>Por favor espera</div>
                                </div>
                            </li>
                        ) : actividad.length ? (
                            actividad.map((a, idx) => (
                                <li key={`${a.title}-${idx}`} className={styles.activityItem}>
                                    <div className={styles.activityIconWrapper}>{a.icon}</div>
                                    <div className={styles.activityContent}>
                                        <div className={styles.activityTitle}>{a.title}</div>
                                        <div className={styles.activityDate}>{a.date}</div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className={styles.activityItem}>
                                <div className={styles.activityIconWrapper}>🎉</div>
                                <div className={styles.activityContent}>
                                    <div className={styles.activityTitle}>Bienvenido a MediCare</div>
                                    <div className={styles.activityDate}>Comienza agendando tu primera cita médica</div>
                                </div>
                            </li>
                        )}
                    </ul>
                </section>
            </main>
        </div>
    );
}
