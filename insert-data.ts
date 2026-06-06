import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cywxjqjixgqhgvesqxbi.supabase.co';
const supabaseKey = 'sb_publishable_WYD2UZ91DN_YHK4RfMrLug_4tj1lOiv';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupData() {
  console.log('🚀 Setting up Ethio Market sample data...\n');

  try {
    // Insert default admin credentials
    console.log('📝 Setting up admin account...');
    const { error: adminError } = await supabase
      .from('admin_settings')
      .upsert([{ id: 1, username: 'lemi', password: '1111' }], { onConflict: 'id' });

    if (!adminError) {
      console.log('✓ Admin account: lemi / 1111\n');
    } else {
      console.log(`⚠️  Admin setup: ${adminError.message}\n`);
    }

    // Insert sample products
    console.log('📦 Inserting sample products...');
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

    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();

    if (!productsError && products) {
      console.log(`✓ Inserted ${products.length} sample products:`);
      products.forEach(p => console.log(`  - ${p.name} (${p.category})`));
    } else if (productsError) {
      console.log(`⚠️  Products insert: ${productsError.message}`);
    }

    console.log('\n✅ Database setup complete!');
    console.log('\n🎉 Your Ethio Market is ready:');
    console.log('   📍 Customer site: http://localhost:3001');
    console.log('   🔐 Admin panel: http://localhost:3001/admin');
    console.log('   👤 Login: lemi / 1111');
    console.log('\nRun "npm run dev" to start the server!\n');

  } catch (error: any) {
    console.error('❌ Error:', error?.message || error);
  }
}

setupData();
