---
name: Varni Holidays Design System
description: Editorial luxury, sharp rectangular geometry, deep navy and warm ochre palette
colors:
  primary: "#002037"
  primary-hover: "#24689B"
  accent-gold: "#E9B95E"
  accent-gold-hover: "#D4A347"
  surface-bg: "#F7F8FA"
  surface-ivory: "#F8F6F0"
  card-bg: "#FFFFFF"
  border-subtle: "#E5E8ED"
  text-primary: "#153650"
  text-body: "#172B45"
  text-muted: "#718096"
  status-success: "#168653"
  status-warning: "#D97706"
  status-error: "#D54747"
  status-info: "#24689B"
typography:
  display:
    fontFamily: "Playfair Display, serif"
    fontWeight: 700
  headline:
    fontFamily: "Playfair Display, Archivo Black, serif"
    fontWeight: 700
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontWeight: 400
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  button-accent:
    backgroundColor: "{colors.accent-gold}"
    textColor: "{colors.primary}"
    rounded: "{rounded.none}"
    padding: "10px 20px"
---

## Overview

The Varni Holidays design system conveys established authority, authentic Gujarat warmth, and institutional reliability. Drawing on editorial luxury aesthetics, it avoids generic AI design tropes (no floating purple blobs, no glowing rounded pill capsules, no excessive border-radii) in favor of crisp rectangular surfaces, high-contrast typography, and purposeful data density.

## Colors

- **Primary Navy (`#002037`):** Represents structural stability, maritime journeys, and institutional authority. Used for dark topbars, primary action buttons, table headers, and commanding title blocks.
- **Accent Gold (`#E9B95E`):** Warm celebratory ochre gold, evoking Gujarat heritage, premium hospitality, and elevated milestones. Used for badges, active tabs, icon highlights, and key calls-to-action.
- **Surface Ivory & Light Neutral (`#F7F8FA` & `#F8F6F0`):** Soft, editorial page backgrounds that maximize readability and prevent eye fatigue.
- **Card Background (`#FFFFFF`):** High-contrast crisp containers with delicate 1px `#E5E8ED` borders.
- **Semantic Accents:**
  - Success Green: `#168653`
  - Warning Amber: `#D97706`
  - Critical Red: `#D54747`
  - Informational Blue: `#24689B`

## Typography

- **Headlines & Mastheads:** *Playfair Display* for classic travel prestige and editorial elegance; *Archivo Black* for cinematic display headers.
- **Body & Controls:** *Plus Jakarta Sans* for clean, modern legibility across high-density data tables, forms, and dossiers.
- **Identifiers & Metrics:** Monospace tabular numerals for references (`VH-VIS-...`, `VH-QUO-...`), currency values, timestamps, and portal IDs.

## Layout

- Desktop: Multi-column responsive layout with fixed/collapsible sidebar and sticky utility header.
- High Information Density: Clean tabular views, timeline tracks, and quick status filters.
- Breadcrumbs on all secondary and detail views for clear hierarchy.

## Elevation & Depth

- Low, restrained shadows (`shadow-xs` / `shadow-sm`).
- Depth is established through 1px border separation (`#E5E8ED`) and contrasting surface tonality rather than heavy blurry drop-shadows.

## Shapes

- **Strict Rectangular Geometry (`rounded-none`):** Buttons, cards, table rows, input fields, modals, and badge tags maintain crisp 90-degree corners.
- Circular geometry is restricted strictly to user avatars and step milestone indicator dots.

## Components

- **Buttons:** Sharp corners, uppercase or bold tracking, gold accents on primary hover.
- **Badges & Tags:** Muted background with high-contrast text and 1px border.
- **Modals:** Dark navy backdrop blur (`bg-[#002037]/70 backdrop-blur-xs`) with crisp white dialogs.

## Do's and Don'ts

### Do's
- Keep borders thin and deliberate (`1px solid #E5E8ED`).
- Format all monetary figures with INR `₹` and proper Indian numbering format where applicable.
- Ensure all dates follow standard readable formats (DD/MM/YYYY).
- Provide immediate feedback alerts for user operations.

### Don'ts
- Do not introduce rounded pill buttons (`rounded-full`) or playful bubbly geometry.
- Do not use bright purple, neon gradients, or generic dark-mode templates on Admin surfaces.
- Never use unverified placeholder claims in official PDF or email templates.

