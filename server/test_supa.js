import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing with URL:', supabaseUrl);
// Don't log full key for security, just prefix
console.log('Key prefix:', supabaseAnonKey ? supabaseAnonKey.substring(0, 15) : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    const { data, error } = await supabase.auth.signUp({
        email: `test_${Date.now()}@example.com`,
        password: 'Password123!'
    });
    console.log('SignUp Response Data:', data);
    console.log('SignIn Error:', error);
  } catch (e) {
    console.log('Exception:', e);
  }
}
run();
