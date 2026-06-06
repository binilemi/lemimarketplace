import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cywxjqjixgqhgvesqxbi.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_WYD2UZ91DN_YHK4RfMrLug_4tj1lOiv';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role key if available, otherwise anon key
const KEY = SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupData() {
  console.log('🚀 Setting up Ethio Market data...\n');

  try {
    // 1. Insert admin credentials
    console.log('📝 Setting up admin account...');
    const { error: adminError } = await supabase
      .from('admin_settings')
      .upsert(
        {
          id: 1,
          username: 'lemi',
          password: '1111',
        },
        { onConflict: 'id' }
      );

    if (adminError) {
      console.warn(`⚠️  Admin setup: ${adminError.message}`);
    } else {
      console.log('✅ Admin credentials inserted successfully');
    }

    // 2. Insert sample products
    console.log('\n📦 Inserting sample products...');
    const products = [
      {
        name: 'AirPulse X2',
        category: 'Electronics',
        price: 199.99,
        original_price: 299.99,
        discount: 33,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        status: 'Active',
        featured: true,
        stock: 25,
      },
      {
        name: 'Premium Cotton T-Shirt',
        category: 'Fashion',
        price: 24.99,
        original_price: 49.99,
        discount: 50,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        status: 'Active',
        featured: true,
        stock: 100,
      },
      {
        name: 'Wireless Phone Charger',
        category: 'Electronics',
        price: 29.99,
        original_price: 59.99,
        discount: 50,
        image: 'https://images.unsplash.com/photo-1589889971402-6851d9e88e42?w=500',
        status: 'Active',
        featured: true,
        stock: 50,
      },
    ];

    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .upsert([product], { onConflict: 'name' });

      if (error) {
        console.warn(`  ⚠️  ${product.name}: ${error.message}`);
      } else {
        console.log(`  ✅ ${product.name}: inserted`);
      }
    }

    console.log('\n✅ Database setup complete!');
    console.log('\n🎉 Your Ethio Market is ready:');
    console.log('   📍 Customer site: http://localhost:3002');
    console.log('   🔐 Admin panel: http://localhost:3002/admin');
    console.log('   👤 Login: lemi / 1111');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupData();
