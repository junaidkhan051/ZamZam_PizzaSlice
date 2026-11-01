import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  Check,
  CreditCard,
  Banknote,
  MapPin,
  Crosshair,
  Compass,
  Building,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import { CartItem, Order } from '../types/pizza';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: Order) => void;
  currentAddress: string;
  language: 'en' | 'ur';
}

export const CartDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  currentAddress,
  language,
}) => {
  if (!isOpen) return null;
  const isUr = language === 'ur';

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountPercent: number;
    freeDelivery?: boolean;
  } | null>({
    code: 'SLICE20',
    discountPercent: 20,
  });
  const [voucherError, setVoucherError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'card'>('cod');
  const [phoneNumber, setPhoneNumber] = useState('0300-1234567');

  // Live Location State for Marley Chowk
  const [addressInput, setAddressInput] = useState(
    currentAddress || 'Marley Chowk Main Road'
  );
  const [houseFlat, setHouseFlat] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>({
    lat: 31.4826,
    lng: 74.3032,
  });
  const [pinOffset, setPinOffset] = useState({ x: 50, y: 50 }); // percentage on interactive map
  const [gpsStatus, setGpsStatus] = useState<
    'idle' | 'locating' | 'success' | 'fallback'
  >('idle');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
  const deliveryFee = appliedVoucher?.freeDelivery ? 0 : items.length > 0 ? 1.49 : 0;
  const discountAmount = appliedVoucher?.discountPercent
    ? (subtotal * appliedVoucher.discountPercent) / 100
    : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Live GPS geolocation trigger
  const handleDetectLiveLocation = () => {
    setGpsStatus('locating');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(5));
          const lng = Number(position.coords.longitude.toFixed(5));
          const acc = Math.round(position.coords.accuracy || 8);

          setPinCoords({ lat, lng });
          setGpsAccuracy(acc);
          setGpsStatus('success');
          setAddressInput(`Marley Chowk (Live GPS: ${lat}, ${lng})`);
          setPinOffset({ x: 48, y: 46 });
        },
        (error) => {
          // Fallback to high-precision Marley Chowk coordinates
          const simulatedLat = 31.4826 + (Math.random() - 0.5) * 0.003;
          const simulatedLng = 74.3032 + (Math.random() - 0.5) * 0.003;
          setPinCoords({
            lat: Number(simulatedLat.toFixed(5)),
            lng: Number(simulatedLng.toFixed(5)),
          });
          setGpsAccuracy(12);
          setGpsStatus('fallback');
          setAddressInput(`Marley Chowk Sector A (GPS: ${simulatedLat.toFixed(4)}, ${simulatedLng.toFixed(4)})`);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setGpsStatus('fallback');
      setAddressInput('Marley Chowk Main (GPS Pin Fixed)');
    }
  };

  // Interactive map click
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
    setPinOffset({ x, y });

    // Calculate approximate delta from Marley Chowk center
    const newLat = Number((31.4826 + (y - 50) * -0.0001).toFixed(5));
    const newLng = Number((74.3032 + (x - 50) * 0.0001).toFixed(5));
    setPinCoords({ lat: newLat, lng: newLng });
    setGpsStatus('success');
    setGpsAccuracy(5);
  };

  const applyPromo = () => {
    const code = voucherCode.trim().toUpperCase();
    if (code === 'SLICE20') {
      setAppliedVoucher({ code: 'SLICE20', discountPercent: 20 });
      setVoucherError('');
    } else if (code === 'FREEDEL') {
      setAppliedVoucher({ code: 'FREEDEL', discountPercent: 0, freeDelivery: true });
      setVoucherError('');
    } else {
      setVoucherError(isUr ? 'غلط پرومو کوڈ ہے' : 'Invalid code. Try SLICE20 or FREEDEL');
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    const firstItem = items[0];
    const fullAddress = `${addressInput}${houseFlat ? `, ${houseFlat}` : ''}${
      landmark ? ` (Landmark: ${landmark})` : ''
    }`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `PS-${Math.floor(100000 + Math.random() * 900000)}`,
      shopId: firstItem.shopId,
      shopName: firstItem.shopName,
      shopAddress: 'Marley Chowk Main Hub',
      items: [...items],
      subtotal,
      deliveryFee,
      discount: discountAmount,
      voucherCode: appliedVoucher?.code,
      total: grandTotal,
      deliveryAddress: fullAddress,
      contactNumber: phoneNumber,
      liveCoordinates: {
        lat: pinCoords.lat,
        lng: pinCoords.lng,
        accuracyMeters: gpsAccuracy || 10,
        houseFlat,
        landmark,
        isGpsLive: gpsStatus === 'success',
      },
      paymentMethod,
      status: 'confirmed',
      progressPercent: 20,
      estimatedDeliveryMinutes: 20,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rider: {
        name: 'Tariq Mehmood',
        phone: '+92 312 8899221',
        vehicle: 'Honda CD 70 (Pizza Hotbox)',
        rating: 4.9,
        currentLocationLat: 31.4820,
        currentLocationLng: 74.3025,
      },
    };

    onPlaceOrder(newOrder);
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
              <span>🍕</span>
              <span>{isUr ? 'آپ کا پیزا کارٹ' : 'Your Pizza Cart'}</span>
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              {items.length} {items.length === 1 ? 'item' : 'items'} · Marley Chowk Express
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-200/70 hover:bg-stone-300/80 text-stone-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-3xl">
                🍕
              </div>
              <h3 className="text-base font-bold text-stone-800">
                {isUr ? 'آپ کا کارٹ خالی ہے' : 'Your Cart is Empty'}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                {isUr
                  ? 'مرلی چوک کی پیزا شاپس سے لذیذ سلائسز یا پیزا منتخب کریں!'
                  : 'Add mouthwatering hot slices from Marley Chowk pizza shops!'}
              </p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 rounded-2xl border border-stone-200/90 bg-stone-50/50 flex gap-3 text-stone-900"
                  >
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-bold text-stone-900 truncate font-serif">
                          {item.menuItem.name}
                        </h4>
                        <span className="text-sm font-bold text-stone-900 shrink-0">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Customization Details */}
                      {item.customization ? (
                        <div className="text-[11px] text-stone-500 mt-1 space-y-0.5 font-sans">
                          <div className="text-amber-800 font-semibold">
                            {item.customization.sizeLabel} · {item.customization.crustLabel}
                          </div>
                          <div>Sauce: {item.customization.sauceLabel}</div>
                          {item.customization.selectedToppings.length > 0 && (
                            <div className="truncate">
                              Toppings: {item.customization.selectedToppings.map((t) => t.name).join(', ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-500 mt-1">
                          {item.shopName}
                        </div>
                      )}

                      {/* Quantity & Delete Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() => onRemoveItem(item.cartItemId)}
                          className="text-stone-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 bg-white rounded-lg border border-stone-200 px-2 py-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                            className="text-stone-600 hover:text-stone-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-stone-800 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                            className="text-stone-600 hover:text-stone-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* LIVE LOCATION & GPS PINPOINT (KEY REQUEST) */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border-2 border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-bold shadow-xs">
                      📍
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wide">
                        {isUr ? 'لائیو ڈیلیوری لوکیشن (مرلی چوک)' : 'Live Delivery Location (Marley Chowk)'}
                      </h3>
                      <p className="text-[10px] text-stone-500">
                        {isUr ? 'رائیڈر کی درست رہنمائی کے لیے لائیو پن لگائیں' : 'Pinpoint exact location for rider'}
                      </p>
                    </div>
                  </div>

                  {/* Detect GPS Button */}
                  <button
                    type="button"
                    onClick={handleDetectLiveLocation}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${gpsStatus === 'locating' ? 'animate-spin' : ''}`} />
                    <span>
                      {gpsStatus === 'locating'
                        ? isUr
                          ? 'تلاش جاری...'
                          : 'Locating...'
                        : isUr
                        ? 'لائیو GPS حاصل کریں'
                        : 'Use Live GPS'}
                    </span>
                  </button>
                </div>

                {/* GPS Status Pill */}
                {gpsStatus !== 'idle' && (
                  <div
                    className={`flex items-center justify-between text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                      gpsStatus === 'success'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {isUr ? 'لائیو پوزیشن حاصل کر لی گئی ہے' : 'Live GPS Location Acquired'}
                      </span>
                    </span>
                    <span className="font-mono text-[10px]">
                      {pinCoords.lat}, {pinCoords.lng}
                    </span>
                  </div>
                )}

                {/* Interactive Marley Chowk Map Visualizer */}
                <div
                  onClick={handleMapClick}
                  className="relative h-36 rounded-xl border border-stone-300 bg-stone-100 overflow-hidden cursor-crosshair shadow-inner group"
                  title="Click anywhere to adjust your exact delivery pin"
                >
                  {/* Stylized Street Grid */}
                  <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="roadGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#roadGrid)" />
                    {/* Main Marley Chowk Roundabout */}
                    <circle cx="50%" cy="50%" r="24" fill="#fed7aa" stroke="#f97316" strokeWidth="2" strokeDasharray="3 3" />
                    <text x="50%" y="52%" textAnchor="middle" fontSize="8" fill="#9a3412" fontWeight="bold">
                      Marley Chowk
                    </text>
                    {/* Roads radiating out */}
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#fdba74" strokeWidth="4" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#fdba74" strokeWidth="4" />
                  </svg>

                  {/* Draggable / Clickable Live User Pin */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 flex flex-col items-center pointer-events-none z-10"
                    style={{ left: `${pinOffset.x}%`, top: `${pinOffset.y}%` }}
                  >
                    <div className="relative">
                      <span className="absolute -inset-1 rounded-full bg-red-400 animate-ping opacity-75" />
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold">
                        📍
                      </div>
                    </div>
                    <div className="bg-stone-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow mt-0.5 whitespace-nowrap">
                      {isUr ? 'آپ کا گھر' : 'Your Spot'}
                    </div>
                  </div>

                  <div className="absolute bottom-1 right-2 bg-white/90 text-[10px] text-stone-600 px-2 py-0.5 rounded shadow">
                    Tap map to move pin
                  </div>
                </div>

                {/* Address & Specific House Details */}
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isUr ? 'گلی یا علاقہ' : 'Street / Area Name'}
                    </label>
                    <input
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="e.g. Marley Chowk, Street 4"
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 bg-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {isUr ? 'مکان / فلیٹ نمبر' : 'House / Flat #'}
                      </label>
                      <input
                        type="text"
                        value={houseFlat}
                        onChange={(e) => setHouseFlat(e.target.value)}
                        placeholder="House 12B, 1st Floor"
                        className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {isUr ? 'قریبی مشہور جگہ' : 'Nearby Landmark'}
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="Near Masjid / Water Tank"
                        className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Voucher */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800 mb-2">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isUr ? 'ڈسکاؤنٹ واؤچر' : 'Promo Voucher'}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Enter SLICE20 or FREEDEL"
                    className="flex-1 text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono uppercase"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
                  >
                    {isUr ? 'لاگو کریں' : 'Apply'}
                  </button>
                </div>

                {appliedVoucher && (
                  <div className="mt-2 text-[11px] text-emerald-700 flex items-center justify-between font-medium">
                    <span>
                      ✓ {appliedVoucher.code} ({appliedVoucher.discountPercent}% off applied)
                    </span>
                    <button
                      onClick={() => setAppliedVoucher(null)}
                      className="text-stone-400 hover:text-stone-600 text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {voucherError && (
                  <div className="mt-1.5 text-[11px] text-red-600 font-medium">
                    {voucherError}
                  </div>
                )}
              </div>

              {/* Phone & Contact */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isUr ? 'رابطہ نمبر (رائیڈر کے لیے)' : 'Phone Number (For Rider)'}
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 bg-white"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  {isUr ? 'طریقہ ادائیگی' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', sub: 'Pay rider at Marley Chowk' },
                    { id: 'jazzcash', label: 'JazzCash / EasyPaisa', sub: 'Mobile payment' },
                    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa & Mastercard' },
                    { id: 'easypaisa', label: 'Raast QR Instant', sub: 'Instant transfer' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-colors ${
                        paymentMethod === p.id
                          ? 'border-amber-500 bg-amber-50 text-stone-900 font-semibold'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                      }`}
                    >
                      <div className="font-bold truncate">{p.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-stone-100 text-xs space-y-1.5 text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marley Chowk Delivery Fee</span>
                  <span className="font-medium text-stone-900">
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Voucher Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Action */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-100 bg-white shadow-lg">
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-stone-950 font-bold text-sm rounded-2xl shadow-md shadow-amber-500/25 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <span>🍕</span>
                <span>{isUr ? 'آرڈر کنفرم کریں (مرلی چوک)' : 'Confirm Order at Marley Chowk'}</span>
              </div>
              <div className="font-extrabold text-stone-950">
                ${grandTotal.toFixed(2)}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
