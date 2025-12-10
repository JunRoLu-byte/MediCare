'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { authHelpers } from '@/lib/supabase';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre completo es requerido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Correo electrónico inválido';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Teléfono inválido (10 dígitos)';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!acceptedTerms) {
            newErrors.terms = 'Debes aceptar los términos y condiciones';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setSuccessMessage('');

        try {
            const { data, error } = await authHelpers.signUp(
                formData.email,
                formData.password,
                {
                    full_name: formData.fullName,
                    phone: formData.phone,
                }
            );

            if (error) {
                setErrors({ submit: error.message });
            } else {
                setSuccessMessage('¡Cuenta creada exitosamente! Revisa tu correo para confirmar tu cuenta.');

                // Clear form
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirmPassword: '',
                });
                setAcceptedTerms(false);

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (error: any) {
            setErrors({ submit: 'Error al crear la cuenta. Por favor intenta de nuevo.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <div className={styles.signupContainer}>
            <div className={styles.contentWrapper}>
                {/* Brand Section */}
                <div className={styles.brandSection}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>🏥</div>
                        <span className={styles.logoText}>MediCare</span>
                    </div>
                    <h1>Únete a MediCare</h1>
                    <p>
                        Crea tu cuenta y accede a servicios médicos de calidad. Gestiona tus citas,
                        consulta tu historial y mantente conectado con profesionales de la salud.
                    </p>
                    <ul className={styles.benefitsList}>
                        <li>Agenda citas médicas en línea</li>
                        <li>Acceso a tu historial médico</li>
                        <li>Consultas con especialistas</li>
                        <li>Recordatorios de medicamentos</li>
                    </ul>
                </div>

                {/* Signup Card */}
                <div className={styles.signupCard}>
                    <div className={styles.signupHeader}>
                        <h2>Crear Cuenta</h2>
                        <p>Completa el formulario para registrarte</p>
                    </div>

                    {successMessage && (
                        <div className={styles.successMessage}>
                            {successMessage}
                        </div>
                    )}

                    {errors.submit && (
                        <div className={styles.errorMessage} style={{ marginBottom: '1rem' }}>
                            {errors.submit}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="fullName">Nombre Completo *</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="fullName"
                                    type="text"
                                    className={`${styles.input} ${errors.fullName ? styles.error : ''}`}
                                    placeholder="Juan Pérez García"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                />
                                <span className={styles.inputIcon}>👤</span>
                            </div>
                            {errors.fullName && (
                                <span className={styles.errorMessage}>{errors.fullName}</span>
                            )}
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="email">Correo Electrónico *</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="email"
                                        type="email"
                                        className={`${styles.input} ${errors.email ? styles.error : ''}`}
                                        placeholder="ejemplo@correo.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                    />
                                    <span className={styles.inputIcon}>📧</span>
                                </div>
                                {errors.email && (
                                    <span className={styles.errorMessage}>{errors.email}</span>
                                )}
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="phone">Teléfono *</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="phone"
                                        type="tel"
                                        className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                                        placeholder="1234567890"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                    />
                                    <span className={styles.inputIcon}>📱</span>
                                </div>
                                {errors.phone && (
                                    <span className={styles.errorMessage}>{errors.phone}</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="password">Contraseña *</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="password"
                                        type="password"
                                        className={`${styles.input} ${errors.password ? styles.error : ''}`}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                    />
                                    <span className={styles.inputIcon}>🔒</span>
                                </div>
                                {errors.password && (
                                    <span className={styles.errorMessage}>{errors.password}</span>
                                )}
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    />
                                    <span className={styles.inputIcon}>🔒</span>
                                </div>
                                {errors.confirmPassword && (
                                    <span className={styles.errorMessage}>{errors.confirmPassword}</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.termsCheckbox}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={acceptedTerms}
                                onChange={(e) => {
                                    setAcceptedTerms(e.target.checked);
                                    if (errors.terms) {
                                        setErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.terms;
                                            return newErrors;
                                        });
                                    }
                                }}
                            />
                            <label htmlFor="terms">
                                Acepto los{' '}
                                <a href="#terms" target="_blank">
                                    términos y condiciones
                                </a>{' '}
                                y la{' '}
                                <a href="#privacy" target="_blank">
                                    política de privacidad
                                </a>
                            </label>
                        </div>
                        {errors.terms && (
                            <span className={styles.errorMessage}>{errors.terms}</span>
                        )}

                        <button
                            type="submit"
                            className={styles.signupButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>o</span>
                    </div>

                    <div className={styles.loginSection}>
                        <p>
                            ¿Ya tienes una cuenta?
                            <Link href="/login">Iniciar Sesión</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
