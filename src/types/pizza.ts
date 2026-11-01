export interface PizzaShop {
  id: string;
  name: string;
  urduName?: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string; // e.g., "20-30 min"
  deliveryFee: number;
  minOrder: number;
  distanceKm: number;
  address: string;
  area: string;
  image: string;
  bannerImage: string;
  isOpen: boolean;
  hasSingleSlices: boolean;
  isFeatured?: boolean;
  priceLevel: '$' | '$$' | '$$$';
  specialOffer?: string;
  tags: string[];
  menu: MenuItem[];
}

export type MenuCategory = 'slices' | 'classic' | 'specialty' | 'deals' | 'sides' | 'drinks';

export interface MenuItem {
  id: string;
  name: string;
  urduName?: string;
  description: string;
  price: number;
  slicePrice?: number; // Price if ordered as a single slice
  category: MenuCategory;
  image: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isBestseller?: boolean;
  customizable?: boolean;
  availableSizes?: {
    id: 'slice' | 'regular' | 'large' | 'jumbo';
    label: string;
    description: string;
    price: number;
  }[];
}

export interface PizzaTopping {
  id: string;
  name: string;
  price: number;
  category: 'meat' | 'veg' | 'cheese' | 'sauce';
  color: string;
}

export interface CustomizedPizza {
  baseItemName: string;
  size: 'slice' | 'regular' | 'large' | 'jumbo';
  sizeLabel: string;
  crust: 'classic' | 'thin' | 'cheese_stuffed' | 'garlic_butter';
  crustLabel: string;
  sauce: 'classic_tomato' | 'spicy_marinara' | 'creamy_garlic' | 'bbq_smoky';
  sauceLabel: string;
  cheeseLevel: 'standard' | 'extra' | 'double';
  selectedToppings: PizzaTopping[];
  specialInstructions: string;
  unitPrice: number;
}

export interface CartItem {
  cartItemId: string;
  shopId: string;
  shopName: string;
  menuItem: MenuItem;
  customization?: CustomizedPizza;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'baking' | 'on_the_way' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  shopId: string;
  shopName: string;
  shopAddress: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  voucherCode?: string;
  total: number;
  deliveryAddress: string;
  contactNumber: string;
  liveCoordinates?: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
    houseFlat?: string;
    landmark?: string;
    isGpsLive?: boolean;
  };
  paymentMethod: 'cod' | 'jazzcash' | 'easypaisa' | 'card';
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
