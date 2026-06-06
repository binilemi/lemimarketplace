import { MessageCircle } from 'lucide-react';

export default function TelegramSection() {
  return (
    <section id="telegram" className="mx-auto max-w-7xl px-6 pb-16">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-glass backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              <MessageCircle size={18} /> Instant support
            </span>
            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Need help? Chat instantly on Telegram.</h2>
            <p className="mt-4 max-w-xl text-slate-400">Order questions, supplier updates, and product support are just one message away. We usually reply within minutes via Telegram.</p>
          </div>
          <a href="https://t.me/leonmsgn" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-3xl bg-cyan-400 px-8 py-5 text-base font-semibold text-slate-950 transition hover:bg-cyan-300">
            Contact on Telegram
          </a>
        </div>
      </div>
    </section>
  );
}
