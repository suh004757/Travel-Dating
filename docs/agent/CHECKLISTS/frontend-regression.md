# Frontend Regression Checklist

## Required Smoke Checks
- Home archive list loads without a script error
- Detail page loads without a script error
- Trip summary renders when there are no reviews
- Highlight section renders when there are no photos
- Review CTA reflects login state
- Review save flow still refreshes visible cards
- Photo delete refreshes the relevant place state
- Mobile overview, places, and map switching stays consistent
- Home page remains readable on narrow mobile screens
- Primary buttons remain reachable and tappable on iPhone-sized viewports
- No horizontal overflow appears in the main app shell unless intentionally scrollable
- Safari-sensitive UI patterns such as fixed overlays, viewport-height sections, and input bars do not hide critical content

## Empty State Checks
- No trips
- Trip with places but no reviews
- Trip with reviews but no photos
- Missing optional place fields such as category, area, or link
- Mobile empty states stay readable without clipped buttons or text
