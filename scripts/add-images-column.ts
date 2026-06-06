import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

async function addImagesColumn() {
  try {
    console.log('Adding images and description columns to products table...\n');
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // First, try a simple query to see if the images column exists
    console.log('Checking if images column exists...');
    const { data, error: checkError } = await supabase
      .from('products')
      .select('id, images')
      .limit(1);

    if (!checkError) {
      console.log('✓ Images column already exists!');
      return;
    }

    // If column doesn't exist, we need to add it via RPC or direct SQL
    // Since we can't run raw SQL directly from the client, we'll try to insert a product
    // with the images field to trigger the schema to be updated or get a clear error
    
    console.log('Images column not found. Adding it now...');
    
    // Try to add the column by attempting an insert with the images field
    // This will fail with a schema error, but we'll know it needs to be added
    const { data: products, error: selectError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('Error querying products:', selectError);
      process.exit(1);
    }

    console.log('✓ Products table is accessible');
    console.log('Note: To add the images and description columns, please:');
    console.log('');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the following SQL:');
    console.log('');
    console.log(`ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images TEXT[],
  ADD COLUMN IF NOT EXISTS description TEXT;`);
    console.log('');
    console.log('After running this SQL, restart the development server.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addImagesColumn();
