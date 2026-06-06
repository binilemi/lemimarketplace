'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Box, CheckCircle2, Edit, Layers, LogOut, MessageCircle, Plus, Search, Settings, Trash2, User } from 'lucide-react';
import { createClient as createBrowserClient } from '../../utils/supabase/client';
import { productSeed, type ProductItem } from '../../lib/data';

const STORAGE_KEY = 'ethio-admin-settings';
const DEFAULT_USERNAME = 'lemi';
const DEFAULT_PASSWORD = '1111';

function getStoredSettings() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { username: string; password: string };
  } catch {
    return null;
  }
}

async function fileToBase64(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export default function AdminPage() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [authenticated, setAuthenticated] = React.useState(false);
  const [adminUsername, setAdminUsername] = React.useState(DEFAULT_USERNAME);
  const [adminPassword, setAdminPassword] = React.useState(DEFAULT_PASSWORD);
  const [activeView, setActiveView] = React.useState<'dashboard' | 'products' | 'orders' | 'settings'>('dashboard');
  const [products, setProducts] = React.useState<ProductItem[]>(productSeed);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<ProductItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loginError, setLoginError] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState<string>('Loading admin dashboard...');
  const [selectedImageFiles, setSelectedImageFiles] = React.useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = React.useState<string[]>([]);
  const [productSearch, setProductSearch] = React.useState('');
  const [selectedProductCategory, setSelectedProductCategory] = React.useState('All');

  const productCategories = React.useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((product) => product.category || 'Uncategorized')));
    return ['All', ...uniqueCategories];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      const category = product.category || 'Uncategorized';
      const matchesCategory = selectedProductCategory === 'All' || category === selectedProductCategory;
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        String(product.price).includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, productSearch, selectedProductCategory]);

  React.useEffect(() => {
    const storedSettings = getStoredSettings();
    if (storedSettings) {
      setAdminUsername(storedSettings.username);
      setAdminPassword(storedSettings.password);
    }

    async function loadAdminData() {
      try {
        const supabase = createBrowserClient();
        console.log('[Admin] Connecting to Supabase...');

        const { data: settingsData, error: settingsError } = await supabase.from('admin_settings').select('username,password').single();
        if (settingsError) {
          console.error('[Admin] Settings error:', settingsError.code, settingsError.message);
          setStatusMessage(`⚠️ Settings load failed: ${settingsError.message}`);
        } else if (settingsData) {
          setAdminUsername(settingsData.username || DEFAULT_USERNAME);
          setAdminPassword(settingsData.password || DEFAULT_PASSWORD);
          console.log('[Admin] Settings loaded');
        }

        const { data: productData, error: productError } = await supabase.from('products').select('*').order('id', { ascending: false });
        if (productError) {
          console.error('[Admin] Products error:', productError.code, productError.message);
          setStatusMessage(`❌ Supabase unavailable: ${productError.message} (${productError.code}). Showing fallback data.`);
        } else if (productData) {
          setProducts(productData as ProductItem[]);
          console.log(`[Admin] Loaded ${productData.length} products from Supabase`);
          setStatusMessage(`✓ Loaded ${productData.length} products from Supabase.`);
        }
      } catch (err) {
        setStatusMessage(`Error loading data: ${String(err)}`);
        console.error('[Admin] Catch error:', err);
      }

      setLoading(false);
    }

    loadAdminData();
  }, []);

  const login = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    (async () => {
      try {
        const resp = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const json = await resp.json();
        if (resp.ok && json.ok) {
          setAuthenticated(true);
          setUsername('');
          setPassword('');
          setLoginError('');
          return;
        }

        setLoginError(json.error || 'Wrong login details. Please check your username and password.');
        window.setTimeout(() => setLoginError(''), 5000);
      } catch (err) {
        setLoginError('Login failed. Please try again later.');
        window.setTimeout(() => setLoginError(''), 5000);
      }
    })();
  };

  const saveCredentials = async () => {
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from('admin_settings').upsert(
        [{ id: 1, username: adminUsername, password: adminPassword }],
        { onConflict: 'id' },
      );
      if (error) {
        window.alert('Failed to save credentials to Supabase. Check your configuration.');
        console.error(error);
        return;
      }
      setStatusMessage('Admin credentials saved to Supabase.');
    } catch (err) {
      console.error(err);
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: adminUsername, password: adminPassword }));
    window.alert('Credentials updated. Use the new login values next time.');
  };

  const refreshProducts = async () => {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (!error && data) {
        setProducts(data as ProductItem[]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = Array.from(formData.getAll('images') as File[]).filter(
      (item): item is File => item instanceof File && item.size > 0,
    );
    const productData: any = {
      name: String(formData.get('name') || '').trim(),
      category: String(formData.get('category') || ''),
      description: String(formData.get('description') || '').trim(),
      price: Number(formData.get('price') || 0),
      stock: Number(formData.get('stock') || 0),
      status: String(formData.get('status') || 'Active'),
      featured: formData.get('featured') === 'on',
    };

    if (!productData.name || !productData.category) {
      window.alert('Please complete product name and category.');
      return;
    }

    const defaultImage = 'https://images.unsplash.com/photo-1510557880182-3ddba4b9d491?auto=format&fit=crop&w=900&q=80';

    if (files.length > 0) {
      try {
        productData.imagesToUpload = await Promise.all(
          files.map(async (file) => {
            const base64 = await fileToBase64(file);

            return {
              contentType: file.type || 'application/octet-stream',
              base64,
              filename: file.name,
            };
          }),
        );
      } catch (err) {
        console.error('Image base64 read error:', err);
        window.alert('Image processing failed. Please try again with a different image.');
      }
    } else if (editingProduct) {
      if (editingProduct.images) {
        productData.images = editingProduct.images;
        productData.image = editingProduct.images[0] || editingProduct.image;
      }
      if (editingProduct.image && !productData.image) {
        productData.image = editingProduct.image;
      }
    } else {
      productData.image = defaultImage;
      productData.images = [defaultImage];
    }

    try {
      if (editingProduct) {
        if (productData.imagesToUpload) {
          productData.id = editingProduct.id;
          const resp = await fetch('/api/products', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });
          const json = await resp.json();
          if (!resp.ok) {
            window.alert(`Failed to update product: ${json?.error ?? resp.statusText}`);
            console.error(json);
          } else {
            await refreshProducts();
          }
        } else {
          const supabase = createBrowserClient();
          const result = await supabase.from('products').update(productData).eq('id', editingProduct.id);
          if (result.error) {
            window.alert('Failed to update product in Supabase. Check your configuration.');
            console.error(result.error);
          } else {
            await refreshProducts();
          }
        }
      } else {
        // Use secure server endpoint to insert product (bypass RLS with service role)
        const resp = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        const json = await resp.json();
        if (!resp.ok) {
          window.alert(`Failed to save product: ${json?.error ?? resp.statusText}`);
          console.error(json);
        } else {
          await refreshProducts();
        }
      }
    } catch (err) {
      console.error('Product save failed', err);
      window.alert('Product save failed. Please check the console for details and try again.');
      setStatusMessage('Failed to save product.');
    }

    setFormOpen(false);
    setEditingProduct(null);
    setSelectedImageFiles([]);
    setImagePreviewUrls([]);
    form.reset();
  };

  const handleEditProduct = (product: ProductItem) => {
    setEditingProduct(product);
    setFormOpen(true);
    setImagePreviewUrls(product.images ?? (product.image ? [product.image] : []));
    setSelectedImageFiles([]);
  };

  const handleDelete = async (id: number) => {
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        window.alert('Failed to delete product from Supabase.');
        console.error(error);
        return;
      }
    } catch (err) {
      console.error(err);
    }
    setProducts((current) => current.filter((product) => product.id !== id));
    try {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/' }),
      });
    } catch (err) {
      console.warn('Failed to call revalidate endpoint', err);
    }
  };

  const toggleFeatured = async (id: number) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from('products').update({ featured: !product.featured }).eq('id', id);
      if (error) {
        window.alert('Failed to update feature status in Supabase.');
        console.error(error);
        return;
      }
      await refreshProducts();
      return;
    } catch (err) {
      console.error(err);
    }

    setProducts((current) => current.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item)));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-20">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-12 text-center shadow-glass backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Loading</p>
            <h1 className="mt-4 text-3xl font-bold">Preparing your dashboard…</h1>
            <p className="mt-2 text-slate-400">This may take a few seconds while Supabase data loads.</p>
          </div>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6 py-14">
          <div className="w-full rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-glass backdrop-blur-xl">
            <div className="mb-6 space-y-3">
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-cyan-300">
                <User className="h-5 w-5" /> Admin login
              </p>
              <h1 className="text-3xl font-bold">Control center access</h1>
              <p className="text-slate-400">Sign in with your username and password to manage products, orders, and homepage content.</p>
            </div>
            <form onSubmit={login} className="space-y-6">
              {loginError ? (
                <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100 shadow-lg shadow-red-500/10">
                  <p className="font-semibold">Invalid password</p>
                  <p className="mt-1 text-slate-200">{loginError}</p>
                </div>
              ) : null}
              <label className="block text-sm text-slate-300">
                Username
                <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" placeholder="Username" />
              </label>
              <label className="block text-sm text-slate-300">
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" placeholder="Password" />
              </label>
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Sign in
                <ArrowRight size={18} />
              </button>
            </form>
            <div className="mt-4">
              <Link href="/" className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
                Back to homepage
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const totalProducts = products.length;
  const pendingOrders = 3;
  const revenueEstimate = totalProducts * 4200;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-5 shadow-glass backdrop-blur-xl">
          <div className="mb-8 space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Admin Panel</p>
            <h2 className="text-3xl font-bold">Ethio Market</h2>
            <p className="text-sm text-slate-400">Manage products, monitor orders, and update your storefront.</p>
          </div>
          <nav className="space-y-2 text-sm text-slate-300">
            {[
              { label: 'Dashboard', key: 'dashboard', icon: BarChart3 },
              { label: 'Products', key: 'products', icon: Box },
              { label: 'Orders', key: 'orders', icon: Layers },
              { label: 'Settings', key: 'settings', icon: Settings },
            ].map((item) => (
              <button key={item.key} onClick={() => setActiveView(item.key as any)} className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left transition ${activeView === item.key ? 'bg-cyan-400/10 text-white' : 'hover:bg-white/5'}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <Link href="/" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 transition hover:bg-cyan-500/20">
            Back to homepage
          </Link>
          <button onClick={() => setAuthenticated(false)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-glass backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Dashboard</p>
                <h1 className="mt-2 text-3xl font-bold">Welcome back, {adminUsername}</h1>
              </div>
              <div className="inline-flex items-center gap-3 rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <MessageCircle className="h-4 w-4 text-cyan-300" /> Live Telegram orders
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: 'Total products', value: totalProducts, accent: 'bg-cyan-400/10 text-cyan-200' },
                { label: 'Pending orders', value: pendingOrders, accent: 'bg-violet-400/10 text-violet-200' },
                { label: 'Revenue estimate', value: `~${revenueEstimate.toLocaleString()} ETB`, accent: 'bg-emerald-400/10 text-emerald-200' },
              ].map((card) => (
                <div key={card.label} className={`rounded-3xl border border-white/10 p-5 ${card.accent}`}>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{card.label}</p>
                  <p className="mt-4 text-2xl font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {activeView === 'dashboard' && (
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-glass backdrop-blur-xl">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Recent Orders</p>
                  <h2 className="mt-3 text-2xl font-semibold">Latest Telegram interactions</h2>
                </div>
                <button onClick={() => setActiveView('orders')} className="inline-flex items-center gap-2 rounded-3xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                  View orders
                </button>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {products.slice(0, 2).map((product) => (
                  <div key={product.id} className="rounded-3xl border border-white/10 bg-slate-950/90 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Order item</p>
                        <p className="mt-2 text-xl font-semibold">{product.name}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">Pending</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-400">Customer requested details for stock, price, and shipping on Telegram.</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Products</p>
                  <h2 className="text-3xl font-semibold">Manage your inventory</h2>
                </div>
                <button onClick={() => {
                if (formOpen) {
                  setFormOpen(false);
                  setEditingProduct(null);
                } else {
                  setFormOpen(true);
                  setEditingProduct(null);
                }
              }} className="inline-flex items-center gap-2 rounded-3xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                <Plus size={16} /> {formOpen ? 'Close' : 'Add Product'}
              </button>
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-12 py-3 text-white outline-none focus:border-cyan-400"
                    placeholder="Search products, categories, or prices"
                  />
                </div>
                <div className="rounded-3xl bg-slate-950/90 px-4 py-3 text-sm text-slate-300">
                  Showing {filteredProducts.length} of {products.length}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {productCategories.map((category) => {
                  const count = products.filter((product) => (product.category || 'Uncategorized') === category).length;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedProductCategory(category)}
                      className={`rounded-[2rem] border px-5 py-4 text-left transition ${
                        selectedProductCategory === category
                          ? 'border-cyan-400 bg-cyan-400/10 text-white'
                          : 'border-white/10 bg-slate-950/90 text-slate-300 hover:border-cyan-400/30 hover:bg-white/5'
                      }`}
                    >
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{category}</p>
                      <p className="mt-3 text-2xl font-semibold">{count}</p>
                    </button>
                  );
                })}
              </div>

              {formOpen && (
                <form key={editingProduct ? editingProduct.id : 'new'} onSubmit={handleAddProduct} className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-glass backdrop-blur-xl">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{editingProduct ? 'Edit Product' : 'Add New Product'}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{editingProduct ? `Editing ${editingProduct.name}` : 'Create a new item'}</h3>
                    </div>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setFormOpen(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 mt-6">
                    <label className="block text-sm text-slate-300">
                      Product Title
                      <input
                        name="name"
                        defaultValue={editingProduct?.name ?? ''}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="block text-sm text-slate-300">
                      Category
                      <input
                        name="category"
                        defaultValue={editingProduct?.category ?? ''}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                        placeholder="Electronics"
                      />
                    </label>
                    <label className="block text-sm text-slate-300">
                      Description
                      <textarea
                        name="description"
                        defaultValue={editingProduct?.description ?? ''}
                        rows={3}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                        placeholder="Enter a short product description"
                      />
                    </label>
                    <label className="block text-sm text-slate-300">
                      Product images
                      <input
                        name="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(event) => {
                          const files = Array.from(event.currentTarget.files || []);
                          setSelectedImageFiles(files);
                          setImagePreviewUrls(files.map((file) => URL.createObjectURL(file)));
                        }}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none file:cursor-pointer file:border-0 file:bg-cyan-400/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-cyan-200 file:transition file:hover:bg-cyan-400/20"
                      />
                      {editingProduct?.images && editingProduct.images.length > 0 && selectedImageFiles.length === 0 ? (
                        <p className="mt-2 text-xs text-slate-500">Current images will be preserved unless you choose new files.</p>
                      ) : null}
                      {imagePreviewUrls.length > 0 ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {imagePreviewUrls.map((preview, index) => (
                            <img key={index} src={preview} alt={`Image preview ${index + 1}`} className="h-32 w-full rounded-3xl object-cover" />
                          ))}
                        </div>
                      ) : null}
                    </label>
                    <label className="block text-sm text-slate-300">
                      Price (ETB)
                      <input
                        name="price"
                        type="number"
                        defaultValue={editingProduct?.price ?? undefined}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="block text-sm text-slate-300">
                      Stock quantity
                      <input
                        name="stock"
                        type="number"
                        defaultValue={editingProduct?.stock ?? undefined}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        name="featured"
                        defaultChecked={editingProduct?.featured ?? false}
                        className="h-4 w-4 rounded border-white/10 bg-slate-900 text-cyan-400"
                      />
                      Feature product
                    </label>
                    <label className="block text-sm text-slate-300">
                      Status
                      <select
                        name="status"
                        defaultValue={editingProduct?.status ?? 'Active'}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      >
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Draft</option>
                        <option>Hidden</option>
                      </select>
                    </label>
                  </div>
                  <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </button>
                </form>
              )}

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-glass backdrop-blur-xl overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-t border-white/10">
                        <td className="px-4 py-4 font-medium text-white">{product.name}</td>
                        <td className="px-4 py-4">{product.price} ETB</td>
                        <td className="px-4 py-4">{product.stock}</td>
                        <td className="px-4 py-4">{product.category}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs ${product.featured ? 'bg-cyan-500/15 text-cyan-200' : 'bg-white/5 text-slate-300'}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 space-x-2">
                          <button onClick={() => handleEditProduct(product)} className="rounded-3xl bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/20">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="rounded-3xl bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20">
                            <Trash2 size={14} />
                          </button>
                          <button onClick={() => toggleFeatured(product.id)} className="rounded-3xl bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/20">
                            <CheckCircle2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 ? (
                  <div className="mt-4 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-slate-400">
                    No products match this search or category. Try clearing the search or selecting a different category.
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {activeView === 'orders' && (
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-glass backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Orders</p>
                  <h2 className="text-3xl font-semibold">Telegram order feed</h2>
                </div>
                <span className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">Manual fulfilment only</span>
              </div>
              <div className="mt-8 grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="rounded-3xl border border-white/10 bg-slate-950/90 p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Order ID #{product.id}</p>
                        <p className="mt-2 text-xl font-semibold">{product.name}</p>
                      </div>
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-200">{product.status === 'Pending' ? 'Pending' : 'Confirmed'}</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-400">Customer requested this product. Order message is ready for Telegram delivery.</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-glass backdrop-blur-xl">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Settings</p>
                <h2 className="mt-3 text-3xl font-semibold">Account & access</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  Admin username
                  <input value={adminUsername} onChange={(event) => setAdminUsername(event.target.value)} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                </label>
                <label className="block text-sm text-slate-300">
                  Admin password
                  <input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                </label>
              </div>
              <button onClick={saveCredentials} className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Save credentials
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
