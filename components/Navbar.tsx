import Link from 'next/link';
import { MessageCircle, ShoppingBag, Sparkles, SunMoon } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Categories', href: '#categories' },
  { label: 'Deals', href: '#featured' },
  { label: 'About', href: '#telegram' },
  { label: 'Contact', href: '#footer' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-3 text-lg font-semibold text-white">
          <Sparkles className="h-6 w-6 text-cyan-400" />
          Ethio Market
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="text-sm text-slate-300 transition hover:text-white">
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="https://t.me/leonmsgn" target="_blank" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
            <MessageCircle size={16} /> Telegram
          </Link>
          <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-cyan-300/40 hover:bg-white/10">
            <ShoppingBag size={16} /> Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
