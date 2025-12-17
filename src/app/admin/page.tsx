'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { adminHelpers, authHelpers } from '@/lib/supabase';

const ADMIN_EMAIL = '2411080183@undc.edu.pe';
type EstadoPago = 'Pendiente' | 'Completado' | 'Fallido' | 'Reembolsado';

type Paciente = {
    nombre_completo: string;
    telefono: string | null;
};

type Medico = {
    nombre_completo: string;
};

type Cita = {
    fecha_cita: string;
    hora_cita: string;
    estado: string;
    medicos?: Medico | null;
};

type PagoRow = {
    id: string;
    paciente_id: string;
    cita_id: string | null;
    monto: number;
    moneda: string | null;
    metodo_pago: string | null;
    estado_pago: EstadoPago;
    transaccion_id: string | null;
    fecha_pago: string | null;
    notas: string | null;
    voucher_data_url?: string | null;
    creado_en: string;
    pacientes?: Paciente | null;
    citas?: Cita | null;
};

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pagos, setPagos] = useState<PagoRow[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const isAdmin = useMemo(() => {
        const email = (user?.email ?? '').toLowerCase();
        return email === ADMIN_EMAIL.toLowerCase();
    }, [user?.email]);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { user, error } = await authHelpers.getCurrentUser();

        if (error || !user) {
            router.push('/login');
            return;
        }

        setUser(user);
        setLoading(false);
    };

    useEffect(() => {
        if (!loading && user) {
            if (!isAdmin) {
                router.push('/dashboard');
                return;
            }
            refreshPagos();
        }
    }, [loading, user, isAdmin]);

    const refreshPagos = async () => {
        setErrorMsg(null);
        const { data, error } = await adminHelpers.getAllPagos();
        if (error) {
            setErrorMsg(error.message);
            return;
        }
        setPagos((data ?? []) as PagoRow[]);
    };

    const handleLogout = async () => {
        await authHelpers.signOut();
        router.push('/login');
    };

    const updateEstadoPago = async (pagoId: string, citaId: string | null, estado_pago: EstadoPago) => {
        setUpdatingId(pagoId);
        setErrorMsg(null);
        try {
            const { error } = await adminHelpers.updatePagoEstado(pagoId, estado_pago);
            if (error) {
                setErrorMsg(error.message);
                return;
            }

            if (citaId) {
                const estadoCita = estado_pago === 'Completado' ? 'Confirmada' : (estado_pago === 'Fallido' ? 'Cancelada' : 'Programada');
                const { error: citaError } = await adminHelpers.updateCitaEstado(citaId, estadoCita);
                if (citaError) {
                    setErrorMsg(citaError.message);
                    return;
                }
            }
            await refreshPagos();
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando...</p>
            </div>
        );
    }

    if (!user) return null;

    if (!isAdmin) {
        return null;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
                        <div className={styles.logoIcon}>🏥</div>
                        <span className={styles.logoText}>MediCare Admin</span>
                    </div>
                    <div className={styles.userSection}>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>Administrador</div>
                            <div className={styles.userEmail}>{user.email}</div>
                        </div>
                        <button className={styles.logoutButton} onClick={handleLogout}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <section className={styles.titleSection}>
                    <h1>Panel de Pagos</h1>
                    <p>Revisa, aprueba o rechaza pagos registrados por los pacientes.</p>
                    <div className={styles.actionsRow}>
                        <button className={styles.refreshButton} onClick={refreshPagos}>
                            Refrescar
                        </button>
                        {errorMsg ? <div className={styles.errorBox}>{errorMsg}</div> : null}
                    </div>
                </section>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Paciente</th>
                                    <th>Cita</th>
                                    <th>Monto</th>
                                    <th>Método</th>
                                    <th>Estado</th>
                                    <th>Transacción</th>
                                    <th>Fecha</th>
                                    <th>Voucher</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagos.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className={styles.emptyCell}>No hay pagos registrados.</td>
                                    </tr>
                                ) : (
                                    pagos.map((p) => {
                                        const disabled = updatingId === p.id;
                                        return (
                                            <tr key={p.id}>
                                                <td className={styles.mono}>{p.id}</td>
                                                <td>
                                                    <div>{p.pacientes?.nombre_completo ?? '-'}</div>
                                                    <div className={styles.subText}>{p.pacientes?.telefono ?? p.paciente_id}</div>
                                                </td>
                                                <td>
                                                    <div>{p.citas ? `${p.citas.fecha_cita} ${p.citas.hora_cita}` : '-'}</div>
                                                    <div className={styles.subText}>{p.citas?.medicos?.nombre_completo ?? p.cita_id ?? ''}</div>
                                                </td>
                                                <td>S/ {Number(p.monto ?? 0).toFixed(2)}</td>
                                                <td>{p.metodo_pago ?? '-'}</td>
                                                <td>
                                                    <span className={styles.statusPill} data-status={p.estado_pago}>
                                                        {p.estado_pago}
                                                    </span>
                                                </td>
                                                <td className={styles.mono}>{p.transaccion_id ?? '-'}</td>
                                                <td>{p.fecha_pago ? new Date(p.fecha_pago).toLocaleString() : '-'}</td>
                                                <td>
                                                    {p.voucher_data_url ? (
                                                        <a className={styles.link} href={p.voucher_data_url} target="_blank" rel="noreferrer">Ver</a>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    <div className={styles.rowActions}>
                                                        <button
                                                            className={styles.approveButton}
                                                            disabled={disabled}
                                                            onClick={() => updateEstadoPago(p.id, p.cita_id ?? null, 'Completado')}
                                                        >
                                                            Aceptar
                                                        </button>
                                                        <button
                                                            className={styles.rejectButton}
                                                            disabled={disabled}
                                                            onClick={() => updateEstadoPago(p.id, p.cita_id ?? null, 'Fallido')}
                                                        >
                                                            Rechazar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
