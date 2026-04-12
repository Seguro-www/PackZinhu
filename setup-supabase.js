import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usdzlpaletfbvvhkvaki.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZHpscGFsZXRmYnZ2aGt2YWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQxNzUzNiwiZXhwIjoyMDkwOTkzNTM2fQ.t3-rSm4VMT9klY_zFv3_5DLo2no9rP_cUbfmTozdev8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
  console.log('Checking buckets...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const mediaBucketExists = buckets.some(b => b.name === 'media');
  
  if (!mediaBucketExists) {
    console.log('Creating media bucket...');
    const { data, error } = await supabase.storage.createBucket('media', {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*'],
      fileSizeLimit: 52428800 // 50MB
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Bucket created successfully:', data);
    }
  } else {
    console.log('Media bucket already exists. Ensuring it is public...');
    const { data, error } = await supabase.storage.updateBucket('media', {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*'],
      fileSizeLimit: 52428800
    });
    if (error) {
      console.error('Error updating bucket:', error);
    } else {
      console.log('Bucket updated successfully.');
    }
  }
}

setup();
