import { EventDetails, TicketTier, MenuItem } from "./types.js";
export const fallbackEvent: EventDetails = {
  id: "evt-hideout-pool-2026",
  title: "The Hideout \u2014 Pool Edition",
  subtitle: "The hilltop sunset pool party",
  theme: "Pool \u00b7 Music \u00b7 Fun games \u00b7 Networking \u00b7 Sunset",
  description:
    "An afternoon by the pool. Music in the air. A sunset worth staying for. Join The Vybecheck with Bama for The Hideout, Pool Edition.",
  date: "November 28, 2026",
  startTime: "2 PM",
  endTime: "Late",
  venue: "Venue to be announced",
  address: "Call the organizers for venue details.",
  city: "",
  country: "Nigeria",
  bannerImage: "/images/hideout-pool-edition.png",
  organizerName: "The Vybecheck with Bama",
  organizerEmail: "",
  organizerPhone: "+2349030064744",
  organizerPhoneSecondary: "+2348131173415",
  socialLinks: {
    instagram: "https://www.instagram.com/vybecheckGlobal/",
    hostInstagram: "https://www.instagram.com/iam_Bama/",
  },
  schedule: [
    {
      time: "2 PM \u2013 Late",
      title: "Pool, music & good company",
      description:
        "Pool, music, fun games, networking and sunset. The detailed programme will be announced by the organizers.",
    },
  ],
  faqs: [
    {
      question: "When is The Hideout?",
      answer: "Saturday, 28 November 2026, from 2 PM until late.",
    },
    {
      question: "Where is the party?",
      answer:
        "The poster does not list an exact venue. Call +2349030064744 or +2348131173415 for location details.",
    },
    {
      question: "How do I book a table or cabana?",
      answer:
        "All packages can be booked online. Couple and VIP table of 2 each include two individual passes. For VVIP and Cabana, our team will contact the booking contact after payment to confirm guest arrangements.",
    },
    {
      question: "What is the PVC ticket?",
      answer:
        "The poster lists \u201cWith your PVC\u201d at \u20a615,000. Contact the organizers to confirm eligibility and what to bring before booking.",
    },
    {
      question: "Who can I contact for sponsorship?",
      answer:
        "Call +2349030064744 or +2348131173415. Follow @vybecheckGlobal and @iam_Bama on Instagram for updates.",
    },
    {
      question: "Can I buy food or drinks online?",
      answer:
        "The menu is for display only. Food and drinks are purchased at the venue and are not added to your ticket payment.",
    },
  ],
};
export const fallbackTicketTiers: TicketTier[] = [
  {
    id: "hideout-pvc",
    name: "With PVC",
    code: "PVC",
    description:
      "Individual entry to The Hideout. Bring your PVC for this ticket.",
    price: 15000,
    availableQuantity: 0,
    soldQuantity: 0,
    maxPerRegistration: 5,
    salesStartDate: "2026-10-01",
    salesEndDate: "2026-11-28",
    benefits: [],
    isActive: true,
    bookingOnly: false,
    inventoryUnlimited: true,
    guestsPerTicket: 1,
  },
  {
    id: "hideout-access",
    name: "Access",
    code: "ACCESS",
    description: "Individual entry to The Hideout \u2014 Pool Edition.",
    price: 25000,
    availableQuantity: 0,
    soldQuantity: 0,
    maxPerRegistration: 5,
    salesStartDate: "2026-10-01",
    salesEndDate: "2026-11-28",
    benefits: [],
    isActive: true,
    bookingOnly: false,
    inventoryUnlimited: true,
    guestsPerTicket: 1,
  },
  {
    id: "hideout-couple",
    name: "Couple",
    code: "COUPLE",
    description: "Includes two individual guest passes.",
    price: 45000,
    availableQuantity: 0,
    soldQuantity: 0,
    maxPerRegistration: 5,
    salesStartDate: "2026-10-01",
    salesEndDate: "2026-11-28",
    benefits: [],
    isActive: true,
    bookingOnly: false,
    inventoryUnlimited: true,
    guestsPerTicket: 2,
  },
  {
    id: "hideout-vip",
    name: "VIP \u00b7 Table of 2",
    code: "VIP",
    description: "Includes two individual guest passes.",
    price: 100000,
    availableQuantity: 0,
    soldQuantity: 0,
    maxPerRegistration: 5,
    salesStartDate: "2026-10-01",
    salesEndDate: "2026-11-28",
    benefits: [],
    isActive: true,
    bookingOnly: false,
    inventoryUnlimited: true,
    guestsPerTicket: 2,
  },
  {
    id: "hideout-vvip",
    name: "VVIP",
    code: "VVIP",
    description:
      "Package booking. Our team will contact you after payment to confirm guest arrangements.",
    price: 250000,
    availableQuantity: 0,
    soldQuantity: 0,
    maxPerRegistration: 5,
    salesStartDate: "2026-10-01",
    salesEndDate: "2026-11-28",
    benefits: [],
    isActive: true,
    bookingOnly: false,
    inventoryUnlimited: true,
    guestsPerTicket: 1,
  },
  {
    id: "hideout-cabana",
    name: "Cabana",
    code: "CABANA",
    description:
      "Package booking. Our team will contact you after payment to confirm guest arrangements.",
    price: 1000000,
    availableQuantity: 0,
    soldQuantity: 0,
    maxPerRegistration: 5,
    salesStartDate: "2026-10-01",
    salesEndDate: "2026-11-28",
    benefits: [],
    isActive: true,
    bookingOnly: false,
    inventoryUnlimited: true,
    guestsPerTicket: 1,
  },
];
export const fallbackMenuItems: MenuItem[] = [
  {
    id: "menu-1",
    name: "Hot Party Jollof Rice & Peppered Chicken",
    description:
      "Authentic firewood-smoked Nigerian party jollof served with crispy fried plantain (dodo) and spicy peppered chicken.",
    category: "Food",
    price: 4000,
    isAvailable: true,
    displayOrder: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    dietaryOrTag: "Party Special",
  },
  {
    id: "menu-2",
    name: "Charcoal Grilled Beef & Chicken Suya Platter",
    description:
      "Tender beef and chicken char-grilled with authentic northern yaji spice, served with sweet red onions and cabbage.",
    category: "Food",
    price: 4500,
    isAvailable: true,
    displayOrder: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    dietaryOrTag: "Hot & Spicy",
  },
  {
    id: "menu-3",
    name: "Smoky Peppered Goat Meat (Asun)",
    description:
      "Traditional slow-roasted goat meat diced and tossed in fiery habanero peppers and onions.",
    category: "Food",
    price: 4000,
    isAvailable: true,
    displayOrder: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80",
    dietaryOrTag: "Lagos Classic",
  },
  {
    id: "menu-4",
    name: "Lagos Small Chops Pack (Spring Rolls, Samosa, Puff-Puff)",
    description:
      "Golden fried puff-puff, crunchy beef samosas, crispy chicken spring rolls, and peppered gizzard.",
    category: "Refreshments",
    price: 2500,
    isAvailable: true,
    displayOrder: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
    dietaryOrTag: "Party Favorite",
  },
  {
    id: "menu-5",
    name: "Signature Chilled Zobo Royale",
    description:
      "Cold-brewed Nigerian hibiscus infusion with ginger, cloves, citrus zest, and mint.",
    category: "Drinks",
    price: 1800,
    isAvailable: true,
    displayOrder: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    dietaryOrTag: "Non-Alcoholic",
  },
  {
    id: "menu-6",
    name: "Classic Nigerian Chapman Cocktail / Punch",
    description:
      "The ultimate celebratory drink with Angostura bitters, Fanta, Sprite, cucumber, lime, and grenadine.",
    category: "Drinks",
    price: 2200,
    isAvailable: true,
    displayOrder: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    dietaryOrTag: "Popular Punch",
  },
  {
    id: "menu-7",
    name: "Premium Spirits & Energy Mixers",
    description:
      "Chilled premium vodka, tequila shots, Hennessy cocktails, or Red Bull mixes served by our professional mixologists.",
    category: "Drinks",
    price: 4500,
    isAvailable: true,
    displayOrder: 7,
    imageUrl:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    dietaryOrTag: "Bar Special",
  },
  {
    id: "menu-8",
    name: "Glow Sticks, LED Glasses & Party Merch Kit",
    description:
      "High-intensity LED rave foam sticks, neon sunglasses, and commemorative party merch pack.",
    category: "Merchandise",
    price: 2000,
    isAvailable: true,
    displayOrder: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    dietaryOrTag: "Party Merch",
  },
];
