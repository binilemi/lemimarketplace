import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '../../../utils/supabase/server';

interface ProductRecord {
  id: number;
  name: string;
  category: string;
  price: string | number;
  original_price?: string | number | null;
  discount?: string | number | null;
  image?: string | null;
  images?: string[] | null;
  description?: string | null;
  stock?: string | number | null;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const productId = Number(params.id);
  const { data: product, error } = await supabase
    .from('products')
    .select('id,name,category,price,original_price,discount,image,images,description,stock')
    .eq('id', productId)
    .single();

  if (error || !product) {
    return notFound();
  }

  const stockValue = Number(product.stock ?? 0);
  const priceValue = Number(product.price ?? 0);
  const originalPriceValue = product.original_price ? Number(product.original_price) : undefined;
  const imageUrl = product.images?.[0] ?? product.image ?? '/';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_30%),linear-gradient(180deg,_#050816_0%,_#0b1223_100%)] text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
          ← Back to products
        </Link>
        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-4 shadow-glow sm:p-6">
            <img src={imageUrl} alt={product.name} className="h-[260px] w-full rounded-[1.75rem] object-cover sm:h-[340px]" />
            <div className="mt-6 space-y-3">
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Stock</p>
                <p>{stockValue > 0 ? `${stockValue} available` : 'Out of stock'}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Category</p>
                <p>{product.category}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-5 shadow-glow sm:p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Product details</p>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{product.name}</h1>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <p className="text-3xl font-bold text-white sm:text-4xl">{priceValue} ETB</p>
                {originalPriceValue ? <p className="text-sm text-slate-500 line-through">{originalPriceValue} ETB</p> : null}
                {product.discount ? <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">{product.discount}% off</span> : null}
              </div>
              <p className="mt-6 text-base leading-7 text-slate-300">{product.description || 'No description available for this product yet.'}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/checkout/${product.id}`}
                  className={`inline-flex items-center justify-center rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 ${stockValue <= 0 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  Order now
                </Link>
                <Link href="/" className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10">
                  Continue shopping
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-5 shadow-glow sm:p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Product snapshot</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Name</p>
                  <p className="mt-2">{product.name}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Price</p>
                  <p className="mt-2">{priceValue} ETB</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Stock</p>
                  <p className="mt-2">{stockValue}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Category</p>
                  <p className="mt-2">{product.category}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
