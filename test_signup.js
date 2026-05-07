import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase Signup for URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  
  console.log(`Attempting signup for ${testEmail}...`);
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (error) {
    console.error('Signup Error Code:', error.status);
    console.error('Signup Error Message:', error.message);
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
  } else {
    console.log('Signup SECESSFUL!');
    console.log('User ID:', data.user?.id);
  }
}

testSignup();
