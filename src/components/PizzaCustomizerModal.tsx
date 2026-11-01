import React, { useState } from 'react';
import { X, Plus, Minus, Check, Flame, Sparkles, ChefHat } from 'lucide-react';
import {
  MenuItem,
  PizzaTopping,
  ProductCustomization,
  PizzaSizeId,
} from '../types/pizza';
import { PIZZA_TOPPINGS } from '../data/menuData';
import { formatPrice } from '../utils/currency';
import { SafeImage } from './SafeImage';

interface Props {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (customization: ProductCustomization | undefined, quantity: number, unitPrice: number, summary: string) => void;
  language: 'en' | 'ur';
}

export const PizzaCustomizerModal: React.FC<Props> = ({
  item,
  onClose,
  onAddToCart,
  language,
}) => {
  const isUr = language === 'ur';
  const isPizza = item.category === 'pizza' || item.customizationType === 'pizza';
  const isBurger = item.category.includes('burger') || item.customizationType === 'burger';
  const isShawarma = item.category === 'shawarma' || item.category === 'wraps-rolls' || item.customizationType === 'shawarma';

  // Quantity
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Pizza states
  const defaultSizeId: PizzaSizeId = (item.availableSizes && item.availableSizes[1]?.id) || 'medium';
  const [pizzaSize, setPizzaSize] = useState<PizzaSizeId>(defaultSizeId);
  const [crust, setCrust] = useState<'classic' | 'thin' | 'cheese_stuffed'>('classic');
  const [cheeseLevel, setCheeseLevel] = useState<'regular' | 'extra' | 'double'>('regular');
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'hot'>('medium');
  const [selectedToppings, setSelectedToppings] = useState<PizzaTopping[]>([]);

  // Burger states
  const [patty, setPatty] = useState<'single' | 'double'>('single');
  const [extraCheese, setExtraCheese] = useState(false);
  const [extraSauce, setExtraSauce] = useState(false);
  const [removeOnions, setRemoveOnions] = useState(false);
  const [removeTomatoes, setRemoveTomatoes] = useState(false);
  const [burgerSpice, setBurgerSpice] = useState<'mild' | 'medium' | 'hot'>('medium');

  // Shawarma states
  const [shawarmaSauce, setShawarmaSauce] = useState<'garlic_mayo' | 'tahini' | 'spicy_chili' | 'bbq'>('garlic_mayo');
  const [shawarmaCheese, setShawarmaCheese] = useState(false);
  const [shawarmaSpice, setShawarmaSpice] = useState<'mild' | 'medium' | 'hot'>('medium');

  // Calculate Unit Price in PKR
  const calculateUnitPrice = (): number => {
    if (isPizza) {
      const selectedSizeObj = item.availableSizes?.find((s) => s.id === pizzaSize);
      const base = selectedSizeObj ? selectedSizeObj.price : item.price;
      const crustCost = crust === 'cheese_stuffed' ? 150 : 0;
      const cheeseCost = cheeseLevel === 'extra' ? 150 : cheeseLevel === 'double' ? 250 : 0;
      const toppingsCost = selectedToppings.reduce((sum, t) => sum + t.price, 0);
      return base + crustCost + cheeseCost + toppingsCost;
    }

    if (isBurger) {
      let price = item.price;
      if (patty === 'double') price += 200;
      if (extraCheese) price += 80;
      if (extraSauce) price += 50;
      return price;
    }

    if (isShawarma) {
      let price = item.price;
      if (shawarmaCheese) price += 80;
      return price;
    }

    return item.price;
  };

  const unitPrice = calculateUnitPrice();
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping: PizzaTopping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleConfirm = () => {
    if (isPizza) {
      const sizeObj = item.availableSizes?.find((s) => s.id === pizzaSize);
      const sizeLabel = sizeObj ? sizeObj.label : pizzaSize;
      const crustLabel =
        crust === 'cheese_stuffed'
          ? isUr ? 'چیز اسٹفڈ رم' : 'Cheese Stuffed Crust (+Rs. 150)'
          : crust === 'thin'
          ? isUr ? 'تھن کرسٹ' : 'Thin Crust'
          : isUr ? 'کلاسک کرسٹ' : 'Classic Crust';

      const cheeseLabel =
        cheeseLevel === 'double'
          ? isUr ? 'ڈبل چیز' : 'Double Cheese (+Rs. 250)'
          : cheeseLevel === 'extra'
          ? isUr ? 'اضافی چیز' : 'Extra Cheese (+Rs. 150)'
          : isUr ? 'معیاری چیز' : 'Regular Cheese';

      const toppingsList = selectedToppings.map((t) => t.name).join(', ');
      const summaryParts = [
        sizeLabel,
        crustLabel,
        cheeseLabel,
        toppingsList ? `Toppings: ${toppingsList}` : '',
        `Spice: ${spiceLevel.toUpperCase()}`,
      ].filter(Boolean);

      const pizzaCustomization: ProductCustomization = {
        type: 'pizza',
        sizeId: pizzaSize,
        sizeLabel,
        crust,
        crustLabel,
        crustPrice: crust === 'cheese_stuffed' ? 150 : 0,
        cheeseLevel,
        cheeseLabel,
        cheesePrice: cheeseLevel === 'extra' ? 150 : cheeseLevel === 'double' ? 250 : 0,
        spiceLevel,
        selectedToppings,
        specialInstructions,
        unitPrice,
      };

      onAddToCart(pizzaCustomization, quantity, unitPrice, summaryParts.join(' · '));
      return;
    }

    if (isBurger) {
      const summaryParts = [
        patty === 'double' ? (isUr ? 'ڈبل پیٹی (+Rs. 200)' : 'Double Patty (+Rs. 200)') : (isUr ? 'سنگل پیٹی' : 'Single Patty'),
        extraCheese ? (isUr ? 'اضافی چیز (+Rs. 80)' : 'Extra Cheese (+Rs. 80)') : '',
        extraSauce ? (isUr ? 'اضافی سوس (+Rs. 50)' : 'Extra Sauce (+Rs. 50)') : '',
        removeOnions ? (isUr ? 'بغیر پیاز' : 'No Onions') : '',
        removeTomatoes ? (isUr ? 'بغیر ٹماٹر' : 'No Tomatoes') : '',
        `Spice: ${burgerSpice.toUpperCase()}`,
      ].filter(Boolean);

      const burgerCustomization: ProductCustomization = {
        type: 'burger',
        patty,
        pattyExtraPrice: patty === 'double' ? 200 : 0,
        extraCheese,
        extraCheesePrice: extraCheese ? 80 : 0,
        extraSauce,
        extraSaucePrice: extraSauce ? 50 : 0,
        removeOnions,
        removeTomatoes,
        spiceLevel: burgerSpice,
        specialInstructions,
        unitPrice,
      };

      onAddToCart(burgerCustomization, quantity, unitPrice, summaryParts.join(' · '));
      return;
    }

    if (isShawarma) {
      const summaryParts = [
        `Sauce: ${shawarmaSauce.replace('_', ' ').toUpperCase()}`,
        shawarmaCheese ? (isUr ? 'اضافی چیز (+Rs. 80)' : 'Extra Cheese (+Rs. 80)') : '',
        `Spice: ${shawarmaSpice.toUpperCase()}`,
      ].filter(Boolean);

      const shawarmaCustomization: ProductCustomization = {
        type: 'shawarma',
        sauce: shawarmaSauce,
        sauceLabel: shawarmaSauce.replace('_', ' '),
        spiceLevel: shawarmaSpice,
        extraCheese: shawarmaCheese,
        extraCheesePrice: shawarmaCheese ? 80 : 0,
        specialInstructions,
        unitPrice,
      };

      onAddToCart(shawarmaCustomization, quantity, unitPrice, summaryParts.join(' · '));
      return;
    }

    // Default item
    onAddToCart(undefined, quantity, unitPrice, specialInstructions ? `Notes: ${specialInstructions}` : '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-amber-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FFF9F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-700 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-red-700/20">
              {isPizza ? '🍕' : isBurger ? '🍔' : '🌯'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif leading-snug">
                {isUr ? item.urduName || item.name : item.name}
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                {isUr ? 'زم زم پیزا سلائس کسٹمائزر' : 'Zam Zam Pizza Slice Customizer'}
              </p>
            </div>
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
          {/* PIZZA VISUALIZER CANVAS (FOR PIZZAS) */}
          {isPizza && (
            <div className="relative bg-gradient-to-b from-stone-900 via-stone-900 to-stone-800 rounded-2xl p-6 text-center overflow-hidden flex flex-col items-center justify-center shadow-inner">
              <div className="absolute top-3 left-4 flex items-center gap-1.5 text-xs text-amber-300 font-medium bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isUr ? 'لائیو پیزا ویژولائزر' : 'Live Pizza Visualizer'}</span>
              </div>

              <div className="mt-4 mb-2 flex items-center justify-center">
                <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(198,40,40,0.35)]">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Outer Crust */}
                    <circle
                      cx="100"
                      cy="100"
                      r="94"
                      fill={crust === 'cheese_stuffed' ? '#b45309' : crust === 'thin' ? '#d97706' : '#f59e0b'}
                      stroke="#78350f"
                      strokeWidth="3.5"
                    />
                    {/* Sauce Base */}
                    <circle
                      cx="100"
                      cy="100"
                      r="84"
                      fill="#b91c1c"
                    />
                    {/* Cheese Layer */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill={cheeseLevel === 'double' ? '#fde047' : '#fef08a'}
                      opacity={cheeseLevel === 'regular' ? 0.9 : 0.98}
                    />

                    {/* Slices Cut Lines */}
                    <line x1="100" y1="16" x2="100" y2="184" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="16" y1="100" x2="184" y2="100" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="40" x2="160" y2="160" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="160" y1="40" x2="40" y2="160" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Chicken Topping */}
                    {(selectedToppings.some((t) => t.id === 'chicken') || item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('fajita') || item.name.toLowerCase().includes('tikka')) && (
                      <g fill="#c2410c">
                        <rect x="85" y="70" width="12" height="7" rx="2" transform="rotate(25 85 70)" />
                        <rect x="120" y="65" width="11" height="8" rx="2" transform="rotate(-15 120 65)" />
                        <rect x="75" y="115" width="12" height="8" rx="2" transform="rotate(40 75 115)" />
                        <rect x="110" y="125" width="10" height="7" rx="2" transform="rotate(-30 110 125)" />
                        <rect x="95" y="95" width="13" height="8" rx="2" transform="rotate(10 95 95)" />
                      </g>
                    )}

                    {/* Black Olives */}
                    {selectedToppings.some((t) => t.id === 'olives') && (
                      <g fill="#1c1917" stroke="#44403c" strokeWidth="1.5">
                        <circle cx="85" cy="55" r="4" fill="none" />
                        <circle cx="115" cy="55" r="4" fill="none" />
                        <circle cx="65" cy="90" r="4" fill="none" />
                        <circle cx="135" cy="90" r="4" fill="none" />
                        <circle cx="80" cy="135" r="4" fill="none" />
                        <circle cx="120" cy="135" r="4" fill="none" />
                      </g>
                    )}

                    {/* Mushrooms */}
                    {selectedToppings.some((t) => t.id === 'mushrooms') && (
                      <g fill="#78716c">
                        <path d="M 95 65 a 6 6 0 0 1 12 0 v 3 h -12 z" />
                        <path d="M 68 100 a 6 6 0 0 1 12 0 v 3 h -12 z" />
                        <path d="M 125 110 a 6 6 0 0 1 12 0 v 3 h -12 z" />
                      </g>
                    )}

                    {/* Jalapenos */}
                    {selectedToppings.some((t) => t.id === 'jalapenos') && (
                      <g fill="#15803d">
                        <circle cx="100" cy="78" r="4.5" stroke="#166534" strokeWidth="1.5" />
                        <circle cx="82" cy="115" r="4.5" stroke="#166534" strokeWidth="1.5" />
                        <circle cx="125" cy="90" r="4.5" stroke="#166534" strokeWidth="1.5" />
                      </g>
                    )}

                    {/* Sweet Corn */}
                    {selectedToppings.some((t) => t.id === 'sweet_corn') && (
                      <g fill="#eab308">
                        <circle cx="88" cy="88" r="3" />
                        <circle cx="112" cy="80" r="3" />
                        <circle cx="105" cy="115" r="3" />
                        <circle cx="70" cy="80" r="3" />
                        <circle cx="130" cy="120" r="3" />
                      </g>
                    )}
                  </svg>
                </div>
              </div>
              <p className="text-xs text-stone-300">
                {isUr ? 'تازہ آٹے سے تیار شدہ خستہ کرسٹ اور لذیذ ٹاپنگز' : 'Freshly hand-stretched dough & signature Zam Zam sauce'}
              </p>
            </div>
          )}

          {/* ITEM PREVIEW (FOR BURGER / SHAWARMA / SIDES) */}
          {!isPizza && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFF9F2] border border-amber-200">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  fallbackCategory={item.fallbackCategory}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900 font-serif">
                  {isUr ? item.urduName || item.name : item.name}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                  {item.description}
                </p>
                <div className="text-sm font-black text-red-700 mt-2">
                  {formatPrice(unitPrice)}
                </div>
              </div>
            </div>
          )}

          {/* PIZZA SIZE SELECTOR */}
          {isPizza && item.availableSizes && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                {isUr ? '1. پیزا کا سائز منتخب کریں' : '1. Choose Pizza Size'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {item.availableSizes.map((sizeOpt) => {
                  const isSelected = pizzaSize === sizeOpt.id;
                  return (
                    <button
                      key={sizeOpt.id}
                      type="button"
                      onClick={() => setPizzaSize(sizeOpt.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-red-700 bg-red-50 text-red-950 font-bold ring-2 ring-red-700/30'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-800'
                      }`}
                    >
                      <div className="text-sm font-bold flex items-center justify-between">
                        <span>{isUr ? sizeOpt.urduLabel : sizeOpt.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-red-700" />}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{sizeOpt.description}</div>
                      <div className="text-xs font-black text-red-700 mt-1.5">
                        {formatPrice(sizeOpt.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PIZZA CRUST SELECTOR */}
          {isPizza && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                {isUr ? '2. کرسٹ کا انتخاب' : '2. Crust Type'}
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'classic', label: isUr ? 'کلاسک کرسٹ' : 'Classic Hand-Tossed', price: 0 },
                  { id: 'thin', label: isUr ? 'تھن کرسٹ' : 'Thin & Crispy', price: 0 },
                  { id: 'cheese_stuffed', label: isUr ? 'چیز اسٹفڈ رم' : 'Cheese Stuffed (+Rs. 150)', price: 150 },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCrust(c.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-colors ${
                      crust === c.id
                        ? 'border-red-700 bg-red-50 text-red-950 font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                    }`}
                  >
                    <div>{c.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PIZZA CHEESE LEVEL */}
          {isPizza && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                {isUr ? '3. چیز کی مقدار' : '3. Cheese Quantity'}
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'regular', label: isUr ? 'معیاری چیز' : 'Regular Cheese', cost: 0 },
                  { id: 'extra', label: isUr ? 'اضافی چیز (+Rs. 150)' : 'Extra Cheese (+Rs. 150)', cost: 150 },
                  { id: 'double', label: isUr ? 'ڈبل چیز برسٹ (+Rs. 250)' : 'Double Cheese (+Rs. 250)', cost: 250 },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setCheeseLevel(ch.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-colors ${
                      cheeseLevel === ch.id
                        ? 'border-red-700 bg-red-50 text-red-950 font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                    }`}
                  >
                    <div>{ch.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PIZZA EXTRA TOPPINGS */}
          {isPizza && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  {isUr ? '4. اضافی ٹاپنگز شامل کریں' : '4. Additional Toppings'}
                </label>
                <span className="text-xs text-red-700 font-bold">
                  {selectedToppings.length} {isUr ? 'منتخب' : 'selected'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {PIZZA_TOPPINGS.map((topping) => {
                  const isSelected = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <button
                      key={topping.id}
                      type="button"
                      onClick={() => toggleTopping(topping)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-red-700 bg-red-50 text-red-950 font-bold ring-1 ring-red-700'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      <div className="truncate pr-1">
                        {isUr ? topping.urduName : topping.name}
                      </div>
                      <span className="text-red-700 font-semibold shrink-0">
                        +{formatPrice(topping.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* BURGER CUSTOMIZATION OPTIONS */}
          {isBurger && (
            <div className="space-y-4">
              {/* Patty choice */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  {isUr ? 'پیٹی کا انتخاب' : 'Patty Selection'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPatty('single')}
                    className={`p-3 rounded-xl border text-center font-bold ${
                      patty === 'single'
                        ? 'border-red-700 bg-red-50 text-red-950'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    {isUr ? 'سنگل پیٹی' : 'Single Patty'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatty('double')}
                    className={`p-3 rounded-xl border text-center font-bold ${
                      patty === 'double'
                        ? 'border-red-700 bg-red-50 text-red-950'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    {isUr ? 'ڈبل پیٹی (+Rs. 200)' : 'Double Patty (+Rs. 200)'}
                  </button>
                </div>
              </div>

              {/* Extras toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  {isUr ? 'اضافی چیزیں اور ترجیحات' : 'Add-ons & Preferences'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setExtraCheese(!extraCheese)}
                    className={`p-2.5 rounded-xl border text-left flex justify-between items-center ${
                      extraCheese ? 'border-red-700 bg-red-50 text-red-950 font-bold' : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span>{isUr ? 'اضافی چیز' : 'Extra Cheese'}</span>
                    <span>+Rs. 80</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtraSauce(!extraSauce)}
                    className={`p-2.5 rounded-xl border text-left flex justify-between items-center ${
                      extraSauce ? 'border-red-700 bg-red-50 text-red-950 font-bold' : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span>{isUr ? 'اضافی سوس' : 'Extra Sauce'}</span>
                    <span>+Rs. 50</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveOnions(!removeOnions)}
                    className={`p-2.5 rounded-xl border text-left flex justify-between items-center ${
                      removeOnions ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold' : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span>{isUr ? 'پیاز نہ ڈالیں' : 'No Onions'}</span>
                    <span>✓</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveTomatoes(!removeTomatoes)}
                    className={`p-2.5 rounded-xl border text-left flex justify-between items-center ${
                      removeTomatoes ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold' : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span>{isUr ? 'ٹماٹر نہ ڈالیں' : 'No Tomatoes'}</span>
                    <span>✓</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SHAWARMA / WRAP CUSTOMIZATION */}
          {isShawarma && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  {isUr ? 'سوس کا انتخاب' : 'Signature Sauce'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'garlic_mayo', label: 'Garlic Mayo Toum' },
                    { id: 'tahini', label: 'Classic Tahini' },
                    { id: 'spicy_chili', label: 'Fiery Red Chili' },
                    { id: 'bbq', label: 'Smoky BBQ' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShawarmaSauce(s.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold truncate ${
                        shawarmaSauce === s.id
                          ? 'border-red-700 bg-red-50 text-red-950'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShawarmaCheese(!shawarmaCheese)}
                  className={`w-full p-3 rounded-xl border text-xs flex justify-between items-center font-bold ${
                    shawarmaCheese ? 'border-red-700 bg-red-50 text-red-950' : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  <span>{isUr ? 'پگھلی ہوئی چیز شامل کریں' : 'Add Melted Cheese'}</span>
                  <span>+Rs. 80</span>
                </button>
              </div>
            </div>
          )}

          {/* SPICE LEVEL SELECTOR */}
          {(isPizza || isBurger || isShawarma) && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                {isUr ? 'مرچ کی شدت' : 'Spice Level'}
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'mild', label: isUr ? 'ہلکی مرچ' : 'Mild' },
                  { id: 'medium', label: isUr ? 'درمیانی مرچ' : 'Medium' },
                  { id: 'hot', label: isUr ? 'تیز مصالحہ' : 'Hot & Spicy 🔥' },
                ].map((sp) => {
                  const currentSpice = isPizza ? spiceLevel : isBurger ? burgerSpice : shawarmaSpice;
                  const setSpice = isPizza ? setSpiceLevel : isBurger ? setBurgerSpice : setShawarmaSpice;
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setSpice(sp.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-colors ${
                        currentSpice === sp.id
                          ? 'border-red-700 bg-red-50 text-red-950'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      {sp.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUANTITY SELECTOR */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              {isUr ? 'تعداد' : 'Quantity'}
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white text-stone-800 flex items-center justify-center font-bold shadow-xs hover:bg-stone-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-white text-stone-800 flex items-center justify-center font-bold shadow-xs hover:bg-stone-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-stone-500">
                {unitPrice > 0 && `@ ${formatPrice(unitPrice)} each`}
              </span>
            </div>
          </div>

          {/* SPECIAL INSTRUCTIONS */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              {isUr ? 'شیف کے لیے خصوصی ہدایات' : 'Special Chef Notes'}
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={
                isUr
                  ? 'مثلاً زیادہ خستہ کرسٹ، الگ سے اوریگانو پاؤچ...'
                  : 'e.g. Well-done crispy crust, extra garlic dip on side...'
              }
              className="w-full text-xs px-3.5 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-800"
            />
          </div>
        </div>

        {/* Footer with Price and Action */}
        <div className="px-6 py-4 border-t border-stone-100 bg-[#FFF9F2] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 block font-medium">
              {isUr ? 'کل رقم' : 'Calculated Price'}
            </span>
            <div className="text-2xl font-black text-red-700 font-serif">
              {formatPrice(totalPrice)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-semibold transition-colors"
            >
              {isUr ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-700/25 flex items-center gap-2 transition-transform active:scale-95"
            >
              <span>{isPizza ? '🍕' : isBurger ? '🍔' : '🛍️'}</span>
              <span>{isUr ? 'کارٹ میں شامل کریں' : 'Add to Order'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
