import React, { useState } from 'react';
import { ArrowLeft, Star, Clock, Bike, MapPin, Sparkles, Plus, Flame, SlidersHorizontal } from 'lucide-react';
import { PizzaShop, MenuItem, MenuCategory, CustomizedPizza } from '../types/pizza';

interface Props {
  shop: PizzaShop;
  onBack: () => void;
  onOpenCustomizer: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  language: 'en' | 'ur';
}

export const ShopDetail: React.FC<Props> = ({
  shop,
  onBack,
  onOpenCustomizer,
  onQuickAdd,
  language,
}) => {
  const isUr = language === 'ur';
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');

  const categories: { id: MenuCategory | 'all'; label: string; urduLabel: string }[] = [
    { id: 'all', label: 'All Items', urduLabel: 'تمام آئٹمز' },
    { id: 'slices', label: '🍕 Single Slices', urduLabel: '🍕 سنگل سلائسز' },
    { id: 'classic', label: 'Classic Pies', urduLabel: 'کلاسک پیزا' },
    { id: 'specialty', label: 'Specialty Crusts', urduLabel: 'اسپیشلٹی پیزا' },
    { id: 'deals', label: 'Combos & Deals', urduLabel: 'ڈیلز اور کومبوز' },
    { id: 'sides', label: 'Sides & Dips', urduLabel: 'سائیڈز اور ڈپس' },
  ];

  const filteredItems = activeCategory === 'all'
    ? shop.menu
    : shop.menu.filter((item) => item.category === activeCategory);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Navigation & Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isUr ? 'واپس جائیں' : 'Back to Pizza Shops'}</span>
        </button>
      </div>

      {/* Shop Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200/80 bg-white shadow-sm">
        <div className="relative h-48 sm:h-64 overflow-hidden bg-stone-900">
          <img
            src={shop.bannerImage}
            alt={shop.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          {/* Special offer banner */}
          {shop.specialOffer && (
            <div className="absolute top-4 right-4 bg-amber-500 text-stone-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-950" />
              <span>{shop.specialOffer}</span>
            </div>
          )}

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
              {shop.name}
            </h1>
            {shop.urduName && (
              <div className="text-sm text-amber-300 font-medium mt-0.5">
                {shop.urduName}
              </div>
            )}
            <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl">
              {shop.tagline}
            </p>
          </div>
        </div>

        {/* Shop Key Info Bar */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 bg-white">
          <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-xs text-stone-600">
            <div className="flex items-center gap-1 font-bold text-stone-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{shop.rating}</span>
              <span className="text-stone-400 font-normal">({shop.reviewCount} reviews)</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <div className="flex items-center gap-1 text-stone-700">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{shop.deliveryTime}</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <div className="flex items-center gap-1 text-stone-700">
              <Bike className="w-3.5 h-3.5 text-stone-400" />
              <span>${shop.deliveryFee.toFixed(2)} delivery</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <div className="flex items-center gap-1 text-stone-700">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{shop.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-md font-semibold">
              ● {isUr ? 'آرڈرز جاری ہیں' : 'Accepting Orders'}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Categories Segmented Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {isUr ? c.urduLabel : c.label}
            </button>
          );
        })}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 font-serif group-hover:text-amber-800 transition-colors">
                    {item.name}
                  </h3>
                  {item.isSpicy && <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                </div>

                {item.urduName && (
                  <div className="text-xs text-amber-900/60 font-medium">
                    {item.urduName}
                  </div>
                )}

                <p className="text-xs text-stone-500 line-clamp-2 mt-1 font-sans">
                  {item.description}
                </p>

                {/* Pricing & Slice availability */}
                <div className="mt-3 flex items-center flex-wrap gap-x-2 gap-y-1 text-xs">
                  {item.slicePrice ? (
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                      🍕 Slice: ${item.slicePrice.toFixed(2)}
                    </span>
                  ) : null}
                  <span className="font-bold text-stone-900">
                    Whole: ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Item Image */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.isBestseller && (
                  <span className="absolute top-1 left-1 bg-amber-500 text-stone-950 font-bold text-[9px] px-1.5 py-0.5 rounded shadow-sm">
                    POPULAR
                  </span>
                )}
              </div>
            </div>

            {/* Actions: Customize or Quick Add */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <div className="text-[11px] text-stone-400">
                {item.customizable
                  ? isUr
                    ? 'کرسٹ، سوس اور ٹاپنگز اپنی مرضی سے منتخب کریں'
                    : 'Choice of crust, sauce & toppings'
                  : isUr
                  ? 'شیف اسپیشل ریسیپی'
                  : 'Chef signature recipe'}
              </div>

              <div className="flex items-center gap-2">
                {item.customizable ? (
                  <button
                    onClick={() => onOpenCustomizer(item)}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-amber-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isUr ? 'کسٹمائز کریں' : 'Customize Slice'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onQuickAdd(item)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isUr ? 'شامل کریں' : 'Add to Order'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
