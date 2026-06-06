import Link from 'next/link';
import { Copyright, Facebook, Instagram, Linkedin, Mail, MessageCircle, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-white/10 bg-slate-950/90 py-12 text-slate-400">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3 text-xl font-semibold text-white">
            <MessageCircle className="h-6 w-6 text-cyan-400" /> Ethio Market
          </div>
          <p className="max-w-sm leading-7">Premium Telegram storefront built for Ethiopian shoppers and fast ordering. Modern, trustworthy, and mobile-friendly.</p>
        </div>
        <div>
          <h3 className="mb-4 text-sm uppercase tracking-[0.35em] text-slate-500">Links</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="#home" className="hover:text-white">Home</Link></li>
            <li><Link href="#featured" className="hover:text-white">Deals</Link></li>
            <li><Link href="#telegram" className="hover:text-white">Telegram</Link></li>
            <li><Link href="/admin" className="hover:text-white">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm uppercase tracking-[0.35em] text-slate-500">Contact</h3>
          <div className="grid gap-3 text-sm">
            <a href="https://www.instagram.com/leonm.45" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-cyan-400/10">
              <Instagram size={18} />
              <span>Instagram</span>
            </a>
            <a href="https://www.facebook.com/lemi.misgana.3" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-cyan-400/10">
              <Facebook size={18} />
              <span>Facebook</span>
            </a>
            <a href="mailto:lemimsgn611@gmail.com" className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-cyan-400/10">
              <Mail size={18} />
              <span>Gmail</span>
            </a>
            <a href="tel:+251935786877" className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-cyan-400/10">
              <Phone size={18} />
              <span>Call</span>
            </a>
            <a href="https://t.me/leonmsgn" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-cyan-400/10">
              <MessageCircle size={18} />
              <span>Telegram</span>
            </a>
          </div>
          <p className="mt-4">Support available 9am–9pm ETB time.</p>
        </div>
      </div>
      <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
        <Copyright className="mr-2 inline-block align-text-bottom" size={14} />
        2026 Ethio Market. All rights reserved.
      </div>
    </footer>
  );
}
