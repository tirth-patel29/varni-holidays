# Varni Holidays — Enterprise Admin Design System Specification

**Document Version:** 1.0.0  
**Generated Date:** November 2026  
**Status:** Unified Design Standard  
**Design Direction:** Premium Enterprise SaaS × Sharp Geometry × Warm Ivory Light Theme

---

## 1. Color Palette & Surface Tokens

| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary Navy** | `#153650` | Primary buttons, active sidebar selection, brand accents, dark headers |
| **Primary Blue** | `#24689B` | Links, primary focus outlines, secondary navigation indicators |
| **Brand Ochre / Gold** | `#E9B95E` | Active accent pill, high-priority notifications, VIP status badges |
| **Warm Ivory** | `#F8F6F0` | Sub-surface panels, highlighted summary boxes, table headers |
| **Canvas Background**| `#F7F8FA` | Main body viewport background, workspace canvas |
| **Surface White** | `#FFFFFF` | Cards, data tables, dialogs, dropdown menus, sidebar body |
| **Main Text** | `#172B3A` | High-contrast headings, primary table data, label typography |
| **Secondary Text** | `#667085` | Subtitles, helper text, empty states, timestamp metadata |
| **Muted Text** | `#94A3B8` | Table borders, subtle icons, disabled states |
| **Border Gray** | `#E5E8ED` | Crisp 1px container and table divider lines |
| **Status Green** | `#168653` | Confirmed bookings, converted leads, verified connections (`#DEF7EC` bg) |
| **Status Amber** | `#C05621` | Quotations sent, pending payments, upcoming departures (`#FEF3C7` bg) |
| **Status Red** | `#D54747` | Overdue follow-ups, urgent priority, cancelled bookings (`#FEE2E2` bg) |
| **Status Blue** | `#2B6CB0` | New enquiries, contacted leads, in-progress tasks (`#EBF8FF` bg) |

---

## 2. Geometry & Spatial Standards

* **Border Radius:**
  * Cards, Tables, Buttons, and Inputs: **`0px – 3px`** (`rounded-none` to `rounded-xs`).
  * Explicit Rule: **Zero pill-shaped buttons and zero bubbly rounded cards.**
* **Elevation & Shadows:**
  * Strict restraint: Flat border-centric layout with subtle `shadow-xs` or `shadow-sm` on elevated dropdowns and modals.
  * Border thickness: Crisp `1px solid #E5E8ED`.
* **Transitions:**
  * Fast, subtle transitions (`150ms ease-in-out`). No bouncy or decorative animations.

---

## 3. Typography Hierarchy

* **Font Families:**
  * UI Text & Body: Inter / System Sans-Serif (`font-sans`).
  * Headings: Modern Editorial Headings (`font-bold text-[#153650]`).
  * Monospace Data: Reference codes, PNRs, currency amounts, and phone numbers (`font-mono text-xs`).
* **Scale:**
  * Page Title: `text-xl font-bold tracking-tight text-[#153650]`
  * Section Header: `text-sm font-bold uppercase tracking-wider text-[#153650]`
  * Table Header: `text-[11px] font-bold uppercase tracking-wider text-[#718096]`
  * Table Body / Primary: `text-xs font-semibold text-[#172B3A]`
  * Metadata / Timestamp: `text-[11px] text-[#667085]`

---

## 4. Reusable Component Matrix

1. **`AdminSidebar`:**
   * Expandable 7-category navigation tree with chevron indicators.
   * Remembers open category when traversing child links.
   * Collapses smoothly into compact icon rail (64px) or full width (256px).
   * Mobile responsive sliding drawer with backdrop overlay.
2. **`AdminHeader`:**
   * Global omni-search input with shortcut support.
   * Quick Actions `+ New` button launching modal workflows.
   * Real-time notifications bell with unread badge.
   * Active consultant profile card with session switcher.
3. **`Breadcrumbs` & `PageHeader`:**
   * Contextual navigation path (`Admin > Customers & CRM > All Customers`).
   * Clean title, subtitle, and right-aligned contextual action buttons.
4. **`DataTable`:**
   * Compact yet readable table rows (`h-11` or `h-12`).
   * Alternating hover states (`hover:bg-[#F9FAFB]`).
   * Integrated search filter, status filter, and pagination bar.
5. **`QuickActionDialog`:**
   * Modal dialog for creating enquiries, bookings, follow-ups, and payments directly from any screen.
6. **`StatusBadge` & `PriorityIndicator`:**
   * Sharp rectangular badges with restrained semantic colors.

