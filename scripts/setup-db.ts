import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cywxjqjixgqhgvesqxbi.supabase.co';

// Try with service role key - you may need to add SUPABASE_SERVICE_ROLE_KEY to your .env.local
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.log('\nTo create tables, add your service role key to .env.local:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here\n');
  console.log('You can find this key in your Supabase dashboard:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Sign in with your email/password or GitHub');
  console.log('3. Select project "cywxjqjixgqhgvesqxbi"');
  console.log('4. Go to Settings > API');
  console.log('5. Copy the "service_role" secret key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function createTablesViaSql() {
  try {
    console.log('🚀 Setting up Ethio Market database tables...\n');

    // Execute multiple SQL statements
    const sqlStatements = [
      // Drop existing sequences if they exist
      `DROP SEQUENCE IF EXISTS products_id_seq CASCADE;`,
      `DROP SEQUENCE IF EXISTS orders_id_seq CASCADE;`,
      
      // Create sequences
      `CREATE SEQUENCE products_id_seq START 1;`,
      `CREATE SEQUENCE orders_id_seq START 1;`,
      
      // Create products table
      `CREATE TABLE IF NOT EXISTS products (
        id BIGINT PRIMARY KEY DEFAULT nextval('products_id_seq'),
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price NUMERIC NOT NULL DEFAULT 0,
        original_price NUMERIC,
        discount NUMERIC DEFAULT 0,
        image TEXT,
        status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Draft', 'Hidden')),
        featured BOOLEAN DEFAULT false,
        stock NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );`,
      
      // Create admin_settings table
      `CREATE TABLE IF NOT EXISTS admin_settings (
        id BIGINT PRIMARY KEY DEFAULT 1,
        username TEXT DEFAULT 'lemi',
        password TEXT DEFAULT '1111',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );`,
      
      // Create orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id BIGINT PRIMARY KEY DEFAULT nextval('orders_id_seq'),
        product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
        customer_name TEXT,
        customer_contact TEXT,
        status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Delivered', 'Cancelled')),
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`,
      `CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`,
    ];

    let successCount = 0;
    
    for (const statement of sqlStatements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error && !statement.includes('DROP')) {
          console.warn(`⚠️  ${statement.substring(0, 40)}... - ${error.message}`);
        } else {
          successCount++;
          console.log(`✓ ${statement.substring(0, 50)}...`);
        }
      } catch (e: any) {
        if (!statement.includes('DROP')) {
          console.warn(`⚠️  SQL execution: ${e.message}`);
        }
      }
    }

    // Insert default admin credentials
    console.log('\n📝 Inserting default admin credentials...');
    const { error: adminError } = await supabase
      .from('admin_settings')
      .upsert([{ id: 1, username: 'lemi', password: '1111' }], { onConflict: 'id' });

    if (!adminError) {
      console.log('✓ Admin: lemi / 1111');
    } else {
      console.log(`Admin setup: ${adminError.message}`);
    }

    // Insert sample products
    console.log('\n📦 Inserting sample products...');
    const sampleProducts = [
      {
        name: 'AirPulse X2',
        category: 'Electronics',
        price: 4200,
        original_price: 5999,
        discount: 30,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
        status: 'Active',
        featured: true,
        stock: 15
      },
      {
        name: 'Premium Cotton T-Shirt',
        category: 'Fashion',
        price: 450,
        original_price: 599,
        discount: 25,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
        status: 'Active',
        featured: false,
        stock: 50
      },
      {
        name: 'Wireless Phone Charger',
        category: 'Electronics',
        price: 890,
        original_price: 1299,
        discount: 31,
        image: 'https://images.unsplash.com/photo-1591290621749-2511cc4e3999?auto=format&fit=crop&w=900&q=80',
        status: 'Active',
        featured: true,
        stock: 25
      }
    ];

    const { error: productsError, data } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();

    if (!productsError && data) {
      console.log(`✓ Inserted ${data.length} sample products`);
      data.forEach((p: any) => console.log(`  - ${p.name} (${p.category})`));
    } else if (productsError) {
      console.log(`Products insert: ${productsError.message}`);
    }

    console.log('\n✅ Database setup complete!');
    console.log('\nYou can now:');
    console.log('1. Visit http://localhost:3001 for the customer storefront');
    console.log('2. Visit http://localhost:3001/admin for the admin panel');
    console.log('3. Login with: username=lemi, password=1111');

  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
  }
}

// Main execution
createTablesViaSql();
