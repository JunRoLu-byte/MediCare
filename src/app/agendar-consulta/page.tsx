'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { authHelpers, citaHelpers, medicoHelpers, pagoHelpers, pacienteHelpers } from '@/lib/supabase';

export default function AgendarConsulta() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [medicos, setMedicos] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [registeringPayment, setRegisteringPayment] = useState(false);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [citaId, setCitaId] = useState<string | null>(null);
    const [consultationFee, setConsultationFee] = useState<number | null>(null);
    const [showYapeModal, setShowYapeModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [paymentMethodLabel, setPaymentMethodLabel] = useState<string | null>(null);
    const [yapeOperacion, setYapeOperacion] = useState('');
    const [yapeVoucherDataUrl, setYapeVoucherDataUrl] = useState<string | null>(null);
    const [cardCurrency, setCardCurrency] = useState<'PEN' | 'USD'>('PEN');
    const [cardType, setCardType] = useState<'Tarjeta de crédito' | 'Tarjeta de débito'>('Tarjeta de crédito');
    const [cardTransactionId, setCardTransactionId] = useState('');
    const [cardVoucherDataUrl, setCardVoucherDataUrl] = useState<string | null>(null);
    const [cardPaymentDateTime, setCardPaymentDateTime] = useState<string>(() => {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    });
    const [formData, setFormData] = useState({
        especialidad: '',
        doctor: '',
        fecha: '',
        hora: '',
        motivo: '',
        telefono: ''
    });

    useEffect(() => {
        checkUser();
        loadMedicos();
    }, []);

    const checkUser = async () => {
        const { user } = await authHelpers.getCurrentUser();
        if (!user) {
            alert('Debes iniciar sesión para agendar una consulta.');
            router.push('/login');
        } else {
            setUser(user);
            // Pre-llenar el teléfono si está disponible
            if (user.user_metadata?.phone) {
                setFormData(prev => ({ ...prev, telefono: user.user_metadata.phone }));
            }
        }
        setLoading(false);
    };

    const normalizeText = (value: string) => {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    };

    const loadMedicos = async () => {
        const { data, error } = await medicoHelpers.getMedicosActivos();
        if (error) {
            return;
        }
        setMedicos(Array.isArray(data) ? data : []);
    };

    const handleChange = (field: string, value: string) => {
        if (field === 'doctor') {
            setPaymentId(null);
            setCitaId(null);
            setPaymentMethodLabel(null);
            setConsultationFee(null);
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateFormForCita = () => {
        if (!formData.doctor) {
            alert('Selecciona un doctor.' );
            return false;
        }
        if (!formData.fecha) {
            alert('Selecciona una fecha.' );
            return false;
        }
        if (!formData.hora) {
            alert('Selecciona una hora.' );
            return false;
        }
        if (!formData.telefono?.trim()) {
            alert('Ingresa tu teléfono de contacto.' );
            return false;
        }
        if (!formData.motivo?.trim()) {
            alert('Ingresa el motivo de la consulta.' );
            return false;
        }
        return true;
    };

    const getDoctorInfo = async (doctorId: string) => {
        const { data, error } = await medicoHelpers.getMedicoInfoById(doctorId);
        return { data, error };
    };

    const readFileAsDataUrl = (file: File) => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
            reader.readAsDataURL(file);
        });
    };

    const ensureConsultationFee = async () => {
        if (!formData.doctor) {
            alert('Selecciona un doctor antes de pagar.');
            return null;
        }

        const inMemoryDoctor = medicos.find((m) => m.id === formData.doctor);
        if (inMemoryDoctor) {
            const fee = Number(inMemoryDoctor.tarifa_consulta ?? 0);
            setConsultationFee(fee);
            return fee;
        }

        const { data: doctorInfo, error: doctorError } = await getDoctorInfo(formData.doctor);
        if (doctorError || !doctorInfo) {
            alert('No se pudo obtener la información del doctor para calcular el monto.');
            return null;
        }

        const fee = Number(doctorInfo.tarifa_consulta ?? 0);
        setConsultationFee(fee);
        return fee;
    };

    const openYapeModal = async () => {
        if (!user) {
            alert('Debes iniciar sesión para pagar.');
            router.push('/login');
            return;
        }
        if (paymentId) return;
        const fee = await ensureConsultationFee();
        if (fee === null) return;

        setYapeOperacion('');
        setYapeVoucherDataUrl(null);
        setShowYapeModal(true);
    };

    const openCardModal = async () => {
        if (!user) {
            alert('Debes iniciar sesión para pagar.');
            router.push('/login');
            return;
        }
        if (paymentId) return;
        const fee = await ensureConsultationFee();
        if (fee === null) return;

        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        setCardPaymentDateTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
        setCardCurrency('PEN');
        setCardType('Tarjeta de crédito');
        setCardTransactionId('');
        setCardVoucherDataUrl(null);
        setShowCardModal(true);
    };

    const registerYapePayment = async () => {
        if (!user) {
            alert('Debes iniciar sesión para registrar un pago.');
            return;
        }

        if (!validateFormForCita()) {
            return;
        }

        const { error: pacienteError } = await pacienteHelpers.ensurePacienteExists(user);
        if (pacienteError) {
            alert(`No se pudo crear/verificar tu perfil de paciente: ${pacienteError.message}`);
            return;
        }
        if (!yapeOperacion.trim()) {
            alert('Ingresa el N° de operación.');
            return;
        }
        if (!yapeVoucherDataUrl) {
            alert('Debes subir la foto del voucher.');
            return;
        }

        setRegisteringPayment(true);
        try {
            const { data: pago, error: pagoError } = await pagoHelpers.createPago({
                paciente_id: user.id,
                cita_id: null,
                monto: Number(consultationFee ?? 0),
                metodo_pago: 'Yape',
                estado_pago: 'Pendiente',
                transaccion_id: yapeOperacion.trim(),
                notas: 'Pago simulado (Yape) - pendiente de verificación',
                voucher_data_url: yapeVoucherDataUrl,
            });

            if (pagoError || !pago) {
                alert(`No se pudo registrar el pago: ${pagoError?.message ?? 'Error desconocido'}`);
                return;
            }

            const { data: doctorInfo, error: doctorError } = await getDoctorInfo(formData.doctor);
            if (doctorError || !doctorInfo) {
                alert('No se pudo obtener la información del doctor seleccionado.');
                return;
            }

            const appointmentTime = formData.hora && formData.hora.length === 5
                ? `${formData.hora}:00`
                : formData.hora;

            const { data: cita, error: citaError } = await citaHelpers.createCita({
                paciente_id: user.id,
                medico_id: doctorInfo.id,
                fecha_cita: formData.fecha,
                hora_cita: appointmentTime,
                estado: 'Pendiente Pago',
                motivo: formData.motivo,
                notas: `Teléfono: ${formData.telefono}`
            });

            if (citaError || !cita) {
                alert(`El pago se registró pero no se pudo crear la cita: ${citaError?.message ?? 'Error desconocido'}`);
                return;
            }

            const { error: linkError } = await pagoHelpers.attachPagoToCita(pago.id, user.id, cita.id);
            if (linkError) {
                alert(`El pago y la cita se registraron pero no se pudo asociar el pago: ${linkError.message}`);
                return;
            }

            setPaymentId(pago.id);
            setCitaId(cita.id);
            setPaymentMethodLabel('Yape');
            setShowYapeModal(false);
            setShowPaymentSuccess(true);
        } finally {
            setRegisteringPayment(false);
        }
    };

    const registerCardPayment = async () => {
        if (!user) {
            alert('Debes iniciar sesión para registrar un pago.');
            return;
        }

        if (!validateFormForCita()) {
            return;
        }

        const { error: pacienteError } = await pacienteHelpers.ensurePacienteExists(user);
        if (pacienteError) {
            alert(`No se pudo crear/verificar tu perfil de paciente: ${pacienteError.message}`);
            return;
        }
        if (!cardTransactionId.trim()) {
            alert('Ingresa el Código/ID de transacción.');
            return;
        }
        if (!cardVoucherDataUrl) {
            alert('Debes subir la foto del voucher.');
            return;
        }

        setRegisteringPayment(true);
        try {
            const { data: pago, error: pagoError } = await pagoHelpers.createPago({
                paciente_id: user.id,
                cita_id: null,
                monto: Number(consultationFee ?? 0),
                moneda: cardCurrency,
                metodo_pago: 'Tarjeta',
                estado_pago: 'Pendiente',
                transaccion_id: cardTransactionId.trim(),
                notas: `Pago simulado (Tarjeta) - ${cardType} - ${cardPaymentDateTime}`,
                voucher_data_url: cardVoucherDataUrl,
            });

            if (pagoError || !pago) {
                alert(`No se pudo registrar el pago: ${pagoError?.message ?? 'Error desconocido'}`);
                return;
            }

            const { data: doctorInfo, error: doctorError } = await getDoctorInfo(formData.doctor);
            if (doctorError || !doctorInfo) {
                alert('No se pudo obtener la información del doctor seleccionado.');
                return;
            }

            const appointmentTime = formData.hora && formData.hora.length === 5
                ? `${formData.hora}:00`
                : formData.hora;

            const { data: cita, error: citaError } = await citaHelpers.createCita({
                paciente_id: user.id,
                medico_id: doctorInfo.id,
                fecha_cita: formData.fecha,
                hora_cita: appointmentTime,
                estado: 'Pendiente Pago',
                motivo: formData.motivo,
                notas: `Teléfono: ${formData.telefono}`
            });

            if (citaError || !cita) {
                alert(`El pago se registró pero no se pudo crear la cita: ${citaError?.message ?? 'Error desconocido'}`);
                return;
            }

            const { error: linkError } = await pagoHelpers.attachPagoToCita(pago.id, user.id, cita.id);
            if (linkError) {
                alert(`El pago y la cita se registraron pero no se pudo asociar el pago: ${linkError.message}`);
                return;
            }

            setPaymentId(pago.id);
            setCitaId(cita.id);
            setPaymentMethodLabel('Tarjeta');
            setShowCardModal(false);
            setShowPaymentSuccess(true);
        } finally {
            setRegisteringPayment(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Debes iniciar sesión para agendar una consulta.');
            return;
        }

        const { error: pacienteError } = await pacienteHelpers.ensurePacienteExists(user);
        if (pacienteError) {
            alert(`No se pudo crear/verificar tu perfil de paciente: ${pacienteError.message}`);
            return;
        }
        if (!paymentId) {
            alert('Primero debes registrar un pago para poder confirmar la cita.');
            return;
        }

        if (citaId) {
            router.push('/home');
            return;
        }

        setSubmitting(true);
        try {
            const { data: doctorInfo, error: doctorError } = await getDoctorInfo(formData.doctor);
            if (doctorError || !doctorInfo) {
                alert('No se pudo obtener la información del doctor seleccionado.');
                return;
            }

            const appointmentTime = formData.hora && formData.hora.length === 5
                ? `${formData.hora}:00`
                : formData.hora;

            const { data: cita, error: citaError } = await citaHelpers.createCita({
                paciente_id: user.id,
                medico_id: doctorInfo.id,
                fecha_cita: formData.fecha,
                hora_cita: appointmentTime,
                estado: 'Pendiente Pago',
                motivo: formData.motivo,
                notas: `Teléfono: ${formData.telefono}`
            });

            if (citaError || !cita) {
                alert(`No se pudo crear la cita: ${citaError?.message ?? 'Error desconocido'}`);
                return;
            }

            const { error: linkError } = await pagoHelpers.attachPagoToCita(paymentId, user.id, cita.id);
            if (linkError) {
                alert(`La cita se creó pero no se pudo asociar el pago: ${linkError.message}`);
                return;
            }

            alert('Consulta registrada. Queda pendiente de confirmación hasta verificar el pago.');
            router.push('/home');
        } finally {
            setSubmitting(false);
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

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
                        <div className={styles.logoIcon}>🏥</div>
                        <span className={styles.logoText}>MediCare</span>
                    </div>
                    <button className={styles.backButton} onClick={() => router.push('/')}>
                        ← Volver al Inicio
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <h1>📅 Agendar Consulta Médica</h1>
                        <p>Completa el formulario para agendar tu cita con nuestros especialistas</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Especialidad */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="especialidad">Especialidad *</label>
                            <select
                                id="especialidad"
                                className={styles.select}
                                value={formData.especialidad}
                                onChange={(e) => handleChange('especialidad', e.target.value)}
                                required
                            >
                                <option value="">Selecciona una especialidad</option>
                                <option value="Consulta General">Consulta General</option>
                                <option value="Cardiología">Cardiología</option>
                                <option value="Traumatología">Traumatología</option>
                                <option value="Pediatría">Pediatría</option>
                                <option value="Neurología">Neurología</option>
                                <option value="Análisis Clínicos">Análisis Clínicos</option>
                                <option value="Radiología">Radiología</option>
                                <option value="Vacunación">Vacunación</option>
                            </select>
                        </div>

                        {/* Doctor */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="doctor">Doctor *</label>
                            <select
                                id="doctor"
                                className={styles.select}
                                value={formData.doctor}
                                onChange={(e) => handleChange('doctor', e.target.value)}
                                required
                            >
                                <option value="">Selecciona un doctor</option>
                                {medicos
                                    .filter((m) => {
                                        if (!formData.especialidad) return true;
                                        const esp = String((m as any)?.especialidades?.nombre ?? '');
                                        return normalizeText(esp) === normalizeText(formData.especialidad);
                                    })
                                    .map((m) => {
                                        const esp = String((m as any)?.especialidades?.nombre ?? '');
                                        return (
                                            <option key={m.id} value={m.id}>
                                                {m.nombre_completo}{esp ? ` - ${esp}` : ''}
                                            </option>
                                        );
                                    })}
                            </select>
                        </div>

                        {/* Fecha y Hora */}
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="fecha">Fecha *</label>
                                <input
                                    id="fecha"
                                    type="date"
                                    className={styles.input}
                                    value={formData.fecha}
                                    onChange={(e) => handleChange('fecha', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="hora">Hora *</label>
                                <select
                                    id="hora"
                                    className={styles.select}
                                    value={formData.hora}
                                    onChange={(e) => handleChange('hora', e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona una hora</option>
                                    <option value="08:00">08:00 AM</option>
                                    <option value="09:00">09:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="12:00">12:00 PM</option>
                                    <option value="14:00">02:00 PM</option>
                                    <option value="15:00">03:00 PM</option>
                                    <option value="16:00">04:00 PM</option>
                                    <option value="17:00">05:00 PM</option>
                                    <option value="18:00">06:00 PM</option>
                                </select>
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="telefono">Teléfono de Contacto *</label>
                            <input
                                id="telefono"
                                type="tel"
                                className={styles.input}
                                placeholder="987654321"
                                value={formData.telefono}
                                onChange={(e) => handleChange('telefono', e.target.value)}
                                maxLength={9}
                                required
                            />
                        </div>

                        {/* Motivo */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="motivo">Motivo de la Consulta *</label>
                            <textarea
                                id="motivo"
                                className={styles.textarea}
                                placeholder="Describe brevemente el motivo de tu consulta..."
                                value={formData.motivo}
                                onChange={(e) => handleChange('motivo', e.target.value)}
                                rows={4}
                                required
                            ></textarea>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Pago *</label>
                            <div className={styles.paymentRow}>
                                <button
                                    type="button"
                                    className={styles.payButton}
                                    onClick={openCardModal}
                                    disabled={registeringPayment || submitting || Boolean(paymentId)}
                                >
                                    Pagar con tarjeta
                                </button>
                                <button
                                    type="button"
                                    className={styles.payButton}
                                    onClick={openYapeModal}
                                    disabled={registeringPayment || submitting || Boolean(paymentId)}
                                >
                                    Pagar con Yape
                                </button>
                            </div>
                            <div className={styles.paymentMeta}>
                                <div>{consultationFee !== null ? `Monto exacto: S/ ${consultationFee.toFixed(2)}` : ''}</div>
                                <div>{paymentId ? `Pago registrado (${paymentMethodLabel ?? 'pendiente'})` : 'Aún no has registrado un pago'}</div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className={styles.formActions}>
                            <button type="button" className={styles.cancelButton} onClick={() => router.push('/')}>
                                Cancelar
                            </button>
                            <button type="submit" className={styles.submitButton} disabled={!paymentId || submitting}>
                                Confirmar Cita
                            </button>
                        </div>
                    </form>
                </div>

                {showYapeModal ? (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <div className={styles.modalTitle}>Pagar con Yape</div>
                                <button type="button" className={styles.modalClose} onClick={() => setShowYapeModal(false)} disabled={registeringPayment}>×</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.modalRow}>
                                    <div><strong>Monto exacto:</strong> S/ {Number(consultationFee ?? 0).toFixed(2)}</div>
                                </div>
                                <div className={styles.modalRow}>
                                    <div className={styles.qrBox}>
                                        <img
                                            alt="QR Yape"
                                            className={styles.qrImage}
                                            src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                                `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
<rect width='100%' height='100%' fill='white'/>
<rect x='12' y='12' width='60' height='60' fill='black'/>
<rect x='148' y='12' width='60' height='60' fill='black'/>
<rect x='12' y='148' width='60' height='60' fill='black'/>
<rect x='92' y='92' width='36' height='36' fill='black'/>
<text x='110' y='120' text-anchor='middle' font-family='Arial' font-size='12' fill='white'>QR</text>
<text x='110' y='205' text-anchor='middle' font-family='Arial' font-size='14' fill='black'>YAPE</text>
</svg>`
                                            )}`}
                                        />
                                    </div>
                                </div>
                                <div className={styles.modalRow}>
                                    <div><strong>Receptor (simulado):</strong> +51 999 888 777 - MediCare Perú</div>
                                </div>
                                <div className={styles.modalRow}>
                                    <label className={styles.modalLabel} htmlFor="yapeOperacion">N° de operación *</label>
                                    <input
                                        id="yapeOperacion"
                                        type="text"
                                        className={styles.input}
                                        value={yapeOperacion}
                                        onChange={(e) => setYapeOperacion(e.target.value)}
                                        disabled={registeringPayment}
                                    />
                                </div>
                                <div className={styles.modalRow}>
                                    <label className={styles.modalLabel} htmlFor="yapeVoucher">Subir foto del voucher *</label>
                                    <input
                                        id="yapeVoucher"
                                        type="file"
                                        accept="image/*"
                                        className={styles.fileInput}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const dataUrl = await readFileAsDataUrl(file);
                                            setYapeVoucherDataUrl(dataUrl);
                                        }}
                                        disabled={registeringPayment}
                                    />
                                    {yapeVoucherDataUrl ? (
                                        <img className={styles.voucherPreview} src={yapeVoucherDataUrl} alt="Voucher" />
                                    ) : null}
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelButton} onClick={() => setShowYapeModal(false)} disabled={registeringPayment}>
                                    Cancelar
                                </button>
                                <button type="button" className={styles.submitButton} onClick={registerYapePayment} disabled={registeringPayment}>
                                    {registeringPayment ? 'Enviando...' : 'Enviar pago'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {showCardModal ? (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <div className={styles.modalTitle}>Pagar con tarjeta</div>
                                <button type="button" className={styles.modalClose} onClick={() => setShowCardModal(false)} disabled={registeringPayment}>×</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.modalRow}>
                                    <div><strong>Monto:</strong> {cardCurrency === 'PEN' ? 'S/' : '$'} {Number(consultationFee ?? 0).toFixed(2)}</div>
                                </div>
                                <div className={styles.modalRow}>
                                    <div><strong>Cuenta bancaria:</strong> 191-23456789-00</div>
                                </div>
                                <div className={styles.modalRow}>
                                    <label className={styles.modalLabel} htmlFor="cardCurrency">Moneda *</label>
                                    <select
                                        id="cardCurrency"
                                        className={styles.select}
                                        value={cardCurrency}
                                        onChange={(e) => setCardCurrency(e.target.value as 'PEN' | 'USD')}
                                        disabled={registeringPayment}
                                    >
                                        <option value="PEN">PEN</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <div className={styles.modalRow}>
                                    <label className={styles.modalLabel} htmlFor="cardType">Método de pago *</label>
                                    <select
                                        id="cardType"
                                        className={styles.select}
                                        value={cardType}
                                        onChange={(e) => setCardType(e.target.value as any)}
                                        disabled={registeringPayment}
                                    >
                                        <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                                        <option value="Tarjeta de débito">Tarjeta de débito</option>
                                    </select>
                                </div>
                                <div className={styles.modalRow}>
                                    <label className={styles.modalLabel} htmlFor="cardDateTime">Fecha y hora del pago *</label>
                                    <input
                                        id="cardDateTime"
                                        type="datetime-local"
                                        className={styles.input}
                                        value={cardPaymentDateTime}
                                        onChange={(e) => setCardPaymentDateTime(e.target.value)}
                                        disabled={registeringPayment}
                                    />
                                </div>
                                <div className={styles.modalRow}>
                                    <label className={styles.modalLabel} htmlFor="cardTxn">Código / ID de transacción *</label>
                                    <input
                                        id="cardTxn"
                                        type="text"
                                        className={styles.input}
                                        value={cardTransactionId}
                                        onChange={(e) => setCardTransactionId(e.target.value)}
                                        disabled={registeringPayment}
                                    />
                                </div>
                                <div className={styles.modalRow}>
                                    <label className={styles.modalLabel} htmlFor="cardVoucher">Subir foto del voucher *</label>
                                    <input
                                        id="cardVoucher"
                                        type="file"
                                        accept="image/*"
                                        className={styles.fileInput}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const dataUrl = await readFileAsDataUrl(file);
                                            setCardVoucherDataUrl(dataUrl);
                                        }}
                                        disabled={registeringPayment}
                                    />
                                    {cardVoucherDataUrl ? (
                                        <img className={styles.voucherPreview} src={cardVoucherDataUrl} alt="Voucher" />
                                    ) : null}
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelButton} onClick={() => setShowCardModal(false)} disabled={registeringPayment}>
                                    Cancelar
                                </button>
                                <button type="button" className={styles.submitButton} onClick={registerCardPayment} disabled={registeringPayment}>
                                    {registeringPayment ? 'Enviando...' : 'Enviar pago'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {showPaymentSuccess ? (
                    <div className={styles.modalOverlay}>
                        <div className={styles.successModal}>
                            <div className={styles.successIcon}>
                                <svg className={styles.checkSvg} viewBox="0 0 52 52" aria-hidden="true">
                                    <circle className={styles.checkCircle} cx="26" cy="26" r="25" fill="none" />
                                    <path className={styles.checkPath} fill="none" d="M14 27 L22 35 L38 19" />
                                </svg>
                            </div>
                            <div className={styles.successTitle}>Pago enviado</div>
                            <div className={styles.successMessage}>Pago enviado (pendiente de verificación). Ahora ya puedes confirmar la cita.</div>
                            <button type="button" className={styles.successButton} onClick={() => setShowPaymentSuccess(false)}>
                                Entendido
                            </button>
                        </div>
                    </div>
                ) : null}

                {/* Info Card */}
                <div className={styles.infoCard}>
                    <h3>📋 Información Importante</h3>
                    <ul>
                        <li>✓ Las citas deben agendarse con al menos 24 horas de anticipación</li>
                        <li>✓ Recibirás una confirmación por correo electrónico</li>
                        <li>✓ Llega 10 minutos antes de tu cita</li>
                        <li>✓ Trae tu documento de identidad</li>
                        <li>✓ Si tienes exámenes previos, tráelos contigo</li>
                    </ul>
                    <div className={styles.contactInfo}>
                        <h4>¿Necesitas ayuda?</h4>
                        <p>📞 +51 1 234 5678</p>
                        <p>📧 contacto@medicare.pe</p>
                        <p>🕐 Lun - Vie: 8:00 AM - 8:00 PM</p>
                    </div>
                </div>
            </main>
        </div>
    );

}
