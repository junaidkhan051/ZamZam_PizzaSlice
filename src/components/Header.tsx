import React from 'react';
import { ShoppingBag, MapPin, Phone, Clock, ChevronDown, Sparkles } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';
import { formatPrice } from '../utils/currency';

interface Props {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  language: 'en' | 'ur';
  onToggleLanguage: () => void;
  activeOrderCount: number;
  onOpenActiveOrder: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<Props> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  language,
  onToggleLanguage,
  activeOrderCount,
  onOpenActiveOrder,
  activeSection,
  onNavigate,
}) => {
  const isUr = language === 'ur';

  const navLinks = [
    { id: 'hero', label: 'Home', urduLabel: 'ہوم' },
    { id: 'menu', label: 'Menu', urduLabel: 'مینیو' },
    { id: 'deals', label: 'Deals', urduLabel: 'ڈیلز' },
    { id: 'about', label: 'About', urduLabel: 'ہمارے متعلق' },
    { id: 'location', label: 'Location & Hours', urduLabel: 'اوقات و مقام' },
    { id: 'contact', label: 'Contact', urduLabel: 'رابطہ' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      {/* Top micro-announcement bar */}
      <div className="bg-[#171717] text-stone-200 text-[11px] py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">
              📍 <strong className="text-amber-400">{RESTAURANT_INFO.name}</strong> · {RESTAURANT_INFO.location}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 shrink-0 text-stone-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{RESTAURANT_INFO.openingHours}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{RESTAURANT_INFO.phone}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center text-2xl shadow-md shadow-red-700/25 border border-amber-300/40 group-hover:scale-105 transition-transform">
            🍕
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black tracking-tight text-[#171717] font-serif leading-none flex items-center gap-1.5">
              <span>ZAM ZAM</span>
              <span className="text-red-700">PIZZA SLICE</span>
            </div>
            <div className="text-[11px] text-amber-900/80 font-medium font-sans mt-0.5">
              {isUr ? 'تازہ دم پیزا اور فاسٹ فوڈ' : RESTAURANT_INFO.tagline}
            </div>
          </div>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-stone-700">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`transition-colors py-1 relative ${
                  isActive
                    ? 'text-red-700 font-bold'
                    : 'text-stone-600 hover:text-red-700'
                }`}
              >
                {isUr ? link.urduLabel : link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools: Language, Active Order, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Order live status badge */}
          {activeOrderCount > 0 && (
            <button
              onClick={onOpenActiveOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold animate-pulse hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{isUr ? 'آرڈر لائیو دیکھیں' : 'Demo Tracker'}</span>
            </button>
          )}

          {/* Language Switch */}
          <button
            onClick={onToggleLanguage}
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-800 hover:bg-stone-100 text-xs font-bold transition-colors"
          >
            {language === 'en' ? 'اردو' : 'English'}
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-700 hover:bg-red-800 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-700/25 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">{isUr ? 'کارٹ' : 'Cart'}</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-stone-950 text-[11px] font-black px-1.5 py-0.2 rounded-full">
                {cartCount}
              </span>
            )}
            {cartTotal > 0 && (
              <span className="hidden sm:inline font-mono font-bold border-l border-red-500/80 pl-2">
                {formatPrice(cartTotal)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
