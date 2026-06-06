import { Client } from 'pg';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const projectId = 'cywxjqjixgqhgvesqxbi';
const host = `db.${projectId}.supabase.co`;

async function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupDatabase() {
  try {
    console.log('\n🗄️  Ethio Market - Supabase Database Setup\n');

    // Get database password
    const password = await askQuestion(
      'Enter your Supabase database password (found in project settings): '
    );
    rl.close();

    if (!password) {
      console.error('❌ Password is required');
      process.exit(1);
    }

    const client = new Client({
      host,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password,
    });

    await client.connect();
    console.log('\n✓ Connected to Supabase database\n');

    // Create products table
    console.log('Creating products table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price NUMERIC NOT NULL DEFAULT 0,
        original_price NUMERIC,
        discount NUMERIC DEFAULT 0,
        image TEXT,
        images TEXT[],
        description TEXT,
        status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Draft', 'Hidden')),
        featured BOOLEAN DEFAULT false,
        stock NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);

    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;`);
    console.log('✓ Products table created');

    // Create admin_settings table
    console.log('Creating admin_settings table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id BIGINT PRIMARY KEY DEFAULT 1,
        username TEXT DEFAULT 'lemi',
        password TEXT DEFAULT '1111',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('✓ Admin settings table created');

    // Create orders table
    console.log('Creating orders table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
        customer_name TEXT,
        customer_contact TEXT,
        status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Delivered', 'Cancelled')),
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('✓ Orders table created');

    // Create indexes
    console.log('Creating indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
    console.log('✓ Indexes created');

    // Insert default admin credentials
    console.log('\nInserting admin credentials...');
    await client.query(
      `INSERT INTO admin_settings (id, username, password) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET username = $2, password = $3;`,
      [1, 'lemi', '1111']
    );
    console.log('✓ Admin: lemi / 1111');

    // Insert sample products
    console.log('\nInserting sample products...');
    const products = [
      [
        'AirPulse X2',
        'Electronics',
        4200,
        5999,
        30,
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
        'Active',
        true,
        15,
      ],
      [
        'Premium Cotton T-Shirt',
        'Fashion',
        450,
        599,
        25,
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
        'Active',
        false,
        50,
      ],
      [
        'Wireless Phone Charger',
        'Electronics',
        890,
        1299,
        31,
        'https://images.unsplash.com/photo-1591290621749-2511cc4e3999?auto=format&fit=crop&w=900&q=80',
        'Active',
        true,
        25,
      ],
    ];

    for (const product of products) {
      await client.query(
        `INSERT INTO products (name, category, price, original_price, discount, image, status, featured, stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
        product
      );
    }
    console.log('✓ Inserted 3 sample products');

    // Enable RLS
    console.log('\nEnabling RLS policies...');
    await client.query(`ALTER TABLE products ENABLE ROW LEVEL SECURITY;`);
    await client.query(`ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;`);
    await client.query(`ALTER TABLE orders ENABLE ROW LEVEL SECURITY;`);

    // Create RLS policies for anon access (public read, authenticated write)
    await client.query(`
      CREATE POLICY "Enable read access for all users" ON products
        FOR SELECT USING (true);
    `);
    await client.query(`
      CREATE POLICY "Enable read access for all users" ON admin_settings
        FOR SELECT USING (true);
    `);
    await client.query(`
      CREATE POLICY "Enable insert for all users" ON products
        FOR INSERT WITH CHECK (true);
    `);
    await client.query(`
      CREATE POLICY "Enable update for all users" ON products
        FOR UPDATE USING (true) WITH CHECK (true);
    `);
    await client.query(`
      CREATE POLICY "Enable delete for all users" ON products
        FOR DELETE USING (true);
    `);

    console.log('✓ RLS policies created');

    await client.end();

    console.log('\n✅ Database setup complete!\n');
    console.log('📊 Tables created: products, admin_settings, orders');
    console.log('👤 Admin credentials: lemi / 1111');
    console.log('📦 Sample products: 3 inserted\n');
    console.log('🚀 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Visit: http://localhost:3001');
    console.log('   3. Admin: http://localhost:3001/admin (lemi/1111)\n');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
