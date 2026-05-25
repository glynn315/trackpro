export const siteConfig = {
  name: "TrackPro GPS",
  tagline: "Basta GPS Tracking, TrackPro!",
  shortDescription:
    "Anti-Jammer GPS Tracker with remote kill engine, door lock/unlock, and real-time tracking — protect your vehicle from theft, anywhere in the Philippines.",
  longDescription:
    "TrackPro GPS gives you full control of your vehicle from your phone. With anti-jammer protection, remote engine kill, door lock/unlock, and live tracking, you can secure your car, motorcycle, or fleet against modern theft — even from thieves using signal jammers.",
  url: "https://trackprogps.com",
  locale: "en_PH",
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

export const products = [
  {
    name: "TrackPro 4G GPS Tracker",
    tagline: "Anti-Jammer GPS with remote engine kill, door lock, and real-time tracking",
    imageAlt: "TrackPro 4G GPS Tracker",
    network: "4G LTE",
    bestFor: "Cars · Motorcycles · Trucks · Fleets",
    features: [
      {
        title: "Anti-Jammer Protection",
        body: "Stays connected even against signal jammers used by modern thieves.",
      },
      {
        title: "Remote Engine Kill",
        body: "Stop the vehicle anytime, straight from your phone.",
      },
      {
        title: "Door Lock & Unlock",
        body: "Lock or unlock your vehicle remotely with one tap.",
      },
      {
        title: "Real-Time GPS Tracking",
        body: "Live location, speed, and route history on mobile and web.",
      },
      {
        title: "Tamper & Ignition Alerts",
        body: "Instant notifications when the device or ignition is touched.",
      },
      {
        title: "4G LTE Connectivity",
        body: "Faster, more reliable data than older 2G/3G trackers.",
      },
    ],
  },
] as const;

/**
 * Pricing bundles. Set `price` to a string like "3,500" to display it,
 * or leave it as null to show "Inquire for Pricing" instead.
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
