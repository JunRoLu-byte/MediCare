// Test Supabase Connection with correct anon key
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://czwutcdsmwzhuxghsqdd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6d3V0Y2RzbXd6aHV4Z2hzcWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODI3MzUsImV4cCI6MjA4MDk1ODczNX0.rChMWGPewsOD-FLSpyC3Ho11dWRW1ZIUxsFqjvRqgl8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('🔍 Testing Supabase connection with CORRECT anon key...\n');

    console.log('📍 Supabase URL:', supabaseUrl);
    console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 50) + '...\n');

    try {
        // Test 1: Check connection
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.log('❌ Connection Error:', error.message);
            return;
        }

        console.log('✅ Successfully connected to Supabase!');
        console.log('📊 Current session:', data.session ? 'Active' : 'No active session');

        // Test 2: Try to sign up a test user
        console.log('\n🧪 Testing signup functionality...');
        const testEmail = `test${Date.now()}@example.com`;
        const testPassword = 'test123456';

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (signUpError) {
            console.log('❌ Signup Error:', signUpError.message);
        } else {
            console.log('✅ Signup test successful!');
            console.log('👤 Test user created:', testEmail);
            console.log('📧 Check your Supabase dashboard for the new user');
        }

        console.log('\n✨ Supabase is ready to use with the correct anon key!');

    } catch (err) {
        console.log('❌ Unexpected error:', err);
    }
}

testConnection();
