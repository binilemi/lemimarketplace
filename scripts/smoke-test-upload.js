const fs = require('fs');
const path = require('path');
// use global fetch available in Node 18+
const { createClient } = require('@supabase/supabase-js');

function readEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

(async () => {
  const env = readEnv();
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Write a tiny 1x1 PNG file from base64 and send it as base64 to the server
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  const product = {
    name: `SMOKE TEST ${Date.now()}`,
    category: 'SmokeTest',
    price: 1.23,
    stock: 1,
    status: 'Active',
    featured: false,
    imageBase64: pngBase64,
    imageFilename: `smoke-${Date.now()}.png`,
    imageContentType: 'image/png',
  };

  console.log('Posting product + base64 image to local API...');
  const resp = await fetch('http://127.0.0.1:3000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  const json = await resp.json();
  console.log('API response:', resp.status, json);

  // Verify product exists via Supabase
  const { data: found, error: findErr } = await supabase.from('products').select('*').eq('name', product.name).limit(1);
  console.log('Verify product query error:', findErr);
  console.log('Verify product found:', found);

  process.exit(0);
})();
