# Seoul Romantic Date Itinerary 💕

Interactive web guide for a romantic Seoul date (Feb 10-12, 2026) around Orakai Insadong Suites.

## Features

- 🗺️ **Interactive Kakao Map** with restaurant and activity markers
- 🍽️ **50+ Korean Restaurants** (luxury + casual, 4.0+ ratings)
- 🏛️ **40+ Activities** with TripAdvisor ratings
- 📅 **Day-by-day filtering** (Feb 10/11/12)
- 🚶 **Route planning** with suggested timelines
- 📱 **Mobile responsive** design
- ⚠️ **Allergy-safe**: All recommendations exclude raw shellfish

## Live Demo

Visit: `https://[your-username].github.io/seoul-date-itinerary/`

## Setup for GitHub Pages

### 1. Get Kakao Maps API Key (Free)

1. Visit [Kakao Developers](https://developers.kakao.com/)
2. Sign up / Log in
3. Create a new app
4. Go to "Web Platform" settings
5. Add your GitHub Pages URL: `https://[your-username].github.io`
6. Copy your JavaScript API key

### 2. Update index.html

Replace `YOUR_KAKAO_API_KEY` in `index.html` line 8:

```html
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_ACTUAL_KEY&libraries=services"></script>
```

### 3. Deploy to GitHub Pages

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Seoul date itinerary"

# Create GitHub repository and push
git remote add origin https://github.com/[your-username]/seoul-date-itinerary.git
git branch -M main
git push -u origin main

# Enable GitHub Pages
# Go to repository Settings > Pages
# Source: Deploy from branch 'main' / folder 'root'
```

## Local Development

Simply open `index.html` in a web browser. No build process required!

## Project Structure

```
seoul-date-itinerary/
├── index.html          # Main HTML structure
├── style.css           # Romantic pink gradient styling
├── data.js             # Restaurant & activity data with coordinates
├── app.js              # Interactive map and filtering logic
└── README.md           # This file
```

## Data Sources

- Catchtable (Korean restaurant reservations)
- Google Maps
- TripAdvisor ratings

## Customization

### Add More Restaurants

Edit `data.js` and add to the `restaurants` array:

```javascript
{
    name: "Restaurant Name",
    category: "Korean BBQ",
    area: "Insadong",
    distance: "5 min walk",
    bestDay: "Feb 11",
    description: "Why it's romantic...",
    platform: "Catchtable",
    link: "https://...",
    rating: "⭐4.5/5",
    lat: 37.5741,  // Latitude
    lng: 126.9854, // Longitude
    type: "restaurant"
}
```

### Add More Activities

Edit `data.js` and add to the `activities` array with similar structure.

## License

MIT License - Feel free to fork and customize for your own romantic trips!

## Credits

Created for a special Seoul getaway 🌸
