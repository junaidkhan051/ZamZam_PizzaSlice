export type MenuCategoryId =
  | 'pizza'
  | 'slices'
  | 'zinger-burgers'
  | 'beef-burgers'
  | 'chicken-burgers'
  | 'shawarma'
  | 'wraps-rolls'
  | 'sandwiches'
  | 'fries-sides'
  | 'pasta'
  | 'fried-chicken'
  | 'family-deals'
  | 'combo-deals'
  | 'beverages'
  | 'desserts';

export interface CategoryInfo {
  id: MenuCategoryId;
  name: string;
  urduName: string;
  icon: string;
  description: string;
}

export type PizzaSizeId = 'small' | 'medium' | 'large' | 'xlarge';

export interface PizzaSizeOption {
  id: PizzaSizeId;
  label: string;
  urduLabel: string;
  description: string;
  price: number;
}

export interface PizzaTopping {
  id: string;
  name: string;
  urduName: string;
  price: number; // in PKR
  category: 'meat' | 'veg' | 'cheese';
  color: string;
}

export interface MenuItem {
  id: string;
  name: string;
  urduName: string;
  description: string;
  urduDescription?: string;
  price: number; // in PKR (base price)
  category: MenuCategoryId;
  image: string;
  fallbackCategory?: 'pizza' | 'slices' | 'burger' | 'shawarma' | 'fries' | 'pasta' | 'chicken' | 'drink' | 'dessert';
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isBestseller?: boolean;
  isFeaturedDeal?: boolean;
  dealItems?: string[];
  customizable?: boolean;
  customizationType?: 'pizza' | 'burger' | 'shawarma' | 'standard';
  availableSizes?: PizzaSizeOption[];
}

export interface PizzaCustomization {
  type: 'pizza';
  sizeId: PizzaSizeId;
  sizeLabel: string;
  crust: 'classic' | 'thin' | 'cheese_stuffed';
  crustLabel: string;
  crustPrice: number;
  cheeseLevel: 'regular' | 'extra' | 'double';
  cheeseLabel: string;
  cheesePrice: number;
  spiceLevel: 'mild' | 'medium' | 'hot';
  selectedToppings: PizzaTopping[];
  specialInstructions: string;
  unitPrice: number;
}

export interface BurgerCustomization {
  type: 'burger';
  patty: 'single' | 'double';
  pattyExtraPrice: number;
  extraCheese: boolean;
  extraCheesePrice: number;
  extraSauce: boolean;
  extraSaucePrice: number;
  removeOnions: boolean;
  removeTomatoes: boolean;
  spiceLevel: 'mild' | 'medium' | 'hot';
  specialInstructions: string;
  unitPrice: number;
}

export interface ShawarmaCustomization {
  type: 'shawarma';
  sauce: 'garlic_mayo' | 'tahini' | 'spicy_chili' | 'bbq';
  sauceLabel: string;
  spiceLevel: 'mild' | 'medium' | 'hot';
  extraCheese: boolean;
  extraCheesePrice: number;
  specialInstructions: string;
  unitPrice: number;
}

export type ProductCustomization = PizzaCustomization | BurgerCustomization | ShawarmaCustomization;

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  customization?: ProductCustomization;
  customizationSummary?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'baking' | 'on_the_way' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  voucherCode?: string;
  total: number;
  orderType: 'delivery' | 'pickup';
  customerName: string;
  contactNumber: string;
  deliveryAddress: string;
  nearbyLandmark?: string;
  additionalInstructions?: string;
  liveCoordinates?: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
    houseFlat?: string;
    landmark?: string;
    isGpsLive?: boolean;
  };
  paymentMethod: 'cod' | 'cash_pickup';
  status: OrderStatus;
  progressPercent: number;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  rider: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    currentLocationLat: number;
    currentLocationLng: number;
  };
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  location: string;
  address: string;
  city: string;
  phone: string;
  whatsappPhone: string;
  openingHours: string;
  minOrder: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
}
