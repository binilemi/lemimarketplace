const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    if (key && value && process.env[key] == null) {
      process.env[key] = value;
    }
  });
}

loadDotEnv(path.resolve(__dirname, '../.env.local'));
loadDotEnv(path.resolve(__dirname, '../.env'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables.');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function main() {
  console.log('🔧 Creating Supabase storage bucket product-images...');

  const { data, error } = await supabase.storage.createBucket('product-images', {
    public: true,
  });

  if (error) {
    if (error.message?.toLowerCase().includes('already exists')) {
      console.log('✅ Bucket product-images already exists.');
      process.exit(0);
    }
    console.error('❌ Failed to create bucket:', error.message || error);
    process.exit(1);
  }

  console.log('✅ Bucket created successfully: product-images');
  console.log('You can now upload product images from the admin panel.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
