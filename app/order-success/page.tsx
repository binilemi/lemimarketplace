import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_30%),linear-gradient(180deg,_#050816_0%,_#0b1223_100%)] text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-glow sm:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Order submitted</p>
          <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Thank you — your order is pending confirmation.</h1>
          <p className="mt-6 text-base leading-7 text-slate-400">
            We will review your order and notify you once it is confirmed. If you chose mobile banking, we will verify your payment screenshot before processing.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/" className="inline-flex items-center justify-center rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
