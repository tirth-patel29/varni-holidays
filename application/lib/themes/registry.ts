/**
 * VARNI HOLIDAYS — Centralized Destination Theme Registry
 * Single Source of Truth for Immersive Destination Design Systems
 */

import { DestinationTheme, DestinationId } from './types';

// ====================================================
// 1. KERALA THEME (Complete Implementation)
// Lush Tropical Green, Emerald, Warm Ivory & Tea Mist
// ====================================================
export const KERALA_THEME: DestinationTheme = {
  id: 'kerala',
  slug: 'kerala',
  name: 'Kerala',
  tagline: "God's Own Country • Emerald Backwaters & Munnar Hills",
  region: 'South India',
  colors: {
    primary: '#0D4A36',            // Deep tropical forest green
    primaryHover: '#083828',
    secondary: '#C49746',          // Warm spice gold / ochre
    accent: '#168653',             // Vibrant emerald leaf
    surface: '#F9F8F5',            // Warm coconut ivory background
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#EFEFE8',       // Earthy neutral for inset widgets
    surfaceCard: '#FFFFFF',
    border: '#D5DFD8',
    borderSubtle: '#E6EDE8',
    textPrimary: '#0A3325',        // Deep forest readable heading
    textSecondary: '#244537',      // Rich botanical body
    textMuted: '#587567',
    badgeBg: '#E7F2EB',
    badgeText: '#0D4A36',
    heroOverlay: 'linear-gradient(to top, rgba(13, 74, 54, 0.95) 0%, rgba(13, 74, 54, 0.65) 50%, rgba(0, 0, 0, 0.35) 100%)',
    ambientOrbPrimary: 'rgba(22, 134, 83, 0.15)',
    ambientOrbSecondary: 'rgba(196, 151, 70, 0.12)',
  },
  typography: {
    headingFont: 'var(--font-playfair), serif',
    bodyFont: 'var(--font-jakarta), sans-serif',
    headlineStyleClass: 'font-headline text-[#0A3325]',
    accentTagClass: 'text-[#C49746] font-bold uppercase tracking-wider',
  },
  buttons: {
    primaryClass:
      'bg-[#0D4A36] text-white hover:bg-[#083828] border border-[#0D4A36] shadow-sm transition-all rounded-full',
    secondaryClass:
      'bg-[#E7F2EB] text-[#0D4A36] hover:bg-[#D5DFD8] border border-[#D5DFD8] transition-all rounded-full',
    whatsappClass:
      'bg-[#25D366] text-slate-950 hover:bg-[#20ba59] transition-all shadow-sm rounded-full',
  },
  cards: {
    containerClass:
      'bg-[#FFFFFF] border border-[#D5DFD8] shadow-[0_10px_30px_rgba(13,74,54,0.06)] rounded-3xl',
    elevatedClass:
      'bg-[#FFFFFF] border border-[#D5DFD8] shadow-[0_14px_40px_rgba(13,74,54,0.08)] rounded-3xl',
    insetClass:
      'bg-[#EFEFE8]/70 border border-[#D5DFD8]/60 rounded-2xl',
    glassmorphism: false,
  },
  decorative: {
    motif: 'leaf',
    icon: 'forest',
    sealLabel: "God's Own Country Verified CPAI",
    bannerTagline: 'Handcrafted with authentic Gujarati meal guidance in Munnar, Thekkady & Alleppey',
  },
  ambientEffects: {
    type: 'tropical-mist',
    particleCount: 18,
    particleMinSize: 2,
    particleMaxSize: 5,
    speed: 0.35,
    color: '#168653',
    opacity: 0.22,
    reducedMotionFallback:
      'radial-gradient(ellipse at 80% 20%, rgba(22, 134, 83, 0.08) 0%, transparent 60%)',
  },
  hero: {
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=85',
    atmosphereTag: 'Munnar Tea Hills • Periyar Spices • Alleppey Backwaters',
    climateDefault: {
      temperature: '21°C - 27°C',
      seasonLabel: 'Winter Peak Season (Oct - Mar)',
      validityNote: 'Rates valid Oct 2026 to Mar 2027. Surcharge applies during holiday peak Dec 20 - Jan 10.',
    },
  },
};

// ====================================================
// 2. KASHMIR THEME (Complete Implementation)
// Snow White, Ice Blue, Glacier Navy & Active Snowfall
// ====================================================
export const KASHMIR_THEME: DestinationTheme = {
  id: 'kashmir',
  slug: 'kashmir',
  name: 'Kashmir',
  tagline: 'Paradise on Earth • Himalayan Snow Valleys & Dal Lake Shikaras',
  region: 'North India',
  colors: {
    primary: '#0B2545',            // Deep mountain alpine navy
    primaryHover: '#06172D',
    secondary: '#38BDF8',          // Crisp ice blue
    accent: '#0284C7',             // Glacial cyan accent
    surface: '#F4F8FC',            // Frosted snow ivory background
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#EBF4FC',       // Icy mist container tone
    surfaceCard: 'rgba(255, 255, 255, 0.92)',
    border: '#BFDBFE',            // Ice crystal border
    borderSubtle: '#DBEAFE',
    textPrimary: '#081E38',        // High contrast glacier navy heading
    textSecondary: '#1E3A5F',      // Crisp deep alpine body
    textMuted: '#527297',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
    heroOverlay: 'linear-gradient(to top, rgba(11, 37, 69, 0.96) 0%, rgba(11, 37, 69, 0.65) 50%, rgba(0, 0, 0, 0.35) 100%)',
    ambientOrbPrimary: 'rgba(56, 189, 248, 0.18)',
    ambientOrbSecondary: 'rgba(11, 37, 69, 0.12)',
  },
  typography: {
    headingFont: 'var(--font-playfair), serif',
    bodyFont: 'var(--font-jakarta), sans-serif',
    headlineStyleClass: 'font-headline text-[#081E38]',
    accentTagClass: 'text-[#0284C7] font-bold uppercase tracking-wider',
  },
  buttons: {
    primaryClass:
      'bg-[#0B2545] text-white hover:bg-[#06172D] border border-[#0B2545] shadow-sm transition-all rounded-full',
    secondaryClass:
      'bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD] border border-[#BAE6FD] transition-all rounded-full',
    whatsappClass:
      'bg-[#25D366] text-slate-950 hover:bg-[#20ba59] transition-all shadow-sm rounded-full',
  },
  cards: {
    containerClass:
      'bg-white/95 backdrop-blur-md border border-[#BFDBFE] shadow-[0_12px_36px_rgba(11,37,69,0.08)] rounded-3xl',
    elevatedClass:
      'bg-white/95 backdrop-blur-md border border-[#BFDBFE] shadow-[0_16px_45px_rgba(11,37,69,0.1)] rounded-3xl',
    insetClass:
      'bg-[#EBF4FC]/80 border border-[#BFDBFE]/60 rounded-2xl',
    glassmorphism: true,
  },
  decorative: {
    motif: 'snowflake',
    icon: 'ac_unit',
    sealLabel: 'Himalayan Snow Guarantee • Deluxe Houseboat Included',
    bannerTagline: 'Gulmarg Gondola & Dal Lake heritage houseboats with dedicated private chauffeurs',
  },
  ambientEffects: {
    type: 'snowfall',
    particleCount: 42,
    particleMinSize: 1.5,
    particleMaxSize: 4.2,
    speed: 0.65,
    color: '#FFFFFF',
    opacity: 0.65,
    reducedMotionFallback:
      'radial-gradient(ellipse at 80% 20%, rgba(186, 230, 253, 0.25) 0%, transparent 60%)',
  },
  hero: {
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1600&q=85',
    atmosphereTag: 'Gulmarg Snow Peaks • Dal Lake Shikara • Pahalgam Pine Valleys',
    climateDefault: {
      temperature: '-2°C to 12°C',
      seasonLabel: 'Winter Snow & Spring Bloom',
      validityNote: 'Rates valid Oct 2026 to Apr 2027. Gondola ride passes subject to weather conditions.',
    },
  },
};

// ====================================================
// 3. RAJASTHAN PRESET (Heritage Palaces & Golden Dunes)
// ====================================================
export const RAJASTHAN_THEME: DestinationTheme = {
  id: 'rajasthan',
  slug: 'rajasthan',
  name: 'Rajasthan',
  tagline: 'Land of Kings • Forts, Royal Havelis & Sam Desert Dunes',
  region: 'North-West India',
  colors: {
    primary: '#7C2D12',            // Royal terracotta
    primaryHover: '#5B1E0A',
    secondary: '#D97706',          // Desert amber gold
    accent: '#B45309',             // Thar bronze
    surface: '#FDFCF7',            // Sandstone warm ivory
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#FBF5E8',       // Camel dune beige
    surfaceCard: '#FFFFFF',
    border: '#E8DBC5',
    borderSubtle: '#F1E8D7',
    textPrimary: '#431407',
    textSecondary: '#622410',
    textMuted: '#8E5E4A',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    heroOverlay: 'linear-gradient(to top, rgba(124, 45, 18, 0.95) 0%, rgba(124, 45, 18, 0.6) 50%, rgba(0, 0, 0, 0.35) 100%)',
    ambientOrbPrimary: 'rgba(217, 119, 6, 0.15)',
    ambientOrbSecondary: 'rgba(124, 45, 18, 0.1)',
  },
  typography: {
    headingFont: 'var(--font-playfair), serif',
    bodyFont: 'var(--font-jakarta), sans-serif',
    headlineStyleClass: 'font-headline text-[#431407]',
    accentTagClass: 'text-[#D97706] font-bold uppercase tracking-wider',
  },
  buttons: {
    primaryClass:
      'bg-[#7C2D12] text-white hover:bg-[#5B1E0A] border border-[#7C2D12] shadow-sm transition-all rounded-full',
    secondaryClass:
      'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] border border-[#FDE68A] transition-all rounded-full',
    whatsappClass:
      'bg-[#25D366] text-slate-950 hover:bg-[#20ba59] transition-all shadow-sm rounded-full',
  },
  cards: {
    containerClass:
      'bg-[#FFFFFF] border border-[#E8DBC5] shadow-[0_10px_30px_rgba(124,45,18,0.06)] rounded-3xl',
    elevatedClass:
      'bg-[#FFFFFF] border border-[#E8DBC5] shadow-[0_14px_40px_rgba(124,45,18,0.08)] rounded-3xl',
    insetClass:
      'bg-[#FBF5E8]/80 border border-[#E8DBC5]/60 rounded-2xl',
    glassmorphism: false,
  },
  decorative: {
    motif: 'palace-arch',
    icon: 'castle',
    sealLabel: 'Heritage Palace & Desert Safari Verified',
    bannerTagline: 'Jaipur, Jodhpur, Udaipur & Jaisalmer with verified heritage stays',
  },
  ambientEffects: {
    type: 'desert-dust',
    particleCount: 16,
    particleMinSize: 1.5,
    particleMaxSize: 4,
    speed: 0.3,
    color: '#D97706',
    opacity: 0.2,
    reducedMotionFallback:
      'radial-gradient(ellipse at 80% 20%, rgba(217, 119, 6, 0.1) 0%, transparent 60%)',
  },
  hero: {
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=85',
    atmosphereTag: 'Hawa Mahal • Sam Desert Camp • Lake Pichola Palaces',
    climateDefault: {
      temperature: '15°C to 28°C',
      seasonLabel: 'Pleasant Winter Season (Oct - Mar)',
      validityNote: 'Rates valid Oct 2026 to Mar 2027. Desert camp includes cultural folk dance and buffet.',
    },
  },
};

// ====================================================
// 4. GOA PRESET (Tropical Beach & Ocean Waves)
// ====================================================
export const GOA_THEME: DestinationTheme = {
  id: 'goa',
  slug: 'goa',
  name: 'Goa',
  tagline: 'Coastal Paradise • Sun-Kissed Beaches & Portuguese Heritage',
  region: 'West Coast India',
  colors: {
    primary: '#0D9488',            // Ocean teal
    primaryHover: '#0F766E',
    secondary: '#F43F5E',          // Coral pink
    accent: '#06B6D4',             // Turquoise wave
    surface: '#F8FCFC',            // Pearl coastal ivory
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#E6F7F6',
    surfaceCard: '#FFFFFF',
    border: '#B2EBF2',
    borderSubtle: '#CCFBF1',
    textPrimary: '#0F4D4A',
    textSecondary: '#115E59',
    textMuted: '#538A85',
    badgeBg: '#CCFBF1',
    badgeText: '#0F766E',
    heroOverlay: 'linear-gradient(to top, rgba(13, 148, 136, 0.95) 0%, rgba(13, 148, 136, 0.6) 50%, rgba(0, 0, 0, 0.35) 100%)',
    ambientOrbPrimary: 'rgba(13, 148, 136, 0.15)',
    ambientOrbSecondary: 'rgba(244, 63, 94, 0.1)',
  },
  typography: {
    headingFont: 'var(--font-playfair), serif',
    bodyFont: 'var(--font-jakarta), sans-serif',
    headlineStyleClass: 'font-headline text-[#0F4D4A]',
    accentTagClass: 'text-[#0D9488] font-bold uppercase tracking-wider',
  },
  buttons: {
    primaryClass:
      'bg-[#0D9488] text-white hover:bg-[#0F766E] border border-[#0D9488] shadow-sm transition-all rounded-full',
    secondaryClass:
      'bg-[#CCFBF1] text-[#0F766E] hover:bg-[#99F6E4] border border-[#99F6E4] transition-all rounded-full',
    whatsappClass:
      'bg-[#25D366] text-slate-950 hover:bg-[#20ba59] transition-all shadow-sm rounded-full',
  },
  cards: {
    containerClass:
      'bg-[#FFFFFF] border border-[#B2EBF2] shadow-[0_10px_30px_rgba(13,148,136,0.06)] rounded-3xl',
    elevatedClass:
      'bg-[#FFFFFF] border border-[#B2EBF2] shadow-[0_14px_40px_rgba(13,148,136,0.08)] rounded-3xl',
    insetClass:
      'bg-[#E6F7F6]/80 border border-[#B2EBF2]/60 rounded-2xl',
    glassmorphism: false,
  },
  decorative: {
    motif: 'wave',
    icon: 'beach_access',
    sealLabel: 'Sun & Sea Luxury Verified',
    bannerTagline: 'Calangute, Candolim & South Goa pristine shores with private transfers',
  },
  ambientEffects: {
    type: 'ocean-breeze',
    particleCount: 15,
    particleMinSize: 2,
    particleMaxSize: 4,
    speed: 0.4,
    color: '#0D9488',
    opacity: 0.2,
    reducedMotionFallback:
      'radial-gradient(ellipse at 80% 20%, rgba(13, 148, 136, 0.1) 0%, transparent 60%)',
  },
  hero: {
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85',
    atmosphereTag: 'Vagator Sunset • Old Goa Cathedrals • Palolem Serenity',
    climateDefault: {
      temperature: '24°C to 31°C',
      seasonLabel: 'Tropical Beach Season',
      validityNote: 'Rates valid Oct 2026 to May 2027. Water sports subject to sea conditions.',
    },
  },
};

// ====================================================
// 5. HIMACHAL PRESET (Alpine Pine Forests & High Passes)
// ====================================================
export const HIMACHAL_THEME: DestinationTheme = {
  id: 'himachal',
  slug: 'himachal',
  name: 'Himachal Pradesh',
  tagline: 'Abode of Gods • Alpine Pine Woods, Shimla & Manali Rohtang Pass',
  region: 'North India',
  colors: {
    primary: '#1B4332',            // Alpine pine green
    primaryHover: '#143325',
    secondary: '#0284C7',          // Himalayan sky blue
    accent: '#40916C',
    surface: '#F6F9F7',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#EBF3EE',
    surfaceCard: '#FFFFFF',
    border: '#C7DDCF',
    borderSubtle: '#DBE9E0',
    textPrimary: '#112C21',
    textSecondary: '#1F4736',
    textMuted: '#587A6C',
    badgeBg: '#D8F3DC',
    badgeText: '#1B4332',
    heroOverlay: 'linear-gradient(to top, rgba(27, 67, 50, 0.95) 0%, rgba(27, 67, 50, 0.6) 50%, rgba(0, 0, 0, 0.35) 100%)',
    ambientOrbPrimary: 'rgba(27, 67, 50, 0.15)',
    ambientOrbSecondary: 'rgba(2, 132, 199, 0.1)',
  },
  typography: {
    headingFont: 'var(--font-playfair), serif',
    bodyFont: 'var(--font-jakarta), sans-serif',
    headlineStyleClass: 'font-headline text-[#112C21]',
    accentTagClass: 'text-[#0284C7] font-bold uppercase tracking-wider',
  },
  buttons: {
    primaryClass:
      'bg-[#1B4332] text-white hover:bg-[#143325] border border-[#1B4332] shadow-sm transition-all rounded-full',
    secondaryClass:
      'bg-[#D8F3DC] text-[#1B4332] hover:bg-[#B7E4C7] border border-[#B7E4C7] transition-all rounded-full',
    whatsappClass:
      'bg-[#25D366] text-slate-950 hover:bg-[#20ba59] transition-all shadow-sm rounded-full',
  },
  cards: {
    containerClass:
      'bg-[#FFFFFF] border border-[#C7DDCF] shadow-[0_10px_30px_rgba(27,67,50,0.06)] rounded-3xl',
    elevatedClass:
      'bg-[#FFFFFF] border border-[#C7DDCF] shadow-[0_14px_40px_rgba(27,67,50,0.08)] rounded-3xl',
    insetClass:
      'bg-[#EBF3EE]/80 border border-[#C7DDCF]/60 rounded-2xl',
    glassmorphism: false,
  },
  decorative: {
    motif: 'pine',
    icon: 'park',
    sealLabel: 'Cedar Valleys & Snow Peaks Verified',
    bannerTagline: 'Shimla Ridge, Kufri, Solang Valley & Atal Tunnel excursions',
  },
  ambientEffects: {
    type: 'tropical-mist',
    particleCount: 16,
    particleMinSize: 1.5,
    particleMaxSize: 4,
    speed: 0.35,
    color: '#1B4332',
    opacity: 0.18,
    reducedMotionFallback:
      'radial-gradient(ellipse at 80% 20%, rgba(27, 67, 50, 0.1) 0%, transparent 60%)',
  },
  hero: {
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    atmosphereTag: 'Solang Valley • Rohtang Snow • Shimla Colonial Mall',
    climateDefault: {
      temperature: '2°C to 18°C',
      seasonLabel: 'Himalayan Mountain Climate',
      validityNote: 'Rates valid round the year. Snowfall peak occurs from Dec to Feb.',
    },
  },
};

// ====================================================
// 6. DUBAI PRESET (Desert Gold & Modern Luxury)
// ====================================================
export const DUBAI_THEME: DestinationTheme = {
  id: 'dubai',
  slug: 'dubai',
  name: 'Dubai & UAE',
  tagline: 'Futuristic Luxury • Burj Khalifa, Desert Safaris & Royal Marinas',
  region: 'Middle East',
  colors: {
    primary: '#0F172A',            // Midnight skyline navy
    primaryHover: '#020617',
    secondary: '#B45309',          // Desert gold
    accent: '#F59E0B',
    surface: '#FAF9F6',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#F4EFE6',
    surfaceCard: '#FFFFFF',
    border: '#E2D9CC',
    borderSubtle: '#EDE6DA',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    heroOverlay: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 50%, rgba(0, 0, 0, 0.35) 100%)',
    ambientOrbPrimary: 'rgba(245, 158, 11, 0.15)',
    ambientOrbSecondary: 'rgba(15, 23, 42, 0.1)',
  },
  typography: {
    headingFont: 'var(--font-playfair), serif',
    bodyFont: 'var(--font-jakarta), sans-serif',
    headlineStyleClass: 'font-headline text-[#0F172A]',
    accentTagClass: 'text-[#B45309] font-bold uppercase tracking-wider',
  },
  buttons: {
    primaryClass:
      'bg-[#0F172A] text-white hover:bg-[#020617] border border-[#0F172A] shadow-sm transition-all rounded-full',
    secondaryClass:
      'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] border border-[#FDE68A] transition-all rounded-full',
    whatsappClass:
      'bg-[#25D366] text-slate-950 hover:bg-[#20ba59] transition-all shadow-sm rounded-full',
  },
  cards: {
    containerClass:
      'bg-[#FFFFFF] border border-[#E2D9CC] shadow-[0_10px_30px_rgba(15,23,42,0.06)] rounded-3xl',
    elevatedClass:
      'bg-[#FFFFFF] border border-[#E2D9CC] shadow-[0_14px_40px_rgba(15,23,42,0.08)] rounded-3xl',
    insetClass:
      'bg-[#F4EFE6]/80 border border-[#E2D9CC]/60 rounded-2xl',
    glassmorphism: false,
  },
  decorative: {
    motif: 'geometric',
    icon: 'apartment',
    sealLabel: 'Dubai Express Visa & 5-Star Curation',
    bannerTagline: 'Burj Khalifa 124th level, 4x4 dune safari & marina luxury dinner cruises',
  },
  ambientEffects: {
    type: 'desert-dust',
    particleCount: 16,
    particleMinSize: 1.5,
    particleMaxSize: 4,
    speed: 0.35,
    color: '#F59E0B',
    opacity: 0.18,
    reducedMotionFallback:
      'radial-gradient(ellipse at 80% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 60%)',
  },
  hero: {
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85',
    atmosphereTag: 'Burj Khalifa • Desert Red Dunes • Palm Jumeirah Skyline',
    climateDefault: {
      temperature: '20°C to 29°C',
      seasonLabel: 'Ideal Winter Gateway (Nov - Mar)',
      validityNote: 'Rates valid Nov 2026 to Mar 2027. Excludes airfare and tourism dirham fee.',
    },
  },
};

// ====================================================
// DICTIONARY OF THEMES
// ====================================================
export const DESTINATION_THEMES: Record<DestinationId, DestinationTheme> = {
  kerala: KERALA_THEME,
  kashmir: KASHMIR_THEME,
  rajasthan: RAJASTHAN_THEME,
  goa: GOA_THEME,
  himachal: HIMACHAL_THEME,
  dubai: DUBAI_THEME,
  default: KERALA_THEME,
};

/**
 * Robust Theme Resolver
 * Takes destination string (e.g. "Kashmir, India", "kashmir-valley-5n6d", "kerala")
 * and resolves the matching DestinationTheme without relying on fragile string matching.
 */
export function resolveDestinationTheme(input: string | undefined | null): DestinationTheme {
  if (!input) return DESTINATION_THEMES.kerala;

  const normalized = input.toLowerCase().trim();

  // 1. Direct key match
  if (normalized in DESTINATION_THEMES) {
    return DESTINATION_THEMES[normalized as DestinationId];
  }

  // 2. Keyword checks against destination IDs
  if (
    normalized.includes('kashmir') ||
    normalized.includes('srinagar') ||
    normalized.includes('gulmarg') ||
    normalized.includes('pahalgam') ||
    normalized.includes('dal lake') ||
    normalized.includes('shikara')
  ) {
    return DESTINATION_THEMES.kashmir;
  }

  if (normalized.includes('kerala') || normalized.includes('munnar') || normalized.includes('alleppey') || normalized.includes('cochin') || normalized.includes('kovalam')) {
    return DESTINATION_THEMES.kerala;
  }

  if (normalized.includes('rajasthan') || normalized.includes('jaipur') || normalized.includes('udaipur') || normalized.includes('jaisalmer') || normalized.includes('jodhpur')) {
    return DESTINATION_THEMES.rajasthan;
  }

  if (normalized.includes('goa') || normalized.includes('panjim') || normalized.includes('calangute')) {
    return DESTINATION_THEMES.goa;
  }

  if (normalized.includes('himachal') || normalized.includes('shimla') || normalized.includes('manali') || normalized.includes('dharamshala')) {
    return DESTINATION_THEMES.himachal;
  }

  if (normalized.includes('dubai') || normalized.includes('uae') || normalized.includes('abu dhabi')) {
    return DESTINATION_THEMES.dubai;
  }

  return DESTINATION_THEMES.default;
}
