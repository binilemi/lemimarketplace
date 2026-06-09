'use client';

import React from 'react';
import { ArrowRight, ShoppingBag, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { categories as defaultCategories } from '../lib/data';
import { createClient as createBrowserClient } from '../utils/supabase/client';
import TelegramSection from '../components/TelegramSection';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

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

export default function HomePage() {
  const [allProducts, setAllProducts] = React.useState<ProductCard[]>([]);
  const [categoryOptions, setCategoryOptions] = React.useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [supabaseMessage, setSupabaseMessage] = React.useState<string>('');
  const [selectedProduct, setSelectedProduct] = React.useState<ProductCard | null>(null);
  const [cardImageIndex, setCardImageIndex] = React.useState<Record<number, number>>({});
  const [detailImageIndex, setDetailImageIndex] = React.useState(0);
  const [origin, setOrigin] = React.useState('');
  const productsSectionRef = React.useRef<HTMLElement | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  React.useEffect(() => {
    async function loadProducts() {
      try {
        console.log('[Homepage] Connecting to Supabase...');
        const supabase = createBrowserClient();
        const baseSelect = 'id,name,category,price,original_price,discount,image,status,featured';
        const optionalSelect = 'description,images';

        let response: any = await supabase
          .from('products')
          .select(`${baseSelect},${optionalSelect}`)
          .eq('status', 'Active')
          .order('featured', { ascending: false });

        if (response.error && response.error.code === '42703') {
          console.warn('[Homepage] Optional columns missing, retrying without images/description');
          response = await supabase
            .from('products')
            .select(baseSelect)
            .eq('status', 'Active')
            .order('featured', { ascending: false });
        }

        const { data, error } = response;

        if (error) {
          setSupabaseMessage(`❌ Supabase error (${error.code}): ${error.message}`);
          console.error('[Homepage] Supabase error:', error.code, error.message);
          return;
        }

        if (data?.length) {
          console.log(`[Homepage] Loaded ${data.length} products from Supabase`);
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
        } else {
          console.log('[Homepage] No active products found');
          setSupabaseMessage('No active products available yet.');
          setCategoryOptions(['All']);
          setAllProducts([]);
        }
      } catch (err) {
        setSupabaseMessage(`Error: ${String(err)}`);
        console.error('[Homepage] Exception:', err);
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
            <Link href="#categories" className="inline-flex items-center gap-2 rounded-3xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:-translate-y-0.5">
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
                onClick={() => {
                  setActiveCategory(categoryName);
                  productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {categoryName}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section ref={productsSectionRef} id="products" className="mx-auto max-w-5xl px-6 pb-16">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.30em] text-cyan-300">Products by category</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">All products in {activeCategory === 'All' ? 'every category' : activeCategory}.</h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-10 text-center text-slate-300 shadow-glass backdrop-blur-xl">
            <p className="text-lg font-semibold text-white">No products available right now.</p>
            <p className="mt-3 text-sm">{supabaseMessage || 'Check back later or update inventory through the admin dashboard.'}</p>
          </div>
        ) : (
          Object.entries(groupedProducts).map(([categoryName, items]) => (
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
                      onClick={() => router.push(`/product/${product.id}`)}
                      className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-glass backdrop-blur-xl transition"
                    >
                      <div className="relative overflow-hidden">
                        <img src={currentImage} alt={product.name} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-56 md:h-64" />
                        <span className="absolute left-3 top-3 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300 sm:text-sm">{product.discount}% off</span>
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
                      <div className="space-y-4 p-4 sm:p-5">
                        <div>
                          <h4 className="text-xl font-semibold sm:text-2xl">{product.name}</h4>
                          <p className="mt-2 text-sm text-slate-400">{product.category}</p>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xl font-bold text-white sm:text-2xl">{product.price} ETB</p>
                            <p className="text-sm text-slate-500 line-through">{product.originalPrice} ETB</p>
                          </div>
                          <Link
                            href={`/product/${product.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex items-center gap-2 rounded-3xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                          >
                            Detail
                            <ShoppingBag size={18} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {selectedProduct ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/95 p-4 shadow-glow sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-4 sm:grid-cols-[120px_1fr] sm:items-start">
              <img
                src={selectedProduct.images?.[detailImageIndex] ?? selectedProduct.image}
                alt={selectedProduct.name}
                className="h-36 w-full rounded-[1.5rem] object-cover sm:h-52"
              />
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{selectedProduct.category}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{selectedProduct.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{selectedProduct.description}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold text-white sm:text-2xl">{selectedProduct.price} ETB</p>
                    {selectedProduct.originalPrice ? (
                      <p className="text-sm text-slate-500 line-through">{selectedProduct.originalPrice} ETB</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/product/${selectedProduct.id}`}
                      className="inline-flex items-center gap-2 rounded-3xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      Order now
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <TelegramSection />
      <Footer />
    </main>
  );
}
