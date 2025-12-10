// Diagnostic script to check Supabase authentication
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://czwutcdsmwzhuxghsqdd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6d3V0Y2RzbXd6aHV4Z2hzcWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODI3MzUsImV4cCI6MjA4MDk1ODczNX0.rChMWGPewsOD-FLSpyC3Ho11dWRW1ZIUxsFqjvRqgl8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseAuth() {
    console.log('🔍 Diagnosticando autenticación de Supabase...\n');

    // Test 1: Check if we can connect
    console.log('1️⃣ Verificando conexión...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
        console.log('❌ Error de conexión:', sessionError.message);
        return;
    }
    console.log('✅ Conexión exitosa\n');

    // Test 2: Try to sign in with test credentials
    console.log('2️⃣ Probando inicio de sesión...');
    console.log('Por favor ingresa las credenciales que intentaste usar:\n');

    // You can replace these with actual credentials to test
    const testEmail = 'test@example.com'; // Replace with your email
    const testPassword = 'test123456'; // Replace with your password

    console.log(`Email de prueba: ${testEmail}`);
    console.log(`Intentando iniciar sesión...\n`);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (signInError) {
        console.log('❌ Error al iniciar sesión:');
        console.log('   Código:', signInError.status);
        console.log('   Mensaje:', signInError.message);
        console.log('   Nombre:', signInError.name);

        // Common error messages
        if (signInError.message.includes('Invalid login credentials')) {
            console.log('\n⚠️  DIAGNÓSTICO:');
            console.log('   - El email o la contraseña son incorrectos');
            console.log('   - O el usuario no existe en Supabase');
            console.log('   - O el email no ha sido confirmado (si está habilitado)');
        } else if (signInError.message.includes('Email not confirmed')) {
            console.log('\n⚠️  DIAGNÓSTICO:');
            console.log('   - El email necesita ser confirmado');
            console.log('   - Revisa tu bandeja de entrada');
            console.log('   - O desactiva "Confirm email" en Supabase');
        }
    } else {
        console.log('✅ Inicio de sesión exitoso!');
        console.log('👤 Usuario:', signInData.user?.email);
        console.log('🔑 Sesión creada correctamente');
    }

    // Test 3: Check auth settings
    console.log('\n3️⃣ Verificando configuración de autenticación...');
    console.log('📋 Pasos a verificar en Supabase Dashboard:');
    console.log('   1. Ve a Authentication > Providers');
    console.log('   2. Verifica que Email esté HABILITADO');
    console.log('   3. Si "Confirm email" está activado:');
    console.log('      - Revisa tu email para el link de confirmación');
    console.log('      - O desactívalo para desarrollo');
    console.log('   4. Ve a Authentication > Users');
    console.log('      - Verifica que tu usuario exista');
    console.log('      - Verifica el estado de confirmación');
}

diagnoseAuth();
