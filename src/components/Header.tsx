import React from 'react';
import { MapPin, ShoppingBag, ChevronDown, Compass } from 'lucide-react';

interface Props {
  currentLocation: string;
  onOpenLocationPicker: () => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  language: 'en' | 'ur';
  onToggleLanguage: () => void;
  activeOrderCount: number;
  onOpenActiveOrder: () => void;
}

export const Header: React.FC<Props> = ({
  currentLocation,
  onOpenLocationPicker,
  cartCount,
  cartTotal,
  onOpenCart,
  language,
  onToggleLanguage,
  activeOrderCount,
  onOpenActiveOrder,
}) => {
  const isUr = language === 'ur';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Location */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-md shadow-amber-500/20">
              🍕
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-stone-900 font-serif leading-none flex items-center gap-1.5">
                <span>Pizza Slice</span>
              </div>
              <div className="text-[11px] text-stone-500 font-sans mt-0.5">
                {isUr ? 'مرلی چوک کے تازہ پیزیریاز' : 'Marley Chowk Pizza Delivery'}
              </div>
            </div>
          </div>

          {/* Location Picker Pill centered at Marley Chowk */}
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center gap-1.5 text-xs text-stone-800 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 px-3 py-1.5 rounded-full transition-colors truncate max-w-[260px]"
            title="Current delivery location: Marley Chowk"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate font-semibold text-stone-900">
              {currentLocation || 'Marley Chowk'}
            </span>
            <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full shrink-0">
              LIVE
            </span>
            <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
          </button>
        </div>

        {/* Right Tools & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Order live status pill if any */}
          {activeOrderCount > 0 && (
            <button
              onClick={onOpenActiveOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold animate-pulse hover:bg-emerald-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{isUr ? 'آرڈر ٹریک کریں' : 'Track Order'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors"
          >
            {language === 'en' ? 'اردو' : 'English'}
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-bold text-xs shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-stone-950" />
            <span className="hidden sm:inline">{isUr ? 'کارٹ' : 'Cart'}</span>
            {cartCount > 0 && (
              <span className="bg-stone-950 text-amber-400 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {cartCount}
              </span>
            )}
            {cartTotal > 0 && (
              <span className="hidden sm:inline font-mono font-black border-l border-amber-600/60 pl-2">
                ${cartTotal.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
