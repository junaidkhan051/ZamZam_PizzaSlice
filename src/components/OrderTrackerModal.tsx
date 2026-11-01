import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Clock, Phone, Bike, Navigation, MapPin, ChefHat, Sparkles, Check } from 'lucide-react';
import { Order, OrderStatus } from '../types/pizza';

interface Props {
  order: Order | null;
  onClose: () => void;
  language: 'en' | 'ur';
}

export const OrderTrackerModal: React.FC<Props> = ({ order, onClose, language }) => {
  if (!order) return null;
  const isUr = language === 'ur';

  // Live order progress simulation
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [riderPositionPercent, setRiderPositionPercent] = useState(25);
  const [remainingMinutes, setRemainingMinutes] = useState(order.estimatedDeliveryMinutes);

  useEffect(() => {
    // Timer that slowly advances the status for demonstration realism
    const interval = setInterval(() => {
      setRiderPositionPercent((prev) => {
        if (prev >= 95) {
          setCurrentStatus('delivered');
          return 100;
        }
        const next = prev + 5;
        if (next >= 40 && next < 65) setCurrentStatus('baking');
        else if (next >= 65 && next < 85) setCurrentStatus('on_the_way');
        else if (next >= 85) setCurrentStatus('on_the_way');
        return next;
      });

      setRemainingMinutes((prev) => Math.max(1, prev - 1));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    { key: 'confirmed', label: isUr ? 'آرڈر موصول ہوا' : 'Order Received', desc: isUr ? 'پیزیریا نے آرڈر قبول کر لیا ہے' : 'Confirmed by Pizzeria' },
    { key: 'baking', label: isUr ? 'اوون میں تیار ہو رہا ہے' : 'Baking in Oven', desc: isUr ? 'کرسٹ اور ٹاپنگز گرما گرم پک رہی ہیں' : 'Hand-stretched & baked at 450°C' },
    { key: 'on_the_way', label: isUr ? 'رائیڈر روانہ ہو چکا ہے' : 'Rider on the Way', desc: isUr ? 'تھرمل پیزا بیگ میں ڈیلیوری جاری ہے' : 'Hot thermal bag in transit' },
    { key: 'delivered', label: isUr ? 'پیزا پہنچ گیا ہے' : 'Delivered Fresh', desc: isUr ? 'گرما گرم سلائسز کا لطف اٹھائیں!' : 'Enjoy your crispy slice!' },
  ];

  const getStepState = (stepKey: string) => {
    const orderRanks: Record<string, number> = {
      confirmed: 1,
      baking: 2,
      on_the_way: 3,
      delivered: 4,
    };
    const currentRank = orderRanks[currentStatus] || 1;
    const targetRank = orderRanks[stepKey] || 1;

    if (currentRank > targetRank) return 'completed';
    if (currentRank === targetRank) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-stone-100">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-900 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-base font-bold font-serif">
                {isUr ? 'لائیو پیزا سلائس ٹریکر' : 'Live Slice Delivery Tracker'}
              </h2>
            </div>
            <p className="text-xs text-stone-300 font-sans mt-0.5">
              Order #{order.orderNumber} · {order.shopName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Tracker Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Estimated Time Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900/80">
                {isUr ? 'متوقع ڈیلیوری وقت' : 'Estimated Delivery Time'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold mt-0.5 font-serif">
                {currentStatus === 'delivered' ? 'Delivered!' : `${remainingMinutes} mins`}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
              🛵
            </div>
          </div>

          {/* Interactive Simulated Map */}
          <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
            {/* Stylized Map Grid SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Road line from shop to home */}
              <path
                d="M 60 140 Q 180 120 280 80 T 480 60"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="8 6"
              />
            </svg>

            {/* Shop Origin Marker */}
            <div className="absolute left-8 bottom-8 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg border-2 border-amber-400 text-lg">
                🍕
              </div>
              <span className="text-[10px] font-bold text-stone-700 bg-white/90 px-1.5 py-0.5 rounded shadow mt-1">
                {order.shopName.slice(0, 15)}
              </span>
            </div>

            {/* Animated Moving Rider Scooter */}
            <div
              className="absolute transition-all duration-1000 ease-out z-10 flex flex-col items-center"
              style={{
                left: `${Math.min(85, Math.max(15, riderPositionPercent))}%`,
                top: `${Math.max(25, 70 - riderPositionPercent * 0.45)}%`,
              }}
            >
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-amber-400 animate-ping opacity-75" />
                <div className="relative w-10 h-10 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-xl border-2 border-white text-lg">
                  🛵
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-stone-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shadow mt-1 whitespace-nowrap">
                Rider Tariq ({riderPositionPercent}%)
              </span>
            </div>

            {/* Destination Customer Marker */}
            <div className="absolute right-8 top-8 flex flex-col items-center">
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-emerald-400 animate-ping opacity-60" />
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white relative">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[10px] font-bold text-stone-900 bg-white/95 border border-emerald-300 px-2 py-0.5 rounded-full shadow mt-1 whitespace-nowrap flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {order.liveCoordinates?.isGpsLive ? 'Live GPS Pin' : 'Marley Chowk'}
                </span>
              </div>
            </div>
          </div>

          {/* Exact Delivery Address Details Card */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-sm">
              📍
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-stone-900 flex items-center justify-between">
                <span>{isUr ? 'آپ کی درست لائیو لوکیشن' : 'Your Live Delivery Coordinates'}</span>
                {order.liveCoordinates && (
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    GPS: {order.liveCoordinates.lat}, {order.liveCoordinates.lng}
                  </span>
                )}
              </div>
              <p className="text-stone-600 mt-0.5 font-medium">{order.deliveryAddress}</p>
              {order.liveCoordinates?.houseFlat && (
                <p className="text-stone-500 text-[11px] mt-0.5">
                  House/Flat: {order.liveCoordinates.houseFlat}
                </p>
              )}
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {isUr ? 'آرڈر کی صورتحال' : 'Order Progress Stages'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {steps.map((st) => {
                const state = getStepState(st.key);
                return (
                  <div
                    key={st.key}
                    className={`p-3 rounded-2xl border transition-all ${
                      state === 'completed'
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                        : state === 'current'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/30'
                        : 'bg-stone-50 border-stone-200 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold">
                        {state === 'completed' ? '✓ ' : ''}
                        {st.label}
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight opacity-80">
                      {st.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rider Profile Card */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-base">
                TM
              </div>
              <div>
                <div className="text-sm font-bold text-stone-900">
                  {order.rider.name}
                </div>
                <div className="text-xs text-stone-500">
                  {order.rider.vehicle} · ⭐ {order.rider.rating} rating
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${order.rider.phone}`}
                className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUr ? 'کال کریں' : 'Call Rider'}</span>
              </a>
            </div>
          </div>

          {/* Order Summary & Ordered Slices */}
          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {isUr ? 'آرڈر کردہ آئٹمز' : 'Order Items Summary'}
            </h4>
            <div className="space-y-2">
              {order.items.map((it) => (
                <div key={it.cartItemId} className="flex items-center justify-between text-xs py-1 text-stone-700">
                  <div className="truncate pr-2">
                    <span className="font-bold text-stone-900 mr-2">{it.quantity}x</span>
                    <span>{it.menuItem.name}</span>
                    {it.customization && (
                      <span className="text-stone-400 text-[11px] ml-1">
                        ({it.customization.sizeLabel})
                      </span>
                    )}
                  </div>
                  <span className="font-medium shrink-0">${it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold text-stone-900">
                <span>{isUr ? 'کل ادا شدہ رقم' : 'Total Paid'}</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <button
            onClick={() => {
              // Advance simulation
              if (currentStatus === 'confirmed') setCurrentStatus('baking');
              else if (currentStatus === 'baking') setCurrentStatus('on_the_way');
              else if (currentStatus === 'on_the_way') setCurrentStatus('delivered');
            }}
            className="text-xs text-amber-800 font-semibold hover:underline"
          >
            ⚡ Fast-forward delivery status (demo)
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            {isUr ? 'بند کریں' : 'Close Tracker'}
          </button>
        </div>
      </div>
    </div>
  );
};
