const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const rawEnv = fs.readFileSync(envPath, 'utf8');
  rawEnv.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, '').replace(/\.supabase\.co.*$/, '') || 'cywxjqjixgqhgvesqxbi';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${projectId}.supabase.co`;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_WYD2UZ91DN_YHK4RfMrLug_4tj1lOiv';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in environment or .env.local');
  process.exit(1);
}

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = `https://cywxjqjixgqhgvesqxbi.supabase.co/rest/v1/sql`;
    const data = JSON.stringify({ query: sql });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'apikey': anonKey,
        'Authorization': `Bearer ${serviceKey}`,
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function setupDB() {
  console.log('🚀 Setting up Ethio Market database tables...\n');

  const tables = [
    `CREATE TABLE IF NOT EXISTS public.products (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price NUMERIC NOT NULL DEFAULT 0,
      original_price NUMERIC,
      discount NUMERIC DEFAULT 0,
      image TEXT,
      status TEXT DEFAULT 'Active',
      featured BOOLEAN DEFAULT false,
      stock NUMERIC DEFAULT 0,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )`,
    
    `CREATE TABLE IF NOT EXISTS public.admin_settings (
      id BIGINT PRIMARY KEY DEFAULT 1,
      username TEXT DEFAULT 'lemi',
      password TEXT DEFAULT '1111',
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )`,
    
    `CREATE TABLE IF NOT EXISTS public.orders (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
      customer_name TEXT,
      customer_contact TEXT,
      quantity NUMERIC DEFAULT 1,
      total_price NUMERIC DEFAULT 0,
      payment_method TEXT DEFAULT 'cash',
      payment_screenshot_url TEXT,
      shipping_region TEXT,
      shipping_city TEXT,
      shipping_sub_city TEXT,
      shipping_address TEXT,
      notes TEXT,
      status TEXT DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )`
  ];

  for (const sql of tables) {
    try {
      console.log('Executing SQL...');
      const result = await executeSQL(sql);
      console.log('✓ Table created successfully\n');
    } catch (err) {
      console.error('✗ Error:', err.message, '\n');
    }
  }

  const orderColumns = [
    `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 1;`,
    `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;`,
    `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';`,
    `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;`,
    `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_region TEXT;`,
    `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;`,
    `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_sub_city TEXT;`,
    `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;`,
    `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;`,
    `ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'Pending';`
  ];

  for (const sql of orderColumns) {
    try {
      console.log('Executing orders schema update...');
      await executeSQL(sql);
      console.log('✓ Orders column updated successfully\n');
    } catch (err) {
      console.error('✗ Error updating orders schema:', err.message, '\n');
    }
  }

  console.log('✅ Database setup complete!');
}

setupDB();
