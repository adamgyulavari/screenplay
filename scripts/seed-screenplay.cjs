/**
 * Seed a screenplay into Supabase for a user.
 * Run with env from .env.local: yarn seed -- <path-to-screenplay.json> <user-email>
 *
 * Env: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 * JSON format: array of { role, text } or object { title?, author?, content: [...] }
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const jsonPath = process.argv[2];
  const userEmail = process.argv[3];

  if (!jsonPath || !userEmail) {
    console.error('Usage: node scripts/seed-screenplay.cjs <path-to-screenplay.json> <user-email>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), jsonPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error('File not found:', resolvedPath);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  const content = Array.isArray(raw) ? raw : raw.content;
  const title = Array.isArray(raw) ? 'My screenplay' : (raw.title || 'My screenplay');
  const author = Array.isArray(raw) ? null : (raw.author ?? null);

  if (!Array.isArray(content) || content.some((item) => !item.role || item.text === undefined)) {
    console.error('JSON must be an array of { role, text } or an object with content: [...].');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY. Run with: yarn seed -- <json> <email>');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  const user = users.find((u) => u.email?.toLowerCase() === userEmail.toLowerCase());
  if (!user) {
    console.error('No user found with email:', userEmail);
    console.error('Sign in once with Google so the user exists, then run this script.');
    process.exit(1);
  }

  const { data, error } = await supabase
    .from('screenplays')
    .insert({
      owner_id: user.id,
      title,
      author,
      content,
    })
    .select('id, title')
    .single();

  if (error) {
    console.error('Insert failed:', error.message);
    process.exit(1);
  }

  console.log('Seeded screenplay:', data.title, '(id:', data.id, ')');
}

main();
