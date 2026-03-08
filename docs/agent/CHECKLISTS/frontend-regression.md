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

## Empty State Checks
- No trips
- Trip with places but no reviews
- Trip with reviews but no photos
- Missing optional place fields such as category, area, or link
