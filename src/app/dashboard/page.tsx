'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { authHelpers } from '@/lib/supabase';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { user, error } = await authHelpers.getCurrentUser();

        if (error || !user) {
            // Not authenticated, redirect to login
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

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>🏥</div>
                        <span className={styles.logoText}>MediCare</span>
                    </div>
                    <div className={styles.userSection}>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>
                                {user.user_metadata?.full_name || 'Usuario'}
                            </div>
                            <div className={styles.userEmail}>{user.email}</div>
                        </div>
                        <button className={styles.logoutButton} onClick={handleLogout}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Welcome Section */}
                <section className={styles.welcomeSection}>
                    <h1>¡Bienvenido, {user.user_metadata?.full_name || 'Usuario'}!</h1>
                    <p>Gestiona tu salud desde un solo lugar</p>
                </section>

                {/* Cards Grid */}
                <div className={styles.cardsGrid}>
                    <div className={styles.card}>
                        <div className={styles.cardIcon}>📅</div>
                        <h3>Agendar Cita</h3>
                        <p>Programa una cita con nuestros especialistas médicos</p>
                        <button className={styles.cardButton}>Agendar Ahora</button>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>📋</div>
                        <h3>Mis Citas</h3>
                        <p>Consulta y gestiona tus citas médicas programadas</p>
                        <button className={styles.cardButton}>Ver Citas</button>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>📊</div>
                        <h3>Historial Médico</h3>
                        <p>Accede a tu historial médico completo y resultados</p>
                        <button className={styles.cardButton}>Ver Historial</button>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>💊</div>
                        <h3>Recetas</h3>
                        <p>Consulta tus recetas médicas y medicamentos</p>
                        <button className={styles.cardButton}>Ver Recetas</button>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>👨‍⚕️</div>
                        <h3>Especialistas</h3>
                        <p>Encuentra y contacta a nuestros especialistas</p>
                        <button className={styles.cardButton}>Ver Especialistas</button>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>⚙️</div>
                        <h3>Configuración</h3>
                        <p>Actualiza tu perfil y preferencias de cuenta</p>
                        <button className={styles.cardButton}>Configurar</button>
                    </div>
                </div>

                {/* Info Section */}
                <section className={styles.infoSection}>
                    <h2>Servicios Disponibles</h2>
                    <p>
                        En MediCare, nos comprometemos a brindarte la mejor atención médica.
                        Nuestros servicios incluyen:
                    </p>
                    <ul>
                        <li>Consultas médicas generales y especializadas</li>
                        <li>Exámenes de laboratorio y diagnóstico</li>
                        <li>Telemedicina y consultas virtuales</li>
                        <li>Seguimiento personalizado de tratamientos</li>
                        <li>Acceso 24/7 a tu historial médico</li>
                        <li>Recordatorios de citas y medicamentos</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}
