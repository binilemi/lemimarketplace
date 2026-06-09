import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createClient } from '../../../utils/supabase/server';
import CheckoutForm from '../../../components/CheckoutForm';

interface ProductRecord {
  id: number;
  name: string;
  price: string | number;
  original_price?: string | number | null;
  discount?: string | number | null;
  image?: string | null;
  images?: string[] | null;
  description?: string | null;
  stock?: string | number | null;
}

export default async function CheckoutPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const productId = Number(params.id);
  const { data: product, error } = await supabase
    .from('products')
    .select('id,name,price,original_price,discount,image,images,description,stock')
    .eq('id', productId)
    .single();

  if (error || !product) {
    return notFound();
  }

  const checkoutProduct = {
    id: product.id,
    name: product.name,
    price: Number(product.price ?? 0),
    stock: Number(product.stock ?? 0),
    image: product.images?.[0] ?? product.image ?? undefined,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_30%),linear-gradient(180deg,_#050816_0%,_#0b1223_100%)] text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Checkout</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Complete your order</h1>
          </div>
          <a href={`/product/${checkoutProduct.id}`} className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10">
            Back to product
          </a>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <CheckoutForm product={checkoutProduct} />
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-5 shadow-glow sm:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Order summary</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">Product</p>
                <p className="mt-2 text-xl font-semibold text-white">{checkoutProduct.name}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">Unit price</p>
                <p className="mt-2 text-lg font-semibold text-white">{checkoutProduct.price} ETB</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">Current stock</p>
                <p className="mt-2 text-lg font-semibold text-white">{checkoutProduct.stock}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
