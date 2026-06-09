#!/bin/bash

# Supabase project details
SUPABASE_URL="https://cywxjqjixgqhgvesqxbi.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_WYD2UZ91DN_YHK4RfMrLug_4tj1lOiv"

# Create products table
curl -X POST "$SUPABASE_URL/rest/v1/sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS products (id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, name TEXT NOT NULL, category TEXT NOT NULL, price NUMERIC NOT NULL DEFAULT 0, original_price NUMERIC, discount NUMERIC DEFAULT 0, image TEXT, status TEXT DEFAULT '\''Active'\'', featured BOOLEAN DEFAULT false, stock NUMERIC DEFAULT 0, created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now());"
  }'

echo ""
echo "Creating admin_settings table..."

# Create admin_settings table  
curl -X POST "$SUPABASE_URL/rest/v1/sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS admin_settings (id BIGINT PRIMARY KEY DEFAULT 1, username TEXT DEFAULT '\''lemi'\'', password TEXT DEFAULT '\''1111'\'', created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now());"
  }'

echo ""
echo "Creating orders table..."

# Create orders table
curl -X POST "$SUPABASE_URL/rest/v1/sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS orders (id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, product_id BIGINT REFERENCES products(id) ON DELETE CASCADE, customer_name TEXT, customer_contact TEXT, quantity NUMERIC DEFAULT 1, total_price NUMERIC DEFAULT 0, payment_method TEXT DEFAULT '\''cash'\'', payment_screenshot_url TEXT, shipping_region TEXT, shipping_city TEXT, shipping_sub_city TEXT, shipping_address TEXT, notes TEXT, status TEXT DEFAULT '\''Pending'\'', created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now());"
  }'

echo ""
echo "Database setup complete!"
