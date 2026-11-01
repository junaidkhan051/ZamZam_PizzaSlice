import React, { useState } from 'react';
import { X, Plus, Minus, Check, Flame, Sparkles } from 'lucide-react';
import { MenuItem, PizzaTopping, CustomizedPizza } from '../types/pizza';
import { AVAILABLE_TOPPINGS } from '../data/pizzaShops';

interface Props {
  item: MenuItem;
  shopName: string;
  onClose: () => void;
  onAddToCart: (customized: CustomizedPizza) => void;
  language: 'en' | 'ur';
}

export const PizzaCustomizerModal: React.FC<Props> = ({
  item,
  shopName,
  onClose,
  onAddToCart,
  language,
}) => {
  const isUr = language === 'ur';

  // Sizing
  const defaultSize = item.slicePrice ? 'slice' : 'regular';
  const [size, setSize] = useState<'slice' | 'regular' | 'large' | 'jumbo'>(defaultSize);

  // Crust
  const [crust, setCrust] = useState<'classic' | 'thin' | 'cheese_stuffed' | 'garlic_butter'>('classic');

  // Sauce
  const [sauce, setSauce] = useState<'classic_tomato' | 'spicy_marinara' | 'creamy_garlic' | 'bbq_smoky'>('classic_tomato');

  // Cheese
  const [cheeseLevel, setCheeseLevel] = useState<'standard' | 'extra' | 'double'>('standard');

  // Toppings
  const [selectedToppings, setSelectedToppings] = useState<PizzaTopping[]>(() => {
    // default with pepperoni or mushroom if item name suggests
    if (item.name.toLowerCase().includes('pepperoni')) {
      return [AVAILABLE_TOPPINGS[0]];
    }
    if (item.name.toLowerCase().includes('mushroom') || item.name.toLowerCase().includes('truffle')) {
      return [AVAILABLE_TOPPINGS[3]];
    }
    return [AVAILABLE_TOPPINGS[0], AVAILABLE_TOPPINGS[4]];
  });

  const [specialInstructions, setSpecialInstructions] = useState('');

  // Calculate pricing
  const basePrice = (() => {
    if (size === 'slice') return item.slicePrice || 4.29;
    if (size === 'regular') return item.price || 12.99;
    if (size === 'large') return (item.price || 12.99) * 1.45;
    return (item.price || 12.99) * 1.95;
  })();

  const crustCost = crust === 'cheese_stuffed' ? 1.5 : crust === 'garlic_butter' ? 0.99 : 0;
  const cheeseCost = cheeseLevel === 'extra' ? 1.0 : cheeseLevel === 'double' ? 2.0 : 0;
  const toppingsCost = selectedToppings.reduce((acc, t) => acc + (size === 'slice' ? t.price * 0.45 : t.price), 0);
  const totalUnitPrice = Number((basePrice + crustCost + cheeseCost + toppingsCost).toFixed(2));

  const toggleTopping = (topping: PizzaTopping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleConfirm = () => {
    const sizeLabels = {
      slice: isUr ? 'سنگل جمبو سلائس' : 'Single Jumbo Slice',
      regular: isUr ? 'میڈیم پیزا (10 انچ)' : 'Medium Pie (10")',
      large: isUr ? 'لارج پیزا (14 انچ)' : 'Large Pie (14")',
      jumbo: isUr ? 'پارٹی سائز (18 انچ)' : 'Party Giant (18")',
    };

    const crustLabels = {
      classic: isUr ? 'ہینڈ ٹاسڈ کرسٹ' : 'Classic Hand-Tossed',
      thin: isUr ? 'تھن اینڈ کرسپی' : 'Thin & Crispy',
      cheese_stuffed: isUr ? 'چیز اسٹفڈ رنگ' : 'Cheese Stuffed Crust',
      garlic_butter: isUr ? 'گارلک بٹر ہرب' : 'Garlic Herb Butter Crust',
    };

    const sauceLabels = {
      classic_tomato: isUr ? 'سان مارزانو ٹماٹر' : 'San Marzano Tomato',
      spicy_marinara: isUr ? 'اسپائسی میرینارا' : 'Spicy Marinara',
      creamy_garlic: isUr ? 'کیمی الفریڈو گارلک' : 'Creamy Garlic Alfredo',
      bbq_smoky: isUr ? 'اسمونکی بی بی کیو' : 'Smokey BBQ Glaze',
    };

    const customized: CustomizedPizza = {
      baseItemName: item.name,
      size,
      sizeLabel: sizeLabels[size],
      crust,
      crustLabel: crustLabels[crust],
      sauce,
      sauceLabel: sauceLabels[sauce],
      cheeseLevel,
      selectedToppings,
      specialInstructions,
      unitPrice: totalUnitPrice,
    };

    onAddToCart(customized);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-amber-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-amber-50 to-orange-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🍕</span>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                {isUr ? 'اپنی مرضی کا سلائس / پیزا تیار کریں' : 'Custom Slice & Pizza Studio'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              {shopName} · {item.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Pizza Visualizer Canvas (Interactive Render) */}
          <div className="relative bg-gradient-to-b from-stone-900 to-stone-800 rounded-2xl p-6 text-center overflow-hidden flex flex-col items-center justify-center shadow-inner">
            <div className="absolute top-3 left-4 flex items-center gap-1.5 text-xs text-amber-300 font-medium bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isUr ? 'لائیو پیزا سلائس ویژولائزر' : 'Live Slice Visualizer'}</span>
            </div>

            <div className="mt-4 mb-2 flex items-center justify-center">
              {size === 'slice' ? (
                // SVG Slice Visualizer
                <div className="relative w-52 h-52 flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(245,158,11,0.25)]">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform rotate-12">
                    {/* Crust Outer Edge */}
                    <path
                      d="M 100 20 C 135 23, 165 35, 185 55 L 100 185 Z"
                      fill={crust === 'cheese_stuffed' ? '#d97706' : crust === 'thin' ? '#b45309' : '#f59e0b'}
                      stroke="#92400e"
                      strokeWidth="2.5"
                    />
                    {/* Inner Sauce Base */}
                    <path
                      d="M 102 32 C 132 35, 156 46, 172 62 L 102 172 Z"
                      fill={
                        sauce === 'creamy_garlic'
                          ? '#fef08a'
                          : sauce === 'bbq_smoky'
                          ? '#78350f'
                          : sauce === 'spicy_marinara'
                          ? '#991b1b'
                          : '#dc2626'
                      }
                    />
                    {/* Melty Cheese Layer */}
                    <path
                      d="M 102 36 C 130 39, 152 49, 166 64 L 102 165 Z"
                      fill={cheeseLevel === 'double' ? '#fde047' : '#fef08a'}
                      opacity={cheeseLevel === 'standard' ? 0.9 : 0.98}
                    />

                    {/* Dynamic Toppings on Slice */}
                    {selectedToppings.some((t) => t.id === 'pepperoni') && (
                      <g fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1.2">
                        <circle cx="120" cy="70" r="10" />
                        <circle cx="145" cy="85" r="9" />
                        <circle cx="115" cy="110" r="11" />
                        <circle cx="130" cy="130" r="8" />
                        <circle cx="108" cy="148" r="7" />
                      </g>
                    )}

                    {selectedToppings.some((t) => t.id === 'mushrooms') && (
                      <g fill="#78716c">
                        <path d="M 130 60 a 6 6 0 0 1 12 0 v 3 h -12 z" />
                        <path d="M 110 90 a 7 7 0 0 1 14 0 v 3 h -14 z" />
                        <path d="M 138 115 a 6 6 0 0 1 12 0 v 2 h -12 z" />
                      </g>
                    )}

                    {selectedToppings.some((t) => t.id === 'black_olives') && (
                      <g fill="#1c1917" stroke="#44403c" strokeWidth="2">
                        <circle cx="135" cy="78" r="4.5" fill="none" />
                        <circle cx="120" cy="125" r="4" fill="none" />
                        <circle cx="140" cy="100" r="4.5" fill="none" />
                      </g>
                    )}

                    {selectedToppings.some((t) => t.id === 'jalapenos') && (
                      <g fill="#15803d">
                        <circle cx="125" cy="98" r="5" stroke="#166534" strokeWidth="1.5" />
                        <circle cx="145" cy="120" r="4" stroke="#166534" strokeWidth="1.5" />
                      </g>
                    )}

                    {selectedToppings.some((t) => t.id === 'chicken_fajita') && (
                      <g fill="#c2410c">
                        <rect x="110" y="75" width="8" height="6" rx="2" transform="rotate(20 110 75)" />
                        <rect x="135" y="65" width="9" height="7" rx="2" transform="rotate(-15 135 65)" />
                        <rect x="122" y="118" width="8" height="7" rx="2" transform="rotate(40 122 118)" />
                      </g>
                    )}

                    {selectedToppings.some((t) => t.id === 'fresh_basil') && (
                      <g fill="#22c55e">
                        <ellipse cx="128" cy="88" rx="6" ry="3" transform="rotate(35 128 88)" />
                        <ellipse cx="118" cy="135" rx="5" ry="2.5" transform="rotate(-25 118 135)" />
                      </g>
                    )}
                  </svg>
                </div>
              ) : (
                // Full Round Pizza Visualizer with 8 Slices
                <div className="relative w-56 h-56 flex items-center justify-center filter drop-shadow-[0_10px_25px_rgba(245,158,11,0.3)]">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Outer Crust */}
                    <circle
                      cx="100"
                      cy="100"
                      r="94"
                      fill={crust === 'cheese_stuffed' ? '#d97706' : '#f59e0b'}
                      stroke="#92400e"
                      strokeWidth="3"
                    />
                    {/* Sauce */}
                    <circle
                      cx="100"
                      cy="100"
                      r="84"
                      fill={
                        sauce === 'creamy_garlic'
                          ? '#fef08a'
                          : sauce === 'bbq_smoky'
                          ? '#78350f'
                          : sauce === 'spicy_marinara'
                          ? '#991b1b'
                          : '#dc2626'
                      }
                    />
                    {/* Cheese Base */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill={cheeseLevel === 'double' ? '#fde047' : '#fef08a'}
                      opacity={cheeseLevel === 'standard' ? 0.9 : 0.98}
                    />

                    {/* Slices Cut Lines */}
                    <line x1="100" y1="16" x2="100" y2="184" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="16" y1="100" x2="184" y2="100" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="40" x2="160" y2="160" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="160" y1="40" x2="40" y2="160" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Pepperoni */}
                    {selectedToppings.some((t) => t.id === 'pepperoni') && (
                      <g fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1.2">
                        <circle cx="100" cy="65" r="9" />
                        <circle cx="100" cy="135" r="9" />
                        <circle cx="65" cy="100" r="9" />
                        <circle cx="135" cy="100" r="9" />
                        <circle cx="75" cy="75" r="9" />
                        <circle cx="125" cy="75" r="9" />
                        <circle cx="75" cy="125" r="9" />
                        <circle cx="125" cy="125" r="9" />
                        <circle cx="100" cy="100" r="10" />
                      </g>
                    )}

                    {/* Black Olives */}
                    {selectedToppings.some((t) => t.id === 'black_olives') && (
                      <g fill="#1c1917" stroke="#44403c" strokeWidth="1.5">
                        <circle cx="85" cy="60" r="3.5" fill="none" />
                        <circle cx="115" cy="60" r="3.5" fill="none" />
                        <circle cx="85" cy="140" r="3.5" fill="none" />
                        <circle cx="115" cy="140" r="3.5" fill="none" />
                        <circle cx="60" cy="85" r="3.5" fill="none" />
                        <circle cx="140" cy="85" r="3.5" fill="none" />
                        <circle cx="60" cy="115" r="3.5" fill="none" />
                        <circle cx="140" cy="115" r="3.5" fill="none" />
                      </g>
                    )}

                    {/* Jalapenos */}
                    {selectedToppings.some((t) => t.id === 'jalapenos') && (
                      <g fill="#15803d">
                        <circle cx="95" cy="80" r="4" stroke="#166534" strokeWidth="1" />
                        <circle cx="115" cy="115" r="4" stroke="#166534" strokeWidth="1" />
                        <circle cx="80" cy="110" r="4" stroke="#166534" strokeWidth="1" />
                        <circle cx="120" cy="85" r="4" stroke="#166534" strokeWidth="1" />
                      </g>
                    )}

                    {/* Basil */}
                    {selectedToppings.some((t) => t.id === 'fresh_basil') && (
                      <g fill="#22c55e">
                        <ellipse cx="90" cy="95" rx="5" ry="3" transform="rotate(30 90 95)" />
                        <ellipse cx="112" cy="105" rx="5" ry="3" transform="rotate(-40 112 105)" />
                        <ellipse cx="100" cy="120" rx="5" ry="3" transform="rotate(15 100 120)" />
                      </g>
                    )}
                  </svg>
                </div>
              )}
            </div>

            <p className="text-xs text-stone-300">
              {size === 'slice'
                ? isUr
                  ? 'ایک بہت بڑا خستہ سلائس آپ کے سامنے ہے!'
                  : 'Hot & foldable artisan giant slice'
                : isUr
                ? 'پورا تازہ پیزا (8 لذیذ سلائسز)'
                : 'Whole freshly baked pie (8 slices)'}
            </p>
          </div>

          {/* Sizing Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {isUr ? '1. سائز منتخب کریں' : '1. Choose Size'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSize('slice')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  size === 'slice'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold ring-2 ring-amber-400/40'
                    : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                }`}
              >
                <div className="text-sm font-bold flex items-center justify-between">
                  <span>🍕 {isUr ? 'سنگل سلائس' : 'Single Slice'}</span>
                  {size === 'slice' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  ${(item.slicePrice || 4.29).toFixed(2)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSize('regular')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  size === 'regular'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold ring-2 ring-amber-400/40'
                    : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                }`}
              >
                <div className="text-sm font-bold flex items-center justify-between">
                  <span>Medium 10"</span>
                  {size === 'regular' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <div className="text-xs text-stone-500 mt-1">${(item.price || 12.99).toFixed(2)}</div>
              </button>

              <button
                type="button"
                onClick={() => setSize('large')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  size === 'large'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold ring-2 ring-amber-400/40'
                    : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                }`}
              >
                <div className="text-sm font-bold flex items-center justify-between">
                  <span>Large 14"</span>
                  {size === 'large' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <div className="text-xs text-stone-500 mt-1">${((item.price || 12.99) * 1.45).toFixed(2)}</div>
              </button>

              <button
                type="button"
                onClick={() => setSize('jumbo')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  size === 'jumbo'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold ring-2 ring-amber-400/40'
                    : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                }`}
              >
                <div className="text-sm font-bold flex items-center justify-between">
                  <span>Party 18"</span>
                  {size === 'jumbo' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <div className="text-xs text-stone-500 mt-1">${((item.price || 12.99) * 1.95).toFixed(2)}</div>
              </button>
            </div>
          </div>

          {/* Crust Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {isUr ? '2. کرسٹ کی قسم' : '2. Crust Style'}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'classic', label: isUr ? 'کلاسک ہینڈ ٹاسڈ' : 'Classic Hand-Tossed', price: 0 },
                { id: 'thin', label: isUr ? 'تھن اینڈ کرسپی' : 'Thin & Crispy NY Crust', price: 0 },
                { id: 'cheese_stuffed', label: isUr ? 'چیزی اسٹفڈ رم' : 'Cheese Stuffed Rim', price: 1.5 },
                { id: 'garlic_butter', label: isUr ? 'گارلک بٹر ہرب' : 'Garlic Herb Butter Crust', price: 0.99 },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCrust(c.id as any)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    crust === c.id
                      ? 'border-amber-500 bg-amber-50 text-stone-900 font-semibold'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="text-[11px] text-stone-400 font-normal">
                    {c.price > 0 ? `+$${c.price.toFixed(2)}` : 'Free'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sauce Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {isUr ? '3. چٹخارے دار سوس' : '3. Signature Sauce Base'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'classic_tomato', label: 'San Marzano Tomato', color: 'bg-red-600' },
                { id: 'spicy_marinara', label: 'Spicy Fire Marinara', color: 'bg-red-800' },
                { id: 'creamy_garlic', label: 'Creamy Alfredo Garlic', color: 'bg-amber-100 border border-amber-300' },
                { id: 'bbq_smoky', label: 'Smokey Hickory BBQ', color: 'bg-amber-900' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSauce(s.id as any)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors ${
                    sauce === s.id
                      ? 'border-amber-500 bg-amber-50 text-stone-900 font-semibold'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${s.color} shrink-0`} />
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cheese Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {isUr ? '4. چیز کی مقدار' : '4. Cheese Pull Factor'}
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'standard', label: isUr ? 'معیاری چیز' : 'Regular Mozzarella', cost: 0 },
                { id: 'extra', label: isUr ? 'اضافی چیز' : 'Extra Cheese (+ $1)', cost: 1.0 },
                { id: 'double', label: isUr ? 'ڈبل چیز برسٹ' : 'Double Cheese (+ $2)', cost: 2.0 },
              ].map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setCheeseLevel(ch.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-colors ${
                    cheeseLevel === ch.id
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-semibold'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <div>{ch.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Toppings Multi-Select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {isUr ? '5. اضافی ٹاپنگز شامل کریں' : '5. Add Gourmet Toppings'}
              </label>
              <span className="text-xs text-amber-700 font-medium">
                {selectedToppings.length} {isUr ? 'منتخب شدہ' : 'selected'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_TOPPINGS.map((topping) => {
                const isSelected = selectedToppings.some((t) => t.id === topping.id);
                const toppingDisplayPrice = size === 'slice' ? topping.price * 0.45 : topping.price;
                return (
                  <button
                    key={topping.id}
                    type="button"
                    onClick={() => toggleTopping(topping)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-medium ring-1 ring-amber-400'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: topping.color }}
                      />
                      <span className="truncate">{topping.name}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 shrink-0 ml-1">
                      +${toppingDisplayPrice.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              {isUr ? 'خاص ہدایات (شیف کے لیے)' : 'Special Chef Notes'}
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={
                isUr
                  ? 'مثلاً زیادہ خستہ کرسٹ، اوریگانو اوپر سے چھڑک دیں...'
                  : 'e.g. Well-done crispy crust, extra oregano flakes on side...'
              }
              className="w-full text-xs px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
            />
          </div>
        </div>

        {/* Footer with Price and Action */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block font-medium">
              {isUr ? 'کل قیمت' : 'Custom Price'}
            </span>
            <div className="text-xl font-bold text-stone-900">${totalUnitPrice.toFixed(2)}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-medium transition-colors"
            >
              {isUr ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <span>{size === 'slice' ? '🍕' : '🍕'}</span>
              <span>{isUr ? 'آرڈر میں شامل کریں' : 'Add Slice to Order'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
