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
        // Successful login - redirect to main page
        router.push('/');
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
          <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
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

          {/* Google Sign-In Button */}
          <button
            type="button"
            className={styles.googleButton}
            onClick={async () => {
              setIsLoading(true);
              const { error } = await authHelpers.signInWithGoogle();
              if (error) {
                setError('Error al iniciar sesión con Google. Por favor intenta de nuevo.');
                setIsLoading(false);
              }
              // Note: The redirect happens automatically, so we don't need to handle success here
            }}
            disabled={isLoading}
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </button>

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
