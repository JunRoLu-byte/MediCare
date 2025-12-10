'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { authHelpers } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: signInError } = await authHelpers.signIn(email, password);

      if (signInError) {
        // Show the actual error from Supabase for debugging
        console.error('Supabase error:', signInError);

        // Check for specific error types
        if (signInError.message.includes('Email not confirmed')) {
          setError('Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Correo o contraseña incorrectos. Por favor intenta de nuevo.');
        } else {
          setError(`Error: ${signInError.message}`);
        }
      } else if (data.user) {
        // Successful login - redirect to home
        router.push('/home');
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError('Error al iniciar sesión. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/signup');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.contentWrapper}>
        {/* Brand Section */}
        <div className={styles.brandSection}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🏥</div>
            <span className={styles.logoText}>MediCare</span>
          </div>
          <h1>Tu salud es nuestra prioridad</h1>
          <p>
            Accede a tu consultorio médico digital. Gestiona citas, consulta tu historial
            médico y mantente conectado con tu equipo de salud.
          </p>
        </div>

        {/* Login Card */}
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h2>Iniciar Sesión</h2>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Correo Electrónico</label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <span className={styles.inputIcon}>📧</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <span className={styles.inputIcon}>🔒</span>
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <a href="#forgot">¿Olvidaste tu contraseña?</a>
            </div>

            <button
              type="submit"
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>o</span>
          </div>

          <div className={styles.registerSection}>
            <p>¿No tienes una cuenta?</p>
            <button
              type="button"
              className={styles.registerButton}
              onClick={handleRegister}
              disabled={isLoading}
            >
              Crear Cuenta Nueva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
