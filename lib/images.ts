/**
 * Curated Unsplash imagery used while the app is in scaffold mode.
 * Every URL goes through next/image via the remote patterns in next.config.
 *
 * Drop in a real Supabase storage bucket later; the shape stays the same.
 */

const u = (
  id: string,
  { w = 1600, q = 80 }: { w?: number; q?: number } = {},
) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const heroImage = u("1540206395-68808572332f", { w: 2000 });

export const landingCollage = [
  u("1540206395-68808572332f", { w: 1200 }), // Himalayan peaks
  u("1544735716-392fe2489ffa", { w: 800 }), // Boudha stupa
  u("1605649487212-47bdab064df7", { w: 800 }), // prayer flags
  u("1506665531195-3566af2b4dfa", { w: 800 }), // mountains
];

export interface FeaturedItem {
  id: string;
  name: string;
  region: string;
  description: string;
  image: string;
  tags: string[];
  rating: number;
  days: string;
}

export const featuredDestinations: FeaturedItem[] = [
  {
    id: "everest-base-camp",
    name: "Everest Base Camp",
    region: "Solukhumbu",
    description:
      "Twelve days walking through Sherpa villages, pine forests, and the high moraine below the world's tallest peak.",
    image: u("1540206395-68808572332f", { w: 1400 }),
    tags: ["Trek", "High altitude", "Iconic"],
    rating: 4.9,
    days: "10–14 days",
  },
  {
    id: "annapurna-circuit",
    name: "Annapurna Circuit",
    region: "Manang & Mustang",
    description:
      "A classic Himalayan loop across Thorong La, rhododendron forests, and apple-orchard villages.",
    image: u("1464822759023-fed622ff2c3b", { w: 1400 }),
    tags: ["Trek", "Cultural", "Scenic"],
    rating: 4.8,
    days: "12–18 days",
  },
  {
    id: "kathmandu-valley",
    name: "Kathmandu Valley",
    region: "Bagmati",
    description:
      "Seven UNESCO sites, Newari courtyards, hand-beaten metalwork — three capitals in a single valley.",
    image: u("1605649487212-47bdab064df7", { w: 1400 }),
    tags: ["Culture", "Heritage", "City"],
    rating: 4.7,
    days: "3–5 days",
  },
  {
    id: "pokhara-phewa",
    name: "Pokhara & Phewa",
    region: "Gandaki",
    description:
      "Lakeside cafés, paragliding off Sarangkot, and the Annapurnas reflected in still morning water.",
    image: u("1506665531195-3566af2b4dfa", { w: 1400 }),
    tags: ["Lake", "Paragliding", "Relaxed"],
    rating: 4.8,
    days: "3–6 days",
  },
  {
    id: "chitwan-national-park",
    name: "Chitwan National Park",
    region: "Terai",
    description:
      "Jeep safaris through tall grass for one-horned rhinos, wild elephants, and occasionally tigers.",
    image: u("1534430480872-3498386e7856", { w: 1400 }),
    tags: ["Wildlife", "Jungle", "Family"],
    rating: 4.6,
    days: "2–4 days",
  },
  {
    id: "mustang",
    name: "Upper Mustang",
    region: "Mustang",
    description:
      "A restricted Tibetan plateau kingdom of walled cities, cave monasteries, and red cliff villages.",
    image: u("1526772662000-3f88f10405ff", { w: 1400 }),
    tags: ["Remote", "Cultural", "Restricted"],
    rating: 4.9,
    days: "10–14 days",
  },
];

export interface FeaturedGuide {
  id: string;
  name: string;
  title: string;
  region: string;
  languages: string[];
  trips: number;
  rating: number;
  avatar: string;
}

export const featuredGuides: FeaturedGuide[] = [
  {
    id: "pema-sherpa",
    name: "Pema Sherpa",
    title: "High-altitude trek lead",
    region: "Solukhumbu",
    languages: ["Nepali", "English", "Sherpa"],
    trips: 142,
    rating: 4.98,
    avatar: u("1544005313-94ddf0286df2", { w: 400 }),
  },
  {
    id: "anjali-gurung",
    name: "Anjali Gurung",
    title: "Cultural & heritage guide",
    region: "Kathmandu Valley",
    languages: ["Nepali", "English", "Hindi", "French"],
    trips: 98,
    rating: 4.95,
    avatar: u("1494790108377-be9c29b29330", { w: 400 }),
  },
  {
    id: "dawa-tamang",
    name: "Dawa Tamang",
    title: "Annapurna specialist",
    region: "Gandaki",
    languages: ["Nepali", "English", "Tamang"],
    trips: 211,
    rating: 4.97,
    avatar: u("1507003211169-0a1dd7228f2d", { w: 400 }),
  },
  {
    id: "sunita-magar",
    name: "Sunita Magar",
    title: "Wildlife & jungle guide",
    region: "Chitwan",
    languages: ["Nepali", "English", "German"],
    trips: 67,
    rating: 4.92,
    avatar: u("1573496359142-b8d87734a5a2", { w: 400 }),
  },
];

export interface FeaturedStory {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  readMinutes: number;
}

export const featuredStories: FeaturedStory[] = [
  {
    id: "alone-on-thorong-la",
    title: "Alone on Thorong La",
    excerpt:
      "The wind at 5,416 m has a way of reminding you who's in charge — here's what eighteen hours above the clouds taught me about patience.",
    image: u("1464822759023-fed622ff2c3b", { w: 1200 }),
    author: "Priya Rai",
    readMinutes: 7,
  },
  {
    id: "tea-in-namche",
    title: "Tea in Namche at 3 a.m.",
    excerpt:
      "A story about altitude sickness, a stranger's kindness, and the very best butter tea I've ever had.",
    image: u("1544735716-392fe2489ffa", { w: 1200 }),
    author: "Mark Weston",
    readMinutes: 5,
  },
  {
    id: "mustang-cave",
    title: "The cave monasteries of Mustang",
    excerpt:
      "Painted walls older than most countries, carved into cliffs nobody has mapped. Here's how we got in.",
    image: u("1526772662000-3f88f10405ff", { w: 1200 }),
    author: "Anjali Gurung",
    readMinutes: 9,
  },
];

export const testimonials = [
  {
    quote:
      "Pema planned around every one of my kid's moods. We came back with photos we'll look at for the rest of our lives.",
    author: "The Müllers",
    trip: "Annapurna Base Camp · 9 days",
  },
  {
    quote:
      "I wanted to see Kathmandu like a local, not like a tourist. Anjali took us through courtyards that aren't in any book.",
    author: "Claudia R.",
    trip: "Kathmandu Heritage · 4 days",
  },
  {
    quote:
      "Negotiated the itinerary in 20 minutes in chat. Transparent pricing, no surprises, everything pre-paid through Unseen.",
    author: "Dev P.",
    trip: "Langtang Valley · 7 days",
  },
];
