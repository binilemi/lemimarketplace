#!/usr/bin/env python3
"""Direct Supabase data insertion via HTTP REST API"""

import requests
import json

SUPABASE_URL = "https://cywxjqjixgqhgvesqxbi.supabase.co"
SUPABASE_KEY = "sb_publishable_WYD2UZ91DN_YHK4RfMrLug_4tj1lOiv"

headers = {
    "apikey": SUPABASE_KEY,
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

# Insert admin credentials
admin_data = {
    "username": "lemi",
    "password": "1111"
}

print("📝 Inserting admin credentials...")
try:
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/admin_settings",
        headers=headers,
        json=admin_data
    )
    print(f"Admin insert status: {response.status_code}")
    if response.status_code > 300:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error inserting admin: {e}")

# Insert sample products
products = [
    {
        "name": "AirPulse X2",
        "category": "Electronics",
        "price": 199.99,
        "original_price": 299.99,
        "discount": 33,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        "status": "Active",
        "featured": True,
        "stock": 25
    },
    {
        "name": "Premium Cotton T-Shirt",
        "category": "Fashion",
        "price": 24.99,
        "original_price": 49.99,
        "discount": 50,
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        "status": "Active",
        "featured": True,
        "stock": 100
    },
    {
        "name": "Wireless Phone Charger",
        "category": "Electronics",
        "price": 29.99,
        "original_price": 59.99,
        "discount": 50,
        "image": "https://images.unsplash.com/photo-1589889971402-6851d9e88e42?w=500",
        "status": "Active",
        "featured": True,
        "stock": 50
    }
]

print("📦 Inserting sample products...")
for product in products:
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/products",
            headers=headers,
            json=product
        )
        print(f"  • {product['name']}: {response.status_code}")
        if response.status_code > 300:
            print(f"    Error: {response.text}")
    except Exception as e:
        print(f"  • {product['name']}: Error - {e}")

print("\n✅ Database setup complete!")
print("🎉 Your Ethio Market is ready:")
print("   📍 Customer site: http://localhost:3001")
print("   🔐 Admin panel: http://localhost:3001/admin")
print("   👤 Login: lemi / 1111")
