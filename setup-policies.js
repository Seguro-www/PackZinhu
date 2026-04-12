import { Client } from 'pg';

const connectionString = 'postgresql://postgres:5rAV9fwkbP02GYUo@db.usdzlpaletfbvvhkvaki.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function setup() {
  await client.connect();
  console.log('Connected to Postgres');

  const sql = `
    -- Allow public uploads to the 'media' bucket
    CREATE POLICY "Public Uploads"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'media' );

    -- Allow public updates to the 'media' bucket
    CREATE POLICY "Public Updates"
    ON storage.objects FOR UPDATE
    USING ( bucket_id = 'media' );

    -- Allow public deletes from the 'media' bucket
    CREATE POLICY "Public Deletes"
    ON storage.objects FOR DELETE
    USING ( bucket_id = 'media' );

    -- Allow public reads from the 'media' bucket
    CREATE POLICY "Public Reads"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'media' );
  `;

  try {
    await client.query(sql);
    console.log('Policies created successfully');
  } catch (err) {
    console.error('Error creating policies:', err);
  } finally {
    await client.end();
  }
}

setup();
