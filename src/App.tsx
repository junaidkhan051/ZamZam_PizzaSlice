import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  Sparkles,
  ShoppingBag,
  MapPin,
  Filter,
  Check,
  ChevronRight,
  Pizza,
  Zap,
  Crosshair,
} from 'lucide-react';
import { PIZZA_SHOPS } from './data/pizzaShops';
import { PizzaShop, MenuItem, CartItem, Order, CustomizedPizza } from './types/pizza';
import { Header } from './components/Header';
import { ShopCard } from './components/ShopCard';
import { ShopDetail } from './components/ShopDetail';
import { PizzaCustomizerModal } from './components/PizzaCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { LocationPickerModal } from './components/LocationPickerModal';

export default function App() {
  // State
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [currentLocation, setCurrentLocation] = useState('Marley Chowk (مرلی چوک)');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'speed' | 'price'>('recommended');

  const [selectedShop, setSelectedShop] = useState<PizzaShop | null>(null);
  const [customizingItem, setCustomizingItem] = useState<{ item: MenuItem; shopName: string } | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);

  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isUr = language === 'ur';

  // Quick Notification Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter & Search Logic
  const filteredShops = useMemo(() => {
    return PIZZA_SHOPS.filter((shop) => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        shop.name.toLowerCase().includes(q) ||
        shop.address.toLowerCase().includes(q) ||
        shop.area.toLowerCase().includes(q) ||
        shop.tags.some((t) => t.toLowerCase().includes(q)) ||
        shop.menu.some(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            (m.urduName && m.urduName.includes(q))
        );

      if (!matchSearch) return false;

      // Filter tags
      if (filterTag === 'all') return true;
      if (filterTag === 'slices') return shop.hasSingleSlices;
      if (filterTag === 'wood_fired') return shop.tags.includes('Wood Fired');
      if (filterTag === 'fast') return parseInt(shop.deliveryTime) <= 20;
      if (filterTag === 'top_rated') return shop.rating >= 4.8;
      if (filterTag === 'budget') return shop.priceLevel === '$';
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'speed') return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
      if (sortBy === 'price') return a.deliveryFee - b.deliveryFee;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [searchQuery, filterTag, sortBy]);

  // Cart operations
  const handleQuickAdd = (item: MenuItem, shop: PizzaShop) => {
    const existingIndex = cart.findIndex(
      (c) => c.menuItem.id === item.id && !c.customization
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice =
        updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        cartItemId: `item_${Date.now()}_${Math.random()}`,
        shopId: shop.id,
        shopName: shop.name,
        menuItem: item,
        quantity: 1,
        unitPrice: item.slicePrice || item.price,
        totalPrice: item.slicePrice || item.price,
      };
      setCart([...cart, newItem]);
    }

    triggerToast(
      isUr
        ? `${item.name} کارٹ میں شامل ہو گیا!`
        : `Added ${item.name} to cart!`
    );
  };

  const handleAddCustomized = (customized: CustomizedPizza) => {
    if (!customizingItem || !selectedShop) return;

    const newItem: CartItem = {
      cartItemId: `cust_${Date.now()}_${Math.random()}`,
      shopId: selectedShop.id,
      shopName: selectedShop.name,
      menuItem: customizingItem.item,
      customization: customized,
      quantity: 1,
      unitPrice: customized.unitPrice,
      totalPrice: customized.unitPrice,
    };

    setCart([...cart, newItem]);
    setCustomizingItem(null);
    triggerToast(
      isUr
        ? 'آپ کا تیار کردہ پیزا سلائس کارٹ میں شامل ہو گیا!'
        : `Custom ${customized.sizeLabel} added to cart!`
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
        ? `آرڈر #${order.orderNumber} موصول ہو گیا ہے! رائیڈر آپ کی لائیو لوکیشن پر آئے گا۔`
        : `Order #${order.orderNumber} confirmed! Rider is routed to your live location.`
    );
  };

  const cartTotal = cart.reduce((acc, it) => acc + it.totalPrice, 0);
  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-100/60 font-sans text-stone-900 antialiased flex flex-col">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-amber-300 text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-500/30 animate-bounce">
          <span>🍕</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentLocation={currentLocation}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'ur' : 'en')}
        activeOrderCount={activeOrder ? 1 : 0}
        onOpenActiveOrder={() => setIsOrderTrackerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {selectedShop ? (
          // Shop Detail View
          <ShopDetail
            shop={selectedShop}
            onBack={() => setSelectedShop(null)}
            onOpenCustomizer={(item) =>
              setCustomizingItem({ item, shopName: selectedShop.name })
            }
            onQuickAdd={(item) => handleQuickAdd(item, selectedShop)}
            language={language}
          />
        ) : (
          // Main Discovery & Explore Page
          <>
            {/* Hero Banner strictly for Marley Chowk */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-stone-950 p-6 sm:p-10 shadow-lg">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-black/15 text-stone-950 px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
                  <MapPin className="w-3.5 h-3.5 text-stone-950" />
                  <span>
                    {isUr
                      ? 'مرلی چوک پیزا ڈلیوری سروس'
                      : 'Marley Chowk · Local Pizza & Slice Hub'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight leading-tight">
                  {isUr
                    ? 'مرلی چوک کے سب سے لذیذ پیزا اور کرسپی سلائسز آرڈر کریں!'
                    : 'Piping hot pizza slices & artisan pies delivered directly to Marley Chowk.'}
                </h1>

                <p className="text-xs sm:text-sm text-stone-900/80 font-medium mt-2 max-w-lg leading-relaxed">
                  {isUr
                    ? 'سنگل نیویارک سلائس، چیز برسٹ یا ووڈ فائرڈ پیزا — آرڈر کے وقت اپنی لائیو لوکیشن سیٹ کریں تاکہ رائیڈر سیدھا آپ کے دروازے پر پہنچے۔'
                    : 'Order single slices or full pizzas from top pizzerias around Marley Chowk. Pin your live location for pin-point delivery.'}
                </p>

                {/* Search Box */}
                <div className="mt-5 flex items-center gap-2 bg-white rounded-2xl p-2 shadow-xl border border-white/40 max-w-xl">
                  <Search className="w-5 h-5 text-stone-400 ml-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isUr
                        ? 'مرلی چوک میں پیزا، سلائس یا شاپ تلاش کریں...'
                        : 'Search pizza, slice type, or toppings at Marley Chowk...'
                    }
                    className="flex-1 text-xs sm:text-sm px-2 py-1.5 text-stone-900 focus:outline-none placeholder:text-stone-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-stone-400 hover:text-stone-600 text-xs px-2"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    {isUr ? 'تلاش' : 'Search'}
                  </button>
                </div>

                {/* Quick Keywords */}
                <div className="mt-3 flex items-center flex-wrap gap-2 text-[11px] text-stone-950 font-medium">
                  <span className="opacity-75">{isUr ? 'مشہور انتخاب:' : 'Popular:'}</span>
                  {['Single Slice', 'Pepperoni', 'Cheese Pull', 'Fajita Tikka', 'Wood Fired'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="underline hover:text-white transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative background pizza silhouette */}
              <div className="absolute -right-12 -bottom-12 opacity-20 pointer-events-none select-none text-[220px]">
                🍕
              </div>
            </section>

            {/* Interactive Filters & Sort Bar */}
            <section className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Segmented Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: isUr ? 'تمام دکانیں' : 'All Shops' },
                    { id: 'slices', label: isUr ? '🍕 سنگل سلائسز' : '🍕 Slices Available' },
                    { id: 'wood_fired', label: isUr ? '🔥 ووڈ فائرڈ' : '🔥 Wood-Fired' },
                    { id: 'fast', label: isUr ? '⚡ 20 منٹ میں' : '⚡ Under 20m' },
                    { id: 'top_rated', label: isUr ? '⭐ 4.8+ ریٹڈ' : '⭐ 4.8+ Rated' },
                    { id: 'budget', label: isUr ? '🏷️ بجٹ فرینڈلی' : '🏷️ Value' },
                  ].map((flt) => {
                    const isActive = filterTag === flt.id;
                    return (
                      <button
                        key={flt.id}
                        onClick={() => setFilterTag(flt.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                          isActive
                            ? 'bg-amber-500 text-stone-950 shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                        }`}
                      >
                        {flt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 text-xs text-stone-600">
                  <span className="text-stone-400 font-medium">
                    {isUr ? 'ترتیب:' : 'Sort by:'}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white border border-stone-200 text-stone-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  >
                    <option value="recommended">Featured & Closest</option>
                    <option value="rating">Highest Rated</option>
                    <option value="speed">Fastest Delivery</option>
                    <option value="price">Lowest Delivery Fee</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Pizza Shops Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 font-serif">
                    {isUr ? 'مرلی چوک کی قریبی پیزا شاپس' : 'Pizza Shops at Marley Chowk'}
                  </h2>
                  <p className="text-xs text-stone-500 font-sans">
                    {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} currently open for instant delivery
                  </p>
                </div>
              </div>

              {filteredShops.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
                  <div className="text-4xl mb-3">🍕🔍</div>
                  <h3 className="text-base font-bold text-stone-900">
                    {isUr ? 'کوئی پیزیریا نہیں ملا' : 'No Pizza Shops Found'}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                    {isUr
                      ? 'برائے مہربانی دیگر کی ورڈز آزمائیں یا فلٹر ری سیٹ کریں۔'
                      : 'Try resetting your search query or filters to see all Marley Chowk pizzerias.'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterTag('all');
                    }}
                    className="mt-4 px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredShops.map((shop) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      onSelect={(s) => setSelectedShop(s)}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Live Location Awareness feature card */}
            <section className="p-6 rounded-3xl bg-stone-900 text-stone-100 flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-800">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-full">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>{isUr ? 'درست لائیو جی پی ایس ڈیلیوری' : 'Pinpoint Live GPS Delivery'}</span>
                </div>
                <h3 className="text-xl font-bold font-serif text-white">
                  {isUr
                    ? 'مرلی چوک میں اپنی درست گلی اور مکان کی لوکیشن لائیو سیٹ کریں'
                    : 'Set your exact live location so the rider arrives without delay'}
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {isUr
                    ? 'جب آپ کارٹ میں چیک آؤٹ کرتے ہیں، آپ ایک کلک میں اپنا لائیو جی پی ایس اور نقشے پر پن سیٹ کر سکتے ہیں تاکہ گرم پیزا بغیر کسی تاخیر کے پہنچے۔'
                    : 'When placing an order, tap "Use Live GPS" or pinpoint your house on the interactive map so the rider navigates directly to your door.'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-stone-950" />
                  <span>{isUr ? 'لوکیشن چیک کریں' : 'Set Location'}</span>
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-8 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍕</span>
            <span className="font-bold text-stone-800 font-serif">Pizza Slice</span>
            <span>· Hot Local Pizza Delivery at Marley Chowk</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setIsLocationPickerOpen(true)}
              className="text-stone-700 hover:underline"
            >
              📍 {currentLocation}
            </button>
            <span>© {new Date().getFullYear()} Pizza Slice</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {customizingItem && (
        <PizzaCustomizerModal
          item={customizingItem.item}
          shopName={customizingItem.shopName}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddCustomized}
          language={language}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        currentAddress={currentLocation}
        language={language}
      />

      <OrderTrackerModal
        order={activeOrder}
        onClose={() => setIsOrderTrackerOpen(false)}
        language={language}
      />

      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => setCurrentLocation(loc)}
        language={language}
      />
    </div>
  );
}
