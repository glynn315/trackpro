export const siteConfig = {
  name: "TrackPro GPS",
  tagline: "Track, Monitor & Control Every Vehicle—Anytime, Anywhere.",
  shortDescription:
    "TrackPro is a GPS tracking and fleet management solutions provider dedicated to helping businesses, organizations, and vehicle owners manage their vehicles more efficiently, safely, and intelligently.",
  longDescription:
    "Smart GPS Tracking & Management Solutions for Vehicles, Fleets, Assets, and Personal Security.",
  url: "https://trackprotracking.com",
  locale: "en_PH",
  currency: "PHP",
  currencySymbol: "₱",
  location: {
    address: "Brgy. New Ilo-Ilo",
    city: "Tantangan",
    region: "South Cotabato",
    postalCode: "9510",
    country: "Philippines",
  },
  contact: {
    phonePrimary: "0935-695-8211",
    phoneSecondary: "0997-223-4814",
    email: "trackproph@gmail.com",
    salesEmail: "sales@trackprotracking.com",
    techEmail: "tech@trackprotracking.com",
    adminEmail: "admin@trackprotracking.com",
    facebook: "https://www.facebook.com/profile.php?id=61566098976013",
    messenger: "https://m.me/61566098976013",
    hours: "Mondays – Saturdays · 8:00 AM – 5:00 PM",
  },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61566098976013",
    messenger: "https://m.me/61566098976013",
  },
} as const;

/**
 * Primary navigation. Items with `children` render as dropdowns on desktop and
 * expandable groups on mobile. Hash links point at homepage sections; the
 * header prefixes them with "/" when the visitor is on another page.
 */
export type NavLink = { label: string; href: string };
export type NavItem = NavLink & { icon: string; children?: readonly NavLink[] };

export const navigation: readonly NavItem[] = [
  { label: "Home", href: "#home", icon: "map" },
  {
    label: "About",
    href: "#about",
    icon: "shield",
    children: [
      { label: "Our Story", href: "#our-story" },
      { label: "Mission", href: "#mission" },
      { label: "Vision", href: "#vision" },
    ],
  },
  { label: "Services", href: "#services", icon: "support" },
  {
    label: "Products",
    href: "/products",
    icon: "truck",
    children: [
      { label: "Hardware & Add-ons", href: "/products" },
      { label: "Subscription Plans", href: "/plans" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions/fleet-management",
    icon: "chart",
    children: [
      { label: "Fleet Management", href: "/solutions/fleet-management" },
      { label: "Anti-theft Protection", href: "/solutions/anti-theft-protection" },
      { label: "Asset Tracking", href: "/solutions/asset-tracking" },
      { label: "Satellite Tracking", href: "/solutions/satellite-tracking" },
      { label: "AI Remote Video Telematics", href: "/solutions/ai-remote-video-telematics" },
      { label: "TMS API Integration", href: "/solutions/tms-api-integration" },
    ],
  },
  { label: "Reviews", href: "#testimonials", icon: "check" },
  { label: "Contact Us", href: "/contact", icon: "geo" },
];

export const heroFeatures = [
  "Real-time Tracking",
  "Signal Jammer Detection",
  "Fuel Monitoring",
  "Remote Engine Shut-off",
  "Real-time Alerts",
  "Temperature Monitoring",
  "Route History",
  "Door Lock & Unlock",
  "RFID Punch-in",
  "Geo-fencing",
  "Door Status Detection",
  "Web & Mobile Access",
] as const;

export const testimonials = [
  {
    quote:
      "Sobrang panatag na ako kahit nasaan ako. Nakikita ko ang location ng truck ko real-time. Salamat TrackPro!",
    author: "Jomar R.",
    role: "Truck Owner",
    location: "South Cotabato",
  },
  {
    quote:
      "Thank You TrackPro for our GPS installation. We can now monitor all our trucks anytime from our office.",
    author: "Cargo Rush Trucking Services",
    role: "Fleet Operator",
    location: "Cagayan de Oro",
  },
  {
    quote:
      "Yung anti-jammer feature talaga ang bumenta sakin. Kahit i-jam ng magnanakaw, gumagana pa rin yung tracker. Worth it!",
    author: "Mark P.",
    role: "Motorcycle Owner",
    location: "General Santos",
  },
  {
    quote:
      "Installation was fast and the support team is very responsive. Local team na kaya mo makausap, walang abroad call center.",
    author: "LJD Trucking Services",
    role: "Logistics",
    location: "Mindanao",
  },
] as const;

export const servicesIntro = [
  "From GPS tracking and AI video telematics to driver monitoring and fleet management —TrackPro provides the technology you need to track, manage, protect, and optimize every vehicle.",
  "Whether you manage a single vehicle or a growing fleet, our solutions give you real-time visibility, actionable insights, and greater control wherever your vehicles go.",
] as const;

export const services = [
  {
    title: "Real-Time Tracking 24/7",
    description:
      "Track your vehicles in real time using the Tracking mobile app or web dashboard, with live updates on location, speed, and travel status.",
    icon: "map",
  },
  {
    title: "Anti-Jamming Technology",
    description:
      "Advanced anti-jammer technology helps maintain control and alerts you when GPS or cellular interference is detected, providing an additional layer of vehicle security.",
    icon: "signal",
  },
  {
    title: "Remote Engine Shut-off",
    description:
      "Safely prevent unauthorized vehicle use by remotely immobilizing the engine through the Tracking platform when supported by your installed device and vehicle configuration.",
    icon: "power",
  },
  {
    title: "Door Lock & Unlock",
    description:
      "Lock or unlock compatible vehicles remotely using the mobile app, providing added convenience and enhanced security.",
    icon: "lock",
  },
  {
    title: "Fleet Monitoring",
    description:
      "Monitor multiple vehicles, drivers, trips, mileage, idle time, and fleet performance through a centralized dashboard designed for businesses of all sizes.",
    icon: "truck",
  },
  {
    title: "Fuel Monitoring",
    description:
      "Monitor fuel levels and consumption to identify unusual fuel loss, improve efficiency, and help reduce operating costs with compatible fuel sensors.",
    icon: "chart",
  },
  {
    title: "Temperature Monitoring",
    description:
      "Receive real-time temperature readings and alerts to help safeguard refrigerated goods, pharmaceuticals, food products, and other sensitive cargo.",
    icon: "chart",
  },
  {
    title: "RFID Driver Identification",
    description:
      "Assign RFID cards or tags to drivers and automatically record driver identity for improved accountability, access control, and trip history.",
    icon: "check",
  },
  {
    title: "Dashcam Integration",
    description:
      "Combine GPS tracking with front or multi-channel dashcam recording to review trips, investigate incidents, and improve driver safety.",
    icon: "shield",
  },
  {
    title: "OBD Diagnostics",
    description:
      "Access diagnostic information from compatible vehicles, including engine status, fault codes, battery voltage, and maintenance-related data.",
    icon: "power",
  },
  {
    title: "Asset Tracking",
    description:
      "Track trailers, containers, heavy equipment, generators, motorcycles, and other valuable assets with real-time location monitoring and movement alerts.",
    icon: "geo",
  },
  {
    title: "TMS API Integration",
    description:
      "Integrate TrackPro with ERP, logistics, dispatch, fleet management, or custom software using secure APIs for automated data sharing and workflow integration.",
    icon: "arrow",
  },
  {
    title: "Satellite Tracking",
    description:
      "Track assets beyond cellular coverage using a wired or wireless satellite module connected to the GPS device, enabling reliable data transmission to the tracking platform even in remote areas.",
    icon: "signal",
  },
  {
    title: "Driver Management",
    description:
      "Manage driver profiles, trip records, performance scores, and driving analysis to improve safety, efficiency, and overall fleet performance.",
    icon: "support",
  },
  {
    title: "Data Report Analytics",
    description:
      "Access comprehensive reports and analytics covering alerts, temperature and humidity, industry performance, regional entry and exit, RFID driver attendance, and scheduled report tasks for better fleet visibility and decision-making.",
    icon: "chart",
  },
] as const;

export const about = {
  title: "TrackPro GPS Tracking Solutions",
  intro:
    "TrackPro is a GPS tracking and fleet management solutions provider dedicated to helping businesses, organizations, and vehicle owners manage their vehicles more efficiently, safely, and intelligently.",
  story: [
    "TrackPro was established with the goal of providing accessible, reliable, and practical GPS tracking solutions tailored to the needs of businesses, enterprises, and public and private vehicle owners. From individual vehicles to growing fleets, our solutions are designed to support better decision-making and greater operational control.",
    "Powered by a proven tracking platform with 18 years of experience in IoT, Telematics, Fleet Management, and SaaS (Software as a Service), TrackPro provides reliable GPS technology and a user-friendly fleet management system that delivers real-time visibility and valuable insights.",
    "Our solutions help customers monitor vehicle locations, improve operations, reduce unnecessary costs, and protect their assets.",
  ],
  mission:
    "To become a trusted leader in intelligent GPS tracking and fleet management solutions, empowering businesses and vehicle owners with technology that makes mobility safer, smarter, and more efficient.",
  vision:
    "To provide reliable, accessible, and innovative GPS tracking and fleet management solutions that deliver real-time visibility, improve operational efficiency, reduce costs, protect assets, and promote safer driving through proven technology and exceptional customer support.",
} as const;

/**
 * Product catalog — the offline fallback for the storefront. The live API is
 * the source of truth for name/price/stock; keep these in sync with
 * `trackpro-api/database/seeders/ProductSeeder.php`.
 * `model` holds the device descriptor; `subscription` is the lowest monthly plan.
 */
export const products = [
  {
    id: "trackpro-core",
    name: "TrackPro Core",
    model: "Standard 4G GPS Tracker",
    category: "Vehicle",
    icon: "map",
    price: 5299,
    subscription: 299,
    tagline: "Reliable 4G vehicle tracker designed for everyday vehicle security, monitoring, and recovery.",
    description: "Reliable 4G vehicle tracker designed for everyday vehicle security, monitoring, and recovery.",
    highlights: ["4G Connectivity", "Remote Engine Shut-off", "Vehicle Power Monitoring", "Vibration Detection"],
  },
  {
    id: "trackpro-premium-anti-jammer",
    name: "TrackPro Guard",
    model: "Anti-Jammer GPS Tracker",
    category: "Vehicle",
    icon: "signal",
    price: 6799,
    subscription: 599,
    featured: true,
    tagline: "Advanced anti-theft tracker designed for vehicles requiring enhanced security and recovery protection.",
    description: "Advanced anti-theft tracker designed for vehicles requiring enhanced security and recovery protection.",
    highlights: ["Anti-Jamming Protection", "Remote Door Lock/Unlock", "Remote Engine/Fuel Cut-Off", "Advanced Anti-Theft Alerts"],
  },
  {
    id: "trackpro-4g-multi-functional",
    name: "TrackPro Fleet",
    model: "Professional Fleet GPS Tracker",
    category: "Fleet",
    icon: "truck",
    price: 6299,
    subscription: 599,
    tagline: "Professional fleet tracker designed for businesses requiring advanced vehicle, fuel, and temperature monitoring.",
    description: "Professional fleet tracker designed for businesses requiring advanced vehicle, fuel, and temperature monitoring.",
    highlights: ["Fuel Monitoring", "Temperature Monitoring", "RFID Driver Attendance", "Remote Fuel/Power Control", "SOS Function"],
  },
  {
    id: "trackpro-fleet-fuel-rfid",
    name: "TrackPro Fleet X",
    model: "Advanced Heavy-Duty Fleet Tracker",
    category: "Fleet",
    icon: "truck",
    price: 9199,
    subscription: 999,
    tagline: "Advanced fleet tracking solution designed for trucking, logistics, and heavy commercial vehicle operations.",
    description: "Advanced fleet tracking solution designed for trucking, logistics, and heavy commercial vehicle operations.",
    highlights: ["Fuel Monitoring", "Temperature Monitoring", "RFID Driver Attendance", "Remote Fuel/Power Control", "Advanced Fleet Alerts"],
  },
  {
    id: "trackpro-magnet-10000",
    name: "TrackPro Go",
    model: "Wireless GPS Tracker",
    category: "Asset",
    icon: "shield",
    price: 4699,
    subscription: 299,
    tagline: "Battery-powered wireless GPS tracker designed for flexible installation and temporary vehicle or asset monitoring.",
    description: "Battery-powered wireless GPS tracker designed for flexible installation and temporary vehicle or asset monitoring.",
    highlights: ["7,500mAh Rechargeable Battery", "Magnetic Mounting", "Wireless Installation", "Remote Audio Monitoring"],
  },
  {
    id: "trackpro-vision",
    name: "TrackPro Vision",
    model: "4G GPS Dashcam",
    category: "Dashcam",
    icon: "chart",
    price: 10999,
    subscription: 599,
    tagline: "4G GPS dashcam combining vehicle monitoring with remote video recording and surveillance.",
    description: "4G GPS dashcam combining vehicle monitoring with remote video recording and surveillance.",
    highlights: ["1080P Video Recording", "Live Video Monitoring", "Remote Video Playback", "Remote Photo Capture"],
  },
  {
    id: "trackpro-dual-dashcam",
    name: "TrackPro Vision Pro",
    model: "AI Dual-Camera Dashcam",
    category: "Dashcam",
    icon: "chart",
    price: 14599,
    subscription: 999,
    tagline: "Advanced dual-camera dashcam combining GPS tracking, live video, and AI-powered driver safety monitoring.",
    description: "Advanced dual-camera dashcam combining GPS tracking, live video, and AI-powered driver safety monitoring.",
    highlights: [
      "Dual 1080P Cameras", "ADAS Driver Assistance", "DMS Driver Monitoring", "Live Video Monitoring", "Two-Way Talk",
      "Remote Engine Shut-off", "Fuel Monitoring", "Temperature Monitoring", "RFID Driver Attendance",
    ],
  },
  {
    id: "trackpro-4-channel-dashcam",
    name: "TrackPro Vision X",
    model: "Multi-Camera Fleet Dashcam",
    category: "Dashcam",
    icon: "chart",
    price: 23499,
    subscription: 1299,
    tagline: "Professional multi-camera video telematics system designed for comprehensive fleet surveillance and driver safety monitoring.",
    description: "Professional multi-camera video telematics system designed for comprehensive fleet surveillance and driver safety monitoring.",
    highlights: [
      "Up to 4 Cameras", "Multi-Camera Live Video", "ADAS Driver Assistance", "DMS Driver Monitoring", "Video Event Upload",
      "Live Video Monitoring", "Two-Way Talk", "Fuel Monitoring", "Temperature Monitoring", "RFID Driver Attendance",
    ],
  },
  {
    id: "trackpro-obd2",
    name: "TrackPro Plug",
    model: "Plug & Play OBD GPS Tracker",
    category: "OBD",
    icon: "power",
    price: 3899,
    subscription: 299,
    tagline: "Easy-to-install OBD GPS tracker that connects directly to compatible vehicles without conventional hardwired installation.",
    description: "Easy-to-install OBD GPS tracker that connects directly to compatible vehicles without conventional hardwired installation.",
    highlights: ["OBD Plug & Play", "No Hardwire Installation", "Vehicle Data Monitoring", "Easy Installation"],
  },
  {
    id: "trackpro-obd2-system-diagnosis",
    name: "TrackPro Plug X",
    model: "Advanced OBD GPS Tracker",
    category: "OBD",
    icon: "chart",
    price: 5199,
    subscription: 299,
    tagline: "Advanced plug-and-play GPS tracker combining vehicle monitoring with available OBD diagnostic information.",
    description: "Advanced plug-and-play GPS tracker combining vehicle monitoring with available OBD diagnostic information.",
    highlights: ["OBD Vehicle Diagnostics", "Plug & Play Installation", "Vehicle Data Monitoring", "Driving Behavior Data"],
  },
  {
    id: "trackpro-solar-powered",
    name: "TrackPro Solar",
    model: "Solar Asset GPS Tracker",
    category: "Satellite",
    icon: "geo",
    price: 8299,
    subscription: 999,
    tagline: "Long-term GPS tracking solution designed for trailers, containers, equipment, and assets operating in remote locations.",
    description: "Long-term GPS tracking solution designed for trailers, containers, equipment, and assets operating in remote locations.",
    highlights: ["Solar Charging", "Cellular + Satellite Connectivity", "12,000mAh Battery", "IP67 Protection", "Sensor Support"],
  },
  {
    id: "trackpro-link",
    name: "TrackPro Link",
    model: "Specialized GPS Tracker",
    category: "Personal",
    icon: "geo",
    price: 4899,
    subscription: 299,
    tagline: "Flexible GPS tracking solution designed for pet, kids, adult, asset and special vehicle monitoring applications.",
    description: "Flexible GPS tracking solution designed for pet, kids, adult, asset and special vehicle monitoring applications.",
    highlights: ["Configurable Sensor Support", "Specialized Monitoring", "Custom Installation Options", "Vehicle & Asset Monitoring"],
  },
] as const;

export const hardwareIntro = [
  "Choose from our range of 4G GPS tracking devices designed for different vehicle and fleet needs—from anti-theft and fleet trackers to AI dashcams, OBD trackers, and asset trackers.",
  "Every TrackPro hardware package includes the GPS device, IoT SIM, professional installation, and warranty, giving you a complete and reliable tracking solution from day one.",
] as const;

export type PlanKey = "basic" | "standard" | "premium" | "enterprise";

/**
 * Marketing detail for each hardware package, keyed by product slug. Shown on
 * the product card alongside the live price/stock from the API.
 */
export type ProductDetail = {
  inclusions: readonly string[];
  /** Recommended monthly plans — the card shows "+ ₱min–₱max/mo." */
  recommendedPlans: readonly PlanKey[];
  addOns: readonly string[];
  bestFor: readonly string[];
};

const INSTALLED = ["GPS Tracking Device", "IoT SIM Card", "Professional Installation", "Product Warranty"] as const;
const SELF_INSTALL = ["GPS Tracking Device", "IoT SIM Card", "Product Warranty"] as const;
const DASHCAM_KIT = ["GPS Tracking Device", "IoT SIM Card", "SD Card", "Professional Installation", "Product Warranty"] as const;

export const productDetails: Record<string, ProductDetail> = {
  "trackpro-core": {
    inclusions: INSTALLED,
    recommendedPlans: ["basic", "standard"],
    addOns: ["Engine Shut-off Relay"],
    bestFor: ["Private Vehicles", "Company Vehicles", "Car Rental", "Small Fleets"],
  },
  "trackpro-premium-anti-jammer": {
    inclusions: INSTALLED,
    recommendedPlans: ["standard", "premium"],
    addOns: ["Engine Shut-off Relay", "SOS Button"],
    bestFor: ["Private Vehicles", "Car Rental", "Financing Vehicles", "High-Value Vehicles"],
  },
  "trackpro-4g-multi-functional": {
    inclusions: INSTALLED,
    recommendedPlans: ["standard", "premium"],
    addOns: ["Engine Shut-off Relay", "Fuel Sensor", "Temperature Sensor", "RFID Punch-in"],
    bestFor: ["Trucks", "Delivery Vans", "Logistics Vehicles", "Company Fleets"],
  },
  "trackpro-fleet-fuel-rfid": {
    inclusions: INSTALLED,
    recommendedPlans: ["premium", "enterprise"],
    addOns: ["Engine Shut-off Relay", "Fuel Sensor", "Temperature Sensor", "RFID Punch-in", "Camera"],
    bestFor: ["Heavy Trucks", "Tractor Heads", "Trailers", "Logistics Fleets", "Refrigerated Trucks"],
  },
  "trackpro-magnet-10000": {
    inclusions: SELF_INSTALL,
    recommendedPlans: ["basic", "standard"],
    addOns: [],
    bestFor: ["Rental Vehicles", "Private Vehicles", "Motorcycles", "Trailers", "Temporary Assets"],
  },
  "trackpro-vision": {
    inclusions: DASHCAM_KIT,
    recommendedPlans: ["standard", "premium"],
    addOns: ["Video Data Package"],
    bestFor: ["Private Vehicles", "Taxi/TNVS", "Car Rental", "Delivery Vans", "Company Vehicles"],
  },
  "trackpro-dual-dashcam": {
    inclusions: DASHCAM_KIT,
    recommendedPlans: ["premium", "enterprise"],
    addOns: ["Video Data Package", "Additional Camera", "RFID Driver Punch-in", "Fuel Monitoring", "Temperature Monitoring", "Engine Shut-off Relay"],
    bestFor: ["Trucks", "Logistics Fleets", "Company Vehicles", "Buses", "Taxi/TNVS Fleets"],
  },
  "trackpro-4-channel-dashcam": {
    inclusions: DASHCAM_KIT,
    recommendedPlans: ["enterprise"],
    addOns: ["Additional Cameras", "Video Data Package", "RFID Driver Punch-in", "Fuel Monitoring", "Temperature Monitoring"],
    bestFor: ["Trucks", "Buses", "Logistics Fleets", "Delivery Fleets", "Commercial Vehicles"],
  },
  "trackpro-obd2": {
    inclusions: SELF_INSTALL,
    recommendedPlans: ["basic", "standard"],
    addOns: [],
    bestFor: ["Cars", "SUVs", "Vans", "Rental Vehicles", "Company Vehicles"],
  },
  "trackpro-obd2-system-diagnosis": {
    inclusions: SELF_INSTALL,
    recommendedPlans: ["basic", "standard"],
    addOns: [],
    bestFor: ["Private Vehicles", "Company Vehicles", "Car Rental", "Small Fleets"],
  },
  "trackpro-solar-powered": {
    inclusions: INSTALLED,
    recommendedPlans: ["premium", "enterprise"],
    addOns: ["Temperature Sensor", "Humidity Sensor", "Door Sensor", "Fuel Sensor", "Bluetooth Beacon", "Satellite Data Package"],
    bestFor: ["Trailers", "Shipping Containers", "Heavy Equipment", "Vessels", "Remote Assets"],
  },
  "trackpro-link": {
    inclusions: SELF_INSTALL,
    recommendedPlans: ["basic", "standard"],
    addOns: [],
    bestFor: ["Specialized Vehicles", "Utility Vehicles", "Equipment", "Commercial Vehicles", "Special-Purpose Fleets"],
  },
};

export const plansIntro =
  "Choose the plan that fits your tracking and fleet management needs. TrackPro Subscription Plans provide reliable platform access, connectivity, and fleet management features—from essential vehicle tracking to advanced tools for growing businesses and enterprise fleets.";

export const plans: readonly {
  key: PlanKey;
  name: string;
  price: number;
  fleetSize: string;
  description: string;
  includes: readonly string[];
  recommendedFor: readonly string[];
  highlighted?: boolean;
}[] = [
  {
    key: "basic",
    name: "Basic",
    price: 299,
    fleetSize: "1–2 Vehicles",
    description: "Essential GPS tracking for personal and everyday vehicle use.",
    includes: [
      "GPS Tracking Platform", "Web Dashboard", "Mobile App", "Real-Time Tracking", "Trip History", "Geo-Fencing",
      "Speed Monitoring", "Standard Reports", "Platform Updates", "Business-Hours Technical Support",
      "Business-Hours Customer Support", "Initial User Training",
    ],
    recommendedFor: ["Private Vehicles", "Motorcycles", "Family Vehicles", "Individual Users"],
  },
  {
    key: "standard",
    name: "Standard",
    price: 599,
    fleetSize: "3–10 Vehicles",
    description: "Enhanced vehicle monitoring for rental businesses and small fleets.",
    includes: [
      "Everything in Basic", "Video Surveillance", "Temperature Monitoring", "Fuel Monitoring", "RFID Driver Scan-in",
      "Multi-Device Management", "Data Plan Packages", "Refresher User Training",
    ],
    recommendedFor: ["Car Rental", "Small Fleets", "Delivery Vehicles", "Company Vehicles"],
  },
  {
    key: "premium",
    name: "Premium",
    price: 999,
    fleetSize: "11–30 Vehicles",
    description: "Advanced fleet management for growing businesses and professional operators.",
    includes: [
      "Everything in Standard", "Custom Reports", "Driver Management", "Regional Management", "Check-in Management",
      "Advanced Fleet Management", "Priority Technical Support", "Priority Customer Support", "Advanced User Training",
    ],
    recommendedFor: ["Trucking", "Logistics", "Delivery Fleets", "Corporate Fleets", "Growing Businesses"],
    highlighted: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 1299,
    fleetSize: "31+ Vehicles",
    description: "Complete fleet management for large organizations and multi-branch operations.",
    includes: [
      "Everything in Premium", "Task Management", "Dedicated Technical Support", "Dedicated Customer Support",
      "Custom User Training", "Dedicated Account Manager", "Multi-Branch Fleet Management", "Service Level Agreement",
      "API Integration Assistance",
    ],
    recommendedFor: ["Large Fleets", "Trucking Companies", "Logistics Companies", "Transport Companies", "Enterprises"],
  },
];

/** Plan comparison table. `true` = ✓, `false` = —, a string is shown as-is. Columns follow `plans`. */
export const planComparison: readonly { feature: string; values: readonly [boolean | string, boolean | string, boolean | string, boolean | string] }[] = [
  { feature: "GPS Tracking Platform", values: [true, true, true, true] },
  { feature: "Web Dashboard", values: [true, true, true, true] },
  { feature: "Mobile App", values: [true, true, true, true] },
  { feature: "Real-Time Tracking", values: [true, true, true, true] },
  { feature: "Trip History", values: [true, true, true, true] },
  { feature: "Geo-fencing", values: [true, true, true, true] },
  { feature: "Speed Monitoring", values: [true, true, true, true] },
  { feature: "Standard Reports", values: [true, true, true, true] },
  { feature: "Platform Updates", values: [true, true, true, true] },
  { feature: "Data Plan Packages", values: [false, true, true, true] },
  { feature: "Video Surveillance", values: [false, true, true, true] },
  { feature: "Temperature Monitoring", values: [false, true, true, true] },
  { feature: "Fuel Monitoring", values: [false, true, true, true] },
  { feature: "RFID Driver Scan-in", values: [false, true, true, true] },
  { feature: "Multi-Device Management", values: [false, true, true, true] },
  { feature: "Custom Report", values: [false, false, true, true] },
  { feature: "Driver Management", values: [false, false, true, true] },
  { feature: "Regional Management", values: [false, false, true, true] },
  { feature: "Check-in Management", values: [false, false, true, true] },
  { feature: "Task Management", values: [false, false, false, true] },
  { feature: "Technical Support", values: ["Business-Hours", "Business-Hours", "Priority", "Dedicated"] },
  { feature: "Customer Support", values: ["Business-Hours", "Business-Hours", "Priority", "Dedicated"] },
  { feature: "User Training", values: ["Initial Training", "Refresher", "Advanced", "Custom Training"] },
  { feature: "Account Manager", values: [false, false, false, true] },
  { feature: "Multi-Branch Fleet Management", values: [false, false, false, true] },
  { feature: "Service Level Agreement", values: [false, false, false, true] },
  { feature: "API Integration Assistance", values: [false, false, false, true] },
];

export const addOnsIntro = [
  "Enhance your GPS tracking system with optional accessories and add-ons designed for specific devices, unlocking additional features and capabilities based on your vehicle, fleet, and monitoring needs.",
  "From expanded monitoring to specialized vehicle and fleet functions, choose the add-ons you need to get more from your TrackPro system.",
] as const;

export const addOns = [
  {
    name: "Fuel Sensor",
    subtitle: "Capacitive Fuel Sensor",
    price: 5450,
    icon: "chart",
    description: "Monitor vehicle fuel levels to help detect unusual fuel consumption, refueling, and possible fuel theft.",
    features: ["Real-Time Fuel Level Monitoring", "Fuel Consumption Tracking", "Fuel Theft Detection", "Fuel Usage Reports"],
    devices: ["TrackPro Fleet", "TrackPro Fleet X", "TrackPro Vision Pro", "TrackPro Vision X", "TrackPro Solar"],
  },
  {
    name: "Temperature Sensor",
    subtitle: "Temperature & Humidity",
    price: 1650,
    icon: "chart",
    description: "Monitor vehicle or cargo temperature for temperature-sensitive goods and refrigerated transportation.",
    features: ["Real-Time Temperature Monitoring", "Temperature Alerts", "Temperature History", "Cold-Chain Monitoring"],
    devices: ["TrackPro Fleet", "TrackPro Fleet X", "TrackPro Vision Pro", "TrackPro Vision X", "TrackPro Solar"],
  },
  {
    name: "RFID Driver ID",
    subtitle: "Driver’s Attendance",
    price: 1750,
    icon: "check",
    description: "Identify drivers using RFID for easier driver assignment, vehicle access, and trip accountability.",
    features: ["RFID Driver Identification", "Driver-to-Vehicle Assignment", "Driver Activity Records", "Easy Driver Scan-In"],
    devices: ["TrackPro Fleet", "TrackPro Fleet X", "TrackPro Vision Pro", "TrackPro Vision X", "TrackPro Solar"],
  },
  {
    name: "SOS Button",
    subtitle: "Emergency Alert",
    price: 700,
    icon: "support",
    description: "Provides drivers with a dedicated emergency button to quickly send an SOS alert when assistance is needed.",
    features: ["One-Touch SOS Alert", "Emergency Notification", "Driver Safety Support", "Easy Access Emergency Button"],
    devices: ["TrackPro Core", "TrackPro Guard", "TrackPro Fleet", "TrackPro Fleet X", "TrackPro Solar"],
  },
  {
    name: "Engine Shut-off Relay",
    subtitle: "Emergency Shut-down",
    price: 1800,
    icon: "power",
    description: "Allows authorized users to remotely disable the vehicle engine through the TrackPro platform for enhanced security and recovery.",
    features: ["Remote Engine Shut-Off", "Anti-Theft Protection", "Authorized Remote Control", "Vehicle Recovery Support"],
    devices: ["TrackPro Core", "TrackPro Guard", "TrackPro Fleet", "TrackPro Fleet X", "TrackPro Solar", "TrackPro Vision Pro", "TrackPro Vision X"],
  },
  {
    name: "Voice Monitoring",
    subtitle: "Remote Microphone",
    price: 800,
    icon: "signal",
    description: "Adds remote voice monitoring capability for compatible TrackPro devices, providing an additional layer of security and monitoring.",
    features: ["Remote Voice Monitoring", "Audio Listening", "Remote Access"],
    devices: ["TrackPro Guard", "TrackPro Fleet", "TrackPro Fleet X", "TrackPro Solar"],
  },
  {
    name: "Satellite Module",
    subtitle: "Satellite Signal",
    price: 11680,
    icon: "geo",
    description: "Extends tracking capability to remote areas where cellular connectivity may be unavailable or unreliable.",
    features: ["Satellite Connectivity", "Remote-Area Tracking", "Cellular + Satellite Communication", "Extended Asset Coverage"],
    devices: ["TrackPro Solar"],
  },
  {
    name: "Camera Dome",
    subtitle: "Additional Camera",
    price: 2562,
    icon: "shield",
    description: "Adds an additional interior or auxiliary camera for expanded vehicle visibility and surveillance.",
    features: ["Additional Camera View", "Interior Monitoring", "Expanded Video Coverage", "Compatible with Multi-Camera Systems"],
    devices: ["TrackPro Fleet", "TrackPro Fleet X", "TrackPro Vision Pro", "TrackPro Vision X"],
  },
] as const;

export const footer = {
  company: [
    { label: "Home", href: "/#home" },
    { label: "Services", href: "/#services" },
    { label: "Products", href: "/products" },
    { label: "Plans", href: "/plans" },
    { label: "Solutions", href: "/solutions/fleet-management" },
    { label: "Review", href: "/#testimonials" },
    { label: "Contact Us", href: "/contact" },
  ],
  legal: [
    { label: "DTI Registration", href: null },
    { label: "BIR Registered", href: null },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Warranty Policy", href: "/warranty-policy" },
    { label: "Service Agreement", href: "/service-agreement" },
  ],
  support: [
    { label: "Sales Support", email: siteConfig.contact.salesEmail },
    { label: "Technical Support", email: siteConfig.contact.techEmail },
    { label: "Admin Support", email: siteConfig.contact.adminEmail },
  ],
  payment: ["E-Wallets", "QR PH", "Credit & Debit Card", "Online Banking"],
} as const;

export type SiteConfig = typeof siteConfig;
export type Service = (typeof services)[number];
export type Product = (typeof products)[number];
export type Testimonial = (typeof testimonials)[number];
export type AddOn = (typeof addOns)[number];

/** Format a number as PHP currency, e.g. 8999 → "₱8,999" */
export function formatPrice(amount: number): string {
  return `${siteConfig.currencySymbol}${amount.toLocaleString("en-PH")}`;
}
