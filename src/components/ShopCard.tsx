import React from 'react';
import { Star, Clock, MapPin, Bike, Sparkles } from 'lucide-react';
import { PizzaShop } from '../types/pizza';

interface Props {
  shop: PizzaShop;
  onSelect: (shop: PizzaShop) => void;
  language: 'en' | 'ur';
}

export const ShopCard: React.FC<Props> = ({ shop, onSelect, language }) => {
  const isUr = language === 'ur';

  return (
    <div
      onClick={() => onSelect(shop)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-amber-400 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full text-stone-900"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quiet top overlay highlights */}
        {shop.hasSingleSlices && (
          <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
            <span>🍕</span>
            <span>{isUr ? 'سلائس دستیاب ہے' : 'Single Slices Available'}</span>
          </div>
        )}

        {shop.specialOffer && (
          <div className="absolute bottom-3 left-3 right-3 bg-amber-500/95 backdrop-blur-md text-stone-950 text-xs font-bold px-3 py-1.5 rounded-lg truncate shadow-sm">
            {shop.specialOffer}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop Title and Rating */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif group-hover:text-amber-800 transition-colors">
                {shop.name}
              </h3>
              {shop.urduName && (
                <div className="text-xs text-amber-900/70 font-medium">
                  {shop.urduName}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-stone-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{shop.rating}</span>
              <span className="text-stone-400 font-normal">({shop.reviewCount})</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-sans">
            {shop.tagline}
          </p>

          {/* Unboxed Metadata with Typographic Separators (Zero Pill Discipline) */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-stone-500 mt-2.5 pt-2 border-t border-stone-100">
            <span className="flex items-center gap-1 text-stone-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {shop.deliveryTime}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1">
              <Bike className="w-3.5 h-3.5 text-stone-400" />
              ${shop.deliveryFee.toFixed(2)} {isUr ? 'ڈیلیوری' : 'delivery'}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {shop.distanceKm} km ({shop.area})
            </span>
          </div>
        </div>

        {/* Featured Slice / Pizza teaser */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
          <div className="text-[11px] text-stone-500">
            {shop.tags.slice(0, 2).join(' · ')}
          </div>
          <button
            type="button"
            className="text-xs font-bold text-amber-700 group-hover:text-amber-800 flex items-center gap-1 hover:underline"
          >
            <span>{isUr ? 'مینیو دیکھیں' : 'View Slices'}</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
