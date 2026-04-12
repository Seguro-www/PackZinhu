import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usdzlpaletfbvvhkvaki.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZHpscGFsZXRmYnZ2aGt2YWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQxNzUzNiwiZXhwIjoyMDkwOTkzNTM2fQ.t3-rSm4VMT9klY_zFv3_5DLo2no9rP_cUbfmTozdev8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  const { data, error } = await supabase.from('likes').select('*').limit(1);
  console.log('Likes:', data, error);
}

checkTables();
