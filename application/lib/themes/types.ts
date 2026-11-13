/**
 * VARNI HOLIDAYS — Destination-Based Immersive Theme Engine
 * Type Definitions & Configuration Schema
 */

export type DestinationId =
  | 'kerala'
  | 'kashmir'
  | 'rajasthan'
  | 'goa'
  | 'himachal'
  | 'dubai'
  | 'default';

export type AmbientEffectType =
  | 'none'
  | 'snowfall'
  | 'tropical-mist'
  | 'desert-dust'
  | 'ocean-breeze';

export interface ThemeColors {
  primary: string;           // Core identity (e.g. emerald green / glacier navy)
  primaryHover: string;
  secondary: string;         // Accent tone (e.g. ochre gold / ice blue)
  accent: string;            // Micro-highlight
  surface: string;           // Base page background
  surfaceElevated: string;   // Cards and modals
  surfaceMuted: string;      // Inset widgets, tables, form fields
  surfaceCard: string;       // Elevated containers
  border: string;            // Standard 1px structural borders
  borderSubtle: string;      // Soft divider borders
  textPrimary: string;       // Main headings and commanding text
  textSecondary: string;     // Body paragraphs and descriptions
  textMuted: string;         // Captions, timestamps, small tags
  badgeBg: string;           // Characteristic pill badge background
  badgeText: string;         // Characteristic pill badge text
  heroOverlay: string;       // Multi-stop gradient overlay for hero readability
  ambientOrbPrimary: string; // Soft ambient light orb 1
  ambientOrbSecondary: string; // Soft ambient light orb 2
}

export interface ThemeTypography {
  headingFont: string;       // e.g. "var(--font-playfair), serif"
  bodyFont: string;          // e.g. "var(--font-jakarta), sans-serif"
  headlineStyleClass: string; // Tailwind class for display headlines
  accentTagClass: string;    // Tailwind styling for destination tags
}

export interface ThemeButtons {
  primaryClass: string;
  secondaryClass: string;
  whatsappClass: string;
}

export interface ThemeCards {
  containerClass: string;
  elevatedClass: string;
  insetClass: string;
  glassmorphism: boolean;
}

export interface ThemeDecorative {
  motif: 'leaf' | 'snowflake' | 'palace-arch' | 'wave' | 'pine' | 'geometric';
  icon: string;              // Material symbol or Lucide icon name
  sealLabel: string;         // e.g. "God's Own Country Verified" / "Himalayan Sovereign Heritage"
  bannerTagline: string;
  dividerPattern?: string;
}

export interface ThemeAmbientEffects {
  type: AmbientEffectType;
  particleCount: number;
  particleMinSize: number;
  particleMaxSize: number;
  speed: number;
  color: string;
  opacity: number;
  reducedMotionFallback: string; // CSS radial gradient or solid tone
}

export interface DestinationTheme {
  id: DestinationId;
  slug: string;
  name: string;
  tagline: string;
  region: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  buttons: ThemeButtons;
  cards: ThemeCards;
  decorative: ThemeDecorative;
  ambientEffects: ThemeAmbientEffects;
  hero: {
    image: string;
    atmosphereTag: string;
    climateDefault: {
      temperature: string;
      seasonLabel: string;
      validityNote: string;
    };
  };
}
