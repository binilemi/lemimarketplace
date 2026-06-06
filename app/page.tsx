'use client';

import React from 'react';
import { ArrowRight, Cpu, Shirt, Smartphone, Star, Zap, ShoppingBag, Send } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { categories as defaultCategories, featuredProducts as fallbackProducts } from '../lib/data';
import { createClient as createBrowserClient } from '../utils/supabase/client';
import TelegramSection from '../components/TelegramSection';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const iconMap = {
  Smartphone: <Smartphone size={24} />,
  Shirt: <Shirt size={24} />,
  Cpu: <Cpu size={24} />,
  Star: <Star size={24} />,
  Zap: <Zap size={24} />,
};

type ProductCard = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  images?: string[];
  description?: string;
  featured: boolean;
};

function formatTelegramLink(product: ProductCard, origin: string) {
  const productUrl = origin ? `${origin}/?product=${encodeURIComponent(product.name)}` : `/?product=${encodeURIComponent(product.name)}`;
  const message = encodeURIComponent(
    `Hello, I want to order:\n` +
      `Product: ${product.name}\n` +
      `Price: ${product.price} ETB\n` +
      `Image: ${product.images?.[0] ?? product.image}\n` +
      `Link: ${productUrl}`,
  );
  return `https://t.me/leonmsgn?text=${message}`;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = React.useState<ProductCard[]>(fallbackProducts);
  const [allProducts, setAllProducts] = React.useState<ProductCard[]>(fallbackProducts);
  const [categoryOptions, setCategoryOptions] = React.useState<string[]>(['All', ...defaultCategories.map((category) => category.title)]);
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [supabaseMessage, setSupabaseMessage] = React.useState<string>('');
  const [selectedProduct, setSelectedProduct] = React.useState<ProductCard | null>(null);
  const [cardImageIndex, setCardImageIndex] = React.useState<Record<number, number>>({});
  const [detailImageIndex, setDetailImageIndex] = React.useState(0);
  const [origin, setOrigin] = React.useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const categoryIconMap = {
    Electronics: <Smartphone size={24} />,
    Fashion: <Shirt size={24} />,
    Gaming: <Cpu size={24} />,
    Accessories: <Star size={24} />,
    Phones: <Zap size={24} />,
  } as const;

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const supabase = createBrowserClient();
        const baseSelect = 'id,name,category,price,original_price,discount,image,status,featured';
        const optionalSelect = 'description,images';

        let response: any = await supabase
          .from('products')
          .select(`${baseSelect},${optionalSelect}`)
          .eq('status', 'Active')
          .order('featured', { ascending: false });

        if (response.error && response.error.code === '42703') {
          console.warn('Optional product columns missing, retrying without images/description:', response.error.message);
          response = await supabase
            .from('products')
            .select(baseSelect)
            .eq('status', 'Active')
            .order('featured', { ascending: false });
        }

        const { data, error } = response;

        if (error) {
          setSupabaseMessage('Unable to load products from Supabase. Showing fallback data.');
          console.warn(error);
          return;
        }

        if (data?.length) {
          const products: ProductCard[] = data.map((item: any) => {
            const providedImages = Array.isArray(item.images)
              ? item.images.filter(Boolean)
              : item.images
              ? [item.images]
              : [];
            const defaultImage =
              item.image ||
              providedImages[0] ||
              'https://images.unsplash.com/photo-1510557880182-3ddba4b9d491?auto=format&fit=crop&w=900&q=80';

            return {
              id: item.id,
              name: item.name,
              category: item.category || 'Uncategorized',
              price: item.price ?? 0,
              originalPrice: item.original_price ?? item.price ?? 0,
              discount: item.discount ?? 0,
              image: defaultImage,
              images: providedImages.length > 0 ? providedImages : [defaultImage],
              description:
                item.description ||
                'A premium product selected for fast ordering, quality, and excellent value for Ethiopian shoppers.',
              featured: item.featured ?? false,
            };
          });

          const uniqueCategories = Array.from(new Set(products.map((product) => product.category || 'Uncategorized')));
          setCategoryOptions(['All', ...uniqueCategories]);
          setAllProducts(products);

          const featured = products.filter((product) => product.featured);
          setFeaturedProducts(featured.length > 0 ? featured.slice(0, 3) : products.slice(0, 3));
        }
      } catch (err) {
        setSupabaseMessage('Unable to load products. Showing fallback data.');
        console.error(err);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = activeCategory === 'All' ? allProducts : allProducts.filter((product) => product.category === activeCategory);

  const groupedProducts = filteredProducts.reduce<Record<string, ProductCard[]>>((groups, product) => {
    const category = product.category || 'Uncategorized';
    groups[category] = groups[category] || [];
    groups[category].push(product);
    return groups;
  }, {});

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_30%),linear-gradient(180deg,_#050816_0%,_#0b1223_100%)] text-white">
      <Navbar />
      <section className="mx-auto flex min-h-[88vh] max-w-5xl flex-col justify-center px-6 py-10 lg:flex-row lg:items-center lg:gap-16" id="home">
        <div className="w-full lg:w-6/12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" /> Trending products in Ethiopia
          </div>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            Buy Trending Products Easily in Ethiopia
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }} className="mt-6 max-w-xl text-base text-slate-300 sm:text-lg">
            Curated premium products, fast ordering through Telegram, and bold modern design for shoppers and business owners.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }} className="mt-8 flex flex-wrap gap-3">
            <Link href="#featured" className="inline-flex items-center gap-2 rounded-3xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:-translate-y-0.5">
              Shop Now
              <ArrowRight size={16} />
            </Link>
            <a href="https://t.me/leonmsgn" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10">
              Contact on Telegram
              <Send size={16} />
            </a>
          </motion.div>
          {supabaseMessage ? <p className="mt-4 text-sm text-amber-300">{supabaseMessage}</p> : null}
        </div>

      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16" id="categories">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.30em] text-cyan-300">Explore Categories</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Shop by category.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {categoryOptions.map((categoryName) => (
              <button
                key={categoryName}
                type="button"
                className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                  activeCategory === categoryName
                    ? 'bg-cyan-400 text-slate-950'
                    : 'border border-white/10 bg-slate-950/80 text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveCategory(categoryName)}
              >
                {categoryName}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categoryOptions.slice(1).map((categoryName) => {
            const defaultCategory = defaultCategories.find((category) => category.title === categoryName);
            const description = defaultCategory?.description ?? `Explore ${categoryName} products`;
            const icon = categoryIconMap[categoryName as keyof typeof categoryIconMap] ?? <Star size={24} />;

            return (
              <motion.div key={categoryName} whileHover={{ y: -8 }} className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-glass backdrop-blur-xl transition">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 shadow-lg shadow-cyan-500/5">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold">{categoryName}</h3>
                <p className="mt-3 text-sm text-slate-400">{description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-5xl px-6 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.30em] text-cyan-300">Featured Products</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Trending items ready to order.</h2>
          </div>
        </div>

        {selectedProduct ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                <div className="w-full lg:w-7/12">
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90">
                    <img
                      src={selectedProduct.images?.[detailImageIndex] ?? selectedProduct.image}
                      alt={selectedProduct.name}
                      className="h-80 w-full object-cover sm:h-[28rem]"
                    />
                    {selectedProduct.images && selectedProduct.images.length > 1 ? (
                      <div className="absolute inset-x-0 top-1/2 flex items-center justify-between px-4">
                        <button
                          type="button"
                          onClick={() => setDetailImageIndex((current) => (current - 1 + selectedProduct.images!.length) % selectedProduct.images!.length)}
                          className="rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailImageIndex((current) => (current + 1) % selectedProduct.images!.length)}
                          className="rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                        >
                          ›
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {selectedProduct.images?.map((image, index) => (
                      <button
                        key={`${selectedProduct.id}-thumb-${index}`}
                        type="button"
                        onClick={() => setDetailImageIndex(index)}
                        className={`overflow-hidden rounded-3xl border p-1 transition ${index === detailImageIndex ? 'border-cyan-400' : 'border-white/10'}`}
                      >
                        <img src={image} alt={`${selectedProduct.name} ${index + 1}`} className="h-20 w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-6 lg:w-5/12">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Product details</p>
                      <h3 className="mt-3 text-3xl font-semibold text-white">{selectedProduct.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/90 p-5">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Category</p>
                    <p className="text-lg font-semibold text-white">{selectedProduct.category}</p>
                    <p className="text-sm leading-7 text-slate-300">{selectedProduct.description}</p>
                  </div>

                  <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/90 p-5">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Price</p>
                    <p className="text-3xl font-bold text-white">{selectedProduct.price} ETB</p>
                    <p className="text-sm text-slate-500 line-through">{selectedProduct.originalPrice} ETB</p>
                  </div>

                  <a
                    href={formatTelegramLink(selectedProduct, origin)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Order now
                    <ShoppingBag size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => {
            const images = product.images?.length ? product.images : [product.image];
            const currentIndex = cardImageIndex[product.id] ?? 0;
            const currentImage = images[currentIndex] ?? product.image;

            return (
              <motion.div
                key={product.id}
                whileHover={{ y: -6 }}
                onClick={() => {
                  setSelectedProduct(product);
                  setDetailImageIndex(0);
                }}
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-glass backdrop-blur-xl transition"
              >
                <div className="relative overflow-hidden">
                  <img src={currentImage} alt={product.name} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">{product.discount}% off</span>
                  {images.length > 1 ? (
                    <div className="absolute inset-x-0 top-1/2 flex items-center justify-between px-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setCardImageIndex((state) => ({
                            ...state,
                            [product.id]: (currentIndex - 1 + images.length) % images.length,
                          }));
                        }}
                        className="rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setCardImageIndex((state) => ({
                            ...state,
                            [product.id]: (currentIndex + 1) % images.length,
                          }));
                        }}
                        className="rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                      >
                        ›
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <h3 className="text-2xl font-semibold">{product.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">{product.category}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-2xl font-bold text-white">{product.price} ETB</p>
                      <p className="text-sm text-slate-500 line-through">{product.originalPrice} ETB</p>
                    </div>
                    <a
                      href={formatTelegramLink(product, origin)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-2 rounded-3xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      Order now
                      <ShoppingBag size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.30em] text-cyan-300">Products by category</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">All products in {activeCategory === 'All' ? 'every category' : activeCategory}.</h2>
        </div>

        {Object.entries(groupedProducts).map(([categoryName, items]) => (
          <div key={categoryName} className="mb-12">
            <div className="mb-6 flex items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-glass backdrop-blur-xl">
              <div>
                <p className="text-sm uppercase tracking-[0.30em] text-cyan-300">{categoryName}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{items.length} item{items.length === 1 ? '' : 's'}</h3>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => {
                const images = product.images?.length ? product.images : [product.image];
                const currentIndex = cardImageIndex[product.id] ?? 0;
                const currentImage = images[currentIndex] ?? product.image;

                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -6 }}
                    onClick={() => {
                      setSelectedProduct(product);
                      setDetailImageIndex(0);
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-glass backdrop-blur-xl transition"
                  >
                    <div className="relative overflow-hidden">
                      <img src={currentImage} alt={product.name} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-64" />
                      <span className="absolute left-4 top-4 rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">{product.discount}% off</span>
                      {images.length > 1 ? (
                        <div className="absolute inset-x-0 top-1/2 flex items-center justify-between px-3">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setCardImageIndex((state) => ({
                                ...state,
                                [product.id]: (currentIndex - 1 + images.length) % images.length,
                              }));
                            }}
                            className="rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setCardImageIndex((state) => ({
                                ...state,
                                [product.id]: (currentIndex + 1) % images.length,
                              }));
                            }}
                            className="rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                          >
                            ›
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-4 p-5">
                      <div>
                        <h4 className="text-2xl font-semibold">{product.name}</h4>
                        <p className="mt-2 text-sm text-slate-400">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-2xl font-bold text-white">{product.price} ETB</p>
                          <p className="text-sm text-slate-500 line-through">{product.originalPrice} ETB</p>
                        </div>
                        <a
                          href={formatTelegramLink(product, origin)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex items-center gap-2 rounded-3xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                          Order now
                          <ShoppingBag size={18} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <TelegramSection />
      <Footer />
    </main>
  );
}
