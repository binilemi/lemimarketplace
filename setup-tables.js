const https = require('https');

const projectId = 'cywxjqjixgqhgvesqxbi';
const anonKey = 'sb_publishable_WYD2UZ91DN_YHK4RfMrLug_4tj1lOiv';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5d3hqcWppeGdxaGd2ZXNxeGJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODI4NTUwMSwiZXhwIjoxNzU0NjkxNTAxfQ.1234567890';

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

  console.log('✅ Database setup complete!');
}

setupDB();
