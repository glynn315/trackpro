/**
 * Legal & compliance copy rendered by components/legal/LegalPage.tsx.
 * A block is a paragraph, a bulleted list, or a sub-heading.
 */

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: readonly string[] }
  | { type: "h3"; text: string };

export type LegalSection = { heading?: string; blocks: readonly LegalBlock[] };

export type LegalDoc = {
  slug: string;
  title: string;
  description: string;
  lastUpdated?: string;
  sections: readonly LegalSection[];
};

const p = (text: string): LegalBlock => ({ type: "p", text });
const list = (...items: string[]): LegalBlock => ({ type: "list", items });
const h3 = (text: string): LegalBlock => ({ type: "h3", text });

export const privacyPolicy: LegalDoc = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  description: "How TrackPro collects, uses, stores, and protects your personal information.",
  lastUpdated: "August 2026",
  sections: [
    {
      blocks: [
        p("At TrackPro, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our products and services."),
        p("We may collect the following information:"),
        list("Customer name", "Company name", "Contact number", "Email address", "Vehicle information", "GPS device information", "Vehicle location data", "Billing information"),
        p("Your information is used to:"),
        list("Activate your GPS device", "Provide GPS tracking services", "Monitor fleet performance", "Provide customer support", "Process payments", "Improve our services", "Send important service notifications"),
      ],
    },
    {
      heading: "Data Security",
      blocks: [p("We implement reasonable administrative, technical, and physical safeguards to protect your information from unauthorized access, alteration, or disclosure.")],
    },
    {
      heading: "Sharing of Information",
      blocks: [
        p("TrackPro does not sell or rent customer information. We may disclose information only:"),
        list("When required by law", "With your written authorization", "To authorized service providers necessary to operate our services"),
      ],
    },
    {
      heading: "Customer Responsibility",
      blocks: [p("Customers are responsible for protecting their account credentials and notifying TrackPro immediately of any unauthorized access.")],
    },
  ],
};

export const termsOfService: LegalDoc = {
  slug: "terms-of-service",
  title: "Terms of Service",
  description: "The terms that apply when you purchase or use any TrackPro product or subscription.",
  sections: [
    { blocks: [p("By purchasing or using any TrackPro product or subscription, you agree to the following terms.")] },
    {
      heading: "Services",
      blocks: [
        p("TrackPro provides:"),
        list("GPS Tracking", "Fleet Monitoring", "Mobile and Web Platform Access", "Installation Services", "Technical Support", "Optional Value-Added Services"),
      ],
    },
    {
      heading: "Customer Responsibilities",
      blocks: [
        p("Customers agree to:"),
        list("Provide accurate information.", "Use the service only for lawful purposes.", "Maintain active subscription payments.", "Protect account credentials."),
      ],
    },
    {
      heading: "Subscription",
      blocks: [
        p("Monthly subscriptions cover:"),
        list("GPS platform access", "Cloud server", "IoT connectivity (as applicable)", "Software updates", "Technical support based on the selected plan"),
        p("Failure to pay may result in temporary suspension of platform access until the account is brought current."),
      ],
    },
    {
      heading: "Prohibited Use",
      blocks: [
        p("Customers may not:"),
        list("Modify or tamper with the GPS device.", "Attempt unauthorized access to the platform.", "Use the system for illegal activities.", "Remove or alter device identification labels."),
      ],
    },
    {
      heading: "Limitation of Liability",
      blocks: [
        p("TrackPro provides monitoring tools to assist customers in vehicle management. While we strive for reliable operation, GPS accuracy and communications may be affected by factors beyond our control, including satellite availability, cellular network coverage, environmental conditions, or intentional interference. TrackPro is not liable for indirect, incidental, or consequential damages resulting from service interruptions or misuse."),
      ],
    },
  ],
};

export const warrantyPolicy: LegalDoc = {
  slug: "warranty-policy",
  title: "Warranty Policy",
  description: "What TrackPro's limited hardware and installation warranty covers, and how to make a claim.",
  sections: [
    { blocks: [p("TrackPro provides a limited warranty covering manufacturing defects under normal use.")] },
    {
      heading: "Hardware Warranty",
      blocks: [list("GPS Devices: 1 Year", "Add-ons: 1 Year (unless otherwise specified)")],
    },
    {
      heading: "Warranty Covers",
      blocks: [list("Manufacturing defects", "Internal hardware failure", "Factory component malfunction")],
    },
    {
      heading: "Warranty Does Not Cover",
      blocks: [
        list(
          "Physical damage",
          "Water damage (unless the product is rated waterproof and used within its specifications)",
          "Fire or flood damage",
          "Electrical surges or improper wiring",
          "Unauthorized repairs or modifications",
          "Accidental damage",
          "Theft or loss of the device"
        ),
      ],
    },
    {
      heading: "Installation Warranty",
      blocks: [p("Professional installation workmanship is covered for 90 days from the installation date, provided the wiring has not been altered by unauthorized persons.")],
    },
    {
      heading: "Warranty Procedure",
      blocks: [p("Customers should contact TrackPro before removing or returning any equipment. Products may be inspected to determine warranty eligibility. Repair or replacement will be provided at TrackPro's discretion for covered defects.")],
    },
  ],
};

export const serviceAgreement: LegalDoc = {
  slug: "service-agreement",
  title: "Service Agreement",
  description: "The agreement governing the use of TrackPro GPS Tracking Services.",
  sections: [
    { blocks: [p("This Service Agreement governs the use of TrackPro GPS Tracking Services.")] },
    {
      heading: "Included Services",
      blocks: [
        p("Depending on your subscription plan, services may include:"),
        list("GPS Tracking Platform", "Mobile Application", "Web Dashboard", "Real-Time Tracking", "Route History", "Geofencing", "Reports", "Software Updates"),
      ],
    },
    {
      heading: "Subscription Plans",
      blocks: [
        h3("Basic Plan"),
        list("Platform Access", "Standard Reports", "Business-Hours Technical Support"),
        h3("Premium Plan"),
        p("Includes Basic features plus:"),
        list("Priority Support", "Advanced Reports", "Multi-Branch Management", "Quarterly Fleet Reviews", "Additional Administrator Accounts"),
        h3("Enterprise Plan"),
        p("Includes Premium features plus:"),
        list("Dedicated Account Manager", "SLA Support", "API Integration", "Custom Reports", "Monthly Fleet Reviews", "On-Site Assistance"),
      ],
    },
    {
      heading: "Customer Responsibilities",
      blocks: [
        p("Customers agree to:"),
        list(
          "Keep subscription payments current.",
          "Use the equipment according to the installation guidelines.",
          "Report issues promptly.",
          "Allow TrackPro reasonable access for troubleshooting when required."
        ),
      ],
    },
    {
      heading: "Service Availability",
      blocks: [
        p("TrackPro aims to provide reliable platform access and technical support. However, service availability may be affected by internet connectivity, cellular network coverage, power interruptions, satellite conditions, scheduled maintenance, or other factors beyond our reasonable control."),
      ],
    },
    {
      heading: "Termination",
      blocks: [
        p("TrackPro may suspend or terminate services for:"),
        list("Non-payment", "Fraudulent activity", "Violation of these terms", "Misuse of the platform"),
        p("Service may be restored after outstanding issues have been resolved."),
      ],
    },
  ],
};

export const legalDocs = [privacyPolicy, termsOfService, warrantyPolicy, serviceAgreement] as const;

export const faqs: readonly { q: string; a: readonly LegalBlock[] }[] = [
  {
    q: "How much is GPS installation?",
    a: [
      p("Our GPS hardware packages start at ₱3,899, depending on the GPS model, vehicle type, and installation requirements. Every package includes the GPS device, IoT SIM card, professional installation, installation materials, device activation, system configuration, testing, and user orientation."),
      p("Note: A monthly subscription is required to access the GPS tracking platform and cloud services."),
    ],
  },
  {
    q: "Is there a monthly subscription?",
    a: [
      p("Yes. All TrackPro GPS devices require an active monthly subscription to access our cloud-based GPS tracking platform, mobile app, web dashboard, technical support, and software updates."),
      p("Our subscription plans include:"),
      list("Basic – ₱299/month", "Standard – ₱599/month", "Premium – ₱999/month", "Enterprise – ₱1,299/month"),
    ],
  },
  {
    q: "What's included in the Basic Plan?",
    a: [
      p("The Basic Plan includes everything you need for everyday vehicle tracking and monitoring."),
      list("GPS Platform Access", "Mobile App", "Speed Monitoring", "Annual Platform Updates", "Initial User Training"),
    ],
  },
  {
    q: "Can I upgrade from Basic to Premium?",
    a: [p("Yes. You can upgrade your subscription at any time as your business grows. Upgrading provides access to additional features such as advanced reports, priority technical support, multi-branch fleet management, and more.")],
  },
  {
    q: "What happens if I miss a payment?",
    a: [p("If your subscription payment becomes overdue, your platform access may be temporarily suspended until your account is settled. Once payment is received, your service will be restored. If you anticipate a payment issue, please contact our support team so we can discuss available options.")],
  },
  {
    q: "Can you install nationwide?",
    a: [p("Yes. TrackPro provides installation services and technical support across the Philippines through our installation team and service partners. Contact us to confirm service availability in your area.")],
  },
  {
    q: "Is the device waterproof?",
    a: [p("It depends on the GPS model. Some TrackPro devices, such as our magnetic and asset trackers, are designed with IP67-rated waterproof protection, while hard-wired vehicle trackers are intended for installation inside the vehicle where they are protected from direct exposure. Our team will recommend the most suitable model based on your application.")],
  },
  {
    q: "Can the engine be turned off remotely?",
    a: [p("Yes, selected GPS models support remote engine immobilization when a compatible relay is installed. This feature is intended to help prevent unauthorized vehicle use and assist with vehicle recovery. It should always be used responsibly and only when it is safe to do so.")],
  },
  {
    q: "Does it work with Globe, Smart, and DITO?",
    a: [p("Yes. Our GPS solutions are compatible with major Philippine mobile networks, including Globe, Smart, and DITO, depending on the GPS model and SIM configuration. We also offer IoT SIM solutions designed for reliable GPS connectivity.")],
  },
  {
    q: "Do you support fleet vehicles?",
    a: [p("Absolutely. Our GPS platform is designed to support businesses managing multiple vehicles, from small fleets to large enterprise operations. Features include fleet monitoring, route history, driver management, reports, geofencing, alerts, and fleet performance analytics.")],
  },
  {
    q: "Can you provide solutions for government agencies?",
    a: [p("Yes. TrackPro offers GPS tracking and fleet management solutions for government offices, local government units (LGUs), and public-sector fleets. Our platform supports centralized vehicle monitoring, reporting, asset management, and scalable deployment for multiple vehicles. We can also provide technical proposals and customized quotations based on your operational requirements.")],
  },
];
