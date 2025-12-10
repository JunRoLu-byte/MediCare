'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { authHelpers } from '@/lib/supabase';

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { user, error } = await authHelpers.getCurrentUser();

        if (error || !user) {
            router.push('/login');
        } else {
            setUser(user);
        }
        setLoading(false);
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
                    <div className={styles.logo}>
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
                            <p className={styles.profileRole}>Paciente</p>
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
                            <div className={styles.statNumber}>0</div>
                            <div className={styles.statLabel}>Citas Programadas</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>0</div>
                            <div className={styles.statLabel}>Consultas Realizadas</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>0</div>
                            <div className={styles.statLabel}>Recetas Activas</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>0</div>
                            <div className={styles.statLabel}>Estudios Pendientes</div>
                        </div>
                    </div>
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
                        <li className={styles.activityItem}>
                            <div className={styles.activityIconWrapper}>✅</div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityTitle}>Cuenta creada exitosamente</div>
                                <div className={styles.activityDate}>{createdAt}</div>
                            </div>
                        </li>
                        <li className={styles.activityItem}>
                            <div className={styles.activityIconWrapper}>🎉</div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityTitle}>Bienvenido a MediCare</div>
                                <div className={styles.activityDate}>
                                    Comienza agendando tu primera cita médica
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>
            </main>
        </div>
    );
}
