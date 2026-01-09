
import type { NavItem, Product, LearningModule, WeatherAlert, IoTDevice, Notification, DeliveryAgent, StorageFacility, Order } from '@/lib/types';
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Bot,
  DollarSign,
  BookOpen,
  ThermometerSun,
  Settings,
  Tractor,
  CloudRain,
  CloudSnow,
  CloudSun,
  Bell,
  TrendingUp,
  ShoppingBag,
  Award,
  Warehouse,
  Shield,
  ShieldCheck,
  MailCheck,
  PackageCheck,
  Search,
  Heart,
  Leaf,
  GraduationCap,
  Cog,
  Library,
  UserCircle,
  UserPlus,
  Users,
  Edit,
  ListChecks as ListChecksIcon,
  Info,
  Briefcase,
  BarChart2,
  Target,
  Lightbulb,
  Cpu as TechIcon,
  Rocket,
  Group as TeamIcon,
  Handshake,
  MessageSquare,
  Presentation,
  Accessibility,
  Smartphone,
  MicVocal,
  WifiOff,
  Computer,
  Radio,
  User,
  Truck,
  UsersRound,
  Wrench,
  Share2,
  Activity,
  FileText,
  Brain,
  Database,
  RadioTower,
  ShoppingCart as ShoppingCartIcon,
  Languages,
  Globe,
  Zap,
  Building2,
  Network,
  CreditCard
} from 'lucide-react';

export const APP_NAME = "Azmera";
export const APP_DESCRIPTION = "Azmera: Empowering Ethiopian Farmers, Enabling Markets. A digital platform connecting farmers, buyers, logistics, and experts for a thriving agricultural sector.";


export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tooltip: "Overview" },
  {
    label: 'Marketplace',
    icon: Store,
    tooltip: "Buy & Sell Products",
    children: [
      { href: '/market', label: 'Browse Products', icon: Search, tooltip: "Discover Products" },
      { href: '/products/add', label: 'List Your Product', icon: PlusCircle, tooltip: "Sell Your Produce/Tech" },
      { href: '/orders', label: 'My Orders & Sales', icon: ShoppingBag, tooltip: "Track Transactions" },
      { href: '/favorites', label: 'My Favorites', icon: Heart, tooltip: "Saved Items" },
    ],
  },
  {
    label: 'Services & Tools',
    icon: Cog,
    tooltip: "AI, Logistics & Farm Tech",
    children: [
      { href: '/ai-advisor', label: 'AI Crop Advisor', icon: Leaf, tooltip: "Crop Diagnosis" },
      { href: '/pricing-assistant', label: 'Pricing Assistant', icon: DollarSign, tooltip: "Price Suggestions" },
      { href: '/cooperative-planner', label: 'Cooperative Planner', icon: Users, tooltip: "AI Planting Coordination" },
      { href: '/iot-weather', label: 'IoT & Weather', icon: ThermometerSun, tooltip: "Smart Farming Data" },
      { href: '/transportation', label: 'Request Transport', icon: Tractor, tooltip: "Arrange Delivery" },
      { href: '/storage-facilities', label: 'Find Storage', icon: Warehouse, tooltip: "Secure Storage" },
    ],
  },
  {
    label: 'Learning Hub',
    icon: Library,
    href: '/learning',
    tooltip: "Courses & Training",
    children: [
      { href: '/learning', label: 'Explore Courses', icon: GraduationCap, tooltip: "Educational Content" },
      // Educator specific links could be dynamically added based on role if needed
      // { href: '/learning/create', label: 'Create Content (Educator)', icon: Edit, roles: ['educator'] },
      // { href: '/learning/my-content', label: 'My Content (Educator)', icon: ListChecksIcon, roles: ['educator'] },
      // { href: '/consultations', label: 'Consultations (Educator)', icon: MessageSquare, roles: ['educator'] },
    ],
  },
  // Role-specific menu items for Transporter, Tool Seller, Storage Provider can be added here
  // Example for Transporter:
  // {
  //   label: 'Transport Services',
  //   icon: Truck,
  //   roles: ['transporter'],
  //   children: [
  //     { href: '/transportation/requests', label: 'Delivery Requests', icon: ListChecksIcon },
  //     { href: '/transportation/schedule', label: 'My Schedule', icon: CalendarDays },
  //   ]
  // },
  {
    label: 'My Profile',
    icon: UserCircle,
    tooltip: "Manage Your Account",
    children: [
      { href: '/profile', label: 'View Profile', icon: User, tooltip: "Your Profile" },
      { href: '/verification', label: 'Verification Center', icon: ShieldCheck, tooltip: "Get Verified" },
      { href: '/earnings', label: 'My Earnings', icon: DollarSign, tooltip: "Track Revenue" },
      { href: '/transactions', label: 'Transactions', icon: CreditCard, tooltip: "Payment History" },
      { href: '/notifications', label: 'Notifications', icon: Bell, tooltip: "View Alerts" },
      { href: '/settings', label: 'Settings', icon: Settings, tooltip: "Account & App Settings" },
      { href: '/login', label: 'Login/Logout', icon: UserPlus, tooltip: "Account Access" },
    ],
  },
  {
    label: 'Admin',
    icon: ShieldCheck,
    tooltip: "Admin Functions",
    children: [
      { href: '/admin/role-requests', label: 'KYC Command Center', icon: ShieldCheck, tooltip: "Verify Professionals" },
      { href: '/admin/verify-users', label: 'Verify Users (Legacy)', icon: Shield, tooltip: "User Verification" },
      { href: '/admin/revenue', label: 'Platform Revenue', icon: DollarSign, tooltip: "Revenue & Commission" },
    ],
  },
  { href: '/join', label: `Join ${APP_NAME}`, icon: UserPlus, tooltip: "Register or Sign In" },
  { href: '/about', label: 'About Us', icon: Info, tooltip: `Learn More About ${APP_NAME}` },
];


export const ETHIOPIAN_LOCATIONS = [
  "Addis Ababa", "Adama (Nazret)", "Bahir Dar", "Mekelle", "Hawassa",
  "Dire Dawa", "Gondar", "Jimma", "Dessie", "Debre Markos",
  "Shashamane", "Harar", "Axum", "Nekemte", "Arba Minch", "Ziway",
  "Weldiya", "Sodo", "Asella", "Bishoftu (Debre Zeyit)"
];

export const VEHICLE_TYPES = [
  "Isuzu NPR Truck (Covered)",
  "Bajaj RE (Covered)",
  "Refrigerated Van",
  "Toyota Hilux (Open Bed)",
  "Large Refrigerated Truck",
  "Motorcycle (for small parcels)",
  "Three-Wheeler Cargo (Piaggio Ape style)",
  "Minibus (for passenger/small cargo)",
  "Other",
];

export const PRICING_UNITS = [
  "per Trip (Fixed)",
  "per Kilometer (Km)",
  "per Kilogram (Kg)",
  "per Kg per Km",
  "per Hour",
];

export const SPECIAL_HANDLING_FEATURES = [
  { id: "temperatureControl", label: "Temperature Control" },
  { id: "fragileHandling", label: "Fragile Item Handling" },
  { id: "livestockTransport", label: "Livestock Transport" },
  { id: "heavyGoods", label: "Heavy Goods (Over 1 Ton)" },
  { id: "hazardousMaterials", label: "Hazardous Materials (Certified)" },
  { id: "secureTransport", label: "Secure/High-Value Goods Transport" }
];

export const FARM_SIZE_UNITS = ["Hectares", "Acres", "Timad (local unit)", "Gasha (local unit)"];
export const CROP_TYPES_ETHIOPIA = ["Teff", "Coffee", "Maize", "Sorghum", "Wheat", "Barley", "Pulses (Beans, Chickpeas, Lentils)", "Oilseeds (Sesame, Niger Seed)", "Fruits (Mango, Avocado, Banana)", "Vegetables (Tomato, Onion, Cabbage)", "Spices (Berbere, Mitmita)", "Sugarcane", "Enset"];
export const BUYER_TYPES = ["Wholesaler", "Retailer", "Exporter", "Restaurant/Hotel", "Food Processor", "Cooperative Union", "Individual Consumer"];
export const EDUCATOR_EXPERTISE_AREAS = [
  "Soil Health & Management",
  "Pest & Disease Control",
  "Crop Specific (e.g., Teff, Coffee)",
  "Irrigation & Water Management",
  "Agri-Technology Implementation",
  "Organic Farming Practices",
  "Post-Harvest Handling & Storage",
  "Agribusiness & Market Linkage",
  "Climate Smart Agriculture",
  "Livestock Management",
  "Cooperative Management & Development"
];
export const TOOL_CATEGORIES = [
  "Planting Equipment (Seeders, Planters)",
  "Irrigation Systems (Drip, Sprinkler, Pumps)",
  "Harvesting Tools (Scythes, Sickles, Small Harvesters)",
  "Soil Preparation Tools (Plows, Tillers, Hoes)",
  "Pest Control Equipment (Sprayers)",
  "Protective Gear (Gloves, Masks)",
  "Small Machinery (Threshers, Grinders)",
  "Post-Harvest Equipment (Cleaners, Sorters, Dryers)",
  "Beekeeping Equipment",
  "Dairy Equipment"
];

export const MAIN_CROP_CATEGORIES = [
  "Grains (Teff, Wheat, Maize, Sorghum, Barley)",
  "Pulses (Beans, Chickpeas, Lentils, Fava Beans)",
  "Oilseeds (Sesame, Niger Seed, Linseed, Groundnuts, Sunflower)",
  "Coffee (Arabica - various origins like Yirgacheffe, Sidamo, Harrar)",
  "Fruits (Avocado, Mango, Banana, Papaya, Citrus, Grapes)",
  "Vegetables (Tomato, Onion, Potato, Cabbage, Carrots, Leafy Greens)",
  "Spices (Berbere, Mitmita, Korarima, Ginger, Turmeric, Garlic)",
  "Root Crops (Enset, Sweet Potato, Cassava, Taro)",
  "Fiber Crops (Cotton)",
  "Stimulants (Khat, Tea)",
  "Sugarcane",
  "Honey & Beeswax",
  "Livestock Feed",
  "Other"
];

export const STORAGE_TYPES = [
  "Cold Storage (Fruits, Vegetables, Dairy)",
  "Dry Goods Storage (Grains, Pulses)",
  "Grain Silo",
  "Secure Warehouse (General Purpose)",
  "Ventilated Storage (Onions, Potatoes)",
  "Multi-Purpose Agricultural Storage",
];

export const STORAGE_FEATURES = [
  "24/7 Security Monitoring (CCTV)",
  "Pest Control System (Regular)",
  "Climate Controlled (Temperature & Humidity)",
  "Easy Loading/Unloading Access (Dock, Ramp)",
  "Inventory Management System Access",
  "Insurance Coverage Option Available",
  "Flexible Rental Terms (Short/Long)",
  "Rodent Proofing",
  "Fire Safety System",
  "Backup Power Generator",
];

export const STORAGE_CAPACITY_UNITS = ["Quintals", "Metric Tons", "Cubic Meters", "Pallets"];


export const MOCK_STORAGE_FACILITIES: StorageFacility[] = [
  {
    id: 'sf1',
    name: 'Addis Prime Cold Storage',
    location: 'Addis Ababa, Kality',
    capacity: '5000 Quintals',
    storageType: 'Cold Storage (Fruits, Vegetables, Dairy)',
    features: ['24/7 Security Monitoring (CCTV)', 'Climate Controlled (Temperature & Humidity)', 'Easy Loading/Unloading Access (Dock, Ramp)', 'Backup Power Generator'],
    pricePerUnitPerMonth: 75,
    availability: 'Available',
    imageUrl: 'https://placehold.co/300x200.png',
    contact: 'Contact via App',
    rating: 4.7,
    iconName: 'Warehouse',
  },
  {
    id: 'sf2',
    name: 'Adama Grain Secure Silos',
    location: 'Adama, Oromia Region',
    capacity: '20,000 Quintals',
    storageType: 'Grain Silo',
    features: ['Pest Control System (Regular)', 'Rodent Proofing', 'Inventory Management System Access'],
    pricePerUnitPerMonth: 30,
    availability: 'Limited Space',
    imageUrl: 'https://placehold.co/300x200.png',
    contact: '+251 912 987654',
    rating: 4.5,
    iconName: 'Warehouse',
  },
  {
    id: 'sf3',
    name: 'Hawassa AgriHub Storage',
    location: 'Hawassa, Sidama Region',
    capacity: '10,000 Quintals',
    storageType: 'Multi-Purpose Agricultural Storage',
    features: ['24/7 Security Monitoring (CCTV)', 'Easy Loading/Unloading Access (Dock, Ramp)', 'Flexible Rental Terms (Short/Long)'],
    pricePerUnitPerMonth: 40,
    availability: 'Available',
    imageUrl: 'https://placehold.co/300x200.png',
    contact: 'Contact via App',
    rating: 4.3,
    iconName: 'Warehouse',
  },
  {
    id: 'sf4',
    name: 'Bahir Dar Dry Goods Warehouse',
    location: 'Bahir Dar, Amhara Region',
    capacity: '8000 Quintals',
    storageType: 'Dry Goods Storage (Grains, Pulses)',
    features: ['Pest Control System (Regular)', 'Rodent Proofing', 'Fire Safety System'],
    pricePerUnitPerMonth: 35,
    availability: 'Full',
    imageUrl: 'https://placehold.co/300x200.png',
    contact: '+251 911 123456',
    rating: 4.0,
    iconName: 'Warehouse',
  },
];

export { Briefcase, BarChart2, Target, Lightbulb, TechIcon as TechnologyIcon, Rocket, TeamIcon, Handshake, MessageSquare, Presentation as DemoIcon, Leaf as AzmeraLogoIcon, Award as CompetitionIcon };
export { Accessibility, Smartphone, MicVocal, WifiOff, Computer, Radio, User as UserIcon, UsersRound, Wrench, Share2, Activity, FileText, Brain, Database, PackageCheck, RadioTower, UserPlus };
export { Building2, Network };



