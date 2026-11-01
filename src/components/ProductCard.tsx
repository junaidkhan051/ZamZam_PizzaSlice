import React from 'react';
import { Plus, Flame, SlidersHorizontal, Sparkles } from 'lucide-react';
import { MenuItem } from '../types/pizza';
import { formatPrice } from '../utils/currency';
import { SafeImage } from './SafeImage';

interface Props {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onOpenCustomizer: (item: MenuItem) => void;
  language: 'en' | 'ur';
}

export const ProductCard: React.FC<Props> = ({
  item,
  onAddToCart,
  onOpenCustomizer,
  language,
}) => {
  const isUr = language === 'ur';

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-amber-100 hover:border-red-600/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-stone-900">
      <div>
        {/* Product Image */}
        <div className="relative aspect-[16/11] overflow-hidden bg-stone-100">
          <SafeImage
            src={item.image}
            alt={item.name}
            fallbackCategory={item.fallbackCategory}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
            {item.isBestseller && (
              <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-stone-950" />
                <span>POPULAR</span>
              </span>
            )}
            {item.isSpicy && (
              <span className="bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Flame className="w-3 h-3 text-white" />
                <span>SPICY</span>
              </span>
            )}
          </div>

          {/* Starting price tag overlay */}
          <div className="absolute bottom-2.5 right-2.5 bg-[#171717]/85 backdrop-blur-md text-amber-300 text-xs font-black font-mono px-2.5 py-1 rounded-xl shadow-md border border-white/10">
            {item.category === 'pizza' ? `From ${formatPrice(item.price)}` : formatPrice(item.price)}
          </div>
        </div>

        {/* Content details */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif group-hover:text-red-700 transition-colors leading-snug">
                {isUr ? item.urduName || item.name : item.name}
              </h3>
              {item.urduName && !isUr && (
                <div className="text-[11px] text-amber-900/70 font-medium">
                  {item.urduName}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
            {isUr && item.urduDescription ? item.urduDescription : item.description}
          </p>

          {/* Deal items list if applicable */}
          {item.dealItems && item.dealItems.length > 0 && (
            <div className="mt-3 p-2.5 bg-[#FFF9F2] rounded-xl border border-amber-200/70 text-[11px] text-stone-700 space-y-1">
              <span className="font-bold text-red-700 block">Includes:</span>
              {item.dealItems.map((di, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{di}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="pt-3 border-t border-amber-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-stone-400 block font-medium">
              {item.category === 'pizza' ? 'Starting at' : 'Price'}
            </span>
            <span className="text-sm sm:text-base font-black text-red-700 font-mono">
              {formatPrice(item.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {item.customizable ? (
              <button
                type="button"
                onClick={() => onOpenCustomizer(item)}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-stone-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-700" />
                <span>{isUr ? 'کسٹمائز کریں' : 'Customize'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAddToCart(item)}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-red-700/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>{isUr ? 'شامل کریں' : 'Add to Cart'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
