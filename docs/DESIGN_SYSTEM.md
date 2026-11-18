# Varni Holidays — Design System & Visual Token Specification
**Theme:** Warm Tactile Voyage  
**Aesthetic:** Soft Organic Claymorphism & Apple-Inspired Glass Luxury  
**Target:** Shared across Customer PWA, Public Website, and Admin/Employee Interfaces

---

## 1. Visual Philosophy & Art Direction

Varni Holidays serves discerning travelers, joint family vacations, and heritage holidaymakers seeking bespoke attention, genuine vegetarian/Jain cuisine care, and frictionless booking.

The visual direction rejects cold, flat enterprise SaaS paradigms and harsh tech-blue gradients in favor of **Warm Tactile Voyage**:
- **Pillow-Soft Tactility:** Matte porcelain cards with dual-directional ambient light highlights and soft shadows.
- **Editorial Grandeur:** Italian high-contrast serifs (**Playfair Display**) for emotional storytelling paired with humanist geometric sans (**Plus Jakarta Sans**) for ergonomic mobile readability.
- **Grounded Coastal Warmth:** Sun-drenched warm ivory canvas, deep oceanic navy anchors, and celebratory saffron-gold highlights.

---

## 2. Core Color Palette

| Token | Hex Value | Role & Visual Usage |
| :--- | :--- | :--- |
| `primary` | `#002037` / `#153650` | **Deep Voyage Navy**: Primary headings, navigation containers, high-contrast actions |
| `secondary` | `#186393` / `#246B9B` | **Oceanic Azure**: Interactive highlights, itinerary tabs, verified badges |
| `tertiary` | `#C29033` / `#E9B95E` | **Celebratory Saffron Gold**: VIP pricing, star ratings, primary accent CTAs |
| `surface` | `#FBF9F3` / `#F8F6F0` | **Warm Linen Canvas**: Replaces stark digital white with a restful, anti-glare canvas |
| `surface-cream`| `#F1EEE5` | **Recessed Clay Surface**: Inset input containers, search bars, filter capsules |
| `surface-sand` | `#E8E3D5` | **Subtle Borders & Stepper Lines**: Connecting timeline rules, dividers |
| `error` | `#BA1A1A` | **Alert Red**: Booking cancellations, passport expiry warnings, critical errors |
| `success` | `#168653` | **Emerald Green**: Confirmed bookings, verified payments, approved visas |

---

## 3. Typography Scale

```css
/* Editorial Display & Headers */
--font-display-hero:        Playfair Display, 56px / 68px, Bold (Mobile: 38px / 46px)
--font-headline-lg:          Playfair Display, 40px / 50px, SemiBold (Mobile: 30px / 38px)
--font-headline-md:          Playfair Display, 28px / 36px, SemiBold
--font-headline-sm:          Playfair Display, 22px / 30px, Medium

/* Interface & Body Copy */
--font-title-lg:             Plus Jakarta Sans, 20px / 28px, Bold
--font-title-md:             Plus Jakarta Sans, 17px / 24px, SemiBold
--font-body-lg:              Plus Jakarta Sans, 17px / 28px, Regular
--font-body-md:              Plus Jakarta Sans, 15px / 24px, Regular
--font-body-sm:              Plus Jakarta Sans, 13px / 20px, Regular

/* Badges & Meta Tags */
--font-label-lg:             Plus Jakarta Sans, 14px / 20px, Bold, tracking 0.02em
--font-label-md:             Plus Jakarta Sans, 12px / 16px, SemiBold, tracking 0.04em
--font-label-sm:             Plus Jakarta Sans, 11px / 14px, Bold, tracking 0.06em
```

---

## 4. Elevation, Glassmorphism & Shadow Recipes

1. **Clay Raised Base (PWA Cards, Package Highlights):**
   ```css
   box-shadow: 
     inset 2px 2px 4px rgba(255, 255, 255, 0.9),
     8px 16px 28px rgba(21, 54, 80, 0.06), 
     -6px -6px 16px rgba(255, 255, 255, 0.8);
   border-radius: 2rem;
   ```

2. **Apple-Style Frosted Glass (Bottom Navigation, Sticky Action Bar):**
   ```css
   background: rgba(251, 249, 243, 0.85);
   backdrop-filter: blur(16px) saturate(180%);
   border-top: 1px solid rgba(255, 255, 255, 0.6);
   box-shadow: 0 -4px 20px rgba(21, 54, 80, 0.08);
   ```

3. **Clay Recessed Inset (Search Bars, Text Inputs):**
   ```css
   background: #F1EEE5;
   box-shadow: 
     inset 3px 3px 6px rgba(21, 54, 80, 0.08), 
     inset -3px -3px 6px rgba(255, 255, 255, 0.9);
   border: 1px solid rgba(21, 54, 80, 0.04);
   border-radius: 9999px;
   ```

---

## 5. Mobile Navigation & Touch Ergonomics

- **Safe Areas**: `padding-bottom: env(safe-area-inset-bottom)` enforced on all mobile layouts.
- **Pill Buttons**: Height minimum 48px to accommodate touch targets with comfortable margins.
- **Bottom Navigation Dock**:
  - `Home` (`/app`)
  - `Explore` (`/app/explore`)
  - `My Trips` (`/app/trips`)
  - `Documents & Visa` (`/app/wallet`)
  - `Profile` (`/app/profile`)
