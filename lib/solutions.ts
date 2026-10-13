/**
 * Content for the /solutions/[slug] pages. Each solution has an "About"
 * section, two benefit columns, "How it works" steps, and feature groups.
 * TMS API Integration carries a few extra sections (`extras`).
 */

export type Step = { title: string; body: string };
export type FeatureGroup = { title: string; intro?: string; items: readonly string[]; outro?: string };

export type Solution = {
  slug: string;
  name: string;
  icon: string;
  /** One-paragraph summary used on cards and the About section. */
  summary: string;
  about: readonly string[];
  benefits: readonly [readonly string[], readonly string[]];
  steps: readonly Step[];
  featuresTitle: string;
  features: readonly FeatureGroup[];
  extras?: {
    capabilities: readonly Step[];
    workflowIntro: string;
    workflow: readonly Step[];
    workflowOutro: string;
    whyTitle: string;
    why: readonly string[];
  };
};

export const solutions: readonly Solution[] = [
  {
    slug: "fleet-management",
    name: "Fleet Management",
    icon: "truck",
    summary:
      "Fleet Management provides businesses with a centralized platform where they can monitor vehicles, drivers, trips, and fleet activities in real time. By combining GPS tracking, fleet monitoring, reporting, security, and advanced monitoring solutions, TrackPro helps businesses gain better visibility and control over their entire fleet.",
    about: [
      "Fleet Management provides businesses with a centralized platform where they can monitor vehicles, drivers, trips, and fleet activities in real time. By combining GPS tracking, fleet monitoring, reporting, security, and advanced monitoring solutions, TrackPro helps businesses gain better visibility and control over their entire fleet.",
    ],
    benefits: [
      ["Real-Time Fleet Visibility", "Improved Fleet Efficiency", "Reduced Operating Costs", "Enhanced Vehicle Security", "Better Driver Accountability"],
      ["Improved Customer Service", "Data-Driven Decision Making", "Centralized Fleet Management", "Improved Safety and Compliance", "Scalable Fleet Solutions"],
    ],
    steps: [
      { title: "GPS Device Installation", body: "A GPS tracking device is installed in the vehicle. Depending on the customer's requirements, additional devices or sensors may also be installed for fuel, temperature, video surveillance, RFID driver identification, and other monitoring applications." },
      { title: "GPS Data Collection", body: "The GPS device collects information such as the vehicle's realtime location, movement, speed, trip activity, and other available vehicle data." },
      { title: "Data Transmission", body: "The GPS device transmits the collected information through a mobile data connection to the Tracking Platform System." },
      { title: "Fleet Management Platform", body: "The information is processed and presented through the Fleet Management System, allowing authorized users to access their fleet information through the platform." },
      { title: "Monitor and Manage", body: "Fleet managers can monitor vehicle locations, review trips, check vehicle activities, identify unusual events, and access other available fleet information." },
      { title: "Report and Insights", body: "TrackPro converts fleet data into reports and useful information that can help management evaluate fleet performance, identify inefficiencies, control operating costs, and make informed decisions." },
    ],
    featuresTitle: "Features",
    features: [
      { title: "Core Fleet Management", items: ["Real-Time GPS Tracking", "Trip Playback", "Fleet Monitoring", "Geo-fencing", "Vehicle Activity Monitoring"] },
      { title: "Driver Management", items: ["Driver Monitoring", "RFID Driver Identification", "Driver Accountability"] },
      { title: "Fleet Performance & Reporting", items: ["Fleet Reports and Analytics", "Trip History", "Operational Insights"] },
      { title: "Advance Monitoring Solutions", items: ["Fuel Monitoring", "Temperature Monitoring", "Video Surveillance", "Optional API Integration"] },
    ],
  },
  {
    slug: "anti-theft-protection",
    name: "Anti-theft Protection",
    icon: "shield",
    summary:
      "Vehicle theft can happen when you least expect it. Anti-Theft Protection is designed to provide an additional layer of security by combining GPS tracking, Anti-Jamming Technology, and Remote Engine Shut-Down capability.",
    about: [
      "Vehicle theft can happen when you least expect it. Anti-Theft Protection is designed to provide an additional layer of security by combining GPS tracking, Anti-Jamming Technology, and Remote Engine Shut-Down capability.",
      "Unlike conventional GPS tracking that primarily shows the location of a vehicle, Anti-Theft Protection is designed to help businesses and vehicle owners detect suspicious activity, maintain visibility, and respond quickly to potential theft situations.",
      "With TrackPro, vehicle owners can take action when a vehicle's activity becomes suspicious—helping protect valuable vehicles, equipment, and assets.",
    ],
    benefits: [
      ["Enhanced Vehicle Security", "Anti-Jamming Protection", "Rapid Response", "Remote Engine Control", "Real-Time Vehicle Visibility"],
      ["Reduced Risk of Unauthorized Use", "Protect Valuable Assets", "Centralized Security Management"],
    ],
    steps: [
      { title: "Security System Installation", body: "A GPS device with the required anti-theft and engine-control components is professionally installed in the vehicle." },
      { title: "Continuous Monitoring", body: "The device monitors GPS location, vehicle activity, and communication conditions according to the features installed on the vehicle." },
      { title: "Suspicious Activity Detection", body: "If the system detects an unusual event such as unexpected vehicle movement, unauthorized use, or potential signal interference it can generate an alert for the authorized user." },
      { title: "Verify the Situation", body: "The fleet manager or vehicle owner can review the available vehicle information through the tracking platform to determine whether the activity is legitimate or potentially unauthorized." },
      { title: "Remote Response", body: "If the situation is confirmed as suspicious and the vehicle is in a suitable condition for the feature to be used, an authorized user may initiate the Remote Engine Shut-Down command." },
      { title: "Vehicle Security & Recovery", body: "The vehicle's status and available location information can continue to support the owner's security response and coordination with appropriate personnel or authorities." },
    ],
    featuresTitle: "Anti-Theft Protection Features",
    features: [
      {
        title: "Protection & Tracking",
        items: ["Anti-Jamming Technology", "Remote Engine Shut-Down", "Real-Time GPS Tracking", "Suspicious Movement Alerts", "Unauthorized Vehicle Use Monitoring", "Geo-fence Security", "Vehicle Activity History"],
      },
      { title: "Security Management", items: ["Centralized Security Dashboard", "Authorized Remote Control", "Security Alert Notifications"] },
    ],
  },
  {
    slug: "asset-tracking",
    name: "Asset Tracking",
    icon: "geo",
    summary:
      "Not every valuable asset has a built-in power source or can be connected to a vehicle's electrical system. TrackPro Asset Tracking Solutions provides a wireless GPS tracking solution designed for assets that require flexible, discreet, and easy-to-deploy monitoring.",
    about: [
      "Not every valuable asset has a built-in power source or can be connected to a vehicle's electrical system. TrackPro Asset Tracking Solutions provides a wireless GPS tracking solution designed for assets that require flexible, discreet, and easy-to-deploy monitoring.",
      "Our wireless tracking device does not require connection to the vehicle's wiring and does not need an external power supply. It operates using its built-in rechargeable battery, making it suitable for movable assets, equipment, trailers, containers, and other valuable items where conventional wired GPS installation may not be practical.",
      "With TrackPro, businesses can monitor the location and movement of valuable assets through a centralized GPS tracking platform—helping improve asset visibility, security, and management.",
    ],
    benefits: [
      ["No Wiring Required", "No External Power Supply", "Easy Deployment", "Flexible Asset Monitoring", "Improved Asset Security", "Reduced Installation Costs"],
      ["Portable and Reusable", "Better Asset Visibility", "Support for Fleet & Logistics Operations", "Scalable Asset Management"],
    ],
    steps: [
      { title: "Device Deployment", body: "The wireless asset tracker is securely placed or mounted on the asset being monitored." },
      { title: "Battery-Powered Operation", body: "The device operates using its built-in battery, without requiring connection to the asset's wiring or an external power supply." },
      { title: "Location Detection", body: "The device determines its location using GPS/GNSS technology and collects available tracking information." },
      { title: "Data Transmission", body: "The tracker communicates the collected information through its supported cellular communication network and sends the data to the GPS tracking platform." },
      { title: "Centralized Monitoring", body: "Authorized users can access the GPS tracking platform to view the asset's available location information and tracking activity." },
      { title: "Alerts & Reports", body: "Depending on the configured features, users can receive notifications and review historical tracking information to monitor asset movement and identify unusual activity." },
    ],
    featuresTitle: "Asset Tracking Features",
    features: [
      { title: "Wireless Tracking", items: ["Wireless Design", "Built-In Battery", "GPS/GNSS Location Tracking", "Real-Time & Periodic Tracking", "Movement Detection", "Geo-fencing", "Unauthorized Movement Alerts"] },
      { title: "Monitoring & Management", items: ["Historical Trip & Location Data", "Battery Status Monitoring", "Centralized Asset Dashboard", "Portable Deployment", "Scalable Tracking"] },
    ],
  },
  {
    slug: "satellite-tracking",
    name: "Satellite Tracking",
    icon: "signal",
    summary:
      "There are environments where conventional GPS tracking cannot reliably transmit information because cellular network coverage is limited or unavailable. TrackPro Satellite Tracking Solutions is designed for these situations by using direct satellite connectivity to transmit tracking information to the TrackPro platform.",
    about: [
      "There are environments where conventional GPS tracking cannot reliably transmit information because cellular network coverage is limited or unavailable. TrackPro Satellite Tracking Solutions is designed for these situations by using direct satellite connectivity to transmit tracking information to the TrackPro platform.",
      "Unlike conventional cellular-based trackers, the satellite tracking device does not depend on a mobile cellular network to transmit its information. The device communicates directly through a satellite network, making it suitable for remote, isolated, offshore, rural, and other areas where cellular coverage may be unavailable.",
      "The device is also self-powered, operating using its own built-in battery without requiring connection to the vehicle's electrical wiring or an external power supply.",
      "TrackPro Satellite Tracking provides businesses with greater visibility over vehicles, equipment, vessels, containers, and other valuable assets—even when operating beyond the reach of conventional cellular networks.",
    ],
    benefits: [
      ["No Dependence on Cellular Networks", "Remote Area Coverage", "Self-Powered Operation", "Flexible Deployment", "Improved Asset Visibility"],
      ["Enhanced Security", "Reliable Remote Monitoring", "Reduced Installation Requirements", "Support for Remote Operations", "Expanded Tracking Coverage"],
    ],
    steps: [
      { title: "Device Deployment", body: "The Satellite Tracker is securely installed or mounted on the vehicle, equipment, vessel, container, or other asset being monitored." },
      { title: "Battery-Powered Operation", body: "The device operates using its built-in battery, without requiring connection to the asset's wiring or an external power supply." },
      { title: "Location Detection", body: "The tracker determines its location using GPS/GNSS technology and collects available tracking information such as position, movement, and other configured data." },
      { title: "Direct Satellite Communication", body: "Instead of relying on a cellular tower, the device transmits the collected tracking information directly through a satellite communication network." },
      { title: "TrackPro Platform", body: "The information is delivered to the GPS tracking platform, where authorized users can access the available tracking information." },
      { title: "Monitor, Analyze & Respond", body: "Users can monitor the asset's location, review historical information, receive configured alerts, and use the data to support operational and security decisions." },
    ],
    featuresTitle: "Satellite Tracking Features",
    features: [
      { title: "Satellite Connectivity", items: ["Direct Satellite Connectivity", "GPS/GNSS Location Tracking", "Cellular-Independent Tracking", "Built-In Battery", "Solar Battery Charging", "Wireless Installation", "Remote Area Tracking"] },
      { title: "Monitoring", items: ["Movement Detection", "Geofencing", "Location History", "Battery Monitoring", "Configurable Tracking Intervals", "Centralized Monitoring", "Scalable Solution"] },
    ],
  },
  {
    slug: "ai-remote-video-telematics",
    name: "AI Remote Video Telematics",
    icon: "chart",
    summary:
      "AI Remote Video Telematics combines GPS tracking, remote video monitoring, AI-powered driver monitoring, and advanced road safety technology into one intelligent solution.",
    about: [
      "AI Remote Video Telematics combines GPS tracking, remote video monitoring, AI-powered driver monitoring, and advanced road safety technology into one intelligent solution.",
      "With a connected AI dashcam, fleet managers can remotely access live video, review recorded footage, retrieve accident footage, and download important video files without physically removing the SD card from the device.",
      "The system also uses Driver Monitoring System (DMS) technology to help identify potentially unsafe driver behaviors and Advanced Driver Assistance Systems (ADAS) to detect road hazards such as lane drifting, tailgating, and forward collision risks.",
      "By combining video, vehicle location, driver behavior, and AI-powered safety alerts, TrackPro helps businesses move beyond simply knowing where a vehicle is to understanding what is happening inside and around the vehicle.",
    ],
    benefits: [
      ["Remote Live Video Monitoring", "Remote Video Footage Retrieval", "Accident Evidence", "Improved Driver Safety", "Advanced Road Safety"],
      ["Faster Incident Investigation", "Better Driver Accountability", "Reduced Risk and Operating Costs", "AI Video GPS Tracking", "Proactive Fleet Safety Management"],
    ],
    steps: [
      { title: "AI Dashcam Installation", body: "The AI Dashcam GPS device is installed inside the vehicle to capture road-facing and, where configured, driver-facing video." },
      { title: "Video & Data Collection", body: "The device continuously records available video and collects information from its cameras and AI-powered monitoring systems." },
      { title: "AI Driver & Road Monitoring", body: "The Driver Monitoring System (DMS) analyzes driver-related behaviors, while Advanced Driver Assistance Systems (ADAS) analyzes the road environment for potential hazards." },
      { title: "Event Detection", body: "When supported safety events are detected—such as potential driver distraction, lane drifting, tailgating, or forward collision risk—the system can generate an alert and associate available event information with the vehicle." },
      { title: "GPS & Telematics Integration", body: "Vehicle location and other available telematics information can be associated with video and safety events, giving fleet managers additional context." },
      { title: "Remote Access", body: "Authorized users can access the GPS tracking platform to view vehicle status, real-time location, historical track record, alert notification, driving performance, overall report, live video, review recorded footage, investigate events, and retrieve available video files." },
      { title: "Remote Video Download", body: "Authorized users can access the GPS tracking platform to view live video, review recorded footage, investigate events, and retrieve available video files." },
    ],
    featuresTitle: "Features",
    features: [
      { title: "Remote Video Monitoring", items: ["Live Video Streaming", "Remote Video Playback", "Remote Video Download", "Accident Footage Review", "Event-Based Video Retrieval"] },
      { title: "Driver Monitoring System (DMS)", items: ["Driver Behavior Monitoring", "Driver Distraction Detection", "Drowsiness/Fatigue Monitoring", "Driver Safety Alerts", "Driver Accountability"] },
      { title: "Advanced Driver Assistance Systems (ADAS)", items: ["Lane Departure / Lane Drifting Detection", "Forward Collision Risk Detection", "Tailgating Detection", "Road Safety Alerts"] },
      { title: "GPS & Telematics Integration", items: ["Real-Time Vehicle Location", "Trip History", "Event Location", "Fleet Dashboard"] },
      { title: "Video Evidence Management", items: ["Accident Investigation", "Incident Verification", "Remote Evidence Retrieval", "Digital Video Archive"] },
    ],
  },
  {
    slug: "tms-api-integration",
    name: "TMS API Integration",
    icon: "arrow",
    summary:
      "TMS API Integration enables companies to connect GPS Tracking and Telematics Platform directly to their existing Transportation Management System (TMS).",
    about: [
      "TMS API Integration enables companies to connect GPS Tracking and Telematics Platform directly to their existing Transportation Management System (TMS).",
      "Instead of manually transferring vehicle locations, trip updates, milestones, geo-fence events, and other tracking information from one system to another, TrackPro can provide available API data that can be automatically transmitted and integrated into the company's existing TMS.",
      "This creates a connected flow of information between fleet tracking and transportation management, helping businesses reduce manual work, improve data accuracy, and provide their operations team with up-to-date vehicle and shipment information within their existing TMS environment.",
    ],
    benefits: [
      ["Automated Data Transfer", "Seamless System Integration", "Real-Time Visibility", "Reduced Manual Work", "Improved Data Accuracy"],
      ["Faster Shipment & Fleet Updates", "Better Coordination", "Centralized Information", "Improved Customer Visibility", "Scalable Integration"],
    ],
    steps: [
      { title: "Connect the Systems", body: "GPS tracking platform available API endpoints are connected to the company's existing TMS according to the required integration scope." },
      { title: "Track Vehicle & Fleet Data", body: "GPS devices collect available GPS and telematics information from connected vehicles and transmit the information to the GPS Tracking platform." },
      { title: "Process Tracking Information", body: "The GPS tracking platform processes available tracking information, including vehicle locations, statuses, geo-fence events, and other supported telematics data." },
      { title: "API Data Exchange", body: "The GPS tracking platform API makes the required information available to the company's TMS through supported API endpoints and data formats." },
      { title: "Automatic TMS Updates", body: "The company's TMS receives and processes the available API data, automatically updating relevant vehicle, shipment, milestone, appointment, or operational records according to the company's integration configuration." },
      { title: "Unified Transportation Operations", body: "The company can use its existing TMS to manage transportation activities while benefiting from TrackPro's GPS and telematics information." },
    ],
    featuresTitle: "TMS API Integration Features",
    features: [
      {
        title: "GPS / Telematics API",
        intro: "Provide available vehicle tracking and telematics information from GPS tracking platform to the company's TMS. Depending on the supported integration, available data may include:",
        items: ["Vehicle location", "GPS coordinates", "Vehicle movement", "Speed", "Trip information", "Ignition status", "Vehicle status", "Timestamp", "Other available telematics information"],
        outro: "This allows the TMS to use GPS Tracking Platform information as part of its transportation monitoring workflow.",
      },
      {
        title: "Milestone / Status API",
        intro: "Transmit available transportation milestones and vehicle status events from GPS Tracking Platform to the TMS. Supported milestone and status information may include:",
        items: ["Trip started", "Vehicle moving", "Vehicle stopped", "Arrival", "Departure", "En-route status", "Delivery-related status", "Geo-fence triggered events", "Other configured operational events"],
        outro: "This helps the TMS maintain more current transportation status information.",
      },
      {
        title: "Geofencing API",
        intro: "Integrate TrackPro geofence events with the company's TMS. The system can provide supported events when a vehicle enters or exits defined geographic areas such as:",
        items: ["Warehouse", "Distribution center", "Customer location", "Loading facility", "Delivery location", "Port", "Terminal", "Other designated operational areas"],
        outro: "Geo-fence events can be used by the TMS to automatically trigger relevant workflow updates.",
      },
      {
        title: "Load Tender API",
        intro: "Support the exchange of available load tender information between the company's transportation workflow and connected systems. Depending on the integration design, load tender data may include:",
        items: ["Load information", "Pickup details", "Delivery details", "Reference numbers", "Assigned vehicle", "Assigned driver or carrier", "Appointment information", "Other supported load details"],
        outro: "This allows the TMS to use GPS Tracking Platform information as part of its transportation monitoring workflow.",
      },
      {
        title: "Driver / Carrier Assignment API",
        intro: "Connect driver and carrier assignment information with TrackPro tracking data. This can help associate:",
        items: ["Load → Carrier → Vehicle → Driver → GPS Tracking"],
        outro: "The integration can help ensure that the appropriate vehicle and driver information is associated with the corresponding transportation activity within the company's TMS.",
      },
      {
        title: "Appointment Scheduling API",
        intro: "Integrate available appointment information with tracking and transportation status. Depending on the company's TMS capabilities, appointment information may include:",
        items: ["Pickup appointment", "Delivery appointment", "Scheduled arrival time", "Facility information", "Appointment status", "Related load information"],
        outro: "This can help transportation teams compare scheduled activities with actual vehicle movement.",
      },
      {
        title: "Gate In / Gate Out API",
        intro: "Automatically communicate supported vehicle entry and exit events based on configured locations or geo-fencing rules. For example:",
        items: ["Vehicle Approaches Facility → Enters Geo-fence → Gate In Event → Loading/Unloading → Leaves Geo-fence → Gate Out Event"],
        outro: "These events can help companies improve facility visibility and reduce the need for manual gate-status updates.",
      },
    ],
    extras: {
      capabilities: [
        { title: "Automated Data Synchronization", body: "Automatically exchange supported information between TrackPro and the company's TMS." },
        { title: "API-Based Connectivity", body: "Use application programming interfaces to connect TrackPro with existing business systems." },
        { title: "Event-Based Updates", body: "Transmit supported events when defined vehicle, location, or transportation activities occur." },
        { title: "Vehicle-to-Load Association", body: "Connect available vehicle tracking information with transportation loads and assignments." },
        { title: "Driver & Carrier Association", body: "Associate tracking information with the appropriate driver and carrier where supported by the integration." },
        { title: "Geo-fence Based Automation", body: "Trigger supported workflow updates when vehicles enter or exit defined geo-fences." },
        { title: "Status Automation", body: "Automatically update supported transportation statuses based on available TrackPro events." },
        { title: "Data Mapping", body: "Map TrackPro API fields to the corresponding fields and data structures used by the company's TMS." },
        { title: "Secure API Access", body: "Use appropriate authentication and access controls to help protect data exchanged between systems." },
        { title: "Integration Monitoring", body: "Monitor API communication and data exchange to help identify integration issues and maintain reliable system connectivity." },
        { title: "Scalable Architecture", body: "Designed to support integration with growing fleets and transportation operations, subject to API and TMS capabilities." },
      ],
      workflowIntro: "A transportation company receives a load assignment through its TMS.",
      workflow: [
        { title: "Load Tender", body: "The load is created and assigned to a carrier." },
        { title: "Driver & Vehicle Assignment", body: "The driver and vehicle are associated with the load." },
        { title: "GPS Tracking Platform Connection", body: "The assigned vehicle is tracked through the GPS tracking platform." },
        { title: "Vehicle In Route", body: "GPS tracking platform provides available location and status information through the API." },
        { title: "Geofence Arrival", body: "The vehicle enters the pickup facility's geo-fence." },
        { title: "TMS Update", body: "The supported geo-fence event is automatically transmitted to the TMS." },
        { title: "Gate In", body: "The TMS receives the available gate-in event." },
        { title: "Loading / Pickup", body: "The vehicle completes the pickup operation." },
        { title: "Gate Out", body: "The vehicle leaves the facility and the supported gate-out event is transmitted." },
        { title: "In Transit", body: "The TMS continues receiving available tracking and milestone information." },
        { title: "Delivery Arrival", body: "The vehicle enters the delivery location's geofence." },
        { title: "Delivery Status", body: "The TMS receives the available arrival or milestone information." },
      ],
      workflowOutro: "This creates an automated connection between fleet movement and transportation management.",
      whyTitle: "Why Choose TrackPro TMS API Integration?",
      why: [
        "Many companies already have established TMS platforms that manage their transportation operations. Replacing an existing TMS simply to obtain GPS tracking may be unnecessary.",
        "TrackPro TMS API Integration allows businesses to keep their existing TMS while connecting it to TrackPro's GPS and telematics capabilities.",
        "Instead of manually checking one system and updating another, supported information can flow automatically between platforms.",
        "TrackPro provides the tracking data. The TMS manages the transportation workflow. API integration connects the two.",
        "The result is a more connected transportation ecosystem where GPS tracking, vehicle status, geofencing, driver and carrier assignments, appointments, load information, and facility events can work together through automated data exchange.",
      ],
    },
  },
];

export function getSolution(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}
