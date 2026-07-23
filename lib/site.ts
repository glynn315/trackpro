export const siteConfig = {
  name: "TrackPro GPS",
  tagline: "Basta GPS Tracking, TrackPro!",
  shortDescription:
    "Anti-Jammer GPS Tracker with remote kill engine, door lock/unlock, and real-time tracking — protect your vehicle from theft, anywhere in the Philippines.",
  longDescription:
    "TrackPro GPS gives you full control of your vehicle from your phone. With anti-jammer protection, remote engine kill, door lock/unlock, and live tracking, you can secure your car, motorcycle, or fleet against modern theft — even from thieves using signal jammers.",
  url: "https://trackprogps.com",
  locale: "en_PH",
  currency: "PHP",
  currencySymbol: "₱",
  location: {
    address: "Brgy. New Ilo-Ilo",
    city: "Tantangan",
    region: "South Cotabato",
    country: "Philippines",
  },
  contact: {
    phonePrimary: "0935-695-8211",
    phoneSecondary: "0997-223-4814",
    email: "trackproph@gmail.com",
    facebook: "https://www.facebook.com/profile.php?id=61566098976013",
    messenger: "https://m.me/61566098976013",
    hours: "Mondays – Saturdays · 8:00 AM – 5:00 PM",
  },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61566098976013",
    messenger: "https://m.me/61566098976013",
  },
} as const;

export const navigation = [
  { label: "Home", href: "#home", icon: "map" },
  { label: "About", href: "#about", icon: "shield" },
  { label: "Services", href: "#services", icon: "support" },
  { label: "Products", href: "#products", icon: "truck" },
  { label: "Pricing", href: "#pricing", icon: "chart" },
  { label: "Reviews", href: "#testimonials", icon: "check" },
  { label: "Contact", href: "#contact", icon: "geo" },
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

export const heroStats = [
  { value: "Anti-Jammer", label: "Beats Signal Jammers" },
  { value: "Remote", label: "Kill Engine via App" },
  { value: "Real-Time", label: "Live GPS Tracking" },
  { value: "24/7", label: "Local PH Support" },
] as const;

export const services = [
  {
    title: "Anti-Jammer Protection",
    description:
      "Defeats signal jammers used by modern car thieves. TrackPro stays connected when ordinary trackers go dark.",
    icon: "signal",
  },
  {
    title: "Remote Engine Kill",
    description:
      "Stop your vehicle anytime, anywhere, straight from your phone. Total control even if someone else is behind the wheel.",
    icon: "power",
  },
  {
    title: "Door Lock & Unlock",
    description:
      "Lock or unlock your vehicle remotely with a tap. Forgot your keys? Loaning the car? Handled from the app.",
    icon: "lock",
  },
  {
    title: "Real-Time GPS Tracking",
    description:
      "Pinpoint location, speed, and route history with live updates and a clean mobile and web dashboard.",
    icon: "map",
  },
  {
    title: "Fleet Monitoring",
    description:
      "Track multiple vehicles, monitor driver behavior, and review trip history — perfect for trucking and logistics.",
    icon: "truck",
  },
  {
    title: "Local Support",
    description:
      "Filipino-based team for installation, troubleshooting, and after-sales care across Mindanao, Visayas, and Luzon.",
    icon: "support",
  },
] as const;

/**
 * Product catalog — edit prices/features/descriptions here, the site updates automatically.
 * `price` and `subscription` are in PHP (₱). `subscription` is monthly.
 */
export const products = [
  {
    id: "trackpro-4g-multi-functional",
    name: "TrackPro 4G Multi-functional GPS",
    model: "S5L",
    category: "Vehicle",
    icon: "map",
    price: 8999,
    subscription: 299,
    tagline: "Powerful 4G real-time vehicle tracker with fuel monitoring and remote engine cut-off.",
    description:
      "Designed for both commercial and personal use, TrackPro delivers real-time vehicle monitoring, route playback, speed alerts, geofencing, ACC ignition detection, and anti-theft protection. Integrated fuel sensor support helps reduce fuel theft and optimize fleet operations.",
    highlights: [
      "Real-Time GPS Tracking",
      "2G & 4G Connectivity",
      "Fuel Sensor Monitoring",
      "Remote Engine Cut-Off",
      "Anti-Theft Alarm System",
      "Multi-Vehicle Fleet Management",
    ],
  },
  {
    id: "trackpro-magnet-10000",
    name: "TrackPro Magnet 10,000 mAh GPS",
    model: "W18L",
    category: "Asset",
    icon: "shield",
    price: 5999,
    subscription: 299,
    tagline: "4G LTE tracker with 10,000mAh battery and powerful magnetic mount — for vehicles, cargo, and outdoor use.",
    description:
      "High-capacity 10,000mAh rechargeable battery for extended standby. IP67 waterproof with temperature, humidity, light, and tamper sensors. Magnetic mount for flexible deployment.",
    highlights: [
      "10,000mAh Long-Life Battery",
      "Powerful Magnetic Mount",
      "Temperature & Humidity Sensors",
      "IP67 Waterproof Protection",
      "Tamper Alert",
      "Compact & Portable Design",
    ],
  },
  {
    id: "trackpro-solar-powered",
    name: "TrackPro Solar Powered Asset GPS",
    model: "W20L",
    category: "Asset",
    icon: "geo",
    price: 9999,
    subscription: 299,
    tagline: "Solar-powered 4G GPS with 12,000mAh battery — built for fishing vessels, containers, and remote assets.",
    description:
      "Heavy-duty 4G GPS tracker with integrated solar charging. 12,000mAh battery and IP67 protection make it ideal for marine, construction, logistics, and long-term asset tracking.",
    highlights: [
      "Solar-Powered Charging",
      "12,000mAh Long-Life Battery",
      "IP67 Waterproof & Dustproof",
      "Marine & Fishing Vessel Ready",
      "Strong Magnetic Mount",
      "Wireless & Easy Installation",
    ],
  },
  {
    id: "trackpro-dual-dashcam",
    name: "TrackPro Dual Dashcam GPS",
    model: "V7pro",
    category: "Dashcam",
    icon: "chart",
    price: 13999,
    subscription: 799,
    tagline: "AI-powered front + rear 2K dashcam with live GPS tracking and SOS button.",
    description:
      "Front and rear 2K HD cameras with live video access, AI driving monitoring, route playback, and instant alerts. Includes SOS emergency button for driver safety.",
    highlights: [
      "Front & Rear 2K HD Recording",
      "AI Driving Monitoring",
      "Live Video Streaming",
      "SOS Emergency Button",
      "Night Vision Recording",
      "Parking Surveillance Mode",
    ],
  },
  {
    id: "trackpro-4-channel-dashcam",
    name: "TrackPro 4 Channel Dashcam GPS",
    model: "V6",
    category: "Dashcam",
    icon: "chart",
    price: 27999,
    subscription: 999,
    tagline: "Professional 4-camera fleet surveillance with full vehicle coverage and remote video.",
    description:
      "Four HD camera channels for complete vehicle coverage. 4G connectivity, remote video access, and secure storage make it ideal for trucking fleets, buses, taxis, and commercial vehicles.",
    highlights: [
      "4-Channel HD Camera Recording",
      "Full Vehicle Coverage",
      "Remote Video Playback",
      "Secure Video Storage",
      "Night Vision Recording",
      "Driver Behavior Monitoring",
    ],
  },
  {
    id: "trackpro-obd2",
    name: "TrackPro OBD II GPS",
    model: "R56L",
    category: "OBD",
    icon: "power",
    price: 4999,
    subscription: 299,
    tagline: "Plug-and-play 4G OBD II tracker — installs in seconds, no wiring needed.",
    description:
      "Compact OBD II tracker for fast installation. Built-in vibration detection for anti-theft, driving behavior monitoring, and route playback. Discreet OEM-style design.",
    highlights: [
      "Plug-and-Play OBD II Install",
      "Vibration & Movement Alarm",
      "Anti-Theft Protection",
      "High-Accuracy GPS",
      "Compact OEM-Style Design",
      "Low Power Consumption",
    ],
  },
  {
    id: "trackpro-obd2-system-diagnosis",
    name: "TrackPro OBD II System Diagnosis GPS",
    model: "R58L",
    category: "OBD",
    icon: "chart",
    price: 6999,
    subscription: 299,
    tagline: "OBD II tracker with vehicle health diagnostics and engine monitoring.",
    description:
      "Combines real-time GPS tracking with OBD II vehicle diagnostics — monitor engine performance, driving behavior, and vehicle status for better maintenance and operations.",
    highlights: [
      "Vehicle System Diagnosis",
      "Engine Health Monitoring",
      "OBD II Plug-and-Play",
      "Anti-Theft Protection",
      "Compact Smart Card Design",
      "Driving Behavior Monitoring",
    ],
  },
  {
    id: "trackpro-fleet-fuel-rfid",
    name: "TrackPro Fleet Fuel RFID Temperature GPS",
    model: "S208L",
    category: "Fleet",
    icon: "truck",
    price: 17999,
    subscription: 499,
    tagline: "Pro fleet tracker with remote fuel cut-off, RFID, and temperature monitoring.",
    description:
      "Professional-grade fleet management system with remote engine and fuel cut-off, fuel monitoring, temperature sensing, and hidden installation design for trucks, logistics fleets, and refrigerated transport.",
    highlights: [
      "Remote Engine & Fuel Cut-Off",
      "Fuel Level Monitoring",
      "Temperature Monitoring",
      "Hidden Anti-Theft Install",
      "Fleet Management Support",
      "Stable GSM/GPS Connectivity",
    ],
  },
  {
    id: "trackpro-premium-anti-jammer",
    name: "TrackPro Premium Anti-Jammer GPS",
    model: "G21L",
    category: "Vehicle",
    icon: "signal",
    price: 6999,
    subscription: 299,
    tagline: "Flagship anti-jammer tracker with remote door lock/unlock and dual 4G/2G connectivity.",
    featured: true,
    description:
      "Premium 4G/2G GPS with anti-jamming signal protection — stays connected even against signal jammers used by thieves. Remote door lock/unlock, door sensor detection, and vibration alerts for maximum security.",
    highlights: [
      "Anti-Jamming Signal Protection",
      "Remote Door Lock & Unlock",
      "Dual 4G/2G Connectivity",
      "Door Sensor Detection",
      "Vibration & Movement Alerts",
      "Compact Hidden Install",
    ],
  },
] as const;

/**
 * Pricing bundles — packages combining hardware + service.
 * Edit `price` (string like "3,500") or set null to show "Inquire for Pricing".
 */
export const bundles = [
  {
    name: "Solo",
    description: "Perfect for 1 car or motorcycle.",
    price: "3,500" as string | null,
    priceSuffix: "one-time",
    badge: null as string | null,
    features: [
      "1 × TrackPro 4G GPS Tracker",
      "Free installation",
      "Anti-Jammer protection",
      "Real-time tracking via mobile app",
      "Remote engine kill & door lock",
      "1-year hardware warranty",
      "Local Filipino support",
    ],
    ctaLabel: "Get Started",
    highlighted: false,
  },
  {
    name: "Family",
    description: "Best for 2 – 3 vehicles in one household.",
    price: "9,500" as string | null,
    priceSuffix: "one-time",
    badge: "Most Popular",
    features: [
      "2 – 3 × TrackPro 4G GPS Trackers",
      "Free installation for all units",
      "Everything in Solo",
      "Unified family dashboard",
      "Group geofencing & alerts",
      "Priority support",
      "Volume discount applied",
    ],
    ctaLabel: "Get Started",
    highlighted: true,
  },
  {
    name: "Fleet",
    description: "For trucking, logistics, and rental businesses.",
    price: null as string | null,
    priceSuffix: "custom",
    badge: null as string | null,
    features: [
      "4+ TrackPro 4G GPS Trackers",
      "Bulk installation on-site",
      "Everything in Family",
      "Driver behavior analytics",
      "Custom reporting (daily / weekly)",
      "Dedicated account manager",
      "Volume pricing",
    ],
    ctaLabel: "Talk to Sales",
    highlighted: false,
  },
] as const;

export const aboutHighlights = [
  {
    title: "Built to beat modern theft",
    body: "Today's thieves use signal jammers to disable cheap GPS trackers. TrackPro's anti-jammer technology keeps your vehicle visible and controllable.",
  },
  {
    title: "You're the one in control",
    body: "Kill the engine, lock the doors, or check the location — all from your phone. Peace of mind goes wherever you go.",
  },
  {
    title: "Local team, nationwide reach",
    body: "Based in South Cotabato with installation and support across the Philippines. Devices validated for local network coverage and conditions.",
  },
] as const;

export type SiteConfig = typeof siteConfig;
export type NavItem = (typeof navigation)[number];
export type Service = (typeof services)[number];
export type Product = (typeof products)[number];
export type Testimonial = (typeof testimonials)[number];
export type Bundle = (typeof bundles)[number];

/** Format a number as PHP currency, e.g. 8999 → "₱8,999" */
export function formatPrice(amount: number): string {
  return `${siteConfig.currencySymbol}${amount.toLocaleString("en-PH")}`;
}
