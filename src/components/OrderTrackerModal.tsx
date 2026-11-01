import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Clock, Phone, Bike, Navigation, MapPin, ChefHat, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types/pizza';
import { RESTAURANT_INFO } from '../data/menuData';
import { formatPrice } from '../utils/currency';

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
    const interval = setInterval(() => {
      setRiderPositionPercent((prev) => {
        if (prev >= 95) {
          setCurrentStatus('delivered');
          return 100;
        }
        const next = prev + 5;
        if (next >= 40 && next < 65) setCurrentStatus('baking');
        else if (next >= 65) setCurrentStatus('on_the_way');
        return next;
      });

      setRemainingMinutes((prev) => Math.max(1, prev - 1));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    { key: 'confirmed', label: isUr ? 'آرڈر موصول ہوا' : 'Order Received', desc: isUr ? 'زم زم کچن نے آرڈر قبول کر لیا ہے' : 'Confirmed by Zam Zam Kitchen' },
    { key: 'baking', label: isUr ? 'اوون میں تیار ہو رہا ہے' : 'Baking / Preparing', desc: isUr ? 'کرسٹ اور مصالحہ دار ٹاپنگز پک رہی ہیں' : 'Hand-stretched & freshly baked' },
    { key: 'on_the_way', label: isUr ? 'رائیڈر روانہ ہو چکا ہے' : 'Rider on the Way', desc: isUr ? 'تھرمل بیگ میں محفوظ ڈیلیوری جاری ہے' : 'Hot thermal container in transit' },
    { key: 'delivered', label: isUr ? 'پیزا پہنچ گیا ہے' : 'Delivered Fresh', desc: isUr ? 'گرما گرم کھانوں کا لطف اٹھائیں!' : 'Enjoy your meal at Chowk Marley!' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-amber-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#171717] text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-base font-bold font-serif">
                {isUr ? 'ڈیمو آرڈر ٹریکر (Simulated Tracking)' : 'Demo Order Tracking'}
              </h2>
              <span className="text-[10px] bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded-full">
                SIMULATION
              </span>
            </div>
            <p className="text-xs text-stone-300 font-sans mt-0.5">
              Order #{order.orderNumber} · {RESTAURANT_INFO.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-[11px] text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            {isUr
              ? 'پورٹ فولیو ڈیمو: یہ حقیقی رائیڈر ڈسپیچ نہیں ہے بلکہ اسٹیٹس اینیمیشن کا ڈیمو ہے۔'
              : 'Portfolio demonstration: This simulates order milestones and delivery progress for testing.'}
          </span>
        </div>

        {/* Scrollable Tracker Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Estimated Time Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-200">
                {isUr ? 'متوقع ڈیلیوری وقت' : 'Estimated Preparation & Delivery'}
              </span>
              <div className="text-2xl sm:text-3xl font-black mt-0.5 font-serif">
                {currentStatus === 'delivered' ? 'Delivered!' : `${remainingMinutes} mins`}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl">
              🛵
            </div>
          </div>

          {/* Interactive Simulated Map */}
          <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
            {/* Stylized Map Grid SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="trackGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#trackGrid)" />
              {/* Road line from shop to home */}
              <path
                d="M 60 140 Q 180 120 280 80 T 480 60"
                fill="none"
                stroke="#c62828"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="8 6"
              />
            </svg>

            {/* Restaurant Origin Marker */}
            <div className="absolute left-6 bottom-6 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center shadow-lg border-2 border-white text-lg">
                🍕
              </div>
              <span className="text-[10px] font-bold text-stone-800 bg-white/95 px-2 py-0.5 rounded shadow mt-1">
                Zam Zam (Chowk Marley)
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
                <span className="absolute -inset-1 rounded-full bg-red-400 animate-ping opacity-75" />
                <div className="relative w-10 h-10 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xl border-2 border-white text-lg">
                  🛵
                </div>
              </div>
              <span className="text-[10px] font-black text-stone-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shadow mt-1 whitespace-nowrap">
                Rider Tariq ({riderPositionPercent}%)
              </span>
            </div>

            {/* Destination Customer Marker */}
            <div className="absolute right-6 top-6 flex flex-col items-center">
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-emerald-400 animate-ping opacity-60" />
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[10px] font-bold text-stone-900 bg-white/95 border border-emerald-300 px-2 py-0.5 rounded-full shadow mt-1 whitespace-nowrap flex items-center gap-1">
                <span>{order.customerName || 'Your Location'}</span>
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {isUr ? 'آرڈر کی صورتحال' : 'Simulated Order Stages'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {steps.map((st) => {
                const state = getStepState(st.key);
                return (
                  <div
                    key={st.key}
                    className={`p-3 rounded-2xl border transition-all ${
                      state === 'completed'
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : state === 'current'
                        ? 'bg-red-50 border-red-500 text-red-950 ring-2 ring-red-500/30'
                        : 'bg-stone-50 border-stone-200 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
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

          {/* Customer & Address Details */}
          <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-amber-200 text-xs space-y-1.5">
            <div className="font-bold text-stone-900 flex justify-between">
              <span>Customer: {order.customerName}</span>
              <span className="text-stone-500">{order.contactNumber}</span>
            </div>
            <div className="text-stone-600">
              <strong>Address:</strong> {order.deliveryAddress}
            </div>
            {order.nearbyLandmark && (
              <div className="text-stone-500 text-[11px]">
                <strong>Landmark:</strong> {order.nearbyLandmark}
              </div>
            )}
          </div>

          {/* Ordered Items Summary */}
          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {isUr ? 'آرڈر کردہ آئٹمز' : 'Order Summary'}
            </h4>
            <div className="space-y-1.5">
              {order.items.map((it) => (
                <div key={it.cartItemId} className="flex items-center justify-between text-xs py-1 text-stone-700">
                  <div className="truncate pr-2">
                    <span className="font-bold text-stone-900 mr-2">{it.quantity}x</span>
                    <span>{it.menuItem.name}</span>
                    {it.customizationSummary && (
                      <span className="text-stone-400 text-[11px] ml-1">
                        ({it.customizationSummary})
                      </span>
                    )}
                  </div>
                  <span className="font-bold font-mono shrink-0">{formatPrice(it.totalPrice)}</span>
                </div>
              ))}
              <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-black text-red-700">
                <span>{isUr ? 'کل رقم (ادا طلب)' : 'Total Amount (PKR)'}</span>
                <span className="font-mono text-base">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-[#FFF9F2] flex items-center justify-between">
          <button
            onClick={() => {
              if (currentStatus === 'confirmed') setCurrentStatus('baking');
              else if (currentStatus === 'baking') setCurrentStatus('on_the_way');
              else if (currentStatus === 'on_the_way') setCurrentStatus('delivered');
            }}
            className="text-xs text-red-700 font-bold hover:underline"
          >
            ⚡ Fast-forward demo status
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            {isUr ? 'بند کریں' : 'Close Tracker'}
          </button>
        </div>
      </div>
    </div>
  );
};
