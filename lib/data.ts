export const categories = [
  {
    title: 'Electronics',
    description: 'Smart home and mobile essentials for modern living.',
    icon: 'Smartphone',
  },
  {
    title: 'Fashion',
    description: 'Premium apparel and accessories with luxury style.',
    icon: 'Shirt',
  },
  {
    title: 'Gaming',
    description: 'Headsets, controllers, and must-have gear.',
    icon: 'Cpu',
  },
  {
    title: 'Accessories',
    description: 'Curated add-ons for every look and lifestyle.',
    icon: 'Star',
  },
  {
    title: 'Phones',
    description: 'Latest handsets with top specs and elegant design.',
    icon: 'Zap',
  },
];

export const featuredProducts = [
  {
    id: 1,
    name: 'AirPulse X2',
    category: 'Electronics',
    price: 4500,
    originalPrice: 5200,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1510557880182-3ddba4b9d491?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3ddba4b9d491?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517430816045-df4b7de11d1c?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Premium earbuds with a strong bass profile, ergonomic design, and fast Telegram ordering support.',
    featured: true,
  },
  {
    id: 2,
    name: 'NovaFit Sneakers',
    category: 'Shoes',
    price: 3800,
    originalPrice: 4500,
    discount: 16,
    image: 'https://images.unsplash.com/photo-1528701800489-2f6074e0d5d2?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1528701800489-2f6074e0d5d2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1528701800489-2f6074e0d5d2?auto=format&fit=crop&w=900&q=80&sat=-30',
    ],
    description: 'Designed for everyday comfort and modern Ethiopian street style with premium finishing.',
    featured: true,
  },
  {
    id: 3,
    name: 'Vivid Echo Headset',
    category: 'Gaming',
    price: 2950,
    originalPrice: 3600,
    discount: 18,
    image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=80&sat=-20',
    ],
    description: 'A gaming headset built for comfort, crisp voice calls, and immersive audio during long sessions.',
    featured: true,
  },
];

export type ProductItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  featured: boolean;
  image?: string;
  images?: string[];
  description?: string;
  originalPrice?: number;
  discount?: number;
};

export const productSeed: ProductItem[] = [
  {
    id: 101,
    name: 'AirPulse X2',
    category: 'Electronics',
    price: 4500,
    stock: 12,
    status: 'Active',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1510557880182-3ddba4b9d491?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Premium earbuds with balanced sound and fast ordering via Telegram.',
  },
  {
    id: 102,
    name: 'NovaFit Sneakers',
    category: 'Shoes',
    price: 3800,
    stock: 8,
    status: 'Active',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1528701800489-2f6074e0d5d2?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'A stylish shoe built for comfort and durable everyday wear.',
  },
  {
    id: 103,
    name: 'Vivid Echo Headset',
    category: 'Gaming',
    price: 2950,
    stock: 4,
    status: 'Pending',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'A powerful headset with crisp audio and a lightweight frame.',
  },
];
