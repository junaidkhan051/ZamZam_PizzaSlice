import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Flame,
  Clock,
  Sparkles,
  ShoppingBag,
  MapPin,
  Phone,
  Check,
  ChevronRight,
  Pizza,
  Zap,
  ShieldCheck,
  Heart,
  Utensils,
  Award,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import {
  MenuItem,
  CartItem,
  Order,
  MenuCategoryId,
  ProductCustomization,
} from './types/pizza';
import {
  MENU_CATEGORIES,
  MENU_ITEMS,
  RESTAURANT_INFO,
} from './data/menuData';
import { formatPrice } from './utils/currency';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { PizzaCustomizerModal } from './components/PizzaCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { SafeImage } from './components/SafeImage';

export default function App() {
  // Language State
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const isUr = language === 'ur';

  // Navigation active section
  const [activeNavSection, setActiveNavSection] = useState('hero');

  // Menu Search & Filter State
  const [selectedCategory, setSelectedCategory] = useState<MenuCategoryId | 'all'>('pizza');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'name'>('recommended');

  // Customizer Modal
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Cart State with LocalStorage Persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('zam_zam_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Active Order Tracking State
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('zam_zam_cart_items', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Smooth Scroll navigation
  const scrollToSection = (sectionId: string) => {
    setActiveNavSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered Menu Items
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Category match
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search match
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        item.name.toLowerCase().includes(q) ||
        (item.urduName && item.urduName.includes(q)) ||
        item.description.toLowerCase().includes(q) ||
        (item.dealItems && item.dealItems.some((di) => di.toLowerCase().includes(q)))
      );
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });
  }, [selectedCategory, searchQuery, sortBy]);

  // Featured Best Sellers for Showcase Section
  const bestSellers = useMemo(() => {
    return MENU_ITEMS.filter((it) => it.isBestseller).slice(0, 6);
  }, []);

  // Featured Deals for Deals Section
  const featuredDeals = useMemo(() => {
    return MENU_ITEMS.filter((it) => it.category === 'family-deals' || it.category === 'combo-deals').slice(0, 4);
  }, []);

  // Quick Add Standard Item to Cart
  const handleQuickAdd = (item: MenuItem) => {
    const existingIndex = cart.findIndex(
      (c) => c.menuItem.id === item.id && !c.customizationSummary
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice =
        updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        cartItemId: `item_${item.id}_${Date.now()}`,
        menuItem: item,
        quantity: 1,
        unitPrice: item.price,
        totalPrice: item.price,
      };
      setCart((prev) => [...prev, newItem]);
    }

    triggerToast(
      isUr
        ? `${item.urduName || item.name} کارٹ میں شامل ہو گیا!`
        : `Added ${item.name} to cart!`
    );
  };

  // Add Customized Item to Cart
  const handleAddCustomized = (
    customization: ProductCustomization | undefined,
    quantity: number,
    unitPrice: number,
    summary: string
  ) => {
    if (!customizingItem) return;

    // Different customizations must be separate entries
    const newItem: CartItem = {
      cartItemId: `cust_${customizingItem.id}_${Date.now()}_${Math.random()}`,
      menuItem: customizingItem,
      customization,
      customizationSummary: summary,
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
    };

    setCart((prev) => [...prev, newItem]);
    setCustomizingItem(null);
    triggerToast(
      isUr
        ? `${customizingItem.urduName || customizingItem.name} کسٹمائزیشن کے ساتھ شامل ہو گیا!`
        : `Added custom ${customizingItem.name} to cart!`
    );
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice }
          : item
      )
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => setCart([]);

  const handlePlaceOrder = (order: Order) => {
    setActiveOrder(order);
    setIsOrderTrackerOpen(true);
    triggerToast(
      isUr
        ? `آرڈر #${order.orderNumber} موصول ہو گیا ہے! شکریہ۔`
        : `Order #${order.orderNumber} confirmed! Chef is preparing your meal.`
    );
  };

  const cartTotal = cart.reduce((acc, it) => acc + it.totalPrice, 0);
  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FFF9F2] font-sans text-stone-900 antialiased flex flex-col selection:bg-red-700 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] text-amber-300 text-xs sm:text-sm font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-400/40 animate-bounce">
          <span className="text-lg">🍕</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'ur' : 'en')}
        activeOrderCount={activeOrder ? 1 : 0}
        onOpenActiveOrder={() => setIsOrderTrackerOpen(true)}
        activeSection={activeNavSection}
        onNavigate={scrollToSection}
      />

      <main className="flex-1">
        {/* ==================== SECTION 2: HERO SECTION ==================== */}
        <section id="hero" className="relative overflow-hidden bg-[#171717] text-white pt-10 pb-16 lg:py-24">
          {/* Subtle warm glow background effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-700/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column Text Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-red-700/30 text-amber-300 border border-red-600/40 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-xs">
                  <span>🍕</span>
                  <span>{RESTAURANT_INFO.name} · CHOWK MARLEY</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-[1.1] text-white">
                  {isUr ? (
                    <>
                      کیا آپ کچھ <span className="text-amber-400">لذیذ</span> کھانے کے خواہشمند ہیں؟
                    </>
                  ) : (
                    <>
                      Craving Something <span className="text-amber-400">Delicious?</span>
                    </>
                  )}
                </h1>

                <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed">
                  {isUr
                    ? 'زم زم پیزا سلائس پر تازہ دم پیزا، کرسپی زنگر برگرز، لذیذ فرائز، چیزی شوارما اور شاندار فیملی ڈیلز کا لطف اٹھائیں — چوک مرلی، پنجاب میں تیز رفتار ڈیلیوری اور پک اپ کے ساتھ۔'
                    : 'Discover freshly baked pizzas, juicy burgers, crispy fries, and irresistible deals at Zam Zam Pizza Slice. Handcrafted with premium ingredients at Chowk Marley.'}
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => scrollToSection('menu')}
                    className="px-6 py-3.5 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm shadow-lg shadow-red-700/35 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <span>{isUr ? 'ابھی آرڈر کریں' : 'Order Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => scrollToSection('menu')}
                    className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm backdrop-blur-xs transition-colors"
                  >
                    {isUr ? 'مکمل مینیو دیکھیں' : 'Explore Menu'}
                  </button>

                  <button
                    onClick={() => scrollToSection('deals')}
                    className="px-4 py-3.5 rounded-2xl text-amber-400 hover:text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{isUr ? 'خصوصی ڈیلز دیکھیں' : 'View Special Deals'}</span>
                  </button>
                </div>

                {/* Micro trust indicators */}
                <div className="pt-4 border-t border-stone-800 grid grid-cols-3 gap-3 text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>100% Halal Food</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>Fresh Hand-Tossed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>Chowk Marley Hub</span>
                  </div>
                </div>
              </div>

              {/* Right Column Showcase Collage */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Main Pizza Card */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/30 transform hover:scale-[1.02] transition-transform duration-500">
                    <SafeImage
                      src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"
                      alt="Special Zam Zam Pizza"
                      fallbackCategory="pizza"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-red-700/80 px-2.5 py-0.5 rounded-md inline-block w-max">
                        SIGNATURE CREATION
                      </span>
                      <h3 className="text-xl font-bold font-serif text-white mt-1">
                        Special Zam Zam Pizza
                      </h3>
                      <p className="text-xs text-stone-300 line-clamp-1">
                        Loaded with tikka, fajita, sausages, mushrooms & cheese pull
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-amber-300 font-mono font-bold text-sm">
                          Starting at Rs. 850
                        </span>
                        <button
                          onClick={() => {
                            const pz = MENU_ITEMS.find((it) => it.id === 'pz-special-zam-zam');
                            if (pz) setCustomizingItem(pz);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 transition-colors"
                        >
                          Customize
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Overlapping Floating Zinger Card */}
                  <div className="absolute -bottom-6 -left-6 sm:-left-10 bg-[#171717]/95 border border-amber-400/40 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md max-w-[260px]">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                      <SafeImage
                        src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80"
                        alt="Zinger Burger"
                        fallbackCategory="burger"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-400 font-bold uppercase">
                        CRISPY CRUNCH
                      </div>
                      <div className="text-xs font-bold text-white font-serif truncate">
                        Classic Zinger Burger
                      </div>
                      <div className="text-xs font-mono font-black text-red-400">
                        Rs. 450
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 3: POPULAR CATEGORIES ==================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-amber-200/80">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-500">
                {isUr ? 'مشہور کیٹیگریز' : 'Popular Categories'}
              </h2>
              <button
                onClick={() => scrollToSection('menu')}
                className="text-xs font-bold text-red-700 hover:underline flex items-center gap-1"
              >
                <span>{isUr ? 'تمام 15 کیٹیگریز' : 'View All 15 Categories'}</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
              {[
                { id: 'pizza', name: 'Pizzas', urdu: 'پیزا', icon: '🍕', count: '10 Flavors' },
                { id: 'slices', name: 'Pizza Slices', urdu: 'سلائسز', icon: '🍕', count: '5 Slices' },
                { id: 'zinger-burgers', name: 'Zinger Burgers', urdu: 'زنگر برگر', icon: '🍔', count: '4 Items' },
                { id: 'shawarma', name: 'Shawarma', urdu: 'شوارما', icon: '🌯', count: '3 Items' },
                { id: 'fries-sides', name: 'Fries & Sides', urdu: 'فرائز', icon: '🍟', count: '8 Items' },
                { id: 'combo-deals', name: 'Deals & Combos', urdu: 'ڈیلز', icon: '⭐', count: '7 Deals' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as MenuCategoryId);
                    scrollToSection('menu');
                  }}
                  className="p-3.5 rounded-2xl border border-amber-100 hover:border-red-600 bg-[#FFF9F2] hover:bg-red-50/50 text-left transition-all group flex flex-col justify-between"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform block">
                    {cat.icon}
                  </span>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-red-700 transition-colors font-serif truncate">
                      {isUr ? cat.urdu : cat.name}
                    </div>
                    <div className="text-[10px] text-stone-500 font-sans">{cat.count}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SECTION 4: BEST SELLERS ==================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-red-700 font-black uppercase tracking-wider bg-red-100/60 px-3 py-1 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isUr ? 'سب سے زیادہ پسندیدہ' : 'Most Popular Choices'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-stone-900">
                {isUr ? 'چوک مرلی کے بیسٹ سیلرز' : 'Zam Zam Best Sellers'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {isUr
                  ? 'ہمارے کسٹمرز کے پسندیدہ پیزا، برگرز اور لوڈڈ سائیڈز'
                  : 'Customer favorites freshly baked & fried to golden perfection'}
              </p>
            </div>

            <button
              onClick={() => scrollToSection('menu')}
              className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1 self-start sm:self-auto hover:underline"
            >
              <span>{isUr ? 'مکمل مینیو دیکھیں' : 'Explore Full Menu'}</span>
              <span>&rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestSellers.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onAddToCart={handleQuickAdd}
                onOpenCustomizer={(it) => setCustomizingItem(it)}
                language={language}
              />
            ))}
          </div>
        </section>

        {/* ==================== SECTION 5: SPECIAL OFFERS & DEALS ==================== */}
        <section id="deals" className="bg-[#171717] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full inline-block mb-2">
                🎉 MAXIMUM SAVINGS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-serif text-white">
                {isUr ? 'خصوصی فیملی اور کومبو ڈیلز' : 'Special Offers & Value Deals'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-2">
                {isUr
                  ? 'طلباء، دوستوں اور فیملیز کے لیے زبردست رعایتی پیکجز — تمام قیمتیں پاکستانی روپوں میں'
                  : 'Curated value bundles for students, pairs, and family gatherings with genuine sample savings.'}
              </p>
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-stone-900 rounded-3xl p-5 border border-amber-400/30 hover:border-amber-400 transition-all flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-stone-800">
                      <SafeImage
                        src={deal.image}
                        alt={deal.name}
                        fallbackCategory={deal.fallbackCategory}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-red-700 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                        HOT DEAL
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-serif text-white group-hover:text-amber-400 transition-colors">
                      {isUr ? deal.urduName || deal.name : deal.name}
                    </h3>

                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                      {deal.description}
                    </p>

                    {deal.dealItems && (
                      <div className="mt-3 p-3 bg-stone-950/70 rounded-xl border border-stone-800 text-[11px] text-stone-300 space-y-1">
                        {deal.dealItems.map((di, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>{di}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Deal Price</span>
                      <span className="text-lg font-black text-amber-400 font-mono">
                        {formatPrice(deal.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleQuickAdd(deal)}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                    >
                      {isUr ? 'ڈیل شامل کریں' : 'Add Deal'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SECTION 6: WHY CHOOSE US ==================== */}
        <section id="about" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-red-700 bg-red-100/70 px-3 py-1 rounded-full inline-block mb-2">
              WHY ZAM ZAM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-stone-900">
              {isUr ? 'ہمیں کیوں منتخب کریں؟' : 'Why Choose Zam Zam Pizza Slice?'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {isUr
                ? 'معیاری اجزاء اور ذائقے کی گارنٹی کے ساتھ ہر آرڈر تازہ تیار کیا جاتا ہے'
                : 'Commitment to culinary hygiene, authentic spices, and speedy service.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🌱',
                title: 'Fresh Ingredients',
                urduTitle: 'تازہ اور معیاری اجزاء',
                desc: 'Daily prepared sourdough, 100% mozzarella cheese, fresh farm vegetables and prime halal meats.',
              },
              {
                icon: '🔥',
                title: 'Made to Order',
                urduTitle: 'آرڈر پر تازہ تیاری',
                desc: 'Every pizza is stretched, topped, and baked at 450°C upon receiving your order.',
              },
              {
                icon: '⭐',
                title: 'Delicious Fast Food',
                urduTitle: 'بہترین ذائقہ اور کرسٹ',
                desc: 'Specialty recipes perfected over years, offering the famous cheese pull and crunchy zingers.',
              },
              {
                icon: '🛵',
                title: 'Easy WhatsApp Ordering',
                urduTitle: 'آسان اور تیز آرڈرنگ',
                desc: 'Place your order via WhatsApp with exact item breakdown or track progress on-site.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#FFF9F2] text-3xl flex items-center justify-center border border-amber-200">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  {isUr ? feature.urduTitle : feature.title}
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== SECTION 7: COMPLETE RESTAURANT MENU ==================== */}
        <section id="menu" className="py-14 bg-white border-y border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Menu Header with Search and Sorting */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-700 bg-red-50 px-3 py-1 rounded-full inline-block mb-1">
                  OUR COMPLETE MENU
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-serif text-stone-900">
                  {isUr ? 'مکمل مینیو اور قیمتیں' : 'Complete Restaurant Menu'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  {filteredItems.length} items available in{' '}
                  <span className="font-bold text-stone-800">
                    {MENU_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'All Categories'}
                  </span>
                </p>
              </div>

              {/* Search Box & Sort Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isUr ? 'مینیو میں تلاش کریں...' : 'Search pizza, burger, sides...'}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#FFF9F2] border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 text-stone-900"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto bg-[#FFF9F2] border border-stone-200 text-stone-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-700 font-medium"
                >
                  <option value="recommended">Featured First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Sticky/Scrollable 15 Categories Navigation Bar */}
            <div className="sticky top-18 z-30 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-amber-100 overflow-x-auto scrollbar-none flex items-center gap-2 mb-8">
              {MENU_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-red-700 text-white shadow-md shadow-red-700/20 scale-[1.02]'
                        : 'bg-[#FFF9F2] text-stone-700 hover:bg-stone-100 border border-amber-200/60'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{isUr ? cat.urduName : cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Category Description Banner */}
            {selectedCategory !== 'all' && (
              <div className="mb-6 p-4 rounded-2xl bg-[#FFF9F2] border border-amber-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 font-serif">
                    {MENU_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {MENU_CATEGORIES.find((c) => c.id === selectedCategory)?.description}
                  </p>
                </div>
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-lg">
                  {filteredItems.length} Products
                </span>
              </div>
            )}

            {/* Products Grid */}
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center bg-[#FFF9F2] rounded-3xl border border-dashed border-amber-300">
                <div className="text-4xl mb-2">🔍🍕</div>
                <h3 className="text-base font-bold text-stone-800 font-serif">
                  No matching food items found
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Try checking your search query or switch categories to explore our full menu.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('pizza');
                  }}
                  className="mt-4 px-4 py-2 bg-red-700 text-white font-bold text-xs rounded-xl hover:bg-red-800 transition-colors"
                >
                  View All Pizzas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleQuickAdd}
                    onOpenCustomizer={(it) => setCustomizingItem(it)}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ==================== SECTION 8 & 9: LOCATION, HOURS & CONTACT ==================== */}
        <section id="location" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info Card */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-700 bg-red-100/70 px-3 py-1 rounded-full inline-block mb-1">
                  OUR LOCATION & TIMINGS
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-serif text-stone-900">
                  {isUr ? 'چوک مرلی، پنجاب میں خوش آمدید' : 'Visit Us at Chowk Marley'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                  {isUr
                    ? 'زم زم پیزا سلائس چوک مرلی کی مرکزی تجارتی مارکیٹ میں واقع ہے۔ ٹیک اوے، ڈائن اِن یا تیز ہوم ڈیلیوری کے لیے ہم سے رابطہ کریں۔'
                    : 'Located at the heart of Chowk Marley commercial zone. Stop by for hot takeaway slices or order for doorstep delivery.'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-amber-200">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-stone-900 text-sm">Restaurant Address</div>
                    <div className="text-stone-600 mt-0.5">{RESTAURANT_INFO.address}</div>
                    <div className="text-stone-400 mt-0.5">Punjab, Pakistan</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-amber-200">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-stone-900 text-sm">Opening Hours</div>
                    <div className="text-stone-600 mt-0.5">{RESTAURANT_INFO.openingHours}</div>
                    <div className="text-emerald-700 font-bold mt-0.5">● Kitchen Open Now</div>
                  </div>
                </div>

                <div id="contact" className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-amber-200">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-stone-900 text-sm">Phone & WhatsApp Orders</div>
                    <div className="text-stone-600 mt-0.5">{RESTAURANT_INFO.phone}</div>
                    <div className="text-stone-400 mt-0.5">WhatsApp: +{RESTAURANT_INFO.whatsappPhone}</div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Call to Action */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/${RESTAURANT_INFO.whatsappPhone}?text=${encodeURIComponent('Hello Zam Zam Pizza Slice! I would like to inquire about your menu.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Us on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Interactive Location Map Canvas */}
            <div className="lg:col-span-7">
              <div className="relative h-96 rounded-3xl overflow-hidden border-2 border-amber-200 bg-stone-100 shadow-xl">
                {/* Stylized Street Grid */}
                <svg className="absolute inset-0 w-full h-full opacity-60">
                  <defs>
                    <pattern id="mainMapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mainMapGrid)" />
                  {/* Roads radiating */}
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#f59e0b" strokeWidth="8" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#f59e0b" strokeWidth="8" />
                  {/* Chowk Roundabout */}
                  <circle cx="50%" cy="50%" r="55" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
                  <circle cx="50%" cy="50%" r="35" fill="#b91c1c" />
                </svg>

                {/* Restaurant Central Marker */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
                  <div className="relative">
                    <span className="absolute -inset-2 rounded-full bg-red-400 animate-ping opacity-60" />
                    <div className="w-14 h-14 rounded-2xl bg-red-700 text-white flex items-center justify-center text-2xl shadow-2xl border-2 border-amber-300">
                      🍕
                    </div>
                  </div>
                  <div className="bg-[#171717] text-white text-xs font-black px-3 py-1 rounded-full shadow-lg mt-2 whitespace-nowrap border border-amber-400/40">
                    ZAM ZAM PIZZA SLICE
                  </div>
                  <div className="text-[10px] text-amber-300 font-bold bg-black/80 px-2 py-0.5 rounded mt-0.5">
                    Chowk Marley Main
                  </div>
                </div>

                {/* Delivery Zone Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200 text-xs shadow-md">
                  <span className="font-bold text-stone-900 block">Fast Delivery Radius</span>
                  <span className="text-[11px] text-stone-500">Chowk Marley & Surrounding Sectors (15-25 min)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== SECTION 10: PROFESSIONAL FOOTER ==================== */}
      <footer className="bg-[#171717] text-stone-300 border-t border-stone-800 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-stone-800">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  🍕
                </div>
                <div>
                  <div className="text-lg font-black tracking-tight text-white font-serif leading-none">
                    ZAM ZAM <span className="text-red-500">PIZZA SLICE</span>
                  </div>
                  <div className="text-[11px] text-amber-400 font-medium font-sans mt-0.5">
                    {RESTAURANT_INFO.tagline}
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Handcrafted pizzas, crispy single slices, double zinger burgers, stuffed shawarmas, and value family feasts. Serving Chowk Marley with pride and taste perfection.
              </p>

              <div className="text-xs text-stone-400 space-y-1">
                <div>📍 {RESTAURANT_INFO.address}</div>
                <div>📞 Phone: {RESTAURANT_INFO.phone}</div>
                <div>💬 WhatsApp: +{RESTAURANT_INFO.whatsappPhone}</div>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                Menu Categories
              </h4>
              <ul className="text-xs space-y-2 text-stone-400">
                {MENU_CATEGORIES.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        scrollToSection('menu');
                      }}
                      className="hover:text-amber-400 transition-colors"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Operating Hours */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                Opening Hours & Info
              </h4>
              <div className="text-xs space-y-2 text-stone-400">
                <div className="flex justify-between py-1 border-b border-stone-800">
                  <span>Monday – Sunday</span>
                  <span className="font-bold text-white">11:00 AM – 02:00 AM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800">
                  <span>Minimum Order</span>
                  <span className="font-bold text-white">{formatPrice(RESTAURANT_INFO.minOrder)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800">
                  <span>Standard Delivery Fee</span>
                  <span className="font-bold text-white">{formatPrice(RESTAURANT_INFO.deliveryFee)}</span>
                </div>
                <div className="text-[11px] text-amber-300 font-medium pt-1">
                  Free delivery for orders above {formatPrice(RESTAURANT_INFO.freeDeliveryThreshold)}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Demonstration Disclaimer */}
          <div className="pt-8 text-center space-y-2">
            <div className="p-3 bg-stone-900 rounded-2xl border border-stone-800 max-w-3xl mx-auto text-[11px] text-stone-400 leading-relaxed">
              <strong>Portfolio Demonstration Disclaimer:</strong> This web application is a portfolio restaurant website demonstration. Menu items, sample demonstration prices, offers, and ordering workflows are designed for demonstration purposes. Actual restaurant menu pricing and official contact information can be configured as needed.
            </div>

            <div className="text-xs text-stone-500 pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-3xl mx-auto">
              <span>© {new Date().getFullYear()} Zam Zam Pizza Slice. All rights reserved.</span>
              <span>Chowk Marley, Punjab, Pakistan</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Cart Bar */}
      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-red-700 active:bg-red-800 text-white font-bold rounded-2xl shadow-2xl flex items-center justify-between border-2 border-amber-300/60"
          >
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-stone-950 font-black text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
              <span className="text-sm">View Cart ({isUr ? 'کارٹ دیکھیں' : 'Checkout'})</span>
            </div>
            <div className="font-mono font-black text-sm text-amber-300">
              {formatPrice(cartTotal)}
            </div>
          </button>
        </div>
      )}

      {/* Product Customizer Modal */}
      {customizingItem && (
        <PizzaCustomizerModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddCustomized}
          language={language}
        />
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        currentAddress="Chowk Marley, Punjab, Pakistan"
        language={language}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        order={activeOrder}
        onClose={() => setIsOrderTrackerOpen(false)}
        language={language}
      />
    </div>
  );
}
