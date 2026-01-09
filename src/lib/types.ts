
export type Language = 'en' | 'am' | 'om' | 'so' | 'ti';

export interface LanguageInfo {
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export interface Translations {
  [key: string]: string;
}

export const SUPPORTED_LANGUAGES: Record<Language, LanguageInfo> = {
  en: { name: 'English', nativeName: 'English', direction: 'ltr' },
  am: { name: 'Amharic', nativeName: 'አማርኛ', direction: 'ltr' },
  om: { name: 'Oromo', nativeName: 'Afaan Oromoo', direction: 'ltr' },
  so: { name: 'Somali', nativeName: 'Soomaali', direction: 'ltr' },
  ti: { name: 'Tigrinya', nativeName: 'ትግርኛ', direction: 'ltr' },
};

export interface Product {
  id: string;
  title: string;
  name?: string; // Legacy alias
  description: string;
  price: number;
  image_url: string;
  imageUrl?: string; // Legacy alias
  category: string;
  location: string;
  farmerName?: string;
  farmerId?: string;
  sellerId?: string;
  stockQuantity?: number;
  unit?: string;
  createdAt?: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string; // e.g., "2 hours"
  rewardPoints: number;
  href: string;
  iconName?: string;
  language?: string; // Added language field
}

export interface WeatherAlert {
  id: string;
  type: 'Drought Warning' | 'Belg Rain Forecast' | 'Clear & Sunny' | 'Kiremt Rain Start' | 'Frost Warning';
  severity: 'High' | 'Medium' | 'Low' | 'None';
  message: string;
  timestamp: Date;
  iconName: string;
}

export interface IoTDevice {
  id: string;
  name: string;
  type: 'Soil Sensor' | 'Weather Station' | 'Smart Irrigator' | 'Drone';
  status: 'Online' | 'Offline' | 'Error' | 'Optimal';
  lastReading?: string; // e.g., "Temp: 25°C, Humidity: 60%"
  iconName: string;
}

export interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string; // Optional: if not present or for parent items that are also links
  disabled?: boolean;
  external?: boolean;
  children?: NavItem[];
  tooltip?: string;
}

export type NotificationType =
  | 'PriceAlert'
  | 'WeatherUpdate'
  | 'SystemMessage'
  | 'NewOrder'
  | 'LearningReward'
  | 'EscrowPaymentMade'
  | 'DeliveryConfirmationRequired'
  | 'PaymentReleasedToSeller'
  | 'PaymentReleasedToTransporter'
  | 'DeliveryMarkedByTransporter';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  iconName: string;
  read: boolean;
  href?: string;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  vehicleType: string;
  rating: number;
  availability: string;
  location: string;
  specialFeatures: Array<'Temperature Control' | 'Fragile Handling' | 'Livestock Transport'>;
  contact: string;
  priceRate: number;
  priceCurrency: string;
}

export interface StorageFacility {
  id: string;
  name: string;
  location: string;
  capacity: string;
  storageType: string;
  features: string[];
  pricePerUnitPerMonth: number;
  availability: 'Available' | 'Limited Space' | 'Full';
  imageUrl: string;
  contact: string;
  rating: number;
  iconName?: string;
  type?: string; // Add type as alias for storageType
  pricePerUnit?: number; // Add pricePerUnit as alias
}

export type OrderStatus =
  | 'PaymentPending'
  | 'PaymentInEscrow'
  | 'AwaitingShipment' // For self-pickup or if seller handles packaging
  | 'Shipped' // Transporter has picked up
  | 'DeliveredAwaitingConfirmation' // Transporter marked as delivered
  | 'Completed' // Buyer confirmed, payment released
  | 'Cancelled'
  | 'Dispute';

export interface Order {
  id: string;
  product: Product;
  quantity: number;
  totalPrice: number;
  orderDate: Date;
  status: OrderStatus;
  buyerId: string; // Simulated
  sellerId: string; // Simulated
  transporterId?: string; // Simulated, if delivery involved
  deliveryAddress?: string; // If applicable
  pickupLocation?: string; // If self-pickup or for transporter
  deliveryConfirmationPhoto?: string; // URL to a photo, simulated
  paymentMethod: string; // e.g. "Telebirr", "COD"
}



export interface User {
  id: string;
  email: string;
  name: string;
  role: 'farmer' | 'buyer' | 'transporter' | 'educator' | 'tool_seller' | 'storage_provider' | 'admin';
  phone?: string;
  location?: string;
  profileImage?: string;
  walletBalance: number;
  escrowBalance: number;
  bio?: string;
  specialization?: string;
  roleRequestStatus?: 'pending' | 'approved' | 'rejected';
  requestedRole?: string;
  rejectionReason?: string;
  verification_level?: string;
  verified: boolean;
}
