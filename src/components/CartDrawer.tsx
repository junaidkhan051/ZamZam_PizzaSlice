import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  Check,
  MapPin,
  Crosshair,
  MessageCircle,
  ShoppingBag,
  Store,
  Bike,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { CartItem, Order } from '../types/pizza';
import { RESTAURANT_INFO } from '../data/menuData';
import { formatPrice } from '../utils/currency';

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

  // Checkout Form State
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressInput, setAddressInput] = useState(
    currentAddress || 'Chowk Marley, Punjab, Pakistan'
  );
  const [nearbyLandmark, setNearbyLandmark] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'cash_pickup'>('cod');

  // WhatsApp number configuration
  const [customWhatsAppPhone, setCustomWhatsAppPhone] = useState(RESTAURANT_INFO.whatsappPhone);
  const [isPhoneConfigOpen, setIsPhoneConfigOpen] = useState(false);

  // Vouchers
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
  const [formError, setFormError] = useState('');

  // Live Location State for Chowk Marley
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>({
    lat: 31.4826,
    lng: 74.3032,
  });
  const [pinOffset, setPinOffset] = useState({ x: 50, y: 50 });
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success'>('idle');

  // Calculations in PKR
  const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
  const deliveryFee =
    orderType === 'pickup'
      ? 0
      : appliedVoucher?.freeDelivery || subtotal >= RESTAURANT_INFO.freeDeliveryThreshold
      ? 0
      : items.length > 0
      ? RESTAURANT_INFO.deliveryFee
      : 0;

  const discountAmount = appliedVoucher?.discountPercent
    ? Math.round((subtotal * appliedVoucher.discountPercent) / 100)
    : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  // GPS detection
  const handleDetectLiveLocation = () => {
    setGpsStatus('locating');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(5));
          const lng = Number(position.coords.longitude.toFixed(5));
          setPinCoords({ lat, lng });
          setGpsStatus('success');
          setAddressInput(`Chowk Marley (Live GPS: ${lat}, ${lng})`);
          setPinOffset({ x: 48, y: 46 });
        },
        () => {
          setGpsStatus('success');
          setAddressInput('Chowk Marley Main Sector (GPS Fixed)');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsStatus('success');
      setAddressInput('Chowk Marley Main (GPS Fixed)');
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
    setPinOffset({ x, y });
    const newLat = Number((31.4826 + (y - 50) * -0.0001).toFixed(5));
    const newLng = Number((74.3032 + (x - 50) * 0.0001).toFixed(5));
    setPinCoords({ lat: newLat, lng: newLng });
    setGpsStatus('success');
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
      setVoucherError(isUr ? 'غلط پرومو کوڈ ہے (SLICE20 آزمائیں)' : 'Invalid code. Try SLICE20 or FREEDEL');
    }
  };

  // Generate WhatsApp Message
  const generateWhatsAppMessage = () => {
    const name = customerName.trim() || 'Valued Customer';
    const phone = phoneNumber.trim() || 'Not Provided';
    const address = orderType === 'delivery' ? addressInput : 'Self Pickup at Restaurant';

    const itemsText = items
      .map((it) => {
        const custom = it.customizationSummary ? ` (${it.customizationSummary})` : '';
        return `• ${it.quantity}x ${it.menuItem.name}${custom} - ${formatPrice(it.totalPrice)}`;
      })
      .join('\n');

    const msg = [
      `*Hello ${RESTAURANT_INFO.name}!*`,
      `I would like to place an order from your Chowk Marley branch.\n`,
      `*Customer:* ${name}`,
      `*Phone:* ${phone}`,
      `*Order Type:* ${orderType === 'delivery' ? 'Home Delivery' : 'Self Pickup'}`,
      orderType === 'delivery' && nearbyLandmark ? `*Landmark:* ${nearbyLandmark}` : null,
      additionalInstructions ? `*Instructions:* ${additionalInstructions}` : null,
      `\n*Items Ordered:*`,
      itemsText,
      `\n*Subtotal:* ${formatPrice(subtotal)}`,
      orderType === 'delivery' ? `*Delivery Fee:* ${formatPrice(deliveryFee)}` : null,
      discountAmount > 0 ? `*Discount (${appliedVoucher?.code}):* -${formatPrice(discountAmount)}` : null,
      `*Total Amount:* ${formatPrice(grandTotal)}`,
      orderType === 'delivery' ? `\n*Delivery Address:*\n${address}` : null,
      `*Payment Method:* ${orderType === 'delivery' ? 'Cash on Delivery (COD)' : 'Cash on Pickup'}`,
      `\n_Please confirm my order and approximate preparation time._`,
    ]
      .filter(Boolean)
      .join('\n');

    return encodeURIComponent(msg);
  };

  const handleOrderViaWhatsApp = () => {
    if (items.length === 0) return;
    if (!customerName.trim()) {
      setFormError(isUr ? 'براہِ کرم اپنا نام درج کریں' : 'Please enter your name');
      return;
    }
    if (!phoneNumber.trim()) {
      setFormError(isUr ? 'براہِ کرم رابطہ فون نمبر درج کریں' : 'Please enter your phone number');
      return;
    }
    setFormError('');

    const encoded = generateWhatsAppMessage();
    const cleanPhone = customWhatsAppPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;

    // Open WhatsApp in new tab / app
    window.open(url, '_blank');

    // Create local simulated order so user can also view status
    handleLocalOrderSubmit();
  };

  const handleLocalOrderSubmit = () => {
    if (items.length === 0) return;
    if (!customerName.trim()) {
      setFormError(isUr ? 'براہِ کرم اپنا نام درج کریں' : 'Please enter your name');
      return;
    }
    if (!phoneNumber.trim()) {
      setFormError(isUr ? 'براہِ کرم فون نمبر درج کریں' : 'Please enter your phone number');
      return;
    }
    setFormError('');

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `ZZ-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...items],
      subtotal,
      deliveryFee,
      discount: discountAmount,
      voucherCode: appliedVoucher?.code,
      total: grandTotal,
      orderType,
      customerName: customerName.trim(),
      contactNumber: phoneNumber.trim(),
      deliveryAddress: orderType === 'delivery' ? addressInput : 'Chowk Marley (Self Pickup)',
      nearbyLandmark,
      additionalInstructions,
      liveCoordinates: {
        lat: pinCoords.lat,
        lng: pinCoords.lng,
        isGpsLive: gpsStatus === 'success',
      },
      paymentMethod: orderType === 'delivery' ? 'cod' : 'cash_pickup',
      status: 'confirmed',
      progressPercent: 20,
      estimatedDeliveryMinutes: orderType === 'delivery' ? 25 : 15,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rider: {
        name: 'Muhammad Tariq',
        phone: '+92 312 8899221',
        vehicle: 'Honda CD 70 (Pizza Hot Box)',
        rating: 4.9,
        currentLocationLat: 31.482,
        currentLocationLng: 74.302,
      },
    };

    onPlaceOrder(newOrder);
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-amber-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-100 flex items-center justify-between bg-[#FFF9F2]">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
              <span className="text-xl">🍕</span>
              <span>{isUr ? 'آپ کا آرڈر کارٹ' : 'Your Order Cart'}</span>
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              {items.length} {items.length === 1 ? 'item' : 'items'} · {RESTAURANT_INFO.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPhoneConfigOpen(!isPhoneConfigOpen)}
              className="p-2 rounded-xl text-stone-500 hover:bg-stone-200/60 transition-colors"
              title="Configure WhatsApp Business Number"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WhatsApp Configuration Panel (if toggled) */}
        {isPhoneConfigOpen && (
          <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-xs">
            <label className="block font-bold text-stone-800 mb-1">
              WhatsApp Business Number (Sample):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customWhatsAppPhone}
                onChange={(e) => setCustomWhatsAppPhone(e.target.value)}
                placeholder="e.g. 923001234567"
                className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
              />
              <button
                onClick={() => setIsPhoneConfigOpen(false)}
                className="px-3 py-1.5 bg-red-700 text-white font-bold rounded-lg text-xs"
              >
                Save
              </button>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Actual restaurant phone number can be configured here without code changes.
            </p>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-3xl bg-amber-100 text-red-700 flex items-center justify-center text-4xl shadow-sm">
                🍕
              </div>
              <h3 className="text-base font-bold text-stone-800 font-serif">
                {isUr ? 'آپ کا کارٹ خالی ہے' : 'Your Cart is Hungry'}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 leading-relaxed">
                {isUr
                  ? 'زم زم پیزا سلائس کے مینیو سے لذیذ پیزا، زنگر برگر یا ڈیلز منتخب کریں!'
                  : 'Add delicious freshly baked pizzas, crispy zinger burgers, or combo deals from the menu!'}
              </p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-[#FFF9F2]/60 flex gap-3 text-stone-900"
                  >
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-100"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-bold text-stone-900 truncate font-serif">
                          {isUr ? item.menuItem.urduName || item.menuItem.name : item.menuItem.name}
                        </h4>
                        <span className="text-sm font-black text-red-700 shrink-0 font-mono">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>

                      {/* Customization Details */}
                      {item.customizationSummary && (
                        <div className="text-[11px] text-amber-900/80 mt-1 font-medium line-clamp-2">
                          {item.customizationSummary}
                        </div>
                      )}

                      {/* Quantity & Delete Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() => onRemoveItem(item.cartItemId)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1"
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
                          <span className="text-xs font-bold text-stone-800 w-5 text-center">
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

              {/* Order Type: Delivery vs Pickup */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  {isUr ? 'آرڈر کی قسم' : 'Order Fulfillment'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-3 rounded-2xl border text-center font-bold flex items-center justify-center gap-2 transition-all ${
                      orderType === 'delivery'
                        ? 'border-red-700 bg-red-50 text-red-950 shadow-xs ring-1 ring-red-700'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>{isUr ? 'ہوم ڈیلیوری' : 'Home Delivery'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('pickup')}
                    className={`p-3 rounded-2xl border text-center font-bold flex items-center justify-center gap-2 transition-all ${
                      orderType === 'pickup'
                        ? 'border-red-700 bg-red-50 text-red-950 shadow-xs ring-1 ring-red-700'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>{isUr ? 'خود آ کر لیں (پک اپ)' : 'Takeaway / Pickup'}</span>
                  </button>
                </div>
              </div>

              {/* CUSTOMER DETAILS FORM */}
              <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-amber-200 space-y-3">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>👤</span>
                  <span>{isUr ? 'کسٹمر کی معلومات' : 'Customer & Delivery Information'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isUr ? 'آپ کا نام *' : 'Your Full Name *'}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ali Ahmed"
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-medium text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isUr ? 'فون نمبر / واٹس ایپ *' : 'Phone / WhatsApp *'}
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-medium text-stone-900"
                    />
                  </div>
                </div>

                {orderType === 'delivery' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          {isUr ? 'ڈیلیوری ایڈریس (چوک مرلی)' : 'Delivery Address (Chowk Marley)'}
                        </label>
                        <button
                          type="button"
                          onClick={handleDetectLiveLocation}
                          className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100"
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>{isUr ? 'لائیو GPS سیٹ کریں' : 'Fetch GPS Pin'}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="Street, House #, Sector in Chowk Marley..."
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-medium text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        {isUr ? 'قریبی مشہور جگہ (لینڈ مارک)' : 'Nearby Landmark'}
                      </label>
                      <input
                        type="text"
                        value={nearbyLandmark}
                        onChange={(e) => setNearbyLandmark(e.target.value)}
                        placeholder="e.g. Near Main Masjid / Water Tank"
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900"
                      />
                    </div>

                    {/* Interactive Pinpoint Map */}
                    <div
                      onClick={handleMapClick}
                      className="relative h-28 rounded-xl border border-amber-300 bg-amber-50/50 overflow-hidden cursor-crosshair group shadow-inner"
                      title="Tap anywhere to adjust delivery location in Chowk Marley"
                    >
                      <svg className="absolute inset-0 w-full h-full opacity-40">
                        <defs>
                          <pattern id="cartGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#d97706" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#cartGrid)" />
                        <circle cx="50%" cy="50%" r="20" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
                        <text x="50%" y="53%" textAnchor="middle" fontSize="7" fill="#78350f" fontWeight="bold">
                          Chowk Marley
                        </text>
                      </svg>
                      {/* Pin */}
                      <div
                        className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 flex flex-col items-center pointer-events-none"
                        style={{ left: `${pinOffset.x}%`, top: `${pinOffset.y}%` }}
                      >
                        <div className="w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
                          📍
                        </div>
                        <span className="text-[9px] font-black bg-stone-900 text-white px-1.5 py-0.2 rounded mt-0.5">
                          Pin
                        </span>
                      </div>
                      <div className="absolute bottom-1 right-2 text-[9px] text-stone-500 bg-white/80 px-1.5 py-0.5 rounded">
                        Tap map to adjust pin
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {isUr ? 'خصوصی ہدایات' : 'Special Delivery / Cooking Instructions'}
                  </label>
                  <input
                    type="text"
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="e.g. Call before arrival, extra spicy..."
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900"
                  />
                </div>
              </div>

              {/* Promo Voucher */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800 mb-2">
                  <Tag className="w-3.5 h-3.5 text-red-700" />
                  <span>{isUr ? 'ڈسکاؤنٹ واؤچر کوڈ' : 'Apply Promo Voucher'}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Enter SLICE20 or FREEDEL"
                    className="flex-1 text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-700 font-mono uppercase"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
                  >
                    {isUr ? 'لاگو کریں' : 'Apply'}
                  </button>
                </div>

                {appliedVoucher && (
                  <div className="mt-2 text-[11px] text-emerald-700 flex items-center justify-between font-bold">
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

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  {isUr ? 'طریقہ ادائیگی' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className="p-3 rounded-2xl border border-red-700 bg-red-50 text-red-950 font-bold text-left"
                  >
                    <div>{orderType === 'delivery' ? 'Cash on Delivery' : 'Cash on Pickup'}</div>
                    <div className="text-[10px] text-stone-500 font-normal mt-0.5">Pay upon receiving food</div>
                  </button>

                  <div className="p-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50 text-stone-400 text-left cursor-not-allowed">
                    <div className="font-semibold text-stone-500">Online Card / Wallet</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Coming soon</div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown in PKR */}
              <div className="pt-3 border-t border-stone-200 text-xs space-y-1.5 text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-900 font-mono">{formatPrice(subtotal)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Charges (Chowk Marley)</span>
                    <span className="font-bold text-stone-900 font-mono">
                      {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Voucher Discount</span>
                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-red-700 pt-2 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="font-mono text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons: WhatsApp Order + Confirm Button */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-amber-100 bg-[#FFF9F2] space-y-2.5">
            {/* Direct WhatsApp Ordering (Primary User Requirement) */}
            <button
              onClick={handleOrderViaWhatsApp}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/25 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white" />
                <span>{isUr ? 'واٹس ایپ کے ذریعے آرڈر کریں' : 'Order via WhatsApp'}</span>
              </div>
              <div className="font-mono font-black text-white text-base">
                {formatPrice(grandTotal)}
              </div>
            </button>

            {/* Standard Instant Web Checkout */}
            <button
              onClick={handleLocalOrderSubmit}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <span>{isUr ? 'ویب سائٹ کے ذریعے کنفرم کریں' : 'Place Order & View Demo Tracker'}</span>
            </button>

            <p className="text-[10px] text-stone-500 text-center leading-tight">
              {isUr
                ? 'واٹس ایپ پر میسج بھیجنے کے بعد ریسٹورنٹ دستیابی اور وقت کی تصدیق کرے گا۔'
                : 'Note: Opening WhatsApp generates your order message. The restaurant will review and confirm availability.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
