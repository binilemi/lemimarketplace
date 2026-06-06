const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cywxjqjixgqhgvesqxbi.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5d3hqcWppeGdxaGd2ZXNxeGJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODI4NTUwMSwiZXhwIjoxNzU0NjkxNTAxfQ.1234567890'; // Service role key placeholder

async function setupDatabase() {
  try {
    console.log('Setting up Ethio Market database tables...\n');
    
    const sqlStatements = [
      // Create products table
      `CREATE TABLE IF NOT EXISTS products (
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
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        product_id BIGINT REFERENCES products(id),
        customer_name TEXT,
        customer_contact TEXT,
        status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Delivered', 'Cancelled')),
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );`
    ];

    // Try to execute each SQL statement via REST API
    for (const sql of sqlStatements) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
          },
          body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
          console.log('API method not available, using direct data insertion...');
        }
      } catch (e) {
        console.log('Attempting alternative setup method...');
      }
    }

    // Import Supabase client for data insertion
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert sample admin credentials
    console.log('Setting up admin credentials...');
    const { error: adminError } = await supabase
      .from('admin_settings')
      .upsert([{ id: 1, username: 'lemi', password: '1111' }], { onConflict: 'id' });

    if (!adminError) {
      console.log('✓ Admin credentials set (username: lemi, password: 1111)');
    } else {
      console.log('Note: Tables may need manual creation');
    }

    // Insert sample products
    console.log('Inserting sample products...');
    const sampleProducts = [
      {
        name: 'AirPulse X2',
        category: 'Electronics',
        price: 4200,
        original_price: 5999,
        discount: 30,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1517430816045-df4b7de11d1c?auto=format&fit=crop&w=900&q=80'
        ],
        description: 'Wireless earbuds with premium sound, powerful bass, and sleek Ethiopian-inspired design.',
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

    const { error: productsError } = await supabase
      .from('products')
      .insert(sampleProducts);

    if (!productsError) {
      console.log('✓ Sample products inserted');
    } else {
      console.log('Products table may need manual creation');
    }

    console.log('\n✅ Database setup complete!');
    console.log('You can now use the application with database persistence');

  } catch (error) {
    console.error('Error during setup:', error);
  }
}

setupDatabase();
