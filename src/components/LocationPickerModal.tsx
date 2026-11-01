import React, { useState } from 'react';
import { X, MapPin, Check, Crosshair, Navigation } from 'lucide-react';
import { POPULAR_LOCATIONS } from '../data/pizzaShops';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (loc: string) => void;
  language: 'en' | 'ur';
}

export const LocationPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  language,
}) => {
  if (!isOpen) return null;
  const isUr = language === 'ur';

  const [customInput, setCustomInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelectLocation(customInput.trim());
      onClose();
    }
  };

  const handleGetLiveLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const locStr = `Marley Chowk (Live GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
          onSelectLocation(locStr);
          onClose();
        },
        () => {
          setIsLocating(false);
          onSelectLocation('Marley Chowk Main Roundabout');
          onClose();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      onSelectLocation('Marley Chowk Main Roundabout');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900 font-serif">
              {isUr ? 'مرلی چوک لوکیشن' : 'Marley Chowk Location'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/60 hover:bg-stone-300 text-stone-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Live GPS Button */}
          <button
            onClick={handleGetLiveLocation}
            className="w-full p-3 rounded-2xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100/80 text-emerald-950 flex items-center justify-between text-xs font-bold transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Crosshair className={`w-4 h-4 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isUr ? 'موجودہ لائیو GPS لوکیشن حاصل کریں' : 'Fetch Exact Current GPS Location'}</span>
            </div>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">
              LIVE
            </span>
          </button>

          {/* Search/Custom input */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={isUr ? 'مرلی چوک میں اپنی گلی یا مکان لکھیں...' : 'Enter street or house in Marley Chowk...'}
              className="flex-1 text-xs px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-xl transition-colors"
            >
              {isUr ? 'سیٹ کریں' : 'Set'}
            </button>
          </form>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              {isUr ? 'مرلی چوک کے پوائنٹس' : 'Marley Chowk Landmarks'}
            </div>
            <div className="space-y-1.5">
              {POPULAR_LOCATIONS.map((loc) => {
                const isSelected = currentLocation.includes(loc.name);
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc.name);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-stone-900 font-bold ring-1 ring-amber-400'
                        : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      <div className="font-medium text-stone-900">{loc.name}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
