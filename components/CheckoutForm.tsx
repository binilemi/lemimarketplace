'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type CheckoutFormProps = {
  product: {
    id: number;
    name: string;
    price: number;
    stock: number;
    image?: string;
  };
};

export default function CheckoutForm({ product }: CheckoutFormProps) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shippingRegion, setShippingRegion] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingSubCity, setShippingSubCity] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_banking'>('cash');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = useMemo(() => product.price * quantity, [product.price, quantity]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!customerContact.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }

    if (quantity < 1) {
      setErrorMessage('Quantity must be at least 1.');
      return;
    }

    if (!shippingRegion.trim() || !shippingCity.trim() || !shippingSubCity.trim() || !shippingAddress.trim()) {
      setErrorMessage('Please complete your shipping address.');
      return;
    }

    if (paymentMethod === 'mobile_banking' && (!screenshotFile || screenshotFile.size === 0)) {
      setErrorMessage('Please upload a payment screenshot for mobile banking.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set('product_id', String(product.id));
      formData.set('customer_name', customerName.trim());
      formData.set('customer_contact', customerContact.trim());
      formData.set('quantity', String(quantity));
      formData.set('shipping_region', shippingRegion.trim());
      formData.set('shipping_city', shippingCity.trim());
      formData.set('shipping_sub_city', shippingSubCity.trim());
      formData.set('shipping_address', shippingAddress.trim());
      formData.set('payment_method', paymentMethod);
      formData.set('notes', notes.trim());
      formData.set('total_price', String(totalPrice));

      if (screenshotFile) {
        formData.set('screenshot', screenshotFile);
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error || 'Unable to submit your order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      router.push('/order-success');
    } catch (error) {
      setErrorMessage('Unexpected error. Please try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-glow sm:p-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Checkout</h2>
        <p className="text-slate-400">Complete your order details and place the order. Product summary is read only.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-900/90 p-4 sm:p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Product summary</p>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-20 w-20 rounded-3xl object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-slate-400">Image</div>
              )}
              <div>
                <p className="text-lg font-semibold text-white">{product.name}</p>
                <p className="text-sm text-slate-400">{quantity} × {product.price} ETB</p>
              </div>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-semibold text-white">{totalPrice} ETB</p>
            </div>
            <p className="text-sm text-slate-400">Stock: {product.stock}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-900/90 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Buyer info</p>
          <div className="space-y-4">
            <label className="block text-sm text-slate-300">
              Full name
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder="Your full name"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Phone number
              <input
                value={customerContact}
                onChange={(event) => setCustomerContact(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder="0912 xxx xxx"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Quantity
              <input
                type="number"
                min={1}
                max={product.stock || 999}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/90 p-4 sm:p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Shipment address</p>
          <div className="mt-4 space-y-4">
            <label className="block text-sm text-slate-300">
              Region
              <input
                value={shippingRegion}
                onChange={(event) => setShippingRegion(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder="Region"
              />
            </label>
            <label className="block text-sm text-slate-300">
              City
              <input
                value={shippingCity}
                onChange={(event) => setShippingCity(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder="City"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Sub-city
              <input
                value={shippingSubCity}
                onChange={(event) => setShippingSubCity(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder="Sub-city"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Detailed address
              <textarea
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder="House number, street, landmark"
                rows={3}
              />
            </label>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/90 p-4 sm:p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Payment method</p>
          <div className="mt-4 space-y-4">
            <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/90 p-4 text-sm text-slate-300">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
                className="h-4 w-4 accent-cyan-400"
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/90 p-4 text-sm text-slate-300">
              <input
                type="radio"
                name="payment"
                value="mobile_banking"
                checked={paymentMethod === 'mobile_banking'}
                onChange={() => setPaymentMethod('mobile_banking')}
                className="h-4 w-4 accent-cyan-400"
              />
              Mobile Banking
            </label>
            {paymentMethod === 'mobile_banking' ? (
              <label className="block text-sm text-slate-300">
                Upload payment screenshot
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setScreenshotFile(event.target.files?.[0] ?? null)}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none file:rounded-full file:border-0 file:bg-cyan-400/10 file:px-3 file:py-2 file:text-sm file:text-cyan-200"
                />
              </label>
            ) : null}
            <label className="block text-sm text-slate-300">
              Idea box (optional)
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                rows={3}
                placeholder="Call before delivery, leave at gate, etc."
              />
            </label>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{errorMessage}</div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Placing order…' : 'Place Order'}
      </button>
    </form>
  );
}
